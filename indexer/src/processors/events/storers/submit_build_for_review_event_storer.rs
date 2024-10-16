use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::utils::errors::ProcessorError;
use diesel::{
    insert_into, query_dsl::methods::FilterDsl, upsert::excluded, BoolExpressionMethods,
    ExpressionMethods, QueryResult,
};
use diesel_async::{AsyncConnection, AsyncPgConnection, RunQueryDsl};
use std::cmp;

use crate::{
    db_models::{build::Build, user_stat::UserStat},
    schema::{builds, user_stats},
    utils::{
        database_connection::get_db_connection,
        database_utils::{get_config_table_chunk_size, ArcDbPool},
    },
};

const POINT_PER_SUBMIT_BUILD: i64 = 0;

async fn execute_submit_build_for_review_events_sql(
    conn: &mut AsyncPgConnection,
    items_to_insert: Vec<Build>,
    user_stats_changes: AHashMap<String, (i64, i64)>,
) -> QueryResult<()> {
    conn.transaction(|conn| {
        Box::pin(async move {
            let update_build_query = insert_into(builds::table)
                .values(items_to_insert.clone())
                .on_conflict(builds::build_obj_addr)
                .do_update()
                .set((
                    builds::build_obj_addr.eq(builds::build_obj_addr),
                    builds::bounty_obj_addr.eq(builds::bounty_obj_addr),
                    builds::creator_addr.eq(builds::creator_addr),
                    builds::payment_recipient_addr.eq(builds::payment_recipient_addr),
                    builds::payment_amount.eq(builds::payment_amount),
                    builds::create_timestamp.eq(builds::create_timestamp),
                    builds::last_update_timestamp.eq(excluded(builds::last_update_timestamp)),
                    builds::proof_link.eq(excluded(builds::proof_link)),
                    builds::build_status.eq(excluded(builds::build_status)),
                    builds::last_update_event_idx.eq(excluded(builds::last_update_event_idx)),
                ))
                .filter(
                    // Update only if the last update timestamp is greater than the existing one
                    // or if the last update timestamp is the same but the event index is greater
                    builds::last_update_timestamp
                        .lt(excluded(builds::last_update_timestamp))
                        .or(builds::last_update_timestamp
                            .eq(excluded(builds::last_update_timestamp))
                            .and(
                                builds::last_update_event_idx
                                    .lt(excluded(builds::last_update_event_idx)),
                            )),
                );
            update_build_query.execute(conn).await?;

            /*
            DO NOT backfill data (i.e. process same event twice), you would mess up the user stat!!!!
            Instead, if you want to change the point calculation logic, you should delete all data and re-index from scratch.
            You can delete all data by revert all DB migrations, see README.md for more details.
             */
            let update_user_stat_query = insert_into(user_stats::table)
                .values(
                    user_stats_changes
                        .iter()
                        .map(
                            |(user_addr, (submit_build_for_review_count, latest_build_time))| {
                                UserStat {
                                    user_addr: user_addr.clone(),
                                    // This value doesn't matter because we always use the original DB value
                                    create_timestamp: 0,
                                    last_update_timestamp: *latest_build_time,
                                    season_1_points: submit_build_for_review_count
                                        * POINT_PER_SUBMIT_BUILD,
                                    total_points: submit_build_for_review_count
                                        * POINT_PER_SUBMIT_BUILD,
                                    // This value doesn't matter because we always use the original DB value
                                    bounty_created: 0,
                                    // This value doesn't matter because we always use the original DB value
                                    apt_spent: 0,
                                    stable_spent: 0,
                                    // This value doesn't matter because we always use the original DB value
                                    build_created: 0,
                                    build_submitted_for_review: *submit_build_for_review_count,
                                    // This value doesn't matter because we always use the original DB value
                                    build_canceled: 0,
                                    // This value doesn't matter because we always use the original DB value
                                    build_completed: 0,
                                    // This value doesn't matter because we always use the original DB value
                                    apt_received: 0,
                                    stable_received: 0,
                                }
                            },
                        )
                        .collect::<Vec<_>>(),
                )
                .on_conflict(user_stats::user_addr)
                .do_update()
                .set((
                    user_stats::user_addr.eq(user_stats::user_addr),
                    user_stats::create_timestamp.eq(user_stats::create_timestamp),
                    user_stats::last_update_timestamp
                        .eq(excluded(user_stats::last_update_timestamp)),
                    user_stats::season_1_points
                        .eq(user_stats::season_1_points + excluded(user_stats::season_1_points)),
                    user_stats::total_points
                        .eq(user_stats::total_points + excluded(user_stats::total_points)),
                    user_stats::bounty_created.eq(user_stats::bounty_created),
                    user_stats::apt_spent.eq(user_stats::apt_spent),
                    user_stats::stable_spent.eq(user_stats::stable_spent),
                    user_stats::build_created.eq(user_stats::build_created),
                    user_stats::build_submitted_for_review
                        .eq(user_stats::build_submitted_for_review
                            + excluded(user_stats::build_submitted_for_review)),
                    user_stats::build_canceled.eq(user_stats::build_canceled),
                    user_stats::build_completed.eq(user_stats::build_completed),
                    user_stats::apt_received.eq(user_stats::apt_received),
                    user_stats::stable_received.eq(user_stats::stable_received),
                ));
            update_user_stat_query.execute(conn).await?;

            Ok(())
        })
    })
    .await
}

pub async fn process_submit_build_for_review_events(
    pool: ArcDbPool,
    per_table_chunk_sizes: AHashMap<String, usize>,
    submit_events: Vec<Build>,
) -> Result<(), ProcessorError> {
    // Key is user address
    // Value is (number of build submitted, latest submit build time)
    let mut user_stats_changes: AHashMap<String, (i64, i64)> = AHashMap::new();
    for build in submit_events.clone() {
        let default_value = (0, 0);
        let (submit_count, latest_time) = user_stats_changes
            .get(&build.creator_addr)
            .unwrap_or(&default_value);
        user_stats_changes.insert(
            build.creator_addr,
            (
                submit_count + 1,
                cmp::max(*latest_time, build.last_update_timestamp),
            ),
        );
    }

    let chunk_size = get_config_table_chunk_size::<Build>("builds", &per_table_chunk_sizes);
    let tasks = submit_events
        .chunks(chunk_size)
        .map(|chunk| {
            let pool = pool.clone();
            let items = chunk.to_vec();
            let user_stats_changes = user_stats_changes.clone();
            tokio::spawn(async move {
                let conn = &mut get_db_connection(&pool).await.expect(
                    "Failed to get connection from pool while processing submit build events",
                );
                execute_submit_build_for_review_events_sql(conn, items, user_stats_changes).await
            })
        })
        .collect::<Vec<_>>();

    let results = futures_util::future::try_join_all(tasks)
        .await
        .expect("Task panicked executing in chunks");
    for res in results {
        res.map_err(|e| {
            tracing::warn!("Error running query: {:?}", e);
            ProcessorError::ProcessError {
                message: format!("Error running query: {:?}", e),
            }
        })?;
    }
    Ok(())
}

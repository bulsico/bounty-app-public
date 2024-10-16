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
    db_models::{bounty::Bounty, build::Build, user_stat::UserStat},
    schema::{bounties, builds, user_stats},
    utils::{
        database_connection::get_db_connection,
        database_utils::{get_config_table_chunk_size, ArcDbPool},
    },
};

use super::APT_FA_ADDR;

// Negative point for cancel build
const POINT_PER_ACCEPT_BUILD: i64 = 1;

async fn execute_accept_build_events_sql(
    conn: &mut AsyncPgConnection,
    items_to_insert: Vec<(Bounty, Build)>,
    user_stats_changes: AHashMap<String, (i64, i64, i64, i64)>,
) -> QueryResult<()> {
    conn.transaction(|conn| {
        Box::pin(async move {
            let (bounties, builds): (Vec<Bounty>, Vec<Build>) = items_to_insert.into_iter().unzip();
            let update_bounty_query = insert_into(bounties::table)
                .values(bounties)
                .on_conflict(bounties::bounty_obj_addr)
                .do_update()
                .set((
                    bounties::bounty_obj_addr.eq(bounties::bounty_obj_addr),
                    bounties::creator_addr.eq(bounties::creator_addr),
                    bounties::create_timestamp.eq(bounties::create_timestamp),
                    bounties::end_timestamp.eq(bounties::end_timestamp),
                    bounties::last_update_timestamp.eq(excluded(bounties::last_update_timestamp)),
                    bounties::title.eq(bounties::title),
                    bounties::description_link.eq(bounties::description_link),
                    bounties::payment_metadata_obj_addr.eq(bounties::payment_metadata_obj_addr),
                    bounties::payment_per_winner.eq(bounties::payment_per_winner),
                    bounties::stake_required.eq(bounties::stake_required),
                    bounties::stake_lockup_in_seconds.eq(bounties::stake_lockup_in_seconds),
                    bounties::winner_count.eq(excluded(bounties::winner_count)),
                    bounties::winner_limit.eq(bounties::winner_limit),
                    bounties::total_payment.eq(bounties::total_payment),
                    bounties::contact_info.eq(bounties::contact_info),
                    bounties::last_update_event_idx.eq(excluded(bounties::last_update_event_idx)),
                ))
                .filter(
                    // Update only if the last update timestamp is greater than the existing one
                    // or if the last update timestamp is the same but the event index is greater
                    bounties::last_update_timestamp
                        .lt(excluded(bounties::last_update_timestamp))
                        .or(bounties::last_update_timestamp
                            .eq(excluded(bounties::last_update_timestamp))
                            .and(
                                bounties::last_update_event_idx
                                    .lt(excluded(bounties::last_update_event_idx)),
                            )),
                );
            update_bounty_query.execute(conn).await?;

            let update_build_query = insert_into(builds::table)
                .values(builds)
                .on_conflict(builds::build_obj_addr)
                .do_update()
                .set((
                    builds::build_obj_addr.eq(builds::build_obj_addr),
                    builds::bounty_obj_addr.eq(builds::bounty_obj_addr),
                    builds::creator_addr.eq(builds::creator_addr),
                    builds::payment_recipient_addr.eq(builds::payment_recipient_addr),
                    builds::payment_amount.eq(excluded(builds::payment_amount)),
                    builds::create_timestamp.eq(builds::create_timestamp),
                    builds::last_update_timestamp.eq(excluded(builds::last_update_timestamp)),
                    builds::proof_link.eq(builds::proof_link),
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
                            |(
                                user_addr,
                                (
                                    accept_build_count,
                                    latest_build_time,
                                    apt_received,
                                    stable_received,
                                ),
                            )| UserStat {
                                user_addr: user_addr.clone(),
                                // This value doesn't matter because we always use the original DB value
                                create_timestamp: 0,
                                last_update_timestamp: *latest_build_time,
                                season_1_points: accept_build_count * POINT_PER_ACCEPT_BUILD,
                                total_points: accept_build_count * POINT_PER_ACCEPT_BUILD,
                                // This value doesn't matter because we always use the original DB value
                                bounty_created: 0,
                                // This value doesn't matter because we always use the original DB value
                                apt_spent: 0,
                                stable_spent: 0,
                                // This value doesn't matter because we always use the original DB value
                                build_created: 0,
                                build_submitted_for_review: -accept_build_count,
                                // This value doesn't matter because we always use the original DB value
                                build_canceled: 0,
                                build_completed: *accept_build_count,
                                apt_received: *apt_received,
                                stable_received: *stable_received,
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
                        .eq(user_stats::build_submitted_for_review + excluded(user_stats::build_submitted_for_review)),
                    user_stats::build_canceled.eq(user_stats::build_canceled),
                    user_stats::build_completed
                        .eq(user_stats::build_completed + excluded(user_stats::build_completed)),
                    user_stats::apt_received.eq(user_stats::apt_received + excluded(user_stats::apt_received)),
                    user_stats::stable_received.eq(user_stats::stable_received + excluded(user_stats::stable_received)),
                ));
            update_user_stat_query.execute(conn).await?;

            Ok(())
        })
    })
    .await
}

pub async fn process_accept_build_events(
    pool: ArcDbPool,
    per_table_chunk_sizes: AHashMap<String, usize>,
    accept_events: Vec<(Bounty, Build)>,
) -> Result<(), ProcessorError> {
    // Key is user address
    // Value is (number of build accepted, latest accept build time, apt received, stable received)
    let mut user_stats_changes: AHashMap<String, (i64, i64, i64, i64)> = AHashMap::new();
    for (bounty, build) in accept_events.clone() {
        let default_value = (0, 0, 0, 0);
        let (accept_count, latest_time, apt_received, stable_received) = user_stats_changes
            .get(&build.creator_addr)
            .unwrap_or(&default_value);
        let new_apt_received = if bounty.payment_metadata_obj_addr == APT_FA_ADDR {
            apt_received + bounty.payment_per_winner
        } else {
            *apt_received
        };
        user_stats_changes.insert(
            build.creator_addr,
            (
                accept_count + 1,
                cmp::max(*latest_time, build.last_update_timestamp),
                new_apt_received,
                *stable_received,
            ),
        );
    }

    let chunk_size = get_config_table_chunk_size::<Build>("builds", &per_table_chunk_sizes);
    let tasks = accept_events
        .chunks(chunk_size)
        .map(|chunk| {
            let pool = pool.clone();
            let items = chunk.to_vec();
            let user_stats_changes = user_stats_changes.clone();
            tokio::spawn(async move {
                let conn = &mut get_db_connection(&pool).await.expect(
                    "Failed to get connection from pool while processing accept build events",
                );
                execute_accept_build_events_sql(conn, items, user_stats_changes).await
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

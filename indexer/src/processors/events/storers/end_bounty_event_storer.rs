use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::utils::errors::ProcessorError;
use diesel::{
    insert_into, query_dsl::methods::FilterDsl, upsert::excluded, BoolExpressionMethods,
    ExpressionMethods, QueryResult,
};
use diesel_async::{AsyncConnection, AsyncPgConnection, RunQueryDsl};
use std::cmp;

use super::APT_FA_ADDR;
use crate::{
    db_models::{bounty::Bounty, user_stat::UserStat},
    schema::{bounties, user_stats},
    utils::{
        database_connection::get_db_connection,
        database_utils::{get_config_table_chunk_size, ArcDbPool},
    },
};

const POINT_PER_END_BOUNTY: i64 = 0;

async fn execute_end_bounty_events_sql(
    conn: &mut AsyncPgConnection,
    items_to_insert: Vec<Bounty>,
    user_stats_changes: AHashMap<String, (i64, i64, i64, i64)>,
) -> QueryResult<()> {
    conn.transaction(|conn| {
        Box::pin(async move {
            let end_bounty_query = insert_into(bounties::table)
                .values(items_to_insert.clone())
                .on_conflict(bounties::bounty_obj_addr)
                .do_update()
                .set((
                    bounties::bounty_obj_addr.eq(bounties::bounty_obj_addr),
                    bounties::creator_addr.eq(bounties::creator_addr),
                    bounties::create_timestamp.eq(bounties::create_timestamp),
                    bounties::end_timestamp.eq(excluded(bounties::end_timestamp)),
                    bounties::last_update_timestamp.eq(excluded(bounties::last_update_timestamp)),
                    bounties::title.eq(bounties::title),
                    bounties::description_link.eq(bounties::description_link),
                    bounties::payment_metadata_obj_addr.eq(bounties::payment_metadata_obj_addr),
                    bounties::payment_per_winner.eq(bounties::payment_per_winner),
                    bounties::stake_required.eq(bounties::stake_required),
                    bounties::stake_lockup_in_seconds.eq(bounties::stake_lockup_in_seconds),
                    bounties::winner_count.eq(bounties::winner_count),
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
            end_bounty_query.execute(conn).await?;

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
                                    end_bounty_count,
                                    latest_end_bounty_time,
                                    apt_withdraw,
                                    stable_withdraw,
                                ),
                            )| UserStat {
                                user_addr: user_addr.clone(),
                                create_timestamp: *latest_end_bounty_time,
                                last_update_timestamp: *latest_end_bounty_time,
                                season_1_points: end_bounty_count * POINT_PER_END_BOUNTY,
                                total_points: end_bounty_count * POINT_PER_END_BOUNTY,
                                bounty_created: 0,
                                apt_spent: -*apt_withdraw,
                                stable_spent: -*stable_withdraw,
                                build_created: 0,
                                build_submitted_for_review: 0,
                                build_canceled: 0,
                                build_completed: 0,
                                apt_received: 0,
                                stable_received: 0,
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
                    user_stats::apt_spent
                        .eq(user_stats::apt_spent - excluded(user_stats::apt_spent)),
                    user_stats::stable_spent
                        .eq(user_stats::stable_spent - excluded(user_stats::stable_spent)),
                    user_stats::build_created.eq(user_stats::build_created),
                    user_stats::build_submitted_for_review
                        .eq(user_stats::build_submitted_for_review),
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

pub async fn process_end_bounty_events(
    pool: ArcDbPool,
    per_table_chunk_sizes: AHashMap<String, usize>,
    end_events: Vec<(Bounty, i64)>,
) -> Result<(), ProcessorError> {
    // Key is user address
    // Value is (number of bounty created, latest end bounty time, APT withdraw amount, stable withdraw amount)
    let mut user_stats_changes: AHashMap<String, (i64, i64, i64, i64)> = AHashMap::new();
    for (bounty, payment_sent_back_to_creator) in end_events.clone() {
        let default_value = (0, 0, 0, 0);
        let (end_count, latest_time, apt_withdraw, stable_withdraw) = user_stats_changes
            .get(&bounty.creator_addr)
            .unwrap_or(&default_value);
        let new_apt_withdraw = if bounty.payment_metadata_obj_addr == APT_FA_ADDR {
            apt_withdraw + payment_sent_back_to_creator
        } else {
            *apt_withdraw
        };
        user_stats_changes.insert(
            bounty.creator_addr,
            (
                end_count + 1,
                cmp::max(*latest_time, bounty.create_timestamp),
                new_apt_withdraw,
                *stable_withdraw,
            ),
        );
    }

    let chunk_size = get_config_table_chunk_size::<Bounty>("bounties", &per_table_chunk_sizes);
    let tasks = end_events
        .chunks(chunk_size)
        .map(|chunk| {
            let pool = pool.clone();
            let items = chunk.to_vec();
            let user_stats_changes = user_stats_changes.clone();
            tokio::spawn(async move {
                let conn = &mut get_db_connection(&pool).await.expect(
                    "Failed to get connection from pool while processing create bounty events",
                );
                execute_end_bounty_events_sql(
                    conn,
                    items
                        .into_iter()
                        .map(|(bounty, _)| bounty)
                        .collect::<Vec<_>>(),
                    user_stats_changes,
                )
                .await
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

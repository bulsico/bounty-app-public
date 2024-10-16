use diesel::{AsChangeset, Insertable, Queryable};
use field_count::FieldCount;
use serde::{Deserialize, Serialize};

use crate::schema::user_stats;

#[derive(AsChangeset, Clone, Debug, Deserialize, FieldCount, Insertable, Serialize, Queryable)]
#[diesel(table_name = user_stats)]
/// Database representation of a user's statistics
pub struct UserStat {
    pub user_addr: String,
    pub create_timestamp: i64,
    pub last_update_timestamp: i64,
    pub bounty_created: i64,
    pub apt_spent: i64,
    pub stable_spent: i64,
    pub build_created: i64,
    pub build_submitted_for_review: i64,
    pub build_canceled: i64,
    pub build_completed: i64,
    pub apt_received: i64,
    pub stable_received: i64,
    pub season_1_points: i64,
    pub total_points: i64,
}

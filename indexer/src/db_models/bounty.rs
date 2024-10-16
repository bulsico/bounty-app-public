use aptos_indexer_processor_sdk::utils::convert::standardize_address;
use diesel::{AsChangeset, Insertable};
use field_count::FieldCount;
use serde::{Deserialize, Serialize};

use crate::schema::bounties;

#[derive(AsChangeset, Clone, Debug, Deserialize, FieldCount, Insertable, Serialize)]
#[diesel(table_name = bounties)]
/// Database representation of a bounty
pub struct Bounty {
    pub bounty_obj_addr: String,
    pub creator_addr: String,
    pub create_timestamp: i64,
    pub end_timestamp: i64,
    pub last_update_timestamp: i64,
    pub title: String,
    pub description_link: String,
    pub payment_metadata_obj_addr: String,
    pub payment_per_winner: i64,
    pub stake_required: i64,
    pub stake_lockup_in_seconds: i64,
    pub winner_count: i64,
    pub winner_limit: i64,
    pub total_payment: i64,
    pub contact_info: String,
    pub last_update_event_idx: i64,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct OnChainObject {
    pub inner: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
/// On-chain representation of a bounty
pub struct BountyOnChain {
    pub creator: String,
    pub create_timestamp: String,
    pub last_update_timestamp: String,
    pub end_timestamp: String,
    pub title: String,
    pub description_link: String,
    pub payment_metadata_object: OnChainObject,
    pub payment_per_winner: String,
    pub stake_required: String,
    pub stake_lockup_in_seconds: String,
    pub winner_count: String,
    pub winner_limit: String,
    pub contact_info: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
/// On-chain representation of a create bounty event
pub struct CreateBountyEventOnChain {
    pub bounty_obj_addr: String,
    pub bounty: BountyOnChain,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
/// On-chain representation of an end bounty event
pub struct EndBountyEventOnChain {
    pub bounty_obj_addr: String,
    pub bounty: BountyOnChain,
    pub payment_sent_back_to_creator: String,
}

impl CreateBountyEventOnChain {
    pub fn to_db_bounty(&self) -> Bounty {
        let create_timestamp = self.bounty.create_timestamp.parse().unwrap();
        let payment_per_winner = self.bounty.payment_per_winner.parse().unwrap();
        let winner_limit = self.bounty.winner_limit.parse().unwrap();
        Bounty {
            bounty_obj_addr: standardize_address(&self.bounty_obj_addr),
            creator_addr: standardize_address(self.bounty.creator.as_str()),
            create_timestamp,
            end_timestamp: self.bounty.end_timestamp.parse().unwrap(),
            last_update_timestamp: create_timestamp,
            title: self.bounty.title.clone(),
            description_link: self.bounty.description_link.clone(),
            payment_metadata_obj_addr: standardize_address(
                &self.bounty.payment_metadata_object.inner,
            ),
            payment_per_winner,
            stake_required: self.bounty.stake_required.parse().unwrap(),
            stake_lockup_in_seconds: self.bounty.stake_lockup_in_seconds.parse().unwrap(),
            winner_count: self.bounty.winner_count.parse().unwrap(),
            winner_limit,
            total_payment: payment_per_winner * winner_limit,
            contact_info: self.bounty.contact_info.clone(),
            last_update_event_idx: 0,
        }
    }
}

impl EndBountyEventOnChain {
    pub fn to_db_bounty(&self, last_update_event_idx: i64) -> Bounty {
        let payment_per_winner = self.bounty.payment_per_winner.parse().unwrap();
        let winner_limit = self.bounty.winner_limit.parse().unwrap();
        Bounty {
            bounty_obj_addr: standardize_address(&self.bounty_obj_addr),
            creator_addr: standardize_address(self.bounty.creator.as_str()),
            create_timestamp: self.bounty.create_timestamp.parse().unwrap(),
            end_timestamp: self.bounty.end_timestamp.parse().unwrap(),
            last_update_timestamp: self.bounty.last_update_timestamp.parse().unwrap(),
            title: self.bounty.title.clone(),
            description_link: self.bounty.description_link.clone(),
            payment_metadata_obj_addr: standardize_address(
                &self.bounty.payment_metadata_object.inner,
            ),
            payment_per_winner,
            stake_required: self.bounty.stake_required.parse().unwrap(),
            stake_lockup_in_seconds: self.bounty.stake_lockup_in_seconds.parse().unwrap(),
            winner_count: self.bounty.winner_count.parse().unwrap(),
            winner_limit,
            total_payment: payment_per_winner * winner_limit,
            contact_info: self.bounty.contact_info.clone(),
            last_update_event_idx,
        }
    }

    pub fn to_payment_sent_back_to_creator(&self) -> i64 {
        self.payment_sent_back_to_creator.parse().unwrap()
    }
}

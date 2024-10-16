use aptos_indexer_processor_sdk::utils::convert::standardize_address;
use diesel::{AsChangeset, Insertable};
use field_count::FieldCount;
use serde::{Deserialize, Serialize};

use crate::schema::builds;

use super::bounty::{Bounty, BountyOnChain};

#[derive(AsChangeset, Clone, Debug, Deserialize, FieldCount, Insertable, Serialize)]
#[diesel(table_name = builds)]
/// Database representation of a bounty
pub struct Build {
    pub build_obj_addr: String,
    pub bounty_obj_addr: String,
    pub creator_addr: String,
    pub payment_recipient_addr: String,
    pub payment_amount: i64,
    pub create_timestamp: i64,
    pub last_update_timestamp: i64,
    pub proof_link: String,
    pub build_status: i64,
    pub last_update_event_idx: i64,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct OnChainObject {
    pub inner: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
/// On-chain representation of a bounty
pub struct BuildOnChain {
    pub creator: String,
    pub payment_recipient: String,
    pub payment_amount: String,
    pub create_timestamp: String,
    pub last_update_timestamp: String,
    pub proof_link: String,
    pub bounty_object: OnChainObject,
    pub status: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
/// On-chain representation of a create bounty event
pub struct CreateBuildEventOnChain {
    pub build_obj_addr: String,
    pub build: BuildOnChain,
}

impl CreateBuildEventOnChain {
    pub fn to_db_build(&self) -> Build {
        let create_timestamp = self.build.create_timestamp.parse().unwrap();
        Build {
            build_obj_addr: standardize_address(&self.build_obj_addr),
            bounty_obj_addr: standardize_address(&self.build.bounty_object.inner),
            creator_addr: standardize_address(self.build.creator.as_str()),
            payment_recipient_addr: standardize_address(self.build.payment_recipient.as_str()),
            payment_amount: self.build.payment_amount.parse().unwrap(),
            create_timestamp,
            last_update_timestamp: create_timestamp,
            proof_link: self.build.proof_link.clone(),
            build_status: self.build.status.parse().unwrap(),
            last_update_event_idx: 0,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
/// On-chain representation of a cancel bounty event
pub struct CancelBuildEventOnChain {
    pub build_obj_addr: String,
    pub build: BuildOnChain,
}

impl CancelBuildEventOnChain {
    pub fn to_db_build(&self, last_update_event_idx: i64) -> Build {
        Build {
            build_obj_addr: standardize_address(&self.build_obj_addr),
            bounty_obj_addr: standardize_address(&self.build.bounty_object.inner),
            creator_addr: standardize_address(self.build.creator.as_str()),
            payment_recipient_addr: standardize_address(self.build.payment_recipient.as_str()),
            payment_amount: self.build.payment_amount.parse().unwrap(),
            create_timestamp: self.build.create_timestamp.parse().unwrap(),
            last_update_timestamp: self.build.last_update_timestamp.parse().unwrap(),
            proof_link: self.build.proof_link.clone(),
            build_status: self.build.status.parse().unwrap(),
            last_update_event_idx,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
/// On-chain representation of a submit bounty for review event
pub struct SubmitBuildForReviewEventOnChain {
    pub build_obj_addr: String,
    pub build: BuildOnChain,
}

impl SubmitBuildForReviewEventOnChain {
    pub fn to_db_build(&self, last_update_event_idx: i64) -> Build {
        Build {
            build_obj_addr: standardize_address(&self.build_obj_addr),
            bounty_obj_addr: standardize_address(&self.build.bounty_object.inner),
            creator_addr: standardize_address(self.build.creator.as_str()),
            payment_recipient_addr: standardize_address(self.build.payment_recipient.as_str()),
            payment_amount: self.build.payment_amount.parse().unwrap(),
            create_timestamp: self.build.create_timestamp.parse().unwrap(),
            last_update_timestamp: self.build.last_update_timestamp.parse().unwrap(),
            proof_link: self.build.proof_link.clone(),
            build_status: self.build.status.parse().unwrap(),
            last_update_event_idx,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
/// On-chain representation of a submit bounty for review event
pub struct AcceptBuildEventOnChain {
    pub build_obj_addr: String,
    pub build: BuildOnChain,
    pub bounty: BountyOnChain,
}

impl AcceptBuildEventOnChain {
    pub fn to_db_build(&self, last_update_event_idx: i64) -> Build {
        Build {
            build_obj_addr: standardize_address(&self.build_obj_addr),
            bounty_obj_addr: standardize_address(&self.build.bounty_object.inner),
            creator_addr: standardize_address(self.build.creator.as_str()),
            payment_recipient_addr: standardize_address(self.build.payment_recipient.as_str()),
            payment_amount: self.build.payment_amount.parse().unwrap(),
            create_timestamp: self.build.create_timestamp.parse().unwrap(),
            last_update_timestamp: self.build.last_update_timestamp.parse().unwrap(),
            proof_link: self.build.proof_link.clone(),
            build_status: self.build.status.parse().unwrap(),
            last_update_event_idx,
        }
    }
    pub fn to_db_bounty(&self, last_update_event_idx: i64) -> Bounty {
        let payment_per_winner = self.bounty.payment_per_winner.parse().unwrap();
        let winner_limit = self.bounty.winner_limit.parse().unwrap();
        Bounty {
            bounty_obj_addr: standardize_address(&self.build.bounty_object.inner),
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
}

use anyhow::Result;
use aptos_indexer_processor_sdk::{
    aptos_protos::transaction::v1::{transaction::TxnData, Event as EventPB, Transaction},
    traits::{async_step::AsyncRunType, AsyncStep, NamedStep, Processable},
    types::transaction_context::TransactionContext,
    utils::errors::ProcessorError,
};
use async_trait::async_trait;
use rayon::prelude::*;

use crate::db_models::{
    bounty::{Bounty, CreateBountyEventOnChain, EndBountyEventOnChain},
    build::{
        AcceptBuildEventOnChain, Build, CancelBuildEventOnChain, CreateBuildEventOnChain,
        SubmitBuildForReviewEventOnChain,
    },
};

/// EventsExtractor is a step that extracts events and their metadata from transactions.
pub struct EventsExtractor
where
    Self: Sized + Send + 'static,
{
    contract_address: String,
}

impl EventsExtractor {
    pub fn new(contract_address: String) -> Self {
        Self { contract_address }
    }
}

impl AsyncStep for EventsExtractor {}

impl NamedStep for EventsExtractor {
    fn name(&self) -> String {
        "EventsExtractor".to_string()
    }
}

#[async_trait]
impl Processable for EventsExtractor {
    type Input = Transaction;
    type Output = ContractEvent;
    type RunType = AsyncRunType;

    async fn process(
        &mut self,
        item: TransactionContext<Transaction>,
    ) -> Result<Option<TransactionContext<ContractEvent>>, ProcessorError> {
        let events = item
            .data
            .par_iter()
            .map(|txn| {
                let mut events = vec![];
                let txn_version = txn.version as i64;
                let txn_data = match txn.txn_data.as_ref() {
                    Some(data) => data,
                    None => {
                        tracing::warn!(
                            transaction_version = txn_version,
                            "Transaction data doesn't exist"
                        );
                        return vec![];
                    }
                };
                let default = vec![];
                let raw_events = match txn_data {
                    TxnData::BlockMetadata(tx_inner) => &tx_inner.events,
                    TxnData::Genesis(tx_inner) => &tx_inner.events,
                    TxnData::User(tx_inner) => &tx_inner.events,
                    _ => &default,
                };

                let txn_events =
                    ContractEvent::from_events(self.contract_address.as_str(), raw_events);
                events.extend(txn_events);
                events
            })
            .flatten()
            .collect::<Vec<ContractEvent>>();
        Ok(Some(TransactionContext {
            data: events,
            start_version: item.start_version,
            end_version: item.end_version,
            start_transaction_timestamp: item.start_transaction_timestamp,
            end_transaction_timestamp: item.end_transaction_timestamp,
            total_size_in_bytes: item.total_size_in_bytes,
        }))
    }
}

#[derive(Debug, Clone)]
pub enum ContractEvent {
    CreateBountyEvent(Bounty),
    EndBountyEvent(Bounty, i64),
    CreateBuildEvent(Build),
    CancelBuildEvent(Build),
    SubmitBuildForReviewEvent(Build),
    AcceptBuildEvent(Bounty, Build),
}

impl ContractEvent {
    fn from_event(contract_address: &str, event_idx: usize, event: &EventPB) -> Option<Self> {
        let t: &str = event.type_str.as_ref();
        let should_include = t.starts_with(contract_address);

        if should_include {
            if t.starts_with(
                format!("{}::bounty_app::CreateBountyEvent", contract_address).as_str(),
            ) {
                println!("CreateBountyEvent {}", event.data.as_str());
                let create_bounty_event_on_chain: CreateBountyEventOnChain =
                    serde_json::from_str(event.data.as_str()).unwrap_or_else(|_| {
                        panic!("Failed to parse CreateBountyEvent, {}", event.data.as_str())
                    });
                Some(ContractEvent::CreateBountyEvent(
                    create_bounty_event_on_chain.to_db_bounty(),
                ))
            } else if t
                .starts_with(format!("{}::bounty_app::EndBountyEvent", contract_address).as_str())
            {
                println!("EndBountyEvent {}", event.data.as_str());
                let end_bounty_event_on_chain: EndBountyEventOnChain =
                    serde_json::from_str(event.data.as_str()).unwrap_or_else(|_| {
                        panic!("Failed to parse EndBountyEvent, {}", event.data.as_str())
                    });
                Some(ContractEvent::EndBountyEvent(
                    end_bounty_event_on_chain.to_db_bounty(event_idx as i64),
                    end_bounty_event_on_chain.to_payment_sent_back_to_creator(),
                ))
            } else if t
                .starts_with(format!("{}::bounty_app::CreateBuildEvent", contract_address).as_str())
            {
                println!("CreateBuildEvent {}", event.data.as_str());
                let create_build_event_on_chain: CreateBuildEventOnChain =
                    serde_json::from_str(event.data.as_str()).unwrap_or_else(|_| {
                        panic!("Failed to parse CreateBuildEvent, {}", event.data.as_str())
                    });
                Some(ContractEvent::CreateBuildEvent(
                    create_build_event_on_chain.to_db_build(),
                ))
            } else if t
                .starts_with(format!("{}::bounty_app::CancelBuildEvent", contract_address).as_str())
            {
                println!("CancelBuildEvent {}", event.data.as_str());
                let cancel_build_event_on_chain: CancelBuildEventOnChain =
                    serde_json::from_str(event.data.as_str()).unwrap_or_else(|_| {
                        panic!("Failed to parse CancelBuildEvent, {}", event.data.as_str())
                    });
                Some(ContractEvent::CancelBuildEvent(
                    cancel_build_event_on_chain.to_db_build(event_idx as i64),
                ))
            } else if t.starts_with(
                format!(
                    "{}::bounty_app::SubmitBuildForReviewEvent",
                    contract_address
                )
                .as_str(),
            ) {
                println!("SubmitBuildForReviewEvent {}", event.data.as_str());
                let submit_build_for_review_event_on_chain: SubmitBuildForReviewEventOnChain =
                    serde_json::from_str(event.data.as_str()).unwrap_or_else(|_| {
                        panic!(
                            "Failed to parse SubmitBuildForReviewEvent, {}",
                            event.data.as_str()
                        )
                    });
                Some(ContractEvent::SubmitBuildForReviewEvent(
                    submit_build_for_review_event_on_chain.to_db_build(event_idx as i64),
                ))
            } else if t
                .starts_with(format!("{}::bounty_app::AcceptBuildEvent", contract_address).as_str())
            {
                println!("AcceptBuildEvent {}", event.data.as_str());
                let accept_build_event_on_chain: AcceptBuildEventOnChain =
                    serde_json::from_str(event.data.as_str()).unwrap_or_else(|_| {
                        panic!("Failed to parse AcceptBuildEvent, {}", event.data.as_str())
                    });
                Some(ContractEvent::AcceptBuildEvent(
                    accept_build_event_on_chain.to_db_bounty(event_idx as i64),
                    accept_build_event_on_chain.to_db_build(event_idx as i64),
                ))
            } else {
                None
            }
        } else {
            None
        }
    }

    pub fn from_events(contract_address: &str, events: &[EventPB]) -> Vec<Self> {
        events
            .iter()
            .enumerate()
            .filter_map(|(idx, event)| Self::from_event(contract_address, idx, event))
            .collect()
    }
}

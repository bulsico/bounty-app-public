use ahash::AHashMap;
use anyhow::Result;
use aptos_indexer_processor_sdk::{
    traits::{async_step::AsyncRunType, AsyncStep, NamedStep, Processable},
    types::transaction_context::TransactionContext,
    utils::errors::ProcessorError,
};
use async_trait::async_trait;

use super::{
    events_extractor::ContractEvent,
    storers::{
        accept_build_event_storer::process_accept_build_events,
        cancel_build_event_storer::process_cancel_build_events,
        create_bounty_event_storer::process_create_bounty_events,
        create_build_event_storer::process_create_build_events,
        end_bounty_event_storer::process_end_bounty_events,
        submit_build_for_review_event_storer::process_submit_build_for_review_events,
    },
};
use crate::utils::database_utils::ArcDbPool;

/// EventsStorer is a step that inserts events in the database.
pub struct EventsStorer
where
    Self: Sized + Send + 'static,
{
    pool: ArcDbPool,
}

impl AsyncStep for EventsStorer {}

impl NamedStep for EventsStorer {
    fn name(&self) -> String {
        "EventsStorer".to_string()
    }
}

impl EventsStorer {
    pub fn new(pool: ArcDbPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl Processable for EventsStorer {
    type Input = ContractEvent;
    type Output = ContractEvent;
    type RunType = AsyncRunType;

    async fn process(
        &mut self,
        events: TransactionContext<ContractEvent>,
    ) -> Result<Option<TransactionContext<ContractEvent>>, ProcessorError> {
        let per_table_chunk_sizes: AHashMap<String, usize> = AHashMap::new();
        let (
            create_bounty_events,
            end_bounty_events,
            create_build_events,
            cancel_build_events,
            submit_build_for_review_events,
            accept_build_events,
        ) = events.clone().data.into_iter().fold(
            (vec![], vec![], vec![], vec![], vec![], vec![]),
            |(
                mut create_bounty_events,
                mut end_bounty_events,
                mut create_build_events,
                mut cancel_build_events,
                mut submit_build_for_review_events,
                mut accept_build_events,
            ),
             event| {
                match event {
                    ContractEvent::CreateBountyEvent(bounty) => {
                        create_bounty_events.push(bounty);
                    }
                    ContractEvent::EndBountyEvent(bounty, payment_sent_back_to_creator) => {
                        end_bounty_events.push((bounty, payment_sent_back_to_creator));
                    }
                    ContractEvent::CreateBuildEvent(build) => {
                        create_build_events.push(build);
                    }
                    ContractEvent::CancelBuildEvent(build) => {
                        cancel_build_events.push(build);
                    }
                    ContractEvent::SubmitBuildForReviewEvent(build) => {
                        submit_build_for_review_events.push(build);
                    }
                    ContractEvent::AcceptBuildEvent(bounty, build) => {
                        accept_build_events.push((bounty, build));
                    }
                }
                (
                    create_bounty_events,
                    end_bounty_events,
                    create_build_events,
                    cancel_build_events,
                    submit_build_for_review_events,
                    accept_build_events,
                )
            },
        );

        process_create_bounty_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            create_bounty_events,
        )
        .await?;

        process_end_bounty_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            end_bounty_events,
        )
        .await?;

        process_create_build_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            create_build_events,
        )
        .await?;

        process_cancel_build_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            cancel_build_events,
        )
        .await?;

        process_submit_build_for_review_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            submit_build_for_review_events,
        )
        .await?;

        process_accept_build_events(
            self.pool.clone(),
            per_table_chunk_sizes.clone(),
            accept_build_events,
        )
        .await?;

        Ok(Some(events))
    }
}

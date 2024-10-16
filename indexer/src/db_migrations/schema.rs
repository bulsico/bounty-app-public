// @generated automatically by Diesel CLI.

diesel::table! {
    bounties (bounty_obj_addr) {
        #[max_length = 300]
        bounty_obj_addr -> Varchar,
        #[max_length = 300]
        creator_addr -> Varchar,
        create_timestamp -> Int8,
        end_timestamp -> Int8,
        last_update_timestamp -> Int8,
        #[max_length = 300]
        title -> Varchar,
        #[max_length = 300]
        description_link -> Varchar,
        #[max_length = 300]
        payment_metadata_obj_addr -> Varchar,
        payment_per_winner -> Int8,
        stake_required -> Int8,
        stake_lockup_in_seconds -> Int8,
        winner_count -> Int8,
        winner_limit -> Int8,
        total_payment -> Int8,
        #[max_length = 100]
        contact_info -> Varchar,
        last_update_event_idx -> Int8,
    }
}

diesel::table! {
    builds (build_obj_addr) {
        #[max_length = 300]
        build_obj_addr -> Varchar,
        #[max_length = 300]
        bounty_obj_addr -> Varchar,
        #[max_length = 300]
        creator_addr -> Varchar,
        #[max_length = 300]
        payment_recipient_addr -> Varchar,
        payment_amount -> Int8,
        create_timestamp -> Int8,
        last_update_timestamp -> Int8,
        #[max_length = 300]
        proof_link -> Varchar,
        build_status -> Int8,
        last_update_event_idx -> Int8,
    }
}

diesel::table! {
    ledger_infos (chain_id) {
        chain_id -> Int8,
    }
}

diesel::table! {
    processor_status (processor) {
        #[max_length = 50]
        processor -> Varchar,
        last_success_version -> Int8,
        last_updated -> Timestamp,
        last_transaction_timestamp -> Nullable<Timestamp>,
    }
}

diesel::table! {
    user_stats (user_addr) {
        #[max_length = 300]
        user_addr -> Varchar,
        create_timestamp -> Int8,
        last_update_timestamp -> Int8,
        bounty_created -> Int8,
        apt_spent -> Int8,
        stable_spent -> Int8,
        build_created -> Int8,
        build_submitted_for_review -> Int8,
        build_canceled -> Int8,
        build_completed -> Int8,
        apt_received -> Int8,
        stable_received -> Int8,
        season_1_points -> Int8,
        total_points -> Int8,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    bounties,
    builds,
    ledger_infos,
    processor_status,
    user_stats,
);

-- Your SQL goes here
CREATE TABLE
    bounties (
        bounty_obj_addr VARCHAR(300) NOT NULL UNIQUE PRIMARY KEY,
        creator_addr VARCHAR(300) NOT NULL,
        create_timestamp BIGINT NOT NULL,
        end_timestamp BIGINT NOT NULL,
        last_update_timestamp BIGINT NOT NULL,
        title VARCHAR(300) NOT NULL,
        description_link VARCHAR(300) NOT NULL,
        payment_metadata_obj_addr VARCHAR(300) NOT NULL,
        payment_per_winner BIGINT NOT NULL,
        stake_required BIGINT NOT NULL,
        stake_lockup_in_seconds BIGINT NOT NULL,
        winner_count BIGINT NOT NULL,
        winner_limit BIGINT NOT NULL,
        total_payment BIGINT NOT NULL,
        contact_info VARCHAR(100) NOT NULL,
        -- we store the event index so when we update in batch,
        -- we ignore when the event index is less than the last update event index
        last_update_event_idx BIGINT NOT NULL
    );
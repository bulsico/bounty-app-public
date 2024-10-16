-- Your SQL goes here
CREATE TABLE
    builds (
        build_obj_addr VARCHAR(300) NOT NULL UNIQUE PRIMARY KEY,
        bounty_obj_addr VARCHAR(300) NOT NULL,
        creator_addr VARCHAR(300) NOT NULL,
        payment_recipient_addr VARCHAR(300) NOT NULL,
        payment_amount BIGINT NOT NULL,
        create_timestamp BIGINT NOT NULL,
        last_update_timestamp BIGINT NOT NULL,
        proof_link VARCHAR(300) NOT NULL,
        build_status BIGINT NOT NULL,
        -- we store the event index so when we update in batch,
        -- we ignore when the event index is less than the last update event index
        last_update_event_idx BIGINT NOT NULL
    );
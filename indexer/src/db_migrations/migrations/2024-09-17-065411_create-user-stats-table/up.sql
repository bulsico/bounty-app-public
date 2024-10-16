-- Your SQL goes here
CREATE TABLE
    user_stats (
        user_addr VARCHAR(300) NOT NULL UNIQUE PRIMARY KEY,
        create_timestamp BIGINT NOT NULL,
        last_update_timestamp BIGINT NOT NULL,
        bounty_created BIGINT NOT NULL,
        apt_spent BIGINT NOT NULL,
        stable_spent BIGINT NOT NULL,
        build_created BIGINT NOT NULL,
        build_submitted_for_review BIGINT NOT NULL,
        build_canceled BIGINT NOT NULL,
        build_completed BIGINT NOT NULL,
        apt_received BIGINT NOT NULL,
        stable_received BIGINT NOT NULL,
        season_1_points BIGINT NOT NULL,
        total_points BIGINT NOT NULL
    );
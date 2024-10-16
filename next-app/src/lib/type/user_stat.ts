export type UserStat = {
  user_addr: `0x${string}`;
  create_timestamp: number;
  last_update_timestamp: number;
  bounty_created: number;
  apt_spent: number;
  stable_spent: number;
  build_created: number;
  build_submitted_for_review: number;
  build_canceled: number;
  build_completed: number;
  apt_received: number;
  stable_received: number;
  season_1_points: number;
  total_points: number;
};

export const convertDbUserStatRowToUserStat = (
  row: Record<string, any>
): UserStat => {
  return {
    user_addr: row.user_addr,
    create_timestamp: parseInt(row.create_timestamp),
    last_update_timestamp: parseInt(row.last_update_timestamp),
    bounty_created: parseInt(row.bounty_created),
    apt_spent: parseInt(row.apt_spent),
    stable_spent: parseInt(row.stable_spent),
    build_created: parseInt(row.build_created),
    build_submitted_for_review: parseInt(row.build_submitted_for_review),
    build_canceled: parseInt(row.build_canceled),
    build_completed: parseInt(row.build_completed),
    apt_received: parseInt(row.apt_received),
    stable_received: parseInt(row.stable_received),
    season_1_points: parseInt(row.season_1_points),
    total_points: parseInt(row.total_points),
  };
};

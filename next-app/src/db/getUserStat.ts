import { getPostgresClient } from "@/lib/db";
import { UserStat, convertDbUserStatRowToUserStat } from "@/lib/type/user_stat";

export type getUserStatProps = {
  userAddr: `0x${string}`;
};

export const getUserStat = async ({
  userAddr,
}: getUserStatProps): Promise<{
  userStat: UserStat;
}> => {
  const userStat = await getPostgresClient()(
    `SELECT * FROM user_stats WHERE user_addr = '${userAddr}'`
  ).then((rows) => {
    if (rows.length === 0) {
      // don't throw error, just return empty object
      return {
        user_addr: userAddr,
        create_timestamp: 0,
        last_update_timestamp: 0,
        bounty_created: 0,
        apt_spent: 0,
        stable_spent: 0,
        build_created: 0,
        build_submitted_for_review: 0,
        build_canceled: 0,
        build_completed: 0,
        apt_received: 0,
        stable_received: 0,
        season_1_points: 0,
        total_points: 0,
      };
    }
    return convertDbUserStatRowToUserStat(rows[0]);
  });
  return { userStat };
};

import { getPostgresClient } from "@/lib/db";
import { convertDbUserStatRowToUserStat, UserStat } from "@/lib/type/user_stat";

export type GetUserStatsProps = {
  page: number;
  limit: number;
  sortedBy: string;
  order: "ASC" | "DESC";
  filter?: string;
};

export const getUserStats = async ({
  page,
  limit,
  sortedBy,
  order,
  filter,
}: GetUserStatsProps): Promise<{
  userStats: UserStat[];
  total: number;
}> => {
  const userStats = await getPostgresClient()(
    `SELECT * FROM user_stats ${
      filter && `WHERE ${filter}`
    } ORDER BY ${sortedBy} ${order} LIMIT ${limit} OFFSET ${(page - 1) * limit}`
  ).then((rows) => {
    return rows.map(convertDbUserStatRowToUserStat);
  });

  const countResult = await getPostgresClient()(
    `SELECT COUNT(*) FROM user_stats ${filter && `WHERE ${filter}`}`
  );

  return {
    userStats,
    total: parseInt(countResult[0].count),
  };
};

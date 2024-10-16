import { getPostgresClient } from "@/lib/db";
import { Bounty, convertDbBountyRowToBounty } from "@/lib/type/bounty";

export type getBountiesProps = {
  page: number;
  limit: number;
  sortedBy: string;
  order: "ASC" | "DESC";
  filter?: string;
};

export const getBounties = async ({
  page,
  limit,
  sortedBy,
  order,
  filter,
}: getBountiesProps): Promise<{
  bounties: Bounty[];
  total: number;
}> => {
  const bounties = await getPostgresClient()(
    `SELECT * FROM bounties ${
      filter && `WHERE ${filter}`
    } ORDER BY ${sortedBy} ${order} LIMIT ${limit} OFFSET ${(page - 1) * limit}`
  ).then((rows) => {
    return rows.map(convertDbBountyRowToBounty);
  });

  const countResult = await getPostgresClient()(
    `SELECT COUNT(*) FROM bounties ${filter && `WHERE ${filter}`}`
  );

  return { bounties, total: parseInt(countResult[0].count) };
};

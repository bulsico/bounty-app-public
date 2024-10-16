import { getPostgresClient } from "@/lib/db";
import { Build, convertDbBuildRowToBuild } from "@/lib/type/build";

export type getBuildsProps = {
  page: number;
  limit: number;
  sortedBy: string;
  order: "ASC" | "DESC";
  filter?: string;
};

export const getBuilds = async ({
  page,
  limit,
  sortedBy,
  order,
  filter,
}: getBuildsProps): Promise<{
  builds: Build[];
  total: number;
}> => {
  const builds = await getPostgresClient()(
    `SELECT * FROM builds ${
      filter && `WHERE ${filter}`
    } ORDER BY ${sortedBy} ${order} LIMIT ${limit} OFFSET ${(page - 1) * limit}`
  ).then((rows) => {
    return rows.map(convertDbBuildRowToBuild);
  });

  const countResult = await getPostgresClient()(`
        SELECT COUNT(*) FROM builds ${filter && `WHERE ${filter}`}
    `);

  return { builds, total: parseInt(countResult[0].count) };
};

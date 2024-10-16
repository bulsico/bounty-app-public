import { getPostgresClient } from "@/lib/db";
import { Build, convertDbBuildRowToBuild } from "@/lib/type/build";

export type getBuildProps = {
  buildObjAddr: `0x${string}`;
};

export const getBuild = async ({
  buildObjAddr,
}: getBuildProps): Promise<{
  build: Build;
}> => {
  const build = await getPostgresClient()(
    `SELECT * FROM builds WHERE build_obj_addr = '${buildObjAddr}'`
  ).then((rows) => {
    if (rows.length === 0) {
      throw new Error("Build not found");
    }
    return convertDbBuildRowToBuild(rows[0]);
  });
  return { build };
};

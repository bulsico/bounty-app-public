import { getPostgresClient } from "@/lib/db";
import { Bounty, convertDbBountyRowToBounty } from "@/lib/type/bounty";

export type getBountyProps = {
  bountyObjAddr: `0x${string}`;
};

export const getBounty = async ({
  bountyObjAddr,
}: getBountyProps): Promise<{
  bounty: Bounty;
}> => {
  const bounty = await getPostgresClient()(
    `SELECT * FROM bounties WHERE bounty_obj_addr = '${bountyObjAddr}'`
  ).then((rows) => {
    if (rows.length === 0) {
      throw new Error("Bounty not found");
    }
    return convertDbBountyRowToBounty(rows[0]);
  });
  return { bounty };
};

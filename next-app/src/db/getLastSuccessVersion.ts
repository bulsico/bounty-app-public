import { getPostgresClient } from "@/lib/db";
import { convertDbIndexerStatusRowToIndexerStatus } from "@/lib/type/indexer_status";

export const getLastSuccessVersion = async (): Promise<number> => {
  return await getPostgresClient()(
    `SELECT last_success_version FROM processor_status`
  ).then((rows) => {
    if (rows.length === 0) {
      throw new Error("Processor status not found");
    }
    return convertDbIndexerStatusRowToIndexerStatus(rows[0])
      .last_success_version;
  });
};

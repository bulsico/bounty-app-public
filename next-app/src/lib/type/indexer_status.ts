export type IndexerStatus = {
  processor: string;
  last_success_version: number;
  last_updated: number;
  last_transaction_timestamp: number;
};

export const convertDbIndexerStatusRowToIndexerStatus = (
  row: Record<string, any>
): IndexerStatus => {
  return {
    processor: row.processor,
    last_success_version: parseInt(row.last_success_version),
    last_updated: parseInt(row.last_updated),
    last_transaction_timestamp: parseInt(row.last_transaction_timestamp),
  };
};

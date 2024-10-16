import { convertAmountFromOnChainToHumanReadable } from "@aptos-labs/ts-sdk";
import { APT_UNIT } from "@/lib/aptos";

export type Build = {
  build_obj_addr: `0x${string}`;
  bounty_obj_addr: `0x${string}`;
  creator_addr: `0x${string}`;
  payment_recipient_addr: `0x${string}`;
  payment_amount: number;
  create_timestamp: number;
  last_update_timestamp: number;
  proof_link: string;
  build_status: number;
  last_update_event_idx: number;
};

export const convertBuildStatusToHumanReadable = (build: Build) => {
  switch (build.build_status) {
    case 1:
      return "In progress";
    case 2:
      return "Ready for review";
    case 3:
      return "Cancelled";
    case 4:
      return `Completed and earned ${convertAmountFromOnChainToHumanReadable(
        build.payment_amount,
        APT_UNIT
      )} APT`;
    default:
      return "Unknown";
  }
};

export const convertDbBuildRowToBuild = (row: Record<string, any>): Build => {
  return {
    build_obj_addr: row.build_obj_addr,
    bounty_obj_addr: row.bounty_obj_addr,
    creator_addr: row.creator_addr,
    payment_recipient_addr: row.payment_recipient_addr,
    payment_amount: parseInt(row.payment_amount),
    create_timestamp: parseInt(row.create_timestamp),
    last_update_timestamp: parseInt(row.last_update_timestamp),
    proof_link: row.proof_link,
    build_status: parseInt(row.build_status),
    last_update_event_idx: parseInt(row.last_update_event_idx),
  };
};

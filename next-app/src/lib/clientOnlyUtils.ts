import { truncateAddress } from "@aptos-labs/wallet-adapter-react";

import { getAptosClient } from "./aptos";

export const getAnsNameOrTruncatedAddr = async (address?: string) => {
  if (!address) {
    return "Unknown";
  }
  return getAptosClient()
    .ans.getPrimaryName({
      address,
    })
    .then((name) => {
      return name || truncateAddress(address) || "Unknown";
    });
};

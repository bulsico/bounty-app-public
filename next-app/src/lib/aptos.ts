import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { createSurfClient } from "@thalalabs/surf";

import { ABI } from "@/lib/abi/bounty_app_abi";

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK as Network;

const APTOS_CLIENT = new Aptos(
  new AptosConfig({
    network: NETWORK,
  })
);

const SURF_CLIENT = createSurfClient(APTOS_CLIENT).useABI(ABI);

export const getAptosClient = () => APTOS_CLIENT;

export const getSurfClient = () => SURF_CLIENT;

// Address of APT in FA format is 0xa
export const APT_FA_ADDR = "0xa";
// 1 APT = 10 ^ 8 oAPT
export const APT_UNIT = 8;

export type FA = {
  ticker: string;
  unit: number;
};
export const KNOWN_PAYMENT = new Map<`0x${string}`, FA>([
  [
    "0x000000000000000000000000000000000000000000000000000000000000000a",
    { ticker: "APT", unit: APT_UNIT },
  ],
]);

export type PAYMENT_MAP = Map<string, number>;

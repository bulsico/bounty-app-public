"use server";

import { ThalaswapRouter } from "@thalalabs/router-sdk";
import {
  convertAmountFromOnChainToHumanReadable,
  Network,
} from "@aptos-labs/ts-sdk";

import { getLastSuccessVersion } from "@/db/getLastSuccessVersion";
import { getBountyProps, getBounty } from "@/db/getBounty";
import { getBountiesProps, getBounties } from "@/db/getBounties";
import { getBuildsProps, getBuilds } from "@/db/getBuilds";
import { Bounty } from "@/lib/type/bounty";
import { UserStat } from "@/lib/type/user_stat";
import { getUserStats, GetUserStatsProps } from "@/db/getUserStats";
import { Build } from "@/lib/type/build";
import { getBuild, getBuildProps } from "@/db/getBuild";
import { getUserStat, getUserStatProps } from "@/db/getUserStat";
import { APT_FA_ADDR, APT_UNIT, getSurfClient } from "@/lib/aptos";

export const getBountiesOnServer = async ({
  page,
  limit,
  sortedBy,
  order,
  filter,
}: getBountiesProps): Promise<{
  bounties: Bounty[];
  total: number;
}> => {
  return getBounties({ page, limit, sortedBy, order, filter });
};

export const getBountyOnServer = async ({
  bountyObjAddr,
}: getBountyProps): Promise<{
  bounty: Bounty;
}> => {
  return getBounty({ bountyObjAddr });
};

export const getBuildsOnServer = async ({
  page,
  limit,
  sortedBy,
  order,
  filter,
}: getBuildsProps): Promise<{
  builds: Build[];
  total: number;
}> => {
  return getBuilds({ page, limit, sortedBy, order, filter });
};

export const getBuildOnServer = async ({
  buildObjAddr,
}: getBuildProps): Promise<{
  build: Build;
}> => {
  return getBuild({ buildObjAddr });
};

export const getLastVersionOnServer = async (): Promise<number> => {
  return getLastSuccessVersion();
};

export const getUserStatsOnServer = async ({
  page,
  limit,
  sortedBy,
  order,
  filter,
}: GetUserStatsProps): Promise<{
  userStats: UserStat[];
  total: number;
}> => {
  return getUserStats({ page, limit, sortedBy, order, filter });
};

export const getUserStatOnServer = async ({
  userAddr,
}: getUserStatProps): Promise<{
  userStat: UserStat;
}> => {
  return getUserStat({ userAddr });
};

// export const getAPTPriceFromCMCOnServer = async (): Promise<number> => {
//   const parameters = {
//     method: "GET",
//     headers: {
//       "X-CMC_PRO_API_KEY": process.env.COIN_MARKET_CAP_API_KEY!,
//     },
//     qs: {
//       symbol: "APT",
//       convert: "USD",
//     },
//   };
//   return fetch(
//     "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest",
//     parameters
//   )
//     .then((response) => response.json())
//     .then((data) => {
//       const price = data.data.APT.quote.USD.price;
//       console.log(`APT Price: $${price}`);
//       return price;
//     })
//     .catch((error) => console.error("Error getting APT price from coinmarketcap API:", error));
// };

export const getAPTPriceFromThalaRouterOnServer = async (): Promise<number> => {
  // Always use mainnet prices
  const router = new ThalaswapRouter(
    Network.MAINNET,
    "https://fullnode.mainnet.aptoslabs.com/v1",
    "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af",
    "0x60955b957956d79bc80b096d3e41bad525dd400d8ce957cdeb05719ed1e4fc26"
  );
  const fromToken = "0x1::aptos_coin::AptosCoin";
  const toToken =
    "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC";
  const amountIn = 1;

  const route = await router
    .getRouteGivenExactInput(fromToken, toToken, amountIn)
    .then((route) => route)
    .catch((error) => {
      console.error("Error getting APT price from ThalaRouter:", error);
      throw error;
    });

  if (route) {
    const price = route.amountOut;
    console.log(`APT Price: $${price}`);
    return price;
  } else {
    throw new Error(
      "Error getting APT price from ThalaRouter, route not found"
    );
  }
};

export const getTotalBountyValueOnServer = async () => {
  let totalAptAmount = 0;
  await getSurfClient()
    .view.get_payment_allowlist({
      functionArguments: [],
      typeArguments: [],
    })
    .then(([paymentFas, paymentAmounts]) => {
      paymentFas.forEach((fa, i) => {
        if (fa.inner === APT_FA_ADDR) {
          totalAptAmount += convertAmountFromOnChainToHumanReadable(
            parseInt(paymentAmounts[i]),
            APT_UNIT
          );
        }
        // handle stable coin after we have them
      });
    });
  return {
    apt: totalAptAmount,
    stable: 0,
  };
};

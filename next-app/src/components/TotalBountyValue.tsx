import React from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAPTPriceFromThalaRouterOnServer,
  getTotalBountyValueOnServer,
} from "@/app/actions";

export const TotalBountyValue = () => {
  const fetchTotalValue = async () => {
    return await getTotalBountyValueOnServer();
  };

  const fetchAptPrice = async () => {
    const aptPrice = await getAPTPriceFromThalaRouterOnServer();
    return { aptPrice };
  };

  const { data: totalValue } = useQuery({
    queryKey: ["totalBountyValue"],
    queryFn: fetchTotalValue,
    // Refetch every minute
    refetchInterval: 60 * 1000,
  });

  const { data: aptPrice } = useQuery({
    queryKey: ["aptPrice"],
    queryFn: fetchAptPrice,
    // Refetch every hour
    refetchInterval: 3600 * 1000,
  });

  const aptUsdValue =
    totalValue && aptPrice
      ? (totalValue.apt * aptPrice.aptPrice)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : "0.00";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Total bounty value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-base font-bold">${aptUsdValue} USD</div>
      </CardContent>
    </Card>
  );
};

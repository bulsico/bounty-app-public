import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import {
  getAPTPriceFromThalaRouterOnServer,
  getTotalBountyValueOnServer,
} from "@/app/actions";
import { DollarSign } from "lucide-react";

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
    <Card className="bg-white/5 dark:bg-gray-800/50 border-border dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-1">
          <div className="text-sm font-medium text-muted-foreground dark:text-gray-400">
            Total bounty value
          </div>
          <div className="flex items-center space-x-2">
            <div className="rounded-full p-1.5 bg-green-500/10 dark:bg-green-500/20">
              <DollarSign className="w-4 h-4 text-green-500 dark:text-green-400" />
            </div>
            <span className="text-xl font-semibold text-foreground dark:text-white">
              {aptUsdValue}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

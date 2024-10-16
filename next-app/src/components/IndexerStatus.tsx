"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { getLastVersionOnServer } from "@/app/actions";
import { getAptosClient } from "@/lib/aptos";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const IndexerStatus = () => {
  const fetchData = async () => {
    const indexerLastVersion = await getLastVersionOnServer();
    const latestBlockHeight = await getAptosClient().view<[number]>({
      payload: {
        function: "0x1::block::get_current_block_height",
        typeArguments: [],
        functionArguments: [],
      },
    });
    const block = await getAptosClient().getBlockByHeight({
      blockHeight: latestBlockHeight[0],
    });
    const onChainLastVersion = parseInt(block.last_version);
    return {
      indexerLastVersion,
      onChainLastVersion,
    };
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["last-version"],
    queryFn: fetchData,
    refetchInterval: 3000,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center py-2 px-4 text-sm font-medium text-muted-foreground">
        <Activity className="h-4 w-4 mr-2 animate-pulse" />
        Checking indexer...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center py-2 px-4 text-sm font-medium text-red-500">
        <Activity className="h-4 w-4 mr-2" />
        Error: {error.message}
      </div>
    );
  }

  const versionDiff = data.onChainLastVersion - data.indexerLastVersion;
  const isHealthy = versionDiff < 150;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex items-center w-full py-2 px-4 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <Activity className="h-4 w-4 mr-2" />
          Indexer Status
          <div
            className={`w-2 h-2 rounded-full ml-2 ${
              isHealthy ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p>Indexer Version: {data.indexerLastVersion}</p>
            <p>On-Chain Version: {data.onChainLastVersion}</p>
            <p>Difference: {versionDiff}</p>
            <p>
              {isHealthy
                ? "The indexer is in sync."
                : "The indexer is behind by more than 150 transactions."}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

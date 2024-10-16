"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Build, convertBuildStatusToHumanReadable } from "@/lib/type/build";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBountyOnServer } from "@/app/actions";
import { useWalletClient } from "@thalalabs/surf/hooks";
import { ABI } from "@/lib/abi/bounty_app_abi";
import { useToast } from "@/components/ui/use-toast";
import { getAptosClient } from "@/lib/aptos";
import { TransactionOnExplorer } from "@/components/ExplorerLink";

interface DataTableRowActionsProps {
  row: Row<Build>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { connected, account } = useWallet();
  const { client: walletClient } = useWalletClient();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchData = async () => {
    return await getBountyOnServer({
      bountyObjAddr: row.original.bounty_obj_addr,
    });
  };

  const { data } = useQuery({
    queryKey: [row.original.bounty_obj_addr],
    queryFn: fetchData,
  });

  const buildDetailPage = `/build/${row.original.build_obj_addr}`;
  const canAcceptBuild =
    connected &&
    account?.address === data?.bounty.creator_addr &&
    convertBuildStatusToHumanReadable(row.original) === "Ready for review";

  const onSignAndSubmitTransaction = async () => {
    if (!account || !walletClient) {
      console.error("Account or wallet client not available");
      return;
    }

    walletClient
      .useABI(ABI)
      .accept_build({
        type_arguments: [],
        arguments: [row.original.build_obj_addr],
      })
      .then((committedTransaction) => {
        return getAptosClient().waitForTransaction({
          transactionHash: committedTransaction.hash,
        });
      })
      .then((executedTransaction) => {
        toast({
          title: "Success",
          description: (
            <TransactionOnExplorer hash={executedTransaction.hash} />
          ),
        });
        return new Promise((resolve) => setTimeout(resolve, 3000));
      })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: [row.original.bounty_obj_addr],
        });
        queryClient.invalidateQueries({
          queryKey: [row.original.build_obj_addr],
        });
        queryClient.invalidateQueries({
          queryKey: [`${row.original.bounty_obj_addr}-builds`],
        });
      })
      .catch((error) => {
        console.error("Error", error);
        toast({
          title: "Error",
          description: "Failed to create a build",
        });
      });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem>
          <a
            href={buildDetailPage}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 dark:text-blue-300"
          >
            View detail
          </a>
        </DropdownMenuItem>
        {canAcceptBuild && (
          <DropdownMenuItem onClick={onSignAndSubmitTransaction}>
            Accept build
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

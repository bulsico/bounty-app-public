"use client";

import { useWalletClient } from "@thalalabs/surf/hooks";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";

import { getAptosClient } from "@/lib/aptos";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { TransactionOnExplorer } from "@/components/ExplorerLink";
import { ABI } from "@/lib/abi/bounty_app_abi";

interface CreateBuildProps {
  bountyObjAddr: `0x${string}`;
}

export function CreateBuild({ bountyObjAddr }: CreateBuildProps) {
  const { toast } = useToast();
  const { connected, account } = useWallet();
  const { client: walletClient } = useWalletClient();
  const queryClient = useQueryClient();

  const onSignAndSubmitTransaction = async () => {
    if (!account || !walletClient) {
      console.error("Account or wallet client not available");
      return;
    }

    walletClient
      .useABI(ABI)
      .entry_create_build({
        type_arguments: [],
        arguments: [undefined, bountyObjAddr],
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
          queryKey: [`${bountyObjAddr}-builds`],
        });
        queryClient.invalidateQueries({
          queryKey: [account?.address],
        });
        queryClient.invalidateQueries({
          queryKey: ["totalBuilds"],
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
    <div className="flex items-center justify-center">
      <Button
        type="submit"
        disabled={!connected}
        onClick={onSignAndSubmitTransaction}
        className="w-40 self-start col-span-2"
      >
        Work on the bounty!
      </Button>
    </div>
  );
}

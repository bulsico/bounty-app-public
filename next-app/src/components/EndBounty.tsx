"use client";

import { useWalletClient } from "@thalalabs/surf/hooks";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";

import { getAptosClient } from "@/lib/aptos";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { TransactionOnExplorer } from "@/components/ExplorerLink";
import { ABI } from "@/lib/abi/bounty_app_abi";

interface EndBountyProps {
  bountyObjAddr: `0x${string}`;
}

export function EndBounty({ bountyObjAddr }: EndBountyProps) {
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
      .end_bounty({
        type_arguments: [],
        arguments: [bountyObjAddr],
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
          queryKey: [account?.address],
        });
        queryClient.invalidateQueries({
          queryKey: [bountyObjAddr],
        });
      })
      .catch((error) => {
        console.error("Error", error);
        toast({
          title: "Error",
          description: "Failed to end a bounty",
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
        End the bounty
      </Button>
    </div>
  );
}

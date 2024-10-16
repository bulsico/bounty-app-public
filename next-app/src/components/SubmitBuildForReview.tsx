"use client";

import { useWalletClient } from "@thalalabs/surf/hooks";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { getAptosClient } from "@/lib/aptos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TransactionOnExplorer } from "@/components/ExplorerLink";
import { ABI } from "@/lib/abi/bounty_app_abi";
import { Build } from "@/lib/type/build";

const FormSchema = z.object({
  proof_link: z.string(),
});

type SubmitBuildForReviewProps = {
  build: Build;
};

export const SubmitBuildForReview = ({ build }: SubmitBuildForReviewProps) => {
  const { toast } = useToast();
  const { connected, account } = useWallet();
  const { client: walletClient } = useWalletClient();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      proof_link:
        "https://github.com/aptos-labs/aptos-developer-discussions/discussions/1",
    },
  });

  const onSignAndSubmitTransaction = async (
    data: z.infer<typeof FormSchema>
  ) => {
    if (!account || !walletClient) {
      console.error("Wallet not available");
      return;
    }

    walletClient
      .useABI(ABI)
      .submit_build_for_review({
        type_arguments: [],
        arguments: [build.build_obj_addr, data.proof_link],
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
          queryKey: [build.build_obj_addr],
        });
        queryClient.invalidateQueries({
          queryKey: [`${build.bounty_obj_addr}-builds`],
        });
      })
      .catch((error) => {
        console.error("Error", error);
        toast({
          title: "Error",
          description: "Failed to submit build for review",
        });
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit build for review</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSignAndSubmitTransaction)}
            className="flex flex-col justify-between gap-4 w-full"
          >
            <FormField
              control={form.control}
              name="proof_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description Link</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to the proof of the build, e.g. a GitHub repo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={!connected}
              className="w-40 self-start col-span-2"
            >
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

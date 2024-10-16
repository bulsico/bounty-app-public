"use client";

import { useRouter } from "next/navigation";
import { useWalletClient } from "@thalalabs/surf/hooks";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { APT_FA_ADDR, APT_UNIT, getAptosClient } from "@/lib/aptos";
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
import { useQueryClient } from "@tanstack/react-query";
import { convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk";

const FormSchema = z.object({
  title: z.string(),
  description_link: z.string(),
  end_timestamp: z.date().optional(),
  payment_metadata_object: z.string(),
  payment_per_winner: z
    .string()
    .refine((val) => !Number.isNaN(parseFloat(val)), {
      message: "Expected decimal number, received a string",
    }),
  stake_required: z.string().refine((val) => !Number.isNaN(parseFloat(val)), {
    message: "Expected decimal number, received a string",
  }),
  stake_lockup_in_seconds: z
    .string()
    .refine((val) => !Number.isNaN(parseInt(val)), {
      message: "Expected integer number, received a string",
    }),
  winner_limit: z.string().refine((val) => !Number.isNaN(parseInt(val)), {
    message: "Expected integer number, received a string",
  }),
  contact_info: z.string(),
});

export const CreateBounty = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { connected, account } = useWallet();
  const { client: walletClient } = useWalletClient();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "Dummy Bounty",
      description_link:
        "https://github.com/aptos-labs/aptos-developer-discussions/discussions/1",
      end_timestamp: undefined,
      payment_metadata_object: APT_FA_ADDR,
      payment_per_winner: "0.01",
      stake_required: "0",
      stake_lockup_in_seconds: "0",
      winner_limit: "1",
      contact_info: "contact me on twitter @apt_to_the_moon",
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
      .entry_create_bounty({
        type_arguments: [],
        arguments: [
          data.title,
          data.description_link,
          data.end_timestamp ? data.end_timestamp.getTime() / 1000 : undefined,
          data.payment_metadata_object as `0x${string}`,
          convertAmountFromHumanReadableToOnChain(
            parseFloat(data.payment_per_winner),
            APT_UNIT
          ),
          convertAmountFromHumanReadableToOnChain(
            parseFloat(data.stake_required),
            APT_UNIT
          ),
          data.stake_lockup_in_seconds,
          data.winner_limit,
          data.contact_info,
        ],
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
        queryClient.invalidateQueries({ queryKey: ["bounties"] });
        queryClient.invalidateQueries({ queryKey: ["totalBountyValue"] });
        queryClient.invalidateQueries({ queryKey: ["totalBounties"] });
        router.push("/");
      })
      .catch((error) => {
        console.error("Error", error);
        toast({
          title: "Error",
          description: "Failed to create a bounty",
        });
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new bounty</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSignAndSubmitTransaction)}
            className="flex flex-col justify-between gap-4 w-full"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Title of the bounty</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description Link</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to the description of the bounty, e.g. a GitHub issue
                    or a forum post
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_per_winner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reward per winner</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Amount of APT to be paid to each winner
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="winner_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Winner limit</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Maximum number of winners to be selected
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact info</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    How to contact the bounty creator after the build is ready
                    for review
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
              Create
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

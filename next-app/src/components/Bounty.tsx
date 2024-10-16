"use client";

import { useQuery } from "@tanstack/react-query";
import { convertAmountFromOnChainToHumanReadable } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LabelValueGrid } from "@/components/LabelValueGrid";
import { APT_UNIT, getSurfClient, KNOWN_PAYMENT, NETWORK } from "@/lib/aptos";
import { getBountyOnServer } from "@/app/actions";
import { isMaxUnixTimestamp } from "@/lib/time";
import { CreateBuild } from "@/components/CreateBuild";
import { convertBountyStatusToHumanReadable } from "@/lib/type/bounty";

interface BountyProps {
  bountyObjAddr: `0x${string}`;
}

export const Bounty = ({ bountyObjAddr }: BountyProps) => {
  const { account } = useWallet();

  const fetchData = async () => {
    const bounty = await getBountyOnServer({
      bountyObjAddr,
    });
    const existsBuild = account
      ? (
          await getSurfClient().view.exists_build({
            functionArguments: [
              bountyObjAddr,
              account?.address as `0x${string}`,
            ],
            typeArguments: [],
          })
        )[0]
      : false;
    return {
      bounty: bounty.bounty,
      existsBuild,
    };
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [bountyObjAddr, account?.address],
    queryFn: fetchData,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>Bounty not found</div>;
  }

  const bountyStatus = convertBountyStatusToHumanReadable(data.bounty);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Bounty</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-10 pt-6">
          <div className="flex flex-col gap-6">
            <LabelValueGrid
              items={[
                {
                  label: "Status",
                  value: <p>{bountyStatus}</p>,
                },
                {
                  label: "Bounty object address",
                  value: (
                    <p>
                      <a
                        href={`https://explorer.aptoslabs.com/object/${data.bounty.bounty_obj_addr}?network=${NETWORK}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-300"
                      >
                        {data.bounty.bounty_obj_addr}
                      </a>
                    </p>
                  ),
                },
                {
                  label: "Creator address",
                  value: (
                    <p>
                      <a
                        href={`/profile/${data.bounty.creator_addr}`}
                        className="text-blue-600 dark:text-blue-300"
                      >
                        {data.bounty.creator_addr === account?.address ? "Me" : data.bounty.creator_addr}
                      </a>
                    </p>
                  ),
                },
                {
                  label: "Creation timestamp",
                  value: (
                    <p>
                      {new Date(
                        data.bounty.create_timestamp * 1000
                      ).toLocaleString()}
                    </p>
                  ),
                },
                {
                  label: "End timestamp",
                  value: (
                    <p>
                      {isMaxUnixTimestamp(data.bounty.end_timestamp)
                        ? "This build lasts forever!"
                        : new Date(
                            data.bounty.end_timestamp * 1000
                          ).toLocaleString()}
                    </p>
                  ),
                },
                {
                  label: "Last update timestamp",
                  value: (
                    <p>
                      {new Date(
                        data.bounty.last_update_timestamp * 1000
                      ).toLocaleString()}
                    </p>
                  ),
                },
                {
                  label: "Title",
                  value: <p>{data.bounty.title}</p>,
                },
                {
                  label: "Description link",
                  value: (
                    <p>
                      <a
                        href={data.bounty.description_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-300"
                      >
                        {data.bounty.description_link}
                      </a>
                    </p>
                  ),
                },
                {
                  label: "Stake required",
                  value: (
                    <p>
                      {convertAmountFromOnChainToHumanReadable(
                        data.bounty.stake_required,
                        APT_UNIT
                      )}{" "}
                      APT
                    </p>
                  ),
                },
                {
                  label: "Stake lockup seconds",
                  value: <p>{data.bounty.stake_lockup_in_seconds}</p>,
                },
                {
                  label: "Winner limit",
                  value: <p>{data.bounty.winner_limit}</p>,
                },
                {
                  label: "Payment per winner",
                  value: (
                    <p>
                      {convertAmountFromOnChainToHumanReadable(
                        data.bounty.payment_per_winner,
                        KNOWN_PAYMENT.get(
                          data.bounty.payment_metadata_obj_addr
                        )!.unit
                      )}{" "}
                      {
                        KNOWN_PAYMENT.get(
                          data.bounty.payment_metadata_obj_addr
                        )!.ticker
                      }
                    </p>
                  ),
                },
                {
                  label: "Total payment",
                  value: (
                    <p>
                      {convertAmountFromOnChainToHumanReadable(
                        data.bounty.total_payment,
                        KNOWN_PAYMENT.get(
                          data.bounty.payment_metadata_obj_addr
                        )!.unit
                      )}{" "}
                      {
                        KNOWN_PAYMENT.get(
                          data.bounty.payment_metadata_obj_addr
                        )!.ticker
                      }
                    </p>
                  ),
                },
                {
                  label: "Current winner count",
                  value: <p>{data.bounty.winner_count}</p>,
                },
                {
                  label: "Contact info",
                  value: <p>{data.bounty.contact_info}</p>,
                },
              ]}
            />
          </div>
        </CardContent>
      </Card>
      {bountyStatus === "Open" && !data.existsBuild && (
        <CreateBuild bountyObjAddr={bountyObjAddr} />
      )}
    </div>
  );
};

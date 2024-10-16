"use client";

import { useQuery } from "@tanstack/react-query";
import { convertAmountFromOnChainToHumanReadable } from "@aptos-labs/ts-sdk";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LabelValueGrid } from "@/components/LabelValueGrid";
import { APT_UNIT, NETWORK } from "@/lib/aptos";
import { getUserStatOnServer } from "@/app/actions";

type UserStatProps = {
  userAddr: `0x${string}`;
};

export const UserStat = ({ userAddr }: UserStatProps) => {
  const fetchData = async () => {
    return await getUserStatOnServer({
      userAddr,
    });
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [userAddr],
    queryFn: fetchData,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>Build not found</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User statistic</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-10 pt-6">
        <div className="flex flex-col gap-6">
          <LabelValueGrid
            items={[
              {
                label: "User address",
                value: (
                  <p>
                    <a
                      href={`https://explorer.aptoslabs.com/account/${data.userStat.user_addr}?network=${NETWORK}`}
                      className="text-blue-600 dark:text-blue-300"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {data.userStat.user_addr}
                    </a>
                  </p>
                ),
              },
              // {
              //   label: "Create timestamp",
              //   value: (
              //     <p>
              //       {new Date(
              //         data.userStat.create_timestamp * 1000
              //       ).toLocaleString()}
              //     </p>
              //   ),
              // },
              // {
              //   label: "Last update timestamp",
              //   value: (
              //     <p>
              //       {new Date(
              //         data.userStat.last_update_timestamp * 1000
              //       ).toLocaleString()}
              //     </p>
              //   ),
              // },
              {
                label: "Bounty created",
                value: <p>{data.userStat.bounty_created}</p>,
              },
              {
                label: "APT spent",
                value: (
                  <p>
                    {convertAmountFromOnChainToHumanReadable(
                      data.userStat.apt_spent,
                      APT_UNIT
                    )}{" "}
                    APT
                  </p>
                ),
              },
              {
                label: "Stablecoin spent",
                value: <p>{data.userStat.stable_spent} USD</p>,
              },
              {
                label: "Build created",
                value: <p>{data.userStat.build_created}</p>,
              },
              {
                label: "Build submitted for review",
                value: <p>{data.userStat.build_submitted_for_review}</p>,
              },
              {
                label: "Build canceled",
                value: <p>{data.userStat.build_canceled}</p>,
              },
              {
                label: "Build completed",
                value: <p>{data.userStat.build_completed}</p>,
              },
              {
                label: "APT received",
                value: (
                  <p>
                    {convertAmountFromOnChainToHumanReadable(
                      data.userStat.apt_received,
                      APT_UNIT
                    )}{" "}
                    APT
                  </p>
                ),
              },
              {
                label: "Stablecoin received",
                value: <p>{data.userStat.stable_received} USD</p>,
              },
              // {
              //   label: "Season 1 points",
              //   value: <p>{data.userStat.season_1_points}</p>,
              // },
              // {
              //   label: "Total points",
              //   value: <p>{data.userStat.total_points}</p>,
              // },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
};

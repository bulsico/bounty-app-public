"use client";

import { useQuery } from "@tanstack/react-query";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  getBountiesOnServer,
  getBuildsOnServer,
  getTotalBountyValueOnServer,
} from "@/app/actions";

export const OverviewAnalytics = async () => {
  const fetchTotalValue = async () => {
    return await getTotalBountyValueOnServer();
  };
  const fetchTotalBounties = async () => {
    return await getBountiesOnServer({
      limit: 0,
      page: 1,
      sortedBy: "create_timestamp",
      order: "DESC",
    });
  };
  const fetchTotalBuilds = async () => {
    return await getBuildsOnServer({
      limit: 0,
      page: 1,
      sortedBy: "create_timestamp",
      order: "DESC",
    });
  };

  const { data: totalValue } = useQuery({
    queryKey: ["totalBountyValue"],
    queryFn: fetchTotalValue,
    // Refetch every minute
    refetchInterval: 60 * 1000,
  });
  const { data: totalBounties } = useQuery({
    queryKey: ["totalBounties"],
    queryFn: fetchTotalBounties,
    // Refetch every minute
    refetchInterval: 60 * 1000,
  });
  const { data: totalBuilds } = useQuery({
    queryKey: ["totalBuilds"],
    queryFn: fetchTotalBuilds,
    // Refetch every minute
    refetchInterval: 60 * 1000,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total APT value</CardTitle>
        </CardHeader>
        <CardContent className="">
          {totalValue ? totalValue.apt.toFixed(2) : 0} APT
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Total stablecoin value
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          ${totalValue ? totalValue.stable : 0} USD
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Total bounties created
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          {totalBounties ? totalBounties.total : 0}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Total builds created
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          {totalBuilds ? totalBuilds.total : 0}
        </CardContent>
      </Card>
    </div>
  );
};

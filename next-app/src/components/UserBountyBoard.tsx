import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/user-bounty-board/data-table";
import { columns } from "@/components/user-bounty-board/columns";

type UserBountyBoardProps = {
  userAddr: `0x${string}`;
};

export const UserBountyBoard = async ({ userAddr }: UserBountyBoardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bounty posted</CardTitle>
      </CardHeader>
      <CardContent className="h-full flex-1 flex-col space-y-8 p-8 flex">
        <DataTable columns={columns} userAddr={userAddr} />
      </CardContent>
    </Card>
  );
};

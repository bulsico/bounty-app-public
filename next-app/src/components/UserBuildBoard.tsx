import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/user-build-board/data-table";
import { columns } from "@/components/user-build-board/columns";

type UserBuildBoardProps = {
  userAddr: `0x${string}`;
};

export const UserBuildBoard = async ({ userAddr }: UserBuildBoardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Build created</CardTitle>
      </CardHeader>
      <CardContent className="h-full flex-1 flex-col space-y-8 p-8 flex">
        <DataTable columns={columns} userAddr={userAddr} />
      </CardContent>
    </Card>
  );
};

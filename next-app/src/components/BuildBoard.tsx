import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/build-board/data-table";
import { columns } from "@/components/build-board/columns";

type BuildBoardProps = {
  bountyObjAddr: `0x${string}`;
};

export const BuildBoard = async ({ bountyObjAddr }: BuildBoardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Build board</CardTitle>
      </CardHeader>
      <CardContent className="h-full flex-1 flex-col space-y-8 p-8 flex">
        <DataTable columns={columns} bountyObjAddr={bountyObjAddr} />
      </CardContent>
    </Card>
  );
};

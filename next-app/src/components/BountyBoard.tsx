import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/bounty-board/data-table";
import { columns } from "@/components/bounty-board/columns";

export const BountyBoard = async () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bounty board</CardTitle>
      </CardHeader>
      <CardContent className="h-full flex-1 flex-col space-y-8 p-8 flex">
        <DataTable columns={columns} />
      </CardContent>
    </Card>
  );
};

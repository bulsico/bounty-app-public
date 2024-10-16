"use client";

import { ColumnDef } from "@tanstack/react-table";
import { convertAmountFromOnChainToHumanReadable } from "@aptos-labs/ts-sdk";

import { Bounty } from "@/lib/type/bounty";
import { APT_UNIT } from "@/lib/aptos";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

export const columns: ColumnDef<Bounty>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <a
        href={`/bounty/${row.original.bounty_obj_addr}`}
        className="w-[80px] text-blue-600 dark:text-blue-300"
      >
        {row.getValue("title")}
      </a>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "create_timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Create time" />
    ),
    cell: ({ row }) => (
      <div className="w-[160px]">
        {new Date(
          (row.getValue("create_timestamp") as number) * 1000
        ).toLocaleString()}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "total_payment",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bounty payment" />
    ),
    cell: ({ row }) => (
      <div className="w-[160px]">
        {convertAmountFromOnChainToHumanReadable(
          row.getValue("total_payment"),
          APT_UNIT
        )}{" "}
        APT
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <div className="w-[160px]">
        {row.original.end_timestamp < Date.now() / 1000 ? "Closed" : "Open"}
      </div>
    ),
    enableSorting: false,
  },
];

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { convertAmountFromOnChainToHumanReadable } from "@aptos-labs/ts-sdk";

import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { APT_UNIT } from "@/lib/aptos";
import { UserStat } from "@/lib/type/user_stat";
import { AddressTableCell } from "@/components/AddressTableCell";

export const columns: ColumnDef<UserStat>[] = [
  {
    accessorKey: "user_addr",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User address" />
    ),
    cell: ({ row }) => <AddressTableCell addr={row.original.user_addr} />,
    enableSorting: false,
  },
  {
    accessorKey: "apt_received",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="APT received" />
    ),
    cell: ({ row }) => (
      <div className="w-[100px]">
        {convertAmountFromOnChainToHumanReadable(
          row.original.apt_received,
          APT_UNIT
        )}{" "}
        APT
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "stable_received",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stablecoin received" />
    ),
    cell: ({ row }) => (
      <div className="w-[100px]">
        {convertAmountFromOnChainToHumanReadable(
          row.original.stable_received,
          APT_UNIT // TODO: use stablecoin unit after we have stablecoin on Aptos
        )}{" "}
        USD
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "build_created",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Build created" />
    ),
    cell: ({ row }) => (
      <div className="w-[40px]">{row.getValue("build_created")}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "build_completed",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Build completed" />
    ),
    cell: ({ row }) => (
      <div className="w-[40px]">{row.getValue("build_completed")}</div>
    ),
    enableSorting: true,
  },
];

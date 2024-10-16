"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Build, convertBuildStatusToHumanReadable } from "@/lib/type/build";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableRowActions } from "@/components/build-board/data-table-row-actions";

export const columns: ColumnDef<Build>[] = [
  {
    accessorKey: "last_update_timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last update time" />
    ),
    cell: ({ row }) => (
      <div className="w-[160px]">
        {new Date(
          (row.getValue("last_update_timestamp") as number) * 1000
        ).toLocaleString()}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "proof_link",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Proof link" />
    ),
    cell: ({ row }) =>
      row.original.proof_link === "" ? (
        <div>Unavailable</div>
      ) : (
        <a
          href={row.original.proof_link}
          className="w-[140px] text-blue-600 dark:text-blue-300"
          target="_blank"
          rel="noreferrer"
        >
          {row.original.proof_link}
        </a>
      ),
    enableSorting: false,
  },
  {
    accessorKey: "build_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <div className="w-[120px]">
        {convertBuildStatusToHumanReadable(row.original)}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => (
      <a
        href={`/build/${row.original.build_obj_addr}`}
        className="text-blue-600 dark:text-blue-300"
      >
        View
      </a>
    ),
  },
];

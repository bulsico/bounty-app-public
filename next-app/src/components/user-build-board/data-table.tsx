"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getBuildsOnServer } from "@/app/actions";
import { useQuery } from "@tanstack/react-query";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";

export const filterOptions = [
  {
    value: "in-progress",
    label: "In progress",
  },
  {
    value: "ready-for-review",
    label: "Ready for review",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
  {
    value: "completed",
    label: "Completed",
  },
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  userAddr: `0x${string}`;
}

export function DataTable<TData, TValue>({
  columns,
  userAddr,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "last_update_timestamp", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [{ pageIndex, pageSize }, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchData = async () => {
    let dbFilter = `creator_addr = '${userAddr}'`;
    const filter = columnFilters.reduce((acc, filter) => {
      acc[filter.id] = filter.value;
      return acc;
    }, {} as Record<string, any>);
    if (filter?.build_status) {
      let filteredStatus = [];
      console.log("filter build_status", filter.status);
      if (filter.build_status.includes("in-progress")) {
        filteredStatus.push(1);
      }
      if (filter.build_status.includes("ready-for-review")) {
        filteredStatus.push(2);
      }
      if (filter.build_status.includes("cancelled")) {
        filteredStatus.push(3);
      }
      if (filter.build_status.includes("completed")) {
        filteredStatus.push(4);
      }
      if (filteredStatus.length > 0) {
        dbFilter += ` AND build_status IN (${filteredStatus.join(",")})`;
      }
    }

    return await getBuildsOnServer({
      page: pageIndex + 1,
      limit: pageSize,
      sortedBy: sorting[0]?.id,
      order: sorting[0]?.desc ? "DESC" : "ASC",
      filter: dbFilter,
    });
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      `${userAddr}-builds`,
      pageIndex,
      pageSize,
      sorting,
      columnFilters,
    ],
    queryFn: fetchData,
  });

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: (data?.builds as TData[]) || [],
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    pageCount: Math.ceil(data?.total || 0 / pageSize),
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualFiltering: true,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        filterOptions={filterOptions}
        filterColumnId="build_status"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} totalItems={data?.total || 0} />
    </div>
  );
}

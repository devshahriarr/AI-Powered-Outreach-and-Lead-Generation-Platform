"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Campaign } from "@/types";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import Link from "next/link";

interface CampaignTableProps {
  data: Campaign[];
  globalFilter: string;
  onDelete: (campaign: Campaign) => void;
}

const columnHelper = createColumnHelper<Campaign>();

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <ChevronUp className="w-3.5 h-3.5 text-accent" />;
  if (isSorted === "desc") return <ChevronDown className="w-3.5 h-3.5 text-accent" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CampaignTable({ data, globalFilter, onDelete }: CampaignTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("name", {
        header: "Campaign Name",
        cell: (info) => (
          <Link
            href={`/campaigns/${info.row.original.id}`}
            className="font-semibold text-foreground hover:text-accent transition-colors truncate block max-w-[200px]"
            title={info.getValue()}
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("campaign_type", {
        header: "Campaign Type",
        cell: (info) => (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium">
            {info.getValue() === "cold_outreach" ? "Cold Outreach" : info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("target_business_type", {
        header: "Target Industry",
        cell: (info) => (
          <span className="text-xs text-muted-foreground font-medium truncate block max-w-[150px]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("offer", {
        header: "Offer",
        cell: (info) => (
          <span
            className="text-xs text-muted-foreground truncate block max-w-[220px]"
            title={info.getValue()}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <CampaignStatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor("created_at", {
        header: "Created Date",
        cell: (info) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => {
          const campaign = info.row.original;
          return (
            <div className="flex items-center gap-1.5 justify-end">
              <Link
                href={`/campaigns/${campaign.id}`}
                className="p-1.5 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </Link>
              <Link
                href={`/campaigns/${campaign.id}/edit`}
                className="p-1.5 rounded-lg hover:bg-amber-500/10 text-muted-foreground hover:text-amber-500 transition-colors"
                title="Edit Campaign"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(campaign);
                }}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                title="Delete Campaign"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
        size: 110,
      }),
    ];
  }, [onDelete]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
    globalFilterFn: "includesString",
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-muted/50 dark:bg-muted/20 border-b border-border/40 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-1.5 ${
                          header.column.getCanSort()
                            ? "cursor-pointer select-none hover:text-foreground transition-colors"
                            : ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <SortIcon isSorted={header.column.getIsSorted()} />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/20">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-sm text-muted-foreground">
                  No campaigns found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/30 bg-muted/10 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-2 py-1 rounded border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-accent/40"
          >
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <span>
          {totalRows === 0
            ? "0 results"
            : `${pageIndex * pageSize + 1}–${Math.min(
                (pageIndex + 1) * pageSize,
                totalRows
              )} of ${totalRows}`}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium">
            {pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

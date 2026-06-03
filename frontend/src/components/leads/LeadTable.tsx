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
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Lead } from "@/types";
import { LeadStatusBadge } from "./LeadStatusBadge";

interface LeadTableProps {
  data: Lead[];
  globalFilter: string;
  onRowClick: (lead: Lead) => void;
  showReasonColumn?: boolean;
  enableSelection?: boolean;
  onSelectionChange?: (selected: Lead[]) => void;
}

const columnHelper = createColumnHelper<Lead>();

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 70
      ? "bg-success/10 text-success border-success/30"
      : score >= 40
      ? "bg-warning/10 text-warning border-warning/30"
      : "bg-rose-500/10 text-rose-500 border-rose-500/30";
  return (
    <span className={`inline-flex items-center justify-center w-10 h-6 rounded-md text-xs font-bold border ${cls}`}>
      {score}
    </span>
  );
}

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <ChevronUp className="w-3.5 h-3.5 text-accent" />;
  if (isSorted === "desc") return <ChevronDown className="w-3.5 h-3.5 text-accent" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function LeadTable({
  data,
  globalFilter,
  onRowClick,
  showReasonColumn = false,
  enableSelection = false,
  onSelectionChange,
}: LeadTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const columns = useMemo(() => {
    const cols = [
      ...(enableSelection
        ? [
            columnHelper.display({
              id: "select",
              header: ({ table }) => (
                <input
                  type="checkbox"
                  checked={table.getIsAllRowsSelected()}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = table.getIsSomeRowsSelected();
                    }
                  }}
                  onChange={table.getToggleAllRowsSelectedHandler()}
                  className="rounded border-border bg-background text-accent focus:ring-accent/40 w-4 h-4 cursor-pointer accent-accent"
                  onClick={(e) => e.stopPropagation()}
                />
              ),
              cell: ({ row }) => (
                <input
                  type="checkbox"
                  checked={row.getIsSelected()}
                  disabled={!row.getCanSelect()}
                  onChange={row.getToggleSelectedHandler()}
                  className="rounded border-border bg-background text-accent focus:ring-accent/40 w-4 h-4 cursor-pointer accent-accent"
                  onClick={(e) => e.stopPropagation()}
                />
              ),
              size: 40,
            }),
          ]
        : []),
      columnHelper.accessor("name", {
        header: "Business Name",
        cell: (info) => (
          <span className="font-semibold text-foreground truncate block max-w-[180px]" title={info.getValue()}>
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("business_type", {
        header: "Type",
        cell: (info) => (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium truncate block max-w-[120px]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor(
        (row) => row.cleaned_email ?? row.email ?? "",
        {
          id: "email",
          header: "Email",
          cell: (info) => {
            const email = info.getValue();
            return email ? (
              <a
                href={`mailto:${email}`}
                onClick={(e) => e.stopPropagation()}
                className="text-accent hover:underline text-xs truncate block max-w-[160px]"
                title={email}
              >
                {email}
              </a>
            ) : (
              <span className="text-muted-foreground/50 text-xs italic">—</span>
            );
          },
        }
      ),
      columnHelper.accessor(
        (row) => row.cleaned_phone ?? row.phone_number ?? "",
        {
          id: "phone",
          header: "Phone",
          cell: (info) => (
            <span className="text-xs text-muted-foreground">
              {info.getValue() || <span className="italic text-muted-foreground/50">—</span>}
            </span>
          ),
        }
      ),
      columnHelper.accessor("lead_score", {
        header: "Score",
        cell: (info) => <ScoreBadge score={info.getValue()} />,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <LeadStatusBadge status={info.getValue()} />,
      }),
      ...(showReasonColumn
        ? [
            columnHelper.accessor("qualification_reason", {
              header: "Reason",
              cell: (info) => (
                <span className="text-xs text-muted-foreground truncate block max-w-[200px]" title={info.getValue() ?? ""}>
                  {info.getValue() ?? "—"}
                </span>
              ),
            }),
          ]
        : []),
      columnHelper.accessor("created_at", {
        header: "Discovered",
        cell: (info) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(info.getValue())}</span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <button
            onClick={(e) => { e.stopPropagation(); onRowClick(info.row.original); }}
            className="p-1.5 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        ),
        size: 48,
      }),
    ];
    return cols;
  }, [onRowClick, showReasonColumn, enableSelection]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
    globalFilterFn: "includesString",
  });

  // Call onSelectionChange whenever selection state updates
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getSelectedRowModel().flatRows.map((r) => r.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange]);

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* Sticky header */}
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
                        className={`flex items-center gap-1.5 ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-foreground transition-colors" : ""}`}
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
                  No leads match your current filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row.original)}
                  className="hover:bg-muted/30 dark:hover:bg-muted/10 cursor-pointer transition-colors group"
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
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <span>
          {totalRows === 0 ? "0 results" : `${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, totalRows)} of ${totalRows}`}
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

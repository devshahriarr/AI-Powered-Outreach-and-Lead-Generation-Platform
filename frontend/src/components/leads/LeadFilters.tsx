"use client";

import React from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { ALL_LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/types";

interface LeadFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function LeadFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  filteredCount,
}: LeadFiltersProps) {
  const hasFilters = search !== "" || statusFilter !== "";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, email, type..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-all"
        />
      </div>

      {/* Status filter */}
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-all cursor-pointer"
        >
          <option value="">All Statuses</option>
          {ALL_LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => { onSearchChange(""); onStatusFilterChange(""); }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}

      {/* Count */}
      <div className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
        <span className="font-semibold text-foreground">{filteredCount}</span>
        {filteredCount !== totalCount && <span> of {totalCount}</span>}
        <span> leads</span>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadTableSkeleton } from "@/components/leads/LeadTableSkeleton";
import { LeadDetailsDrawer } from "@/components/leads/LeadDetailsDrawer";
import { useReviewLeads } from "@/hooks/useLeads";
import { Lead } from "@/types";
import { Clock, AlertCircle, AlertTriangle } from "lucide-react";

export default function ReviewQueuePage() {
  const { data: leads, isLoading, isError, error, refetch } = useReviewLeads();
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = (lead: Lead) => { setSelectedLead(lead); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setTimeout(() => setSelectedLead(null), 300); };

  const filtered = useMemo(() => {
    if (!leads) return [];
    if (!search) return leads;
    const q = search.toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.business_type.toLowerCase().includes(q) ||
        (l.email ?? "").toLowerCase().includes(q) ||
        (l.qualification_reason ?? "").toLowerCase().includes(q)
    );
  }, [leads, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Queue"
        description="Borderline leads (score 40–69) that require human judgement before outreach."
      />

      {/* Warning banner */}
      {!isLoading && (leads?.length ?? 0) > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-warning/30 bg-warning/5">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {leads?.length} lead{leads?.length !== 1 ? "s" : ""} need manual inspection
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              These leads scored between 40–69. Review the qualification reason and update their status accordingly.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <LeadFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter=""
        onStatusFilterChange={() => {}}
        totalCount={leads?.length ?? 0}
        filteredCount={filtered.length}
      />

      {isLoading ? (
        <LeadTableSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500" />
          <div>
            <p className="font-semibold text-foreground">Failed to load review queue</p>
            <p className="text-xs text-muted-foreground mt-1">{(error as { message?: string })?.message}</p>
          </div>
          <button onClick={() => refetch()} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No leads require review"
          description="Leads with borderline scores (40–69) will appear here after running the Qualification Agent."
          icon={Clock}
        />
      ) : (
        <LeadTable
          data={filtered}
          globalFilter={search}
          onRowClick={openDrawer}
          showReasonColumn
        />
      )}

      <LeadDetailsDrawer lead={selectedLead} open={drawerOpen} onClose={closeDrawer} />
    </div>
  );
}

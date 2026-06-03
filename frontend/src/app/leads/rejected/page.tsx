"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadTableSkeleton } from "@/components/leads/LeadTableSkeleton";
import { LeadDetailsDrawer } from "@/components/leads/LeadDetailsDrawer";
import { useRejectedLeads } from "@/hooks/useLeads";
import { Lead } from "@/types";
import { XCircle, AlertCircle } from "lucide-react";

export default function RejectedLeadsPage() {
  const { data: leads, isLoading, isError, error, refetch } = useRejectedLeads();
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
        (l.qualification_reason ?? "").toLowerCase().includes(q)
    );
  }, [leads, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rejected Leads"
        description="Leads that failed qualification (score < 40) or contained insufficient contact data."
      />

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
            <p className="font-semibold text-foreground">Failed to load rejected leads</p>
            <p className="text-xs text-muted-foreground mt-1">{(error as { message?: string })?.message}</p>
          </div>
          <button onClick={() => refetch()} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No rejected leads"
          description="Leads that fail the qualification scoring threshold (score < 40) will appear here."
          icon={XCircle}
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

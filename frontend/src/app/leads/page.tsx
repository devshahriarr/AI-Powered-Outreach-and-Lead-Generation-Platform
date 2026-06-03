"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LeadMetricsCards } from "@/components/leads/LeadMetricsCards";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadTableSkeleton } from "@/components/leads/LeadTableSkeleton";
import { LeadDetailsDrawer } from "@/components/leads/LeadDetailsDrawer";
import { useLeads } from "@/hooks/useLeads";
import { Lead } from "@/types";
import { Search, RefreshCw, AlertCircle } from "lucide-react";

export default function LeadsPage() {
  const { data: leads, isLoading, isError, error, refetch } = useLeads({ limit: 500 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedLead(null), 300);
  };

  const filtered = useMemo(() => {
    if (!leads) return [];
    return leads.filter((l) => {
      const matchesStatus = !statusFilter || l.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.business_type.toLowerCase().includes(q) ||
        (l.email ?? "").toLowerCase().includes(q) ||
        (l.cleaned_email ?? "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [leads, search, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Discovery Desk"
        description="All discovered business leads from Apify — search, filter, and inspect each prospect."
      >
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all duration-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </PageHeader>

      {/* Metrics */}
      <LeadMetricsCards />

      {/* Filters */}
      <LeadFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalCount={leads?.length ?? 0}
        filteredCount={filtered.length}
      />

      {/* Table / States */}
      {isLoading ? (
        <LeadTableSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="p-3 rounded-full bg-rose-500/10 text-rose-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Failed to load leads</p>
            <p className="text-xs text-muted-foreground mt-1">
              {(error as { message?: string })?.message ?? "Network error. Is the backend running?"}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search || statusFilter ? "No leads match your filters" : "No leads discovered yet"}
          description={
            search || statusFilter
              ? "Try adjusting your search or clearing the filters."
              : "Run the Lead Discovery Agent to start scanning for corporate catering prospects."
          }
          icon={Search}
          actionText={search || statusFilter ? "Clear Filters" : undefined}
          onAction={search || statusFilter ? () => { setSearch(""); setStatusFilter(""); } : undefined}
        />
      ) : (
        <LeadTable
          data={filtered}
          globalFilter={search}
          onRowClick={openDrawer}
        />
      )}

      {/* Detail Drawer */}
      <LeadDetailsDrawer
        lead={selectedLead}
        open={drawerOpen}
        onClose={closeDrawer}
      />
    </div>
  );
}

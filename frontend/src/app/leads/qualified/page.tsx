"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadTableSkeleton } from "@/components/leads/LeadTableSkeleton";
import { LeadDetailsDrawer } from "@/components/leads/LeadDetailsDrawer";
import { useQualifiedLeads, useStats } from "@/hooks/useLeads";
import { Lead } from "@/types";
import { BadgeCheck, AlertCircle, Download, TrendingUp } from "lucide-react";

export default function QualifiedLeadsPage() {
  const { data: leads, isLoading, isError, error, refetch } = useQualifiedLeads();
  const { data: stats } = useStats();
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
        (l.cleaned_email ?? "").toLowerCase().includes(q)
    );
  }, [leads, search]);

  const avgScore = useMemo(() => {
    if (!leads?.length) return 0;
    return Math.round(leads.reduce((s, l) => s + l.lead_score, 0) / leads.length);
  }, [leads]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Qualified Leads"
        description="Leads that passed AI qualification scoring (score ≥ 70) and are ready for outreach."
      >
        <button
          onClick={() => alert("Export coming in Phase 3")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </PageHeader>

      {/* Quick stats strip */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/40 bg-card shadow-sm">
          <div className="p-2 rounded-lg bg-success/10 text-success">
            <BadgeCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Qualified</p>
            {isLoading ? (
              <div className="h-5 w-12 bg-muted rounded animate-pulse mt-1" />
            ) : (
              <p className="text-xl font-bold text-foreground">{leads?.length ?? 0}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/40 bg-card shadow-sm">
          <div className="p-2 rounded-lg bg-accent/10 text-accent">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Avg. Lead Score</p>
            {isLoading ? (
              <div className="h-5 w-12 bg-muted rounded animate-pulse mt-1" />
            ) : (
              <p className="text-xl font-bold text-foreground">{avgScore}/100</p>
            )}
          </div>
        </div>
      </div>

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
            <p className="font-semibold text-foreground">Failed to load qualified leads</p>
            <p className="text-xs text-muted-foreground mt-1">{(error as { message?: string })?.message}</p>
          </div>
          <button onClick={() => refetch()} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No qualified leads found"
          description="Run the Qualification Agent on your discovered leads to score and qualify them for outreach."
          icon={BadgeCheck}
        />
      ) : (
        <LeadTable data={filtered} globalFilter={search} onRowClick={openDrawer} />
      )}

      <LeadDetailsDrawer lead={selectedLead} open={drawerOpen} onClose={closeDrawer} />
    </div>
  );
}

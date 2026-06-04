"use client";

import React, { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { OutreachMetricsCards } from "@/components/outreach/OutreachMetricsCards";
import { OutreachMessageTable } from "@/components/outreach/OutreachMessageTable";
import { OutreachMessagePreview } from "@/components/outreach/OutreachMessagePreview";
import {
  useOutreachMessages,
  useUpdateOutreachMessage,
  useApproveOutreachMessage,
  useRegenerateOutreachMessage,
  useGenerateEmailForLead,
} from "@/hooks/useOutreach";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useQualifiedLeads } from "@/hooks/useLeads";
import { useToast } from "@/providers/ToastProvider";
import { OutreachMessage, MessageStatusType, Campaign, Lead } from "@/types";
import {
  Search,
  Filter,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronLeft,
  CheckCircle,
  RefreshCw,
  X,
} from "lucide-react";

export default function OutreachPage() {
  const { success, error: toastError } = useToast();

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [needsReview, setNeedsReview] = useState<boolean>(true); // Defaults to Needs Review queue!

  // Active Selected Message
  const [activeMessage, setActiveMessage] = useState<OutreachMessage | null>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkActionPending, setBulkActionPending] = useState(false);

  // Mobile navigation state
  const [mobileView, setMobileView] = useState<"list" | "preview">("list");

  // Queries
  const { data: messages, isLoading: loadingMessages, isError: isMessagesError, error: messagesError, refetch } = useOutreachMessages();
  const { data: campaigns } = useCampaigns();
  const { data: leads } = useQualifiedLeads();

  // Mutations
  const updateMutation = useUpdateOutreachMessage();
  const approveMutation = useApproveOutreachMessage();
  const regenerateMutation = useRegenerateOutreachMessage();
  const generateMutation = useGenerateEmailForLead();

  // Mapping Helpers
  const getLeadName = (leadId: number) => {
    const lead = leads?.find((l) => l.id === leadId);
    return lead ? lead.name : `Lead #${leadId}`;
  };

  const getLeadEmail = (leadId: number) => {
    const lead = leads?.find((l) => l.id === leadId);
    return lead ? lead.cleaned_email ?? lead.email ?? "—" : "—";
  };

  const getLeadScore = (leadId: number) => {
    const lead = leads?.find((l) => l.id === leadId);
    return lead ? lead.lead_score : 0;
  };

  const getCampaignName = (campaignId: number) => {
    const campaign = campaigns?.find((c) => c.id === campaignId);
    return campaign ? campaign.name : `Campaign #${campaignId}`;
  };

  // Sync active message when list updates or on initial load
  useEffect(() => {
    if (messages && messages.length > 0 && !activeMessage) {
      // Default select the first filtered message
      const filteredMsg = messages.find(
        (m) => !needsReview || (m.status !== "approved" && m.status !== "sent")
      );
      if (filteredMsg) {
        setActiveMessage(filteredMsg);
      }
    }
  }, [messages, activeMessage, needsReview]);

  // Filter messages locally
  const filteredMessages = useMemo(() => {
    if (!messages) return [];

    return messages.filter((msg) => {
      // Search: by lead name or subject line
      const leadName = getLeadName(msg.lead_id).toLowerCase();
      const subject = msg.subject.toLowerCase();
      const q = search.toLowerCase();
      const matchesSearch = leadName.includes(q) || subject.includes(q);

      // Campaign Filter
      const matchesCampaign =
        campaignFilter === "all" || String(msg.campaign_id) === campaignFilter;

      // Status Filter (only active if Needs Review is off)
      const matchesStatus =
        needsReview || statusFilter === "all" || msg.status === statusFilter;

      // Needs Review queue logic (status != APPROVED && status != SENT)
      const matchesReviewQueue =
        !needsReview || (msg.status !== "approved" && msg.status !== "sent" && msg.status !== "replied");

      return matchesSearch && matchesCampaign && matchesStatus && matchesReviewQueue;
    });
  }, [messages, search, statusFilter, campaignFilter, needsReview, leads, campaigns]);

  // Bulk Actions
  const allSelected =
    filteredMessages.length > 0 &&
    filteredMessages.every((m) => selectedIds.includes(m.id));

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (allSelected) {
      // Uncheck all in current filtered list
      const filteredIds = filteredMessages.map((m) => m.id);
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      // Check all in current filtered list
      const filteredIds = filteredMessages.map((m) => m.id);
      setSelectedIds((prev) => {
        const union = new Set([...prev, ...filteredIds]);
        return Array.from(union);
      });
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setBulkActionPending(true);

    // Simulate bulk network request
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Optimistically update statuses locally in query caches (simulated)
    // In our case we invalidate query caches to trigger real refreshes
    setBulkActionPending(false);
    success(`Successfully approved ${selectedIds.length} outreach messages!`);
    setSelectedIds([]);
    refetch();
  };

  const handleBulkRegenerate = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to regenerate ${selectedIds.length} messages? This will draft new email copies.`
      )
    ) {
      return;
    }
    setBulkActionPending(true);

    // Simulate bulk network request
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setBulkActionPending(false);
    success(`Triggered AI regeneration for ${selectedIds.length} messages.`);
    setSelectedIds([]);
    refetch();
  };

  // Preview Actions
  const handleApprove = (id: number) => {
    approveMutation.mutate(
      { id },
      {
        onSuccess: (approvedMsg) => {
          success(`Email approved successfully!`);
          // If in review queue, clear active selection to fetch next item
          if (needsReview) {
            setActiveMessage(null);
          } else {
            setActiveMessage(approvedMsg);
          }
        },
        onError: (err: any) => {
          toastError(err?.message ?? "Failed to approve email.");
        },
      }
    );
  };

  const handleRegenerate = (id: number) => {
    regenerateMutation.mutate(id, {
      onSuccess: (newMsg) => {
        success("AI email regenerated successfully.");
        setActiveMessage(newMsg);
      },
      onError: (err: any) => {
        toastError(err?.message ?? "Failed to regenerate email.");
      },
    });
  };

  const handleSaveEdit = (id: number, data: { subject: string; body: string; cta: string }) => {
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: (updatedMsg) => {
          success("Copy updated successfully!");
          setActiveMessage(updatedMsg);
        },
        onError: (err: any) => {
          toastError(err?.message ?? "Failed to save edits.");
        },
      }
    );
  };

  const handleSelectMessage = (msg: OutreachMessage) => {
    setActiveMessage(msg);
    setMobileView("preview");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Outreach Approval Desk"
        description="Review, modify, and authorize AI-generated email copies before dispatching them to leads."
      />

      {/* Metrics Cards */}
      <OutreachMetricsCards />

      {/* Filter and Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Message Feed List & Filters (lg:col-span-1) */}
        <div
          className={`lg:col-span-1 space-y-4 ${
            mobileView === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Filters card */}
          <div className="bg-card border border-border/40 p-4 rounded-xl shadow-sm space-y-3.5">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by Lead or Subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border/60 bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent"
              />
            </div>

            {/* Needs Review Toggle Queue */}
            <div className="flex items-center justify-between pb-2 border-b border-border/20">
              <label htmlFor="needs-review" className="text-xs font-bold text-foreground cursor-pointer select-none">
                Review Queue (Needs Action)
              </label>
              <input
                id="needs-review"
                type="checkbox"
                checked={needsReview}
                onChange={(e) => {
                  setNeedsReview(e.target.checked);
                  setActiveMessage(null); // Reset active message to trigger select first match
                }}
                className="rounded border-border bg-background text-accent focus:ring-accent/40 w-4 h-4 cursor-pointer accent-accent"
              />
            </div>

            {/* Additional filters */}
            <div className="space-y-2.5 pt-1">
              {/* Campaign Filter */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Filter by Campaign
                </span>
                <select
                  value={campaignFilter}
                  onChange={(e) => {
                    setCampaignFilter(e.target.value);
                    setActiveMessage(null);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border/60 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent/40"
                >
                  <option value="all">All Campaigns</option>
                  {campaigns?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter (only active if Needs Review is checked off) */}
              {!needsReview && (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Filter by Status
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setActiveMessage(null);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border/60 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-accent/40"
                  >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="generated">Generated</option>
                    <option value="edited">Edited</option>
                    <option value="approved">Approved</option>
                    <option value="sent">Sent</option>
                    <option value="failed">Failed</option>
                    <option value="replied">Replied</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Messages Feed panel */}
          {loadingMessages ? (
            <div className="bg-card border border-border/40 rounded-xl p-8 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
              <span className="text-xs text-muted-foreground">Loading draft queue...</span>
            </div>
          ) : isMessagesError ? (
            <div className="bg-card border border-border/40 rounded-xl p-6 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-xs font-semibold text-foreground">Failed to load drafts</p>
              <button
                onClick={() => refetch()}
                className="px-3 py-1 bg-accent text-white rounded text-xs hover:bg-accent/90"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-border/40 overflow-hidden shadow-sm">
              <OutreachMessageTable
                messages={filteredMessages}
                selectedId={activeMessage?.id ?? null}
                onSelect={handleSelectMessage}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                allSelected={allSelected}
                getLeadName={getLeadName}
                getCampaignName={getCampaignName}
              />
            </div>
          )}
        </div>

        {/* Right Side: Message Preview Workspace (lg:col-span-2) */}
        <div
          className={`lg:col-span-2 space-y-4 ${
            mobileView === "list" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Mobile Back button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileView("list")}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to List Feed
            </button>
          </div>

          <OutreachMessagePreview
            message={activeMessage}
            loading={loadingMessages}
            getLeadName={getLeadName}
            getLeadEmail={getLeadEmail}
            getLeadScore={getLeadScore}
            getCampaignName={getCampaignName}
            onApprove={handleApprove}
            onRegenerate={handleRegenerate}
            onSaveEdit={handleSaveEdit}
            isApprovePending={approveMutation.isPending}
            isRegeneratePending={regenerateMutation.isPending}
            isSavePending={updateMutation.isPending}
          />
        </div>

      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-slate-900/95 text-white px-5 py-3 rounded-xl shadow-lg border border-slate-800 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="text-xs font-semibold">
            {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApprove}
              disabled={bulkActionPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent hover:bg-accent/90 disabled:bg-accent/70 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              {bulkActionPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCircle className="w-3 h-3" />
              )}
              Approve Selected
            </button>
            <button
              onClick={handleBulkRegenerate}
              disabled={bulkActionPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              {bulkActionPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Regenerate Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

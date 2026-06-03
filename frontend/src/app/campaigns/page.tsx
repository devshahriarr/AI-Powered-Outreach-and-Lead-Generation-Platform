"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CampaignTable } from "@/components/campaigns/CampaignTable";
import { useCampaigns, useDeleteCampaign } from "@/hooks/useCampaigns";
import { Megaphone, Plus, Search, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/providers/ToastProvider";

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const { data: campaigns, isLoading, isError, error, refetch } = useCampaigns();
  const deleteMutation = useDeleteCampaign();
  const { success, error: toastError } = useToast();

  const handleDelete = (campaign: { id: number; name: string }) => {
    if (
      window.confirm(
        `Are you sure you want to delete campaign "${campaign.name}"? This will permanently delete the campaign and its generated outreach messages.`
      )
    ) {
      deleteMutation.mutate(campaign.id, {
        onSuccess: () => {
          success(`Campaign "${campaign.name}" deleted successfully.`);
        },
        onError: (err: any) => {
          toastError(err?.message ?? `Failed to delete campaign "${campaign.name}".`);
        },
      });
    }
  };

  // Filter campaigns locally by search string (name, target vertical, offer)
  const filtered = campaigns
    ? campaigns.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.target_business_type.toLowerCase().includes(search.toLowerCase()) ||
          c.offer.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Outreach Campaigns"
        description="Configure target verticals, discount offers, brand voice guidelines, and monitor email delivery pipeline."
      >
        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/90 text-xs font-semibold shadow-sm transition-all duration-200"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Campaign
        </Link>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card border border-border/40 p-4 rounded-xl shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-border/60 bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent"
          />
        </div>

        {campaigns && campaigns.length > 0 && (
          <div className="text-xs text-muted-foreground font-medium self-end sm:self-auto">
            Showing {filtered.length} of {campaigns.length} campaigns
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-xs text-muted-foreground">Loading campaigns...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center bg-card border border-border/40 rounded-xl">
          <AlertCircle className="w-10 h-10 text-rose-500" />
          <div>
            <p className="font-semibold text-foreground">Failed to load campaigns</p>
            <p className="text-xs text-muted-foreground mt-1">{(error as any)?.message}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90"
          >
            Retry
          </button>
        </div>
      ) : campaigns?.length === 0 ? (
        <div className="py-12 bg-card border border-border/40 rounded-xl">
          <EmptyState
            title="No campaigns found"
            description="Personalize your outreach. Define target segments, specific discounts, brand guidance, and start generating AI emails."
            icon={Megaphone}
            actionText="Create First Campaign"
            onAction={() => window.location.assign("/campaigns/new")}
          />
        </div>
      ) : (
        <CampaignTable data={filtered} globalFilter={search} onDelete={handleDelete} />
      )}
    </div>
  );
}

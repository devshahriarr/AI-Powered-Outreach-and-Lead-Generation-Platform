"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Megaphone, Plus } from "lucide-react";

export default function CampaignsPage() {
  const handleAction = () => {
    alert("In Phase 4, this will open a modal or navigate to setup a new Catering Campaign.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outreach Campaigns"
        description="Configure target businesses, brand voices, custom discount offers, and sending parameters."
      >
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/90 text-xs font-semibold shadow-sm transition-all duration-200"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Campaign
        </button>
      </PageHeader>

      <div className="py-12">
        <EmptyState
          title="No campaigns active"
          description="Manage your personalized email outreach campaigns. Define target business types, custom offers, call-to-actions, and setup platform email send limits."
          icon={Megaphone}
          actionText="Create First Campaign"
          onAction={handleAction}
        />
      </div>
    </div>
  );
}

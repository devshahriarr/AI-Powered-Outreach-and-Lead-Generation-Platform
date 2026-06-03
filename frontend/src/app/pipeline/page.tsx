"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Workflow, Eye } from "lucide-react";

export default function PipelinePage() {
  const handleAction = () => {
    alert("In Phase 5, this will display the sales pipeline board showing lead statuses (discovered, qualified, contacted, interested, booked).");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catering Pipeline"
        description="Monitor lead lifecycle progressions from discovery to booked events."
      >
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/90 text-xs font-semibold shadow-sm transition-all duration-200"
        >
          <Eye className="w-3.5 h-3.5" />
          View Pipeline Metrics
        </button>
      </PageHeader>

      <div className="py-12">
        <EmptyState
          title="Sales pipeline is empty"
          description="Track prospective corporate clients through the sales cycle. From contacted, to interested, meetings scheduled, booked events, and closed contracts."
          icon={Workflow}
          actionText="Inspect Funnel Metrics"
          onAction={handleAction}
        />
      </div>
    </div>
  );
}

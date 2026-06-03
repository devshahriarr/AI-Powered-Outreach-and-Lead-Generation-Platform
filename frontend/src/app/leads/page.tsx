"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Search, Sparkles } from "lucide-react";

export default function LeadsPage() {
  const handleAction = () => {
    alert("In Phase 2, this will trigger the Lead Discovery Apify runner.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Discovery Desk"
        description="Extract raw business leads from directories and map databases using Apify integration."
      >
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/90 text-xs font-semibold shadow-sm transition-all duration-200"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Start Discovery Scan
        </button>
      </PageHeader>

      <div className="py-12">
        <EmptyState
          title="No leads discovered yet"
          description="Discovered raw leads will appear here once scanning begins. Run the Lead Discovery Agent to start parsing new business prospects from Google Maps, Yelp, and local business directories."
          icon={Search}
          actionText="Configure Discovery Agent"
          onAction={handleAction}
        />
      </div>
    </div>
  );
}

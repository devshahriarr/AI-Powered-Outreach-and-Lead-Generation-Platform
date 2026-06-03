"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { BarChart3, Download } from "lucide-react";

export default function AnalyticsPage() {
  const handleAction = () => {
    alert("In Phase 5, this will display interactive visual charts mapping response rates and outreach efficiency.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outreach Analytics"
        description="Review performance metrics, email response statistics, and event conversions."
      >
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/90 text-xs font-semibold shadow-sm transition-all duration-200"
        >
          <Download className="w-3.5 h-3.5" />
          Export System Report
        </button>
      </PageHeader>

      <div className="py-12">
        <EmptyState
          title="No analytics records populated"
          description="Monitor key metrics on lead generation efficiency, email open rates, response rates, qualification distribution, and closed corporate bookings."
          icon={BarChart3}
          actionText="Generate System Report"
          onAction={handleAction}
        />
      </div>
    </div>
  );
}

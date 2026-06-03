"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { BadgeCheck, Cpu } from "lucide-react";

export default function QualifiedLeadsPage() {
  const handleAction = () => {
    alert("In Phase 3, this will trigger the lead qualification pipeline scoring service.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Qualified Leads"
        description="Verify catering-relevant prospects scored by the AI Qualification Agent."
      >
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/90 text-xs font-semibold shadow-sm transition-all duration-200"
        >
          <Cpu className="w-3.5 h-3.5" />
          Qualify Scanned Leads
        </button>
      </PageHeader>

      <div className="py-12">
        <EmptyState
          title="No qualified leads found"
          description="Qualified leads will appear here after passing AI scoring filters. The Qualification Agent runs in the background, analyzing email addresses, website relevance, domain status, and business signals to rate lead suitability."
          icon={BadgeCheck}
          actionText="Run Qualification Scoring"
          onAction={handleAction}
        />
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { SendHorizontal, Sparkles } from "lucide-react";

export default function OutreachPage() {
  const handleAction = () => {
    alert("In Phase 4, this will trigger outreach generation using OpenAI for qualified leads.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outreach Approval Desk"
        description="Verify and send personalized email copies designed by the AI Outreach Agent."
      >
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/90 text-xs font-semibold shadow-sm transition-all duration-200"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate Drafts
        </button>
      </PageHeader>

      <div className="py-12">
        <EmptyState
          title="No outreach drafts generated"
          description="Review, edit, and approve hyper-personalized emails crafted by the Outreach Agent before they are sent. Transition status from draft to scheduled."
          icon={SendHorizontal}
          actionText="Generate Outreach Messages"
          onAction={handleAction}
        />
      </div>
    </div>
  );
}

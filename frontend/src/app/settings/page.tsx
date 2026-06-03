"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Settings, Save } from "lucide-react";

export default function SettingsPage() {
  const handleAction = () => {
    alert("In Phase 2, this will save brand profile details, restaurant configurations, and LLM preferences.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Brand Profile"
        description="Configure default sender identities, brand voice criteria, and API integrations."
      >
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/90 text-xs font-semibold shadow-sm transition-all duration-200"
        >
          <Save className="w-3.5 h-3.5" />
          Save Configurations
        </button>
      </PageHeader>

      <div className="py-12">
        <EmptyState
          title="Configurations uninitialized"
          description="Configure default sender identity, restaurant metadata, brand voice instructions, LLM model choice, global API keys, and notification preferences."
          icon={Settings}
          actionText="Update Brand Profile"
          onAction={handleAction}
        />
      </div>
    </div>
  );
}

import React from "react";
import { CampaignStatusType, CAMPAIGN_STATUS_LABELS } from "@/types";

interface CampaignStatusBadgeProps {
  status: CampaignStatusType;
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const styles: Record<CampaignStatusType, string> = {
    draft: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    active: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    paused: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    completed: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    archived: "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || styles.draft
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {CAMPAIGN_STATUS_LABELS[status] || status}
    </span>
  );
}

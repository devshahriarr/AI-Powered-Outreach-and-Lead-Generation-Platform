"use client";

import React from "react";
import { FileText, CheckSquare, Send, MessageSquare } from "lucide-react";
import { KpiCard } from "@/components/shared/KpiCard";
import { useStats } from "@/hooks/useLeads";

export function OutreachMetricsCards() {
  const { data: stats, isLoading } = useStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-border/45 bg-card p-5 animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded-lg" />
            </div>
            <div className="mt-3 h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  const generated = stats.outreach_messages.total;
  const approved = stats.outreach_messages.approved;
  const sent = stats.outreach_messages.sent;
  const replied = stats.outreach_messages.replied;

  // Calculate reply rate (replies / sent messages)
  const replyRate = sent > 0 ? Math.round((replied / sent) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Generated Emails"
        value={generated}
        icon={FileText}
        description="AI drafted outreach copies"
        trend={{ value: "Drafts", type: "neutral" }}
      />
      <KpiCard
        title="Approved Emails"
        value={approved}
        icon={CheckSquare}
        description="Ready for dispatch"
        trend={generated > 0 ? { value: `${Math.round((approved / generated) * 100)}% rate`, type: "neutral" } : undefined}
      />
      <KpiCard
        title="Sent Emails"
        value={sent}
        icon={Send}
        description="Dispatched to prospects"
        trend={approved > 0 ? { value: `${Math.round((sent / approved) * 100)}% sent`, type: "neutral" } : undefined}
      />
      <KpiCard
        title="Reply Rate"
        value={`${replyRate}%`}
        icon={MessageSquare}
        description={`${replied} replies received`}
        trend={replyRate > 15 ? { value: "High Response", type: "up" } : undefined}
      />
    </div>
  );
}

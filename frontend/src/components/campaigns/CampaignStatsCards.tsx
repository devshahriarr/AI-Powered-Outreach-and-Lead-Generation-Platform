import React from "react";
import { Users, FileText, CheckSquare, Send } from "lucide-react";
import { KpiCard } from "@/components/shared/KpiCard";

interface CampaignStatsCardsProps {
  qualifiedLeadsCount: number;
  generatedEmailsCount: number;
  approvedEmailsCount: number;
  sentEmailsCount: number;
  loading?: boolean;
}

export function CampaignStatsCards({
  qualifiedLeadsCount,
  generatedEmailsCount,
  approvedEmailsCount,
  sentEmailsCount,
  loading = false,
}: CampaignStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

  // Calculate approval rate and send rate
  const approvalRate = generatedEmailsCount
    ? Math.round((approvedEmailsCount / generatedEmailsCount) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Qualified Leads"
        value={qualifiedLeadsCount}
        icon={Users}
        description="Leads eligible for outreach"
        trend={{ value: "Targeted", type: "neutral" }}
      />
      <KpiCard
        title="Generated Emails"
        value={generatedEmailsCount}
        icon={FileText}
        description="AI-generated messages"
        trend={generatedEmailsCount > 0 ? { value: "+100%", type: "up" } : undefined}
      />
      <KpiCard
        title="Approved Emails"
        value={approvedEmailsCount}
        icon={CheckSquare}
        description={`${approvalRate}% approval rate`}
        trend={
          approvalRate >= 80
            ? { value: "High Quality", type: "up" }
            : approvalRate > 0
            ? { value: "Reviewing", type: "neutral" }
            : undefined
        }
      />
      <KpiCard
        title="Sent Emails"
        value={sentEmailsCount}
        icon={Send}
        description="Delivered to leads"
        trend={sentEmailsCount > 0 ? { value: "Active", type: "up" } : undefined}
      />
    </div>
  );
}

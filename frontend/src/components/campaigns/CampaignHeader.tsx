import React from "react";
import Link from "next/link";
import { ChevronLeft, Edit3, Trash2 } from "lucide-react";
import { Campaign } from "@/types";
import { CampaignStatusBadge } from "./CampaignStatusBadge";

interface CampaignHeaderProps {
  campaign: Campaign;
  onDelete: () => void;
}

export function CampaignHeader({ campaign, onDelete }: CampaignHeaderProps) {
  return (
    <div className="space-y-4 bg-card border border-border/40 p-6 rounded-xl shadow-sm">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Link href="/campaigns" className="hover:text-accent flex items-center gap-0.5 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
          Campaigns
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold truncate max-w-[200px]">{campaign.name}</span>
      </div>

      {/* Main header block */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {campaign.name}
            </h1>
            <CampaignStatusBadge status={campaign.status} />
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm font-medium">
            <div className="text-muted-foreground">
              Type:{" "}
              <span className="text-foreground bg-muted px-2 py-0.5 rounded text-xs">
                {campaign.campaign_type === "cold_outreach" ? "Cold Outreach" : campaign.campaign_type}
              </span>
            </div>
            <div className="text-muted-foreground">
              Target vertical: <span className="text-foreground">{campaign.target_business_type}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Link
            href={`/campaigns/${campaign.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 hover:bg-muted text-xs font-semibold text-foreground transition-all duration-200"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </Link>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 text-xs font-semibold text-rose-500 transition-all duration-200 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Offer Summary */}
      <div className="pt-4 border-t border-border/20">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
          Core Offer / Message Value Proposition
        </span>
        <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg border border-border/20 max-w-4xl">
          {campaign.offer}
        </p>
      </div>
    </div>
  );
}

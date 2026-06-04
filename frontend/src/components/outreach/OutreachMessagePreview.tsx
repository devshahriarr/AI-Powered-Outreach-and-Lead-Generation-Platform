"use client";

import React, { useState } from "react";
import { OutreachMessage, MessageStatusType } from "@/types";
import { OutreachStatusBadge } from "./OutreachStatusBadge";
import { OutreachMessageEditor } from "./OutreachMessageEditor";
import { AiInsightsCard } from "./AiInsightsCard";
import {
  User,
  Folder,
  Calendar,
  Cpu,
  Sparkles,
  Edit,
  RefreshCw,
  CheckCircle,
  Mail,
  Loader2,
} from "lucide-react";

interface OutreachMessagePreviewProps {
  message: OutreachMessage | null;
  loading?: boolean;
  getLeadName: (id: number) => string;
  getLeadEmail: (id: number) => string;
  getLeadScore: (id: number) => number;
  getCampaignName: (id: number) => string;
  onApprove: (id: number) => void;
  onRegenerate: (id: number) => void;
  onSaveEdit: (id: number, data: { subject: string; body: string; cta: string }) => void;
  isApprovePending?: boolean;
  isRegeneratePending?: boolean;
  isSavePending?: boolean;
}

export function OutreachMessagePreview({
  message,
  loading = false,
  getLeadName,
  getLeadEmail,
  getLeadScore,
  getCampaignName,
  onApprove,
  onRegenerate,
  onSaveEdit,
  isApprovePending = false,
  isRegeneratePending = false,
  isSavePending = false,
}: OutreachMessagePreviewProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-card border border-border/40 rounded-xl p-6 justify-center items-center gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-xs text-muted-foreground">Loading preview data...</p>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex flex-col h-full bg-card border border-border/40 rounded-xl p-8 justify-center items-center text-center gap-3 min-h-[450px]">
        <Mail className="w-12 h-12 text-muted-foreground/35" />
        <div>
          <h3 className="font-bold text-sm text-foreground">No Message Selected</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Select an AI-generated outreach copy from the panel on the left to preview, edit, or approve.
          </p>
        </div>
      </div>
    );
  }

  const handleRegenerateClick = () => {
    if (
      window.confirm(
        "Are you sure you want to regenerate this copy? This will write a new draft copy and discard edits."
      )
    ) {
      onRegenerate(message.id);
    }
  };

  const handleSave = (data: { subject: string; body: string; cta: string }) => {
    onSaveEdit(message.id, data);
    setIsEditing(false);
  };

  // Status checks
  const canModify = message.status !== "approved" && message.status !== "sent";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full items-start">
      {/* Message Copy Panel (Left/Middle xl:col-span-2) */}
      <div className="xl:col-span-2 bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-5">
        
        {/* Preview Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/25">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground truncate max-w-[280px]">
                {getLeadName(message.lead_id)}
              </h2>
              <OutreachStatusBadge status={message.status} />
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              Campaign: <span className="text-foreground font-semibold">{getCampaignName(message.campaign_id)}</span>
            </p>
          </div>

          {/* Action Toolbar */}
          {canModify && !isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 hover:bg-muted text-xs font-semibold text-foreground transition-all duration-200 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={handleRegenerateClick}
                disabled={isRegeneratePending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 hover:bg-muted text-xs font-semibold text-foreground transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {isRegeneratePending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Regenerate
              </button>
              <button
                onClick={() => onApprove(message.id)}
                disabled={isApprovePending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent/90 disabled:bg-accent/70 text-white rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm"
              >
                {isApprovePending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                Approve
              </button>
            </div>
          )}
        </div>

        {/* Preview Content Area */}
        {isEditing ? (
          <OutreachMessageEditor
            message={message}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            isSaving={isSavePending}
          />
        ) : (
          <div className="space-y-4">
            {/* Subject preview */}
            <div className="bg-muted/30 dark:bg-muted/10 p-3 rounded-lg border border-border/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Subject line
              </span>
              <p className="text-xs font-bold text-foreground select-all">{message.subject}</p>
            </div>

            {/* Body copy preview */}
            <div className="bg-muted/30 dark:bg-muted/10 p-4 rounded-lg border border-border/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Email Body copy
              </span>
              <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed select-all">
                {message.body}
              </p>
            </div>

            {/* CTA copy preview */}
            <div className="bg-muted/30 dark:bg-muted/10 p-3 rounded-lg border border-border/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Call to Action
              </span>
              <p className="text-xs font-semibold text-accent select-all">{message.cta}</p>
            </div>
          </div>
        )}

        {/* Generation Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border/20 text-[10px] text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span>AI Model: </span>
            <span className="font-semibold text-foreground uppercase">{message.model_name || "GPT-4o"}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:justify-end">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span>Generated: </span>
            <span className="font-semibold text-foreground">
              {new Date(message.created_at).toLocaleDateString()} at{" "}
              {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </div>

      {/* Side insights panel (Right xl:col-span-1) */}
      <div className="space-y-4">
        {/* Lead Profile Metadata */}
        <div className="bg-card border border-border/40 p-5 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center gap-1.5 border-b border-border/20 pb-2.5">
            <User className="w-4 h-4 text-accent" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Target Lead Profile
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground text-[10px] block">Company Email</span>
              <a
                href={`mailto:${getLeadEmail(message.lead_id)}`}
                className="font-semibold text-accent hover:underline break-all"
              >
                {getLeadEmail(message.lead_id)}
              </a>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block">AI Qualification Score</span>
              <span className="inline-flex items-center justify-center font-bold px-2 py-0.5 rounded text-[10px] bg-success/15 text-success">
                {getLeadScore(message.lead_id)}/100
              </span>
            </div>
          </div>
        </div>

        {/* AI Insights Card */}
        <AiInsightsCard body={message.body} subject={message.subject} />
      </div>
    </div>
  );
}

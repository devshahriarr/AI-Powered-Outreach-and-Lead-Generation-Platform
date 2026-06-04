"use client";

import React from "react";
import { OutreachMessage, MessageStatusType, MESSAGE_TYPE_LABELS } from "@/types";
import { OutreachStatusBadge } from "./OutreachStatusBadge";
import { Calendar } from "lucide-react";

interface OutreachMessageTableProps {
  messages: OutreachMessage[];
  selectedId: number | null;
  onSelect: (message: OutreachMessage) => void;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  allSelected: boolean;
  getLeadName: (leadId: number) => string;
  getCampaignName: (campaignId: number) => string;
}

export function OutreachMessageTable({
  messages,
  selectedId,
  onSelect,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  getLeadName,
  getCampaignName,
}: OutreachMessageTableProps) {
  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border/30 bg-muted/20 text-xs font-semibold text-muted-foreground select-none">
        <input
          type="checkbox"
          checked={allSelected && messages.length > 0}
          onChange={onToggleSelectAll}
          disabled={messages.length === 0}
          className="rounded border-border/60 text-accent focus:ring-accent/40 w-4 h-4 cursor-pointer accent-accent"
        />
        <span>Select All</span>
        <span className="ml-auto">{messages.length} messages</span>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/20 max-h-[600px]">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-xs font-medium">
            No outreach drafts match the selected filters.
          </div>
        ) : (
          messages.map((msg) => {
            const isSelected = msg.id === selectedId;
            const isChecked = selectedIds.includes(msg.id);

            return (
              <div
                key={msg.id}
                onClick={() => onSelect(msg)}
                className={`flex gap-3 p-4 cursor-pointer transition-all duration-200 border-l-2 hover:bg-muted/30 dark:hover:bg-muted/10 ${
                  isSelected
                    ? "border-accent bg-accent/5 dark:bg-accent/5"
                    : "border-transparent bg-transparent"
                }`}
              >
                {/* Checkbox column */}
                <div
                  className="pt-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleSelect(msg.id)}
                    className="rounded border-border/60 text-accent focus:ring-accent/40 w-4 h-4 cursor-pointer accent-accent"
                  />
                </div>

                {/* Meta details column */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-foreground truncate">
                      {getLeadName(msg.lead_id)}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" />
                      {formatDate(msg.created_at)}
                    </span>
                  </div>

                  <div className="text-[11px] text-muted-foreground truncate font-medium">
                    Campaign: <span className="text-foreground font-semibold">{getCampaignName(msg.campaign_id)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] bg-muted/60 dark:bg-muted/30 px-1.5 py-0.5 rounded text-muted-foreground font-semibold">
                      {(MESSAGE_TYPE_LABELS as Record<string, string>)[msg.message_type] || msg.message_type}
                    </span>
                    <OutreachStatusBadge status={msg.status} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React from "react";
import { LeadStatusType, LEAD_STATUS_LABELS } from "@/types";

interface LeadStatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  DISCOVERED:        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700",
  QUALIFIED:         "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  REVIEW_REQUIRED:   "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  CONTACTED:         "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  INTERESTED:        "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800",
  MEETING_REQUESTED: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
  BOOKED:            "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800",
  CLOSED_WON:        "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  CLOSED_LOST:       "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
  REJECTED:          "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

const PULSE_STATUSES = new Set(["QUALIFIED", "REVIEW_REQUIRED"]);

export function LeadStatusBadge({ status, className = "" }: LeadStatusBadgeProps) {
  const normalized = status.toUpperCase() as LeadStatusType;
  const styles = STATUS_STYLES[normalized] ?? "bg-muted text-muted-foreground border-border";
  const label = LEAD_STATUS_LABELS[normalized] ?? status;
  const pulse = PULSE_STATUSES.has(normalized);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full bg-current shrink-0 ${pulse ? "animate-pulse" : ""}`} />
      {label}
    </span>
  );
}

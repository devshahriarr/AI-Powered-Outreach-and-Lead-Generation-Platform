import React from "react";
import { MessageStatusType, MESSAGE_STATUS_LABELS } from "@/types";

interface OutreachStatusBadgeProps {
  status: MessageStatusType;
}

export function OutreachStatusBadge({ status }: OutreachStatusBadgeProps) {
  const styles: Record<MessageStatusType, string> = {
    draft: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    generated: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40",
    edited: "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/40",
    approved: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40",
    sent: "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40",
    failed: "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40",
    replied: "bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900/40",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
        styles[status] || styles.draft
      }`}
    >
      <span className="w-1 h-1 rounded-full bg-current mr-1.5" />
      {MESSAGE_STATUS_LABELS[status] || status}
    </span>
  );
}

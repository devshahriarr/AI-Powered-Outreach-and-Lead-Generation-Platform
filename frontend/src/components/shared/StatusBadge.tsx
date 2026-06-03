import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  const getStyles = (val: string) => {
    switch (val) {
      // Direct spec statuses
      case "RUNNING":
        return "bg-success/10 text-success border-success/20";
      case "PROCESSING":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "IDLE":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "PAUSED":
      case "WARNING":
      case "EDITED":
      case "REVIEW_REQUIRED":
        return "bg-warning/10 text-warning border-warning/20";
      case "FAILED":
      case "ERROR":
      case "REJECTED":
      case "CLOSED_LOST":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "SUCCESS":
      case "QUALIFIED":
      case "BOOKED":
      case "CLOSED_WON":
      case "ACTIVE":
      case "SENT":
      case "APPROVED":
      case "COMPLETED":
        return "bg-success/10 text-success border-success/20";

      // LeadStatus & message statuses
      case "DISCOVERED":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "CONTACTED":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "INTERESTED":
      case "REPLIED":
        return "bg-pink-500/10 text-pink-500 border-pink-500/20";
      case "MEETING_REQUESTED":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "DRAFT":
        return "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/25";
      case "ARCHIVED":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "GENERATED":
        return "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20";
        
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const shouldPulse = normalized === "RUNNING" || normalized === "PROCESSING";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles(
        normalized
      )} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${shouldPulse ? "animate-pulse" : ""}`} />
      {status.toLowerCase().replace(/_/g, " ")}
    </span>
  );
}

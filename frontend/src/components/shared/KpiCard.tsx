import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    type: "up" | "down" | "neutral";
  };
}

export function KpiCard({ title, value, icon: Icon, description, trend }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:text-accent group-hover:bg-accent/10 transition-colors duration-200">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
              trend.type === "up"
                ? "text-success bg-success/15"
                : trend.type === "down"
                ? "text-destructive bg-destructive/15"
                : "text-muted-foreground bg-muted"
            }`}
          >
            {trend.type === "up" ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : trend.type === "down" ? (
              <ArrowDownRight className="w-3.5 h-3.5" />
            ) : null}
            {trend.value}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-2 text-xs text-muted-foreground font-medium">
          {description}
        </p>
      )}
    </div>
  );
}

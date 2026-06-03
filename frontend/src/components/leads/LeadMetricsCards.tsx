"use client";

import React from "react";
import { useStats } from "@/hooks/useLeads";
import { Users, BadgeCheck, Clock, XCircle } from "lucide-react";
import Link from "next/link";

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
  color: string;
  loading?: boolean;
}

function MetricCard({ label, value, icon: Icon, href, color, loading }: MetricCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card shadow-sm hover:shadow-md hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <div className={`p-2.5 rounded-lg ${color} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
        {loading ? (
          <div className="h-6 w-16 bg-muted rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        )}
      </div>
    </Link>
  );
}

export function LeadMetricsCards() {
  const { data: stats, isLoading } = useStats();

  const cards = [
    {
      label: "Total Leads",
      value: stats?.leads.total ?? 0,
      icon: Users,
      href: "/leads",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Qualified",
      value: stats?.leads.qualified ?? 0,
      icon: BadgeCheck,
      href: "/leads/qualified",
      color: "bg-success/10 text-success",
    },
    {
      label: "Review Required",
      value: stats?.leads.review_required ?? 0,
      icon: Clock,
      href: "/leads/review",
      color: "bg-warning/10 text-warning",
    },
    {
      label: "Rejected",
      value:
        stats
          ? stats.leads.total -
            stats.leads.qualified -
            stats.leads.review_required -
            stats.leads.contacted -
            stats.leads.discovered
          : 0,
      icon: XCircle,
      href: "/leads/rejected",
      color: "bg-rose-500/10 text-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} loading={isLoading} />
      ))}
    </div>
  );
}

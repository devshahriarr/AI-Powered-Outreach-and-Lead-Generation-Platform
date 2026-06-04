"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Users,
  CheckCircle,
  Megaphone,
  Mail,
  Play,
  Pause,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertCircle,
  XCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useStats } from "@/hooks/useStats";

export default function DashboardPage() {
  const { data: stats, isLoading, isError, dataUpdatedAt, refetch, isRefetching } = useStats();

  const kpiData = [
    {
      title: "Total Leads",
      value: stats?.leads.total ?? "-",
      icon: Users,
      description: "Discovered raw contacts",
      href: "/leads",
    },
    {
      title: "Qualified Leads",
      value: stats?.leads.qualified ?? "-",
      icon: CheckCircle,
      description: "Catering relevant businesses",
      href: "/leads/qualified",
    },
    {
      title: "Review Required",
      value: stats?.leads.review_required ?? "-",
      icon: AlertCircle,
      description: "Borderline scores to check",
      href: "/leads?status=REVIEW_REQUIRED",
    },
    {
      title: "Rejected Leads",
      value: stats?.leads.rejected ?? "-",
      icon: XCircle,
      description: "Failed qualification",
      href: "/leads?status=REJECTED",
    },
    {
      title: "Campaigns",
      value: stats?.campaigns.total ?? "-",
      icon: Megaphone,
      description: "Configured outreach sequences",
      href: "/campaigns",
    },
    {
      title: "Generated Emails",
      value: stats?.outreach_messages.total ?? "-",
      icon: Mail,
      description: "Drafts and sent emails",
      href: "/outreach",
    },
  ];

  const lastSyncTime = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : "Syncing...";

  // Mock data for running agents
  const agentDetails = [
    {
      name: "Lead Discovery Agent",
      status: "RUNNING",
      type: "Apify Scraper",
      lastActive: "2 minutes ago",
      metric: "148 leads scanned today",
      log: "Scanned Yelp search: 'office event catering Boston'",
    },
    {
      name: "Qualification Agent",
      status: "RUNNING",
      type: "LLM + DNS Analyzer",
      lastActive: "5 minutes ago",
      metric: "82% qualification rate",
      log: "Verified domain MX record for 'bostonsandwichco.com'",
    },
    {
      name: "Outreach Agent",
      status: "IDLE",
      type: "Email Generator",
      lastActive: "1 hour ago",
      metric: "0 messages in queue",
      log: "Draft emails completed for Campaign: 'Summer BBQ 2026'",
    },
  ];

  // Expanded mock activity feed logs to demonstrate scrolling
  const activityFeed = [
    {
      event: "Lead Discovered",
      target: "Gourmet Bites Bistro",
      detail: "Boston, MA • Score: 85/100",
      time: "4 mins ago",
      type: "success",
    },
    {
      event: "Qualification Completed",
      target: "Atlantic Catering Corp",
      detail: "Verified email • Auto-Qualified",
      time: "12 mins ago",
      type: "success",
    },
    {
      event: "Outreach Generated",
      target: "Summit Tech Group (BBQ)",
      detail: "Cold email draft ready for review",
      time: "24 mins ago",
      type: "warning",
    },
    {
      event: "Campaign Sent",
      target: "Apex Consultants",
      detail: "Follow-up #1 email sent to hr@apex.com",
      time: "48 mins ago",
      type: "info",
    },
    {
      event: "Lead Discovered",
      target: "Fidelity Offices Boston",
      detail: "Boston, MA • Score: 94/100",
      time: "1 hour ago",
      type: "success",
    },
    {
      event: "Email Opened",
      target: "Microsoft New England",
      detail: "Recipient opened outreach mail within 5 mins",
      time: "2 hours ago",
      type: "success",
    },
    {
      event: "Outreach Agent Completed",
      target: "Corporate Lunchbox Campaign",
      detail: "Created 12 custom outreach templates",
      time: "3 hours ago",
      type: "info",
    },
    {
      event: "Lead Discovered",
      target: "Cambridge Biolabs Inc",
      detail: "Cambridge, MA • Score: 78/100",
      time: "4 hours ago",
      type: "success",
    },
    {
      event: "Agent Warning",
      target: "Lead Discovery Agent",
      detail: "Apify scraper encountered a retry limit. Re-routing.",
      time: "5 hours ago",
      type: "warning",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="AI Outreach Command Center"
        description="Monitor lead discovery, qualification, campaigns and outreach activity from a single workspace."
      >
        <button 
          onClick={() => refetch()}
          disabled={isRefetching || isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 text-xs font-semibold text-foreground transition-all duration-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/90 text-xs font-semibold shadow-sm transition-all duration-200"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Discover Leads
        </Link>
      </PageHeader>

      {/* System Status Bar Strip */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 p-3 rounded-lg border border-border/40 bg-card/60 backdrop-blur-sm text-xs text-muted-foreground shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted-foreground/95">System Health:</span>
          <span className="flex items-center gap-1.5 font-bold text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Operational
          </span>
        </div>
        <div className="h-4 w-px bg-border/60 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted-foreground/95">Agents Active:</span>
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            2 / 3 Running
          </span>
        </div>
        <div className="h-4 w-px bg-border/60 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted-foreground/95">Last Sync:</span>
          <span className="font-bold text-foreground flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            {lastSyncTime}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
            <p className="text-sm font-medium">Loading aggregated statistics...</p>
          </div>
        ) : isError ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-destructive">
            <AlertCircle className="w-8 h-8 mb-4 opacity-80" />
            <p className="text-sm font-medium">Failed to load statistics. Please try refreshing.</p>
          </div>
        ) : (
          kpiData.map((kpi, index) => (
            <KpiCard
              key={index}
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              description={kpi.description}
              href={kpi.href}
            />
          ))
        )}
      </div>

      {/* Main Command Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: AI Agent Operations Monitor */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title="Active AI Agent Operations"
            description="Inspect the real-time background processes running across your platform pipelines."
            actions={
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-success" />
                Pipeline Active
              </span>
            }
          >
            <div className="space-y-4">
              {agentDetails.map((agent, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/40 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all duration-200 gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-foreground">
                        {agent.name}
                      </h4>
                      <span className="text-[10px] bg-secondary/15 text-muted-foreground px-2 py-0.5 rounded font-mono">
                        {agent.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {agent.metric} • Active {agent.lastActive}
                    </p>
                    <p className="text-[11px] text-foreground/80 font-mono bg-background/50 p-2 rounded border border-border/20 mt-2 block">
                      <span className="text-accent font-bold">$ </span>
                      {agent.log}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <StatusBadge status={agent.status} />
                    <button
                      className="p-1.5 rounded-lg border border-border hover:bg-background text-muted-foreground hover:text-foreground transition-all duration-200"
                      title={agent.status === "RUNNING" ? "Pause Agent" : "Start Agent"}
                    >
                      {agent.status === "RUNNING" ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/leads"
              className="p-4 rounded-xl border border-border/40 bg-card hover:bg-muted/20 hover:border-accent/40 text-center transition-all duration-200 group flex flex-col items-center justify-center"
            >
              <Users className="w-5 h-5 text-accent mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Manage Leads</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Scraped data & statuses</span>
            </Link>
            <Link
              href="/campaigns"
              className="p-4 rounded-xl border border-border/40 bg-card hover:bg-muted/20 hover:border-accent/40 text-center transition-all duration-200 group flex flex-col items-center justify-center"
            >
              <Megaphone className="w-5 h-5 text-accent mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Campaign Hub</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Template setups & settings</span>
            </Link>
            <Link
              href="/outreach"
              className="p-4 rounded-xl border border-border/40 bg-card hover:bg-muted/20 hover:border-accent/40 text-center transition-all duration-200 group flex flex-col items-center justify-center"
            >
              <Mail className="w-5 h-5 text-accent mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Outreach Desk</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Approve & send drafts</span>
            </Link>
          </div>
        </div>

        {/* Right 1 Column: Scrollable Activity Event Stream */}
        <div className="space-y-6">
          <SectionCard
            title="Real-Time Event Stream"
            description="Live trace of database operations and agent updates."
            actions={
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                <Clock className="w-3.5 h-3.5 animate-pulse text-success" />
                Live
              </span>
            }
          >
            <div className="overflow-y-auto max-h-[380px] pr-2 space-y-4 scrollbar-thin">
              <ul className="space-y-4">
                {activityFeed.map((activity, index) => (
                  <li key={index} className="flex gap-3">
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        activity.type === "success"
                          ? "bg-success/10 text-success"
                          : activity.type === "warning"
                          ? "bg-warning/10 text-warning"
                          : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                    </span>
                    <div className="flex-grow min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-foreground truncate">
                          {activity.event}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/80 font-medium truncate mt-0.5">
                        {activity.target}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {activity.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4 pt-3 border-t border-border/20">
              <Link
                href="/analytics"
                className="flex items-center justify-center gap-1.5 w-full py-2 border border-border/60 hover:bg-muted text-xs font-semibold rounded-lg text-foreground hover:text-accent transition-all duration-200"
              >
                View Full Analytics
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </SectionCard>
        </div>
        
      </div>
    </div>
  );
}

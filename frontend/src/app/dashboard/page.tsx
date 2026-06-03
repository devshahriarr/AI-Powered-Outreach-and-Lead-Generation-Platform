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
  Clock
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // Mock data for the KPIs
  const kpiData = [
    {
      title: "Total Leads",
      value: "1,482",
      icon: Users,
      description: "Discovered raw contacts",
      trend: { value: "+12.4%", type: "up" as const },
    },
    {
      title: "Qualified Leads",
      value: "843",
      icon: CheckCircle,
      description: "Catering relevant businesses",
      trend: { value: "+18.2%", type: "up" as const },
    },
    {
      title: "Active Campaigns",
      value: "5",
      icon: Megaphone,
      description: "Configured outreach sequences",
      trend: { value: "+1", type: "up" as const },
    },
    {
      title: "Outreach Messages",
      value: "612",
      icon: Mail,
      description: "Emails generated & sent",
      trend: { value: "+24.8%", type: "up" as const },
    },
  ];

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

  // Mock activity feed logs
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
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="AI Outreach Command Center"
        description="Monitor lead discovery, qualification, campaigns and outreach activity from a single workspace."
      >
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all duration-200">
          <RefreshCw className="w-3.5 h-3.5" />
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((kpi, index) => (
          <KpiCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            description={kpi.description}
            trend={kpi.trend}
          />
        ))}
      </div>

      {/* Main Command Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: AI Agent Automations Monitor */}
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

        {/* Right 1 Column: Platform Activity Feed */}
        <div className="space-y-6">
          <SectionCard
            title="Real-Time Event Stream"
            description="Live trace of database operations and agent updates."
            actions={
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                <Clock className="w-3 h-3 animate-pulse" />
                Live
              </span>
            }
          >
            <div className="flow-root">
              <ul className="-mb-8">
                {activityFeed.map((activity, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== activityFeed.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border/40"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-card ${
                              activity.type === "success"
                                ? "bg-success/10 text-success"
                                : activity.type === "warning"
                                ? "bg-warning/10 text-warning"
                                : "bg-blue-500/10 text-blue-500"
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-foreground">
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
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <Link
              href="/analytics"
              className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 border border-border/60 hover:bg-muted text-xs font-semibold rounded-lg text-foreground hover:text-accent transition-all duration-200"
            >
              View Full Analytics
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </SectionCard>
        </div>
        
      </div>
    </div>
  );
}

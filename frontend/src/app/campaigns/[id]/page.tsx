"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useCampaign,
  useDeleteCampaign,
  useCampaignMessages,
  useCampaignLeads,
} from "@/hooks/useCampaigns";
import { useQualifiedLeads } from "@/hooks/useLeads";
import { CampaignHeader } from "@/components/campaigns/CampaignHeader";
import { CampaignStatsCards } from "@/components/campaigns/CampaignStatsCards";

import { useToast } from "@/providers/ToastProvider";
import {
  LayoutDashboard,
  Users,
  Mail,
  Settings,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

type TabId = "overview" | "leads" | "messages";

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = Number(params.id);
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Queries
  const { data: campaign, isLoading: loadingCampaign, isError: isCampaignError, error: campaignError } = useCampaign(campaignId);
  const { data: messages, isLoading: loadingMessages } = useCampaignMessages(campaignId);
  const { data: campaignLeads, isLoading: loadingCampaignLeads } = useCampaignLeads(campaignId);
  const deleteMutation = useDeleteCampaign();

  const handleDelete = () => {
    if (!campaign) return;
    if (
      window.confirm(
        `Are you sure you want to delete campaign "${campaign.name}"? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(campaign.id, {
        onSuccess: () => {
          success(`Campaign "${campaign.name}" deleted successfully.`);
          router.push("/campaigns");
        },
        onError: (err: any) => {
          toastError(err?.message ?? "Failed to delete campaign.");
        },
      });
    }
  };

  if (loadingCampaign) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-xs text-muted-foreground">Loading campaign command center...</p>
      </div>
    );
  }

  if (isCampaignError || !campaign) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center bg-card border border-border/40 rounded-xl">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <div>
          <p className="font-semibold text-foreground">Failed to load campaign</p>
          <p className="text-xs text-muted-foreground mt-1">
            {(campaignError as any)?.message ?? "The requested campaign could not be found."}
          </p>
        </div>
        <Link
          href="/campaigns"
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90"
        >
          Back to Campaigns
        </Link>
      </div>
    );
  }

  // Calculate dynamic stats
  const generatedCount = messages?.length ?? 0;
  const approvedCount = messages?.filter((m) => m.status === "approved").length ?? 0;
  const sentCount = messages?.filter((m) => m.status === "sent").length ?? 0;
  
  // Use real assigned leads
  const assignedLeadsList = campaignLeads ?? [];
  const leadsCount = assignedLeadsList.length;

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "leads", label: "Assigned Leads", icon: Users },
    { id: "messages", label: "Outreach Messages", icon: Mail },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Campaign Header */}
      <CampaignHeader campaign={campaign} onDelete={handleDelete} />

      {/* KPI Stats Strip */}
      <CampaignStatsCards
        qualifiedLeadsCount={leadsCount}
        generatedEmailsCount={generatedCount}
        approvedEmailsCount={approvedCount}
        sentEmailsCount={sentCount}
        loading={loadingMessages || loadingCampaignLeads}
      />

      {/* Tab Navigation */}
      <div className="border-b border-border/30">
        <nav className="flex space-x-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="py-2">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left/Middle Columns: Details & Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Campaign Summary */}
              <div className="bg-card border border-border/40 p-5 rounded-xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Campaign Execution Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-muted-foreground block">Target Audience Segment</span>
                    <span className="font-semibold text-foreground bg-muted/50 px-2 py-1 rounded block">
                      {campaign.target_business_type}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground block">Outreach Channel Type</span>
                    <span className="font-semibold text-foreground bg-muted/50 px-2 py-1 rounded block capitalize">
                      {campaign.campaign_type === "cold_outreach" ? "Cold Outreach Email" : campaign.campaign_type}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground block">System Created At</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      {new Date(campaign.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground block">Last Operational Update</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {new Date(campaign.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance summary placeholder */}
              <div className="bg-card border border-border/40 p-5 rounded-xl shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Automation Flow Summary
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This campaign targets <strong>{campaign.target_business_type}</strong> to present the following offer:{" "}
                  <em>&ldquo;{campaign.offer}&rdquo;</em>. AI email generation will automatically draft follow-up
                  sequences once leads are assigned and initial emails are approved.
                </p>
                <div className="flex items-center gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Automation Engine: {campaign.status === "active" ? "Running" : "Idle"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Recent Activity Timeline */}
            <div className="bg-card border border-border/40 p-5 rounded-xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Recent Activity Log
              </h3>
              
              <div className="flow-root">
                <ul className="-mb-8">
                  {[
                    {
                      id: 1,
                      content: `Campaign "${campaign.name}" created`,
                      target: "System",
                      date: new Date(campaign.created_at).toLocaleDateString(),
                      icon: LayoutDashboard,
                      color: "bg-blue-500",
                    },
                    {
                      id: 2,
                      content: `Outreach targets scanned for ${campaign.target_business_type}`,
                      target: "Apify Agent",
                      date: new Date(campaign.created_at).toLocaleDateString(),
                      icon: Users,
                      color: "bg-orange-500",
                    },
                    {
                      id: 3,
                      content: `${generatedCount} AI Outreach drafts prepared`,
                      target: "OpenAI GPT-4",
                      date: new Date().toLocaleDateString(),
                      icon: Mail,
                      color: "bg-emerald-500",
                    },
                  ].map((event, eventIdx) => (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {eventIdx !== 2 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span
                              className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-card ${event.color} text-white`}
                            >
                              <event.icon className="w-4 h-4" />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-xs text-foreground font-semibold">
                                {event.content}{" "}
                                <span className="font-normal text-muted-foreground">
                                  by {event.target}
                                </span>
                              </p>
                            </div>
                            <div className="text-right text-[10px] whitespace-nowrap text-muted-foreground font-medium">
                              {event.date}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "leads" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Assigned Campaign Leads
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Leads targeted in this outreach segment.
                </p>
              </div>
              <Link
                href="/leads/qualified"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border/60 hover:bg-muted text-xs font-semibold text-foreground transition-all duration-200"
              >
                Assign More Leads
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 dark:bg-muted/20 border-b border-border/40">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Business Name
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Lead Score
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs">
                  {loadingCampaignLeads ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-accent" />
                        Loading assigned leads...
                      </td>
                    </tr>
                  ) : assignedLeadsList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground font-medium">
                        No leads assigned to this campaign yet.
                        <br />
                        <Link href="/leads/qualified" className="text-accent hover:underline text-xs mt-1 inline-block">
                          Go to Qualified Leads to assign target business groups →
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    assignedLeadsList.map((lead) => (
                      <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {lead.name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {lead.cleaned_email ?? lead.email ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-success/15 text-success">
                            {lead.lead_score}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 uppercase">
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Campaign Outreach Emails
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI generated outreach sequences and their operational delivery statuses.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 dark:bg-muted/20 border-b border-border/40">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Subject Line
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Recipient Business
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Created Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs">
                  {loadingMessages ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-accent" />
                        Loading outreach messages...
                      </td>
                    </tr>
                  ) : !messages || messages.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground font-medium">
                        No outreach emails generated for this campaign yet.
                        <br />
                        <span className="text-muted-foreground text-xs mt-1 block">
                          Draft emails will be generated when leads are successfully mapped.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    messages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground max-w-xs truncate" title={msg.subject}>
                          {msg.subject}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-medium">
                          {assignedLeadsList?.find((l) => l.id === msg.lead_id)?.name ?? `Lead #${msg.lead_id}`}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                              msg.status === "approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : msg.status === "sent"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : msg.status === "generated"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            {msg.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}

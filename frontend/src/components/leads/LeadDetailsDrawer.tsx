"use client";

import React, { useState } from "react";
import { X, ExternalLink, Phone, Mail, Globe, MapPin, Star } from "lucide-react";
import { Lead, ALL_LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/types";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadDrawerSkeleton } from "./LeadTableSkeleton";
import { useUpdateLead } from "@/hooks/useUpdateLead";
import { useToast } from "@/providers/ToastProvider";

interface LeadDetailsDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-success/10 text-success border-success/30"
      : score >= 40
      ? "bg-warning/10 text-warning border-warning/30"
      : "bg-rose-500/10 text-rose-500 border-rose-500/30";

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${color}`}>
      Score: {score}/100
    </span>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">{label}</p>
      <div className="flex items-center gap-2 text-sm text-foreground font-medium">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/40 pb-2">
        {title}
      </h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function LeadDetailsDrawer({ lead, open, onClose }: LeadDetailsDrawerProps) {
  const { mutate: updateLead, isPending } = useUpdateLead();
  const { success, error } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Sync selectedStatus when lead changes
  React.useEffect(() => {
    setSelectedStatus(lead?.status ?? "");
  }, [lead?.id, lead?.status]);

  const handleStatusChange = (newStatus: string) => {
    if (!lead || newStatus === lead.status) return;
    setSelectedStatus(newStatus);
    updateLead(
      { id: lead.id, data: { status: newStatus } },
      {
        onSuccess: () => success(`Status updated to ${LEAD_STATUS_LABELS[newStatus as keyof typeof LEAD_STATUS_LABELS] ?? newStatus}`),
        onError: (err: unknown) => {
          setSelectedStatus(lead.status); // revert on error
          const msg = (err as { message?: string })?.message ?? "Failed to update status";
          error(msg);
        },
      }
    );
  };

  const emailHref = lead?.cleaned_email ?? lead?.email;
  const websiteHref = lead?.cleaned_website ?? lead?.website;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-primary/20 dark:bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-full max-w-md bg-card border-l border-border/40 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border/30 shrink-0">
          <div className="space-y-1 min-w-0 pr-4">
            <h3 className="text-base font-bold text-foreground truncate">
              {lead?.name ?? "Lead Details"}
            </h3>
            <p className="text-xs text-muted-foreground">{lead?.business_type}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {!lead ? (
            <LeadDrawerSkeleton />
          ) : (
            <>
              {/* Score + Status */}
              <div className="flex flex-wrap items-center gap-3">
                <ScorePill score={lead.lead_score} />
                <LeadStatusBadge status={lead.status} />
              </div>

              {/* Business Information */}
              <Section title="Business Information">
                <InfoRow label="Business Name" value={lead.name} />
                <InfoRow label="Business Type" value={lead.business_type} />
                {lead.rating && (
                  <InfoRow
                    label="Google Rating"
                    icon={<Star className="w-3.5 h-3.5" />}
                    value={`${lead.rating} ★ (${lead.user_ratings_total?.toLocaleString() ?? 0} reviews)`}
                  />
                )}
                <InfoRow
                  label="Address"
                  icon={<MapPin className="w-3.5 h-3.5" />}
                  value={lead.address}
                />
              </Section>

              {/* Contact Details */}
              <Section title="Contact Details">
                <InfoRow
                  label="Email"
                  icon={<Mail className="w-3.5 h-3.5" />}
                  value={
                    emailHref ? (
                      <a href={`mailto:${emailHref}`} className="text-accent hover:underline">
                        {emailHref}
                      </a>
                    ) : <span className="text-muted-foreground text-xs italic">Not available</span>
                  }
                />
                <InfoRow
                  label="Phone"
                  icon={<Phone className="w-3.5 h-3.5" />}
                  value={lead.cleaned_phone ?? lead.phone_number ?? <span className="text-muted-foreground text-xs italic">Not available</span>}
                />
                <InfoRow
                  label="Website"
                  icon={<Globe className="w-3.5 h-3.5" />}
                  value={
                    websiteHref ? (
                      <a
                        href={websiteHref.startsWith("http") ? websiteHref : `https://${websiteHref}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline flex items-center gap-1"
                      >
                        {websiteHref}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : <span className="text-muted-foreground text-xs italic">Not available</span>
                  }
                />
              </Section>

              {/* Qualification */}
              <Section title="Qualification">
                {lead.qualification_reason && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Qualification Reason</p>
                    <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 rounded-lg p-3 border border-border/20">
                      {lead.qualification_reason}
                    </p>
                  </div>
                )}
                <InfoRow label="Created" value={formatDate(lead.created_at)} />
                <InfoRow label="Last Updated" value={formatDate(lead.updated_at)} />
              </Section>

              {/* Status Update */}
              <Section title="Update Status">
                <div className="space-y-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isPending}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {ALL_LEAD_STATUSES.map((s) => (
                      <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  {isPending && (
                    <p className="text-xs text-muted-foreground animate-pulse flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full border-2 border-accent border-t-transparent animate-spin inline-block" />
                      Saving...
                    </p>
                  )}
                </div>
              </Section>
            </>
          )}
        </div>
      </div>
    </>
  );
}

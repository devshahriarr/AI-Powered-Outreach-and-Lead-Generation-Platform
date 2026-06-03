"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Campaign, CampaignCreate, CampaignUpdate, CampaignStatusType } from "@/types";
import { Loader2 } from "lucide-react";

const campaignSchema = z.object({
  name: z
    .string()
    .min(3, "Campaign name must be at least 3 characters")
    .max(100, "Campaign name must be under 100 characters"),
  campaign_type: z.string().min(1, "Campaign type is required"),
  target_business_type: z.string().min(1, "Target industry/business type is required"),
  offer: z.string().min(5, "Offer details must be at least 5 characters"),
  status: z.enum(["draft", "active", "paused", "completed", "archived"]),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  initialValues?: Partial<Campaign>;
  onSubmit: (data: CampaignFormValues) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

export function CampaignForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Save Campaign",
}: CampaignFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      campaign_type: initialValues?.campaign_type ?? "cold_outreach",
      target_business_type: initialValues?.target_business_type ?? "",
      offer: initialValues?.offer ?? "",
      status: initialValues?.status ?? "draft",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-card border border-border/40 p-6 rounded-xl shadow-sm">
      {/* Campaign Name */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Campaign Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="e.g. Corporate Lunch Q3 Outreach"
          {...register("name")}
          className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 ${
            errors.name
              ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
              : "border-border/60 focus:ring-accent/20 focus:border-accent"
          }`}
        />
        {errors.name && (
          <p className="text-xs font-medium text-rose-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campaign Type */}
        <div className="space-y-1.5">
          <label htmlFor="campaign_type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Campaign Type
          </label>
          <select
            id="campaign_type"
            {...register("campaign_type")}
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 ${
              errors.campaign_type
                ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                : "border-border/60 focus:ring-accent/20 focus:border-accent"
            }`}
          >
            <option value="cold_outreach">Cold Outreach</option>
            <option value="followup">Follow-up Sequence</option>
            <option value="newsletter">Catering Newsletter</option>
            <option value="re_engagement">Re-engagement</option>
          </select>
          {errors.campaign_type && (
            <p className="text-xs font-medium text-rose-500 mt-1">{errors.campaign_type.message}</p>
          )}
        </div>

        {/* Target Industry */}
        <div className="space-y-1.5">
          <label htmlFor="target_business_type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Target Industry / Business Type
          </label>
          <input
            id="target_business_type"
            type="text"
            placeholder="e.g. Law Firms, Tech Startups"
            {...register("target_business_type")}
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 ${
              errors.target_business_type
                ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                : "border-border/60 focus:ring-accent/20 focus:border-accent"
            }`}
          />
          {errors.target_business_type && (
            <p className="text-xs font-medium text-rose-500 mt-1">{errors.target_business_type.message}</p>
          )}
        </div>
      </div>

      {/* Offer */}
      <div className="space-y-1.5">
        <label htmlFor="offer" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Outreach Offer / Value Proposition
        </label>
        <textarea
          id="offer"
          rows={4}
          placeholder="e.g. Get 15% off your first corporate catering booking of 20+ guests. Includes free delivery and setup."
          {...register("offer")}
          className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 ${
            errors.offer
              ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
              : "border-border/60 focus:ring-accent/20 focus:border-accent"
          }`}
        />
        {errors.offer && (
          <p className="text-xs font-medium text-rose-500 mt-1">{errors.offer.message}</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Campaign Status
        </label>
        <select
          id="status"
          {...register("status")}
          className={`w-full md:w-1/2 px-3 py-2 text-sm rounded-lg border bg-background text-foreground transition-all duration-200 focus:outline-none focus:ring-2 border-border/60 focus:ring-accent/20 focus:border-accent`}
        >
          <option value="draft">Draft (Inactive)</option>
          <option value="active">Active (Running Outreach)</option>
          <option value="paused">Paused (Temporarily Stopped)</option>
          <option value="completed">Completed (Outreach Concluded)</option>
          <option value="archived">Archived (Deleted from view)</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-border/40">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 disabled:bg-accent/70 text-white rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 cursor-pointer"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitButtonText}
        </button>
      </div>
    </form>
  );
}

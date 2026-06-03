"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { useCampaign, useUpdateCampaign } from "@/hooks/useCampaigns";
import { useToast } from "@/providers/ToastProvider";
import Link from "next/link";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = Number(params.id);

  const { data: campaign, isLoading, isError, error } = useCampaign(campaignId);
  const updateMutation = useUpdateCampaign(campaignId);
  const { success, error: toastError } = useToast();

  const handleUpdate = (data: any) => {
    updateMutation.mutate(data, {
      onSuccess: (updatedCampaign) => {
        success(`Campaign "${updatedCampaign.name}" updated successfully!`);
        router.push(`/campaigns/${campaignId}`);
      },
      onError: (err: any) => {
        toastError(err?.message ?? "Failed to update campaign. Please try again.");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-xs text-muted-foreground">Loading campaign details...</p>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center bg-card border border-border/40 rounded-xl">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <div>
          <p className="font-semibold text-foreground">Failed to load campaign</p>
          <p className="text-xs text-muted-foreground mt-1">
            {(error as any)?.message ?? "The requested campaign could not be found."}
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

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Link href="/campaigns" className="hover:text-accent flex items-center gap-0.5 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
          Campaigns
        </Link>
        <span>/</span>
        <Link href={`/campaigns/${campaignId}`} className="hover:text-accent truncate max-w-[150px] transition-colors">
          {campaign.name}
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">Edit</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Edit Campaign
        </h1>
        <p className="text-sm text-muted-foreground">
          Modify the campaign details, target business types, custom offer description, and lifecycle status.
        </p>
      </div>

      <div className="pt-2">
        <CampaignForm
          initialValues={campaign}
          onSubmit={handleUpdate}
          isSubmitting={updateMutation.isPending}
          submitButtonText="Save Changes"
        />
      </div>
    </div>
  );
}

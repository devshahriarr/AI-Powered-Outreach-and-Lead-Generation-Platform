"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { useCreateCampaign } from "@/hooks/useCampaigns";
import { useToast } from "@/providers/ToastProvider";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function CreateCampaignPage() {
  const router = useRouter();
  const createMutation = useCreateCampaign();
  const { success, error } = useToast();

  const handleCreate = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: (newCampaign) => {
        success(`Campaign "${newCampaign.name}" created successfully!`);
        router.push(`/campaigns/${newCampaign.id}`);
      },
      onError: (err: any) => {
        error(err?.message ?? "Failed to create campaign. Please try again.");
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Link href="/campaigns" className="hover:text-accent flex items-center gap-0.5 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
          Campaigns
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">New Campaign</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create New Campaign
        </h1>
        <p className="text-sm text-muted-foreground">
          Set up target vertical, discount offer parameters, and initial outreach status.
        </p>
      </div>

      <div className="pt-2">
        <CampaignForm
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
          submitButtonText="Create Campaign"
        />
      </div>
    </div>
  );
}

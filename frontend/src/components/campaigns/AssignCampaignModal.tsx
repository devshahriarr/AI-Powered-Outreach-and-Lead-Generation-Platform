"use client";

import React, { useState } from "react";
import { X, Loader2, Megaphone, Check } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useToast } from "@/providers/ToastProvider";

interface AssignCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeadIds: number[];
  onSuccess?: () => void;
}

export function AssignCampaignModal({
  isOpen,
  onClose,
  selectedLeadIds,
  onSuccess,
}: AssignCampaignModalProps) {
  const { data: campaigns, isLoading, isError } = useCampaigns();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const { success, error } = useToast();

  if (!isOpen) return null;

  const activeCampaigns = campaigns?.filter(c => c.status !== "archived") ?? [];

  const handleConfirm = async () => {
    if (!selectedCampaignId) {
      error("Please select a campaign first.");
      return;
    }

    const campaign = campaigns?.find(c => String(c.id) === selectedCampaignId);
    if (!campaign) return;

    setAssigning(true);

    // Simulate API delay for bulk assignment endpoint
    await new Promise(resolve => setTimeout(resolve, 1000));

    setAssigning(false);
    success(
      `Successfully assigned ${selectedLeadIds.length} lead${
        selectedLeadIds.length > 1 ? "s" : ""
      } to campaign "${campaign.name}"!`
    );

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-all duration-300">
      {/* Modal Box */}
      <div className="relative w-full max-w-md rounded-xl border border-border/40 bg-card p-6 shadow-lg animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Assign Leads to Campaign</h3>
            <p className="text-xs text-muted-foreground">
              Selected: <span className="font-semibold text-foreground">{selectedLeadIds.length} leads</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 py-2">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          ) : isError ? (
            <p className="text-xs text-rose-500 text-center py-2">
              Failed to load campaigns list.
            </p>
          ) : activeCampaigns.length === 0 ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-sm text-muted-foreground">No active campaigns available.</p>
              <a
                href="/campaigns/new"
                onClick={onClose}
                className="text-xs text-accent hover:underline font-semibold"
              >
                Create a campaign first →
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="campaign-select" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Choose Campaign
              </label>
              <select
                id="campaign-select"
                value={selectedCampaignId}
                onChange={e => setSelectedCampaignId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border/60 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              >
                <option value="">Select a campaign...</option>
                {activeCampaigns.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border/20">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-border/60 hover:bg-muted text-xs font-semibold text-foreground transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={assigning || !selectedCampaignId}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-accent hover:bg-accent/90 disabled:bg-accent/70 text-white rounded-lg text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer"
          >
            {assigning ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            Confirm Assignment
          </button>
        </div>

      </div>
    </div>
  );
}

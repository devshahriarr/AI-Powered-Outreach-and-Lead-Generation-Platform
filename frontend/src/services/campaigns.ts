import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import {
  Campaign,
  CampaignCreate,
  CampaignUpdate,
  CampaignSettings,
  CampaignSettingsUpdate,
  OutreachMessage,
} from "@/types";

export const campaignsService = {
  /** Fetch all campaigns, optionally filtered by status */
  fetchCampaigns: (status?: string): Promise<Campaign[]> => {
    const query = status ? `?status=${status}` : "";
    return apiGet<Campaign[]>(`/campaigns${query}`);
  },

  /** Fetch a single campaign by ID */
  fetchCampaign: (id: number): Promise<Campaign> =>
    apiGet<Campaign>(`/campaigns/${id}`),

  /** Create a new campaign */
  createCampaign: (data: CampaignCreate): Promise<Campaign> =>
    apiPost<Campaign>("/campaigns", data),

  /** Update an existing campaign */
  updateCampaign: (id: number, data: CampaignUpdate): Promise<Campaign> =>
    apiPatch<Campaign>(`/campaigns/${id}`, data),

  /** Delete a campaign */
  deleteCampaign: (id: number): Promise<Campaign> =>
    apiDelete<Campaign>(`/campaigns/${id}`),

  /** Fetch the global platform campaign settings singleton */
  fetchCampaignSettings: async (): Promise<CampaignSettings | null> => {
    try {
      return await apiGet<CampaignSettings>("/campaign-settings");
    } catch (err: any) {
      // If backend returns 404 (not configured yet), return null gracefully
      if (err?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /** Upsert the platform campaign settings singleton */
  updateCampaignSettings: (data: CampaignSettingsUpdate): Promise<CampaignSettings> =>
    apiPatch<CampaignSettings>("/campaign-settings", data),

  /** Fetch outreach messages for a specific campaign */
  fetchCampaignMessages: (campaignId: number): Promise<OutreachMessage[]> =>
    apiGet<OutreachMessage[]>(`/outreach-messages?campaign_id=${campaignId}`),
};

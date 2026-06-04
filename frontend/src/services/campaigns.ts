import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import {
  Campaign,
  CampaignCreate,
  CampaignUpdate,
  CampaignAssignmentCreate,
  OutreachMessage,
  Lead,
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



  /** Assign multiple leads to a campaign */
  assignLeadsToCampaign: (campaignId: number, data: CampaignAssignmentCreate): Promise<any> =>
    apiPost(`/campaigns/${campaignId}/assign-leads`, data),

  /** Fetch leads assigned to a campaign */
  fetchCampaignLeads: (campaignId: number): Promise<Lead[]> =>
    apiGet<Lead[]>(`/campaigns/${campaignId}/leads`),

  /** Remove a lead from a campaign */
  removeCampaignLead: (campaignId: number, leadId: number): Promise<void> =>
    apiDelete<void>(`/campaigns/${campaignId}/leads/${leadId}`),

  /** Fetch outreach messages for a specific campaign */
  fetchCampaignMessages: (campaignId: number): Promise<OutreachMessage[]> =>
    apiGet<OutreachMessage[]>(`/outreach-messages?campaign_id=${campaignId}`),
};

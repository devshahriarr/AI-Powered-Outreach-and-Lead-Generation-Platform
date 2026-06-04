import { apiGet, apiPost, apiPatch } from "@/lib/api";
import {
  OutreachMessage,
  OutreachMessageUpdate,
  GenerateEmailRequest,
} from "@/types";

export interface OutreachListParams {
  status?: string;
  lead_id?: number;
  campaign_id?: number;
  skip?: number;
  limit?: number;
}

function buildOutreachQuery(params?: OutreachListParams): string {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.lead_id !== undefined) qs.set("lead_id", String(params.lead_id));
  if (params?.campaign_id !== undefined) qs.set("campaign_id", String(params.campaign_id));
  if (params?.skip !== undefined) qs.set("skip", String(params.skip));
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return query ? `?${query}` : "";
}

export const outreachService = {
  /** Fetch a list of outreach messages, optionally filtered */
  fetchMessages: (params?: OutreachListParams): Promise<OutreachMessage[]> =>
    apiGet<OutreachMessage[]>(`/outreach-messages${buildOutreachQuery(params)}`),

  /** Fetch a single outreach message by ID */
  fetchMessage: (id: number): Promise<OutreachMessage> =>
    apiGet<OutreachMessage>(`/outreach-messages/${id}`),

  /** Update an outreach message copy (inline edits) */
  updateMessage: (id: number, data: OutreachMessageUpdate): Promise<OutreachMessage> =>
    apiPatch<OutreachMessage>(`/outreach-messages/${id}`, data),

  /** Approve an outreach message, marking it ready for sending */
  approveMessage: (id: number, notes?: string): Promise<OutreachMessage> =>
    apiPost<OutreachMessage>(`/outreach-messages/${id}/approve`, {
      review_notes: notes ?? null,
    }),

  /** Request the AI agent to regenerate the email copy */
  regenerateMessage: (id: number): Promise<OutreachMessage> =>
    apiPost<OutreachMessage>(`/outreach-messages/${id}/regenerate`, {}),

  /** Trigger AI email generation for a specific lead and campaign */
  generateEmailForLead: (
    leadId: number,
    campaignId: number,
    messageType: string
  ): Promise<OutreachMessage> =>
    apiPost<OutreachMessage>(`/leads/${leadId}/generate-email`, {
      campaign_id: campaignId,
      message_type: messageType,
    }),
};

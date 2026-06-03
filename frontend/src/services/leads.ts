import { apiGet, apiPatch } from "@/lib/api";
import { Lead, LeadUpdate, LeadListParams } from "@/types";

function buildLeadsQuery(params?: LeadListParams): string {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.business_type) qs.set("business_type", params.business_type);
  if (params?.skip !== undefined) qs.set("skip", String(params.skip));
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return query ? `?${query}` : "";
}

export const leadsService = {
  /** Paginated list with optional status/business_type filters */
  fetchLeads: (params?: LeadListParams): Promise<Lead[]> =>
    apiGet<Lead[]>(`/leads${buildLeadsQuery(params)}`),

  /** Qualified leads only */
  fetchQualifiedLeads: (params?: Pick<LeadListParams, "skip" | "limit">): Promise<Lead[]> =>
    apiGet<Lead[]>(`/leads/qualified${buildLeadsQuery(params)}`),

  /** Review-required leads */
  fetchReviewLeads: (params?: Pick<LeadListParams, "skip" | "limit">): Promise<Lead[]> =>
    apiGet<Lead[]>(`/leads/review${buildLeadsQuery(params)}`),

  /** Rejected leads */
  fetchRejectedLeads: (params?: Pick<LeadListParams, "skip" | "limit">): Promise<Lead[]> =>
    apiGet<Lead[]>(`/leads/rejected${buildLeadsQuery(params)}`),

  /** Single lead by ID */
  fetchLead: (id: number): Promise<Lead> =>
    apiGet<Lead>(`/leads/${id}`),

  /** Partial update via PATCH */
  updateLead: (id: number, data: LeadUpdate): Promise<Lead> =>
    apiPatch<Lead>(`/leads/${id}`, data),
};

import { useQuery } from "@tanstack/react-query";
import { leadsService } from "@/services/leads";
import { statsService } from "@/services/stats";
import { LeadListParams } from "@/types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const leadKeys = {
  all: ["leads"] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (params?: LeadListParams) => [...leadKeys.lists(), params] as const,
  qualified: () => [...leadKeys.all, "qualified"] as const,
  review: () => [...leadKeys.all, "review"] as const,
  rejected: () => [...leadKeys.all, "rejected"] as const,
  detail: (id: number) => [...leadKeys.all, "detail", id] as const,
  stats: () => ["stats"] as const,
};

// ─── All Leads ────────────────────────────────────────────────────────────────

export function useLeads(params?: LeadListParams) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => leadsService.fetchLeads(params),
    staleTime: 30_000,
  });
}

// ─── Qualified Leads ──────────────────────────────────────────────────────────

export function useQualifiedLeads() {
  return useQuery({
    queryKey: leadKeys.qualified(),
    queryFn: () => leadsService.fetchQualifiedLeads({ limit: 500 }),
    staleTime: 30_000,
  });
}

// ─── Review Leads ─────────────────────────────────────────────────────────────

export function useReviewLeads() {
  return useQuery({
    queryKey: leadKeys.review(),
    queryFn: () => leadsService.fetchReviewLeads({ limit: 500 }),
    staleTime: 30_000,
  });
}

// ─── Rejected Leads ───────────────────────────────────────────────────────────

export function useRejectedLeads() {
  return useQuery({
    queryKey: leadKeys.rejected(),
    queryFn: () => leadsService.fetchRejectedLeads({ limit: 500 }),
    staleTime: 30_000,
  });
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function useStats() {
  return useQuery({
    queryKey: leadKeys.stats(),
    queryFn: () => statsService.fetchStats(),
    staleTime: 60_000,
  });
}

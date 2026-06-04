import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { outreachService, OutreachListParams } from "@/services/outreach";
import { OutreachMessageUpdate } from "@/types";

export const outreachKeys = {
  all: ["outreach-messages"] as const,
  lists: () => [...outreachKeys.all, "list"] as const,
  list: (params?: OutreachListParams) => [...outreachKeys.lists(), params] as const,
  detail: (id: number) => [...outreachKeys.all, "detail", id] as const,
  stats: () => ["stats"] as const,
};

/** Hook to fetch outreach messages with optional filters */
export function useOutreachMessages(params?: OutreachListParams) {
  return useQuery({
    queryKey: outreachKeys.list(params),
    queryFn: () => outreachService.fetchMessages(params),
    staleTime: 15_000,
  });
}

/** Hook to fetch a single outreach message */
export function useOutreachMessage(id: number) {
  return useQuery({
    queryKey: outreachKeys.detail(id),
    queryFn: () => outreachService.fetchMessage(id),
    staleTime: 30_000,
    enabled: !isNaN(id),
  });
}

/** Hook to update outreach message copy (PATCH) */
export function useUpdateOutreachMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: OutreachMessageUpdate }) =>
      outreachService.updateMessage(id, data),
    onSuccess: (updatedMsg) => {
      queryClient.invalidateQueries({ queryKey: outreachKeys.detail(updatedMsg.id) });
      queryClient.invalidateQueries({ queryKey: outreachKeys.all });
    },
  });
}

/** Hook to approve an outreach message */
export function useApproveOutreachMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      outreachService.approveMessage(id, notes),
    onSuccess: (approvedMsg) => {
      queryClient.invalidateQueries({ queryKey: outreachKeys.detail(approvedMsg.id) });
      queryClient.invalidateQueries({ queryKey: outreachKeys.all });
      queryClient.invalidateQueries({ queryKey: outreachKeys.stats() });
    },
  });
}

/** Hook to regenerate an outreach message */
export function useRegenerateOutreachMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => outreachService.regenerateMessage(id),
    onSuccess: (newMsg) => {
      queryClient.invalidateQueries({ queryKey: outreachKeys.all });
      queryClient.invalidateQueries({ queryKey: outreachKeys.stats() });
    },
  });
}

/** Hook to generate email for a lead and campaign */
export function useGenerateEmailForLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      campaignId,
      messageType,
    }: {
      leadId: number;
      campaignId: number;
      messageType: string;
    }) => outreachService.generateEmailForLead(leadId, campaignId, messageType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outreachKeys.all });
      queryClient.invalidateQueries({ queryKey: outreachKeys.stats() });
    },
  });
}

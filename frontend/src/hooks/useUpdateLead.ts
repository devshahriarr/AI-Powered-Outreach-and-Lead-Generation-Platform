import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsService } from "@/services/leads";
import { Lead, LeadUpdate } from "@/types";
import { leadKeys } from "./useLeads";

interface UpdateLeadArgs {
  id: number;
  data: LeadUpdate;
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateLeadArgs) =>
      leadsService.updateLead(id, data),

    // Optimistic update: immediately update the cached lead in all list queries
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches for lead lists
      await queryClient.cancelQueries({ queryKey: leadKeys.all });

      // Snapshot previous data for rollback
      const previousData = queryClient.getQueriesData<Lead[]>({
        queryKey: leadKeys.lists(),
      });

      // Optimistically update matching lead in every cached list
      queryClient.setQueriesData<Lead[]>(
        { queryKey: leadKeys.lists() },
        (old) =>
          old?.map((lead) =>
            lead.id === id ? { ...lead, ...data } : lead
          )
      );

      // Also update qualified/review/rejected caches
      for (const key of [leadKeys.qualified(), leadKeys.review(), leadKeys.rejected()]) {
        queryClient.setQueryData<Lead[]>(key, (old) =>
          old?.map((lead) => (lead.id === id ? { ...lead, ...data } : lead))
        );
      }

      return { previousData };
    },

    // On error: roll back optimistic update
    onError: (_err, _args, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

    // On settle: invalidate to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats() });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignsService } from "@/services/campaigns";
import { CampaignCreate, CampaignUpdate, CampaignAssignmentCreate } from "@/types";

export const campaignKeys = {
  all: ["campaigns"] as const,
  lists: () => [...campaignKeys.all, "list"] as const,
  list: (status?: string) => [...campaignKeys.lists(), status ?? "all"] as const,
  detail: (id: number) => [...campaignKeys.all, "detail", id] as const,
  leads: (campaignId: number) => [...campaignKeys.all, "leads", campaignId] as const,
  messages: (campaignId: number) => [...campaignKeys.all, "messages", campaignId] as const,
  stats: () => ["stats"] as const, // Share stats query invalidation
};

/** Hook to fetch all campaigns */
export function useCampaigns(status?: string) {
  return useQuery({
    queryKey: campaignKeys.list(status),
    queryFn: () => campaignsService.fetchCampaigns(status),
    staleTime: 30_000,
  });
}

/** Hook to fetch a single campaign by ID */
export function useCampaign(id: number) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => campaignsService.fetchCampaign(id),
    staleTime: 30_000,
    enabled: !isNaN(id),
  });
}



/** Hook to fetch outreach messages for a specific campaign */
export function useCampaignMessages(campaignId: number) {
  return useQuery({
    queryKey: campaignKeys.messages(campaignId),
    queryFn: () => campaignsService.fetchCampaignMessages(campaignId),
    staleTime: 15_000,
    enabled: !isNaN(campaignId),
  });
}

/** Hook to create a campaign */
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CampaignCreate) => campaignsService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
      queryClient.invalidateQueries({ queryKey: campaignKeys.stats() });
    },
  });
}

/** Hook to update a campaign */
export function useUpdateCampaign(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CampaignUpdate) => campaignsService.updateCampaign(id, data),
    onSuccess: (updatedCampaign) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.list() });
    },
  });
}

/** Hook to delete a campaign */
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => campaignsService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
      queryClient.invalidateQueries({ queryKey: campaignKeys.stats() });
    },
  });
}

/** Hook to fetch leads assigned to a specific campaign */
export function useCampaignLeads(campaignId: number) {
  return useQuery({
    queryKey: campaignKeys.leads(campaignId),
    queryFn: () => campaignsService.fetchCampaignLeads(campaignId),
    staleTime: 60_000,
  });
}

/** Hook to assign leads to a campaign */
export function useAssignLeadsToCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, data }: { campaignId: number; data: CampaignAssignmentCreate }) =>
      campaignsService.assignLeadsToCampaign(campaignId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.leads(variables.campaignId) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(variables.campaignId) });
    },
  });
}

/** Hook to remove a lead from a campaign */
export function useRemoveCampaignLead(campaignId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadId: number) =>
      campaignsService.removeCampaignLead(campaignId, leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.leads(campaignId) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(campaignId) });
    },
  });
}

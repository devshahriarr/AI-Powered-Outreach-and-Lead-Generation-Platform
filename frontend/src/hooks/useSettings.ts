import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settings";
import { PlatformSettingsUpdate } from "@/types";

export const settingsKeys = {
  all: ["platform-settings"] as const,
};

/** Hook to fetch the global platform settings singleton */
export function usePlatformSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: () => settingsService.fetchPlatformSettings(),
    staleTime: 60_000,
  });
}

/** Hook to update the global platform settings singleton */
export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlatformSettingsUpdate) => settingsService.updatePlatformSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

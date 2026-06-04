import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/stats";

export const statsKeys = {
  all: ["stats"] as const,
};

/**
 * Hook to fetch platform-wide statistics.
 * Uses a slightly longer staleTime since aggregates don't need to be perfectly real-time.
 */
export function useStats() {
  return useQuery({
    queryKey: statsKeys.all,
    queryFn: () => statsService.fetchStats(),
    staleTime: 60_000,
    refetchInterval: 60_000, // auto-refresh every minute
  });
}

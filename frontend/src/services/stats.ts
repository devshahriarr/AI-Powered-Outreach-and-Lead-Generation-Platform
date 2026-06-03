import { apiGet } from "@/lib/api";
import { StatsResponse } from "@/types";

export const statsService = {
  fetchStats: (): Promise<StatsResponse> => apiGet<StatsResponse>("/stats"),
};

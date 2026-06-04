import { apiGet, apiPatch } from "@/lib/api";
import { PlatformSettings, PlatformSettingsUpdate } from "@/types";

export const settingsService = {
  /** Fetch the global platform campaign settings singleton */
  fetchPlatformSettings: async (): Promise<PlatformSettings | null> => {
    try {
      return await apiGet<PlatformSettings>("/campaign-settings");
    } catch (err: any) {
      // If backend returns 404 (not configured yet), return null gracefully
      if (err?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /** Upsert the platform campaign settings singleton */
  updatePlatformSettings: (data: PlatformSettingsUpdate): Promise<PlatformSettings> =>
    apiPatch<PlatformSettings>("/campaign-settings", data),
};

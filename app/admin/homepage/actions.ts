"use server";

import { saveHomepageConfiguration } from "@/services/homepage.service";
import type { HomepageConfig } from "@/types/homepage";

export async function saveHomepageAction(config: HomepageConfig) {
  const result = await saveHomepageConfiguration(config);
  if (!result.success) {
    return { success: false as const, error: result.error };
  }
  return { success: true as const, config: result.config };
}

export async function publishHomepageAction(config: HomepageConfig) {
  return saveHomepageAction({ ...config, published: true });
}

export async function saveDraftAction(config: HomepageConfig) {
  return saveHomepageAction({ ...config, published: false });
}

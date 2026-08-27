import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { readHomepageConfig, writeHomepageConfig } from "@/lib/homepage-store";
import { homepageConfigSchema } from "@/lib/homepage-validation";
import { normalizePageSettings } from "@/lib/page-settings";
import type { HomepageConfig } from "@/types/homepage";

const HOMEPAGE_TAG = "homepage";

/**
 * The ONLY call the public homepage makes. Wraps the store read in
 * Next.js's data cache so `app/page.tsx` never touches the file/DB
 * directly, and returns sections pre-sorted and pre-filtered to what
 * a visitor should actually see.
 */
export async function getHomepageData(): Promise<HomepageConfig> {
  const config = await readHomepageConfig();
  return {
    ...config,
    sections: [...config.sections].sort((a, b) => a.order - b.order),
  };
}

/** Admin-only: full config, including disabled sections, for the builder. */
export async function getHomepageConfigForAdmin(): Promise<HomepageConfig> {
  const config = await readHomepageConfig();
  return { ...config, sections: [...config.sections].sort((a, b) => a.order - b.order) };
}

/** Validates, persists, and revalidates the public homepage cache. */
export async function saveHomepageConfiguration(input: unknown): Promise<
  { success: true; config: HomepageConfig } | { success: false; error: string }
> {
  const parsed = homepageConfigSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const normalized: HomepageConfig = {
    ...parsed.data,
    page: normalizePageSettings(parsed.data.page),
    sections: parsed.data.sections.map((s, i) => ({ ...s, order: i })) as unknown as HomepageConfig["sections"],
  };

  const saved = await writeHomepageConfig(normalized);
  revalidateTag(HOMEPAGE_TAG, "max");
  revalidatePath("/");
  return { success: true, config: saved };
}

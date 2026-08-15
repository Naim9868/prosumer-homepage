import "server-only";
import type { HomepageConfig, Section } from "@/types/homepage";
import { buildSeedHomepage } from "@/lib/homepage-seed";
import { normalizeHeroSettings } from "@/lib/hero";
import { normalizePageSettings } from "@/lib/page-settings";
import { connectDB } from "@/lib/dbConnect";
import { HomepageModel } from "@/models/Homepage";

/**
 * Homepage persistence — MongoDB is the single source of truth.
 *
 * Every piece of homepage data (sections, hero slides, per-theme datasets,
 * blocks, styling) lives in the `Homepage` collection and is read straight
 * from there. Nothing is written to disk. If MongoDB is unavailable, reads
 * and writes fail loudly instead of silently falling back to stale local
 * data, so the database can never drift out of sync with what visitors see.
 */

/** Upgrade persisted/legacy hero settings to the current multi-slide shape. */
function normalizeSection(section: Section): Section {
  if (section.type === "hero") {
    return { ...section, settings: normalizeHeroSettings(section.settings) };
  }
  return section;
}

async function readFromDb(): Promise<HomepageConfig> {
  await connectDB();
  const doc = await HomepageModel.findOne({}).lean();
  if (!doc || !Array.isArray(doc.sections) || doc.sections.length === 0) {
    // Empty database → seed it so the very first read populates MongoDB.
    return writeToDb(buildSeedHomepage());
  }
  const sections = (doc.sections as Section[]).map(normalizeSection);
  const page = normalizePageSettings(doc.page);
  const updatedAt = (doc.updatedAt instanceof Date ? doc.updatedAt : new Date()).toISOString();
  return { sections, page, updatedAt, published: doc.published !== false };
}

async function writeToDb(config: HomepageConfig): Promise<HomepageConfig> {
  await connectDB();
  await HomepageModel.findOneAndUpdate(
    {},
    { sections: config.sections, page: normalizePageSettings(config.page), published: config.published },
    { upsert: true }
  );
  return { ...config, page: normalizePageSettings(config.page), updatedAt: new Date().toISOString() };
}

export async function readHomepageConfig(): Promise<HomepageConfig> {
  return readFromDb();
}

export async function writeHomepageConfig(config: HomepageConfig): Promise<HomepageConfig> {
  return writeToDb(config);
}

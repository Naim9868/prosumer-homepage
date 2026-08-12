import { HomepageBuilder } from "@/components/homepage-builder/homepage-builder";
import { getHomepageConfigForAdmin } from "@/services/homepage.service";
import { getCatalogData } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const [config, catalog] = await Promise.all([getHomepageConfigForAdmin(), getCatalogData()]);
  return <HomepageBuilder initialConfig={config} initialCatalog={catalog} />;
}

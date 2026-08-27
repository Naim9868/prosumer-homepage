import { Navbar } from "@/components/home/navbar/navbar";
import { Footer } from "@/components/home/footer/footer";
import { HomepageRenderer } from "@/components/shared/homepage-renderer";
import { getHomepageData } from "@/services/homepage.service";
import { getCatalogData } from "@/lib/catalog";
import { pageCssVars } from "@/lib/page-settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [config, catalog] = await Promise.all([getHomepageData(), getCatalogData()]);
  const page = config.page;

  return (
    <div style={pageCssVars(page)}>
      <Navbar settings={page?.navbar} />
      <main>
        <HomepageRenderer sections={config.sections} catalog={catalog} />
      </main>
      <Footer settings={page?.footer} />
    </div>
  );
}

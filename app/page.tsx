import { Navbar } from "@/components/home/navbar/navbar";
import { Footer } from "@/components/home/footer/footer";
import { HomepageRenderer } from "@/components/shared/homepage-renderer";
import { getHomepageData } from "@/services/homepage.service";
import { getCatalogData } from "@/lib/catalog";

export const revalidate = 60;

export default async function Home() {
  const [{ sections }, catalog] = await Promise.all([getHomepageData(), getCatalogData()]);

  return (
    <>
      <Navbar />
      <main>
        <HomepageRenderer sections={sections} catalog={catalog} />
      </main>
      <Footer />
    </>
  );
}

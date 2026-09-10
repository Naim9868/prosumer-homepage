import { Checkout } from "@/components/checkout";
import { Container } from "@/components/shared/layout-primitives";
import { Navbar } from "@/components/home/navbar/navbar";
import { Footer } from "@/components/home/footer/footer";
import { readHomepageConfig } from "@/lib/homepage-store";
import { normalizePageSettings } from "@/lib/page-settings";
import { DEFAULT_PAGE_SETTINGS } from "@/types/homepage";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  let pageSettings = DEFAULT_PAGE_SETTINGS;
  try {
    const config = await readHomepageConfig();
    pageSettings = normalizePageSettings(config.page);
  } catch {}

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar settings={pageSettings.navbar} />
      <main className="flex-1 pt-28">
        <Container className="-mt-5 pb-10 lg:pb-16">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Checkout
            </h1>
            <p className="mt-2 text-foreground-muted">Complete your order</p>
          </div>
          <Checkout />
        </Container>
      </main>
      <Footer settings={pageSettings.footer} />
    </div>
  );
}

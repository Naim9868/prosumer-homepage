import Script from "next/script";

/**
 * Returns the public GTM container id, or an empty string when it is not
 * configured. The container id is public by design (`NEXT_PUBLIC_*`), no
 * secret is ever read here.
 */
export function getGoogleTagManagerId(): string {
  const id = process.env.NEXT_PUBLIC_GTM_ID;
  return typeof id === "string" ? id.trim() : "";
}

/**
 * Bootstrap snippet: creates `window.dataLayer` and queues the `gtm.js` event.
 *
 * It is intentionally rendered BEFORE the `gtm.js` loader. Both use the
 * `afterInteractive` strategy, which `next/script` inserts into the DOM in
 * component order, so the inline script always executes first and GTM always
 * finds `gtm.start` in the queue when the container boots.
 *
 * `next/script` de-duplicates by `id`, so GTM can never be initialised twice.
 */
const GTM_BOOTSTRAP_SOURCE = `(function(){var q=window.dataLayer=window.dataLayer||[];q.push({"gtm.start":Date.now(),"event":"gtm.js"});})();`;

export function GoogleTagManager() {
  const gtmId = getGoogleTagManagerId();
  if (!gtmId) return null;

  return (
    <>
      <Script
        id="plbd-gtm-bootstrap"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: GTM_BOOTSTRAP_SOURCE }}
      />
      <Script
        id="plbd-gtm-loader"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`}
      />
    </>
  );
}

export default GoogleTagManager;

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

/** Google container ids look like `GTM-XXXXXXX`; anything else is refused. */
const CONTAINER_ID_PATTERN = /^GTM-[A-Z0-9]{4,}$/i;

/**
 * Google's official install snippet, verbatim, with the container id
 * parameterised. It creates `window.dataLayer`, queues `gtm.start`/`gtm.js`
 * and injects the `gtm.js` loader itself, so bootstrap/loader ordering is
 * guaranteed by construction and the snippet can never be split across two
 * requests.
 *
 * `strategy="beforeInteractive"` (allowed only in the root layout, where this
 * component is rendered) makes Next.js server-render the script into the
 * `<head>` of the initial HTML document — exactly where Google requires it
 * ("as high in the <head> as possible") — so it executes before hydration and
 * is visible to Tag Assistant, crawlers and any early `dataLayer` pushes.
 * `next/script` de-duplicates by `id`, so it can never run twice.
 *
 * The id is validated by `CONTAINER_ID_PATTERN` before it is interpolated
 * into the source string.
 */
function buildGtmSnippet(containerId: string): string {
  return (
    "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':" +
    "new Date().getTime(),'event':'gtm.js'});" +
    "var f=d.getElementsByTagName(s)[0],j=d.createElement(s)," +
    "dl=l!='dataLayer'?'&l='+l:'';j.async=true;" +
    "j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;" +
    "f.parentNode.insertBefore(j,f);})" +
    `(window,document,'script','dataLayer','${containerId}');`
  );
}

export function GoogleTagManager() {
  const gtmId = getGoogleTagManagerId();
  if (!gtmId) return null;

  if (!CONTAINER_ID_PATTERN.test(gtmId)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[analytics] Ignoring invalid NEXT_PUBLIC_GTM_ID "${gtmId}" ` +
          `(expected GTM-XXXXXXX).`
      );
    }
    return null;
  }

  return (
    // Rendered only from `app/layout.tsx` (the root layout); the rule keys off
    // file path and cannot see through the component boundary.
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      id="plbd-gtm"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: buildGtmSnippet(gtmId) }}
    />
  );
}

export default GoogleTagManager;

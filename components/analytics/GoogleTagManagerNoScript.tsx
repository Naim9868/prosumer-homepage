import { getGoogleTagManagerId } from "./GoogleTagManager";

/**
 * GTM `<noscript>` fallback.
 *
 * Must be the first element inside `<body>` (see `app/layout.tsx`) so
 * JavaScript-disabled browsers still receive the container.
 * `dangerouslySetInnerHTML` is used because React does not hydrate the
 * children of a `<noscript>` element.
 */
export function GoogleTagManagerNoScript() {
  const gtmId = getGoogleTagManagerId();
  if (!gtmId) return null;

  const iframeHtml = `<iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(
    gtmId
  )}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;

  return <noscript data-nscript="gtm" dangerouslySetInnerHTML={{ __html: iframeHtml }} />;
}

export default GoogleTagManagerNoScript;

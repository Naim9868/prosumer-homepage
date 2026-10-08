/**
 * Browser-side Meta attribution helpers.
 *
 * Reads the `_fbc` / `_fbp` cookies set by the Meta pixel (loaded through GTM)
 * so the server-side Conversions API event can be matched more accurately.
 * These values are PII-adjacent and are therefore sent ONLY in the order
 * request body — never into the dataLayer.
 */

const FBC_COOKIE = "_fbc";
const FBP_COOKIE = "_fbp";
const MAX_VALUE_LENGTH = 512;

export interface MetaBrowserAttribution {
  fbc?: string;
  fbp?: string;
}

function isSafeAttributionValue(value: string): boolean {
  if (value.length === 0 || value.length > MAX_VALUE_LENGTH) return false;
  // Meta values are ASCII; reject anything that looks like injected content.
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code > 0x7e) return false;
  }
  return true;
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  try {
    const prefix = `${name}=`;
    const parts = document.cookie ? document.cookie.split("; ") : [];
    for (const part of parts) {
      if (part.startsWith(prefix)) {
        const raw = decodeURIComponent(part.slice(prefix.length));
        return isSafeAttributionValue(raw) ? raw : undefined;
      }
    }
  } catch {
    // Cookies unavailable — attribution simply degrades.
  }
  return undefined;
}

/** Returns Meta browser attribution values, or `undefined` when none exist. */
export function readMetaBrowserAttribution(): MetaBrowserAttribution | undefined {
  if (typeof window === "undefined") return undefined;

  const fbc = readCookie(FBC_COOKIE);
  const fbp = readCookie(FBP_COOKIE);

  if (!fbc && !fbp) return undefined;

  const attribution: MetaBrowserAttribution = {};
  if (fbc) attribution.fbc = fbc;
  if (fbp) attribution.fbp = fbp;
  return attribution;
}

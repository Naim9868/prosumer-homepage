/**
 * Meta Conversions API (CAPI) — server-side only.
 *
 * RULES:
 *  - `META_CAPI_ACCESS_TOKEN` must NEVER leave this module.
 *  - The token/URL is never logged, never returned, never serialised.
 *  - Email / phone are normalised and SHA-256 hashed before leaving the server.
 *  - Fields Meta expects raw (ip, user agent, fbc, fbp) are NOT hashed.
 *  - This module must only be imported from route handlers / server code.
 *
 * Required server-only environment variables:
 *   META_PIXEL_ID
 *   META_CAPI_ACCESS_TOKEN
 *   META_GRAPH_API_VERSION   (optional, defaults to v21.0)
 */

import { createHash } from "node:crypto";

export const PURCHASE_EVENT_ID_PREFIX = "purchase_";

/** Deterministic id shared with the browser Purchase event. */
export function buildPurchaseEventId(orderId: string): string {
  return `${PURCHASE_EVENT_ID_PREFIX}${orderId}`;
}

const DEFAULT_GRAPH_API_VERSION = "v21.0";
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_ATTRIBUTE_LENGTH = 1024;

export interface MetaCustomContent {
  id: string;
  quantity: number;
  item_price?: number;
}

export interface MetaPurchaseEventData {
  eventId: string;
  eventTime?: number;
  currency: string;
  value: number;
  contentIds: string[];
  contentType: string;
  contents: MetaCustomContent[];
  email?: string | null;
  phone?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbc?: string | null;
  fbp?: string | null;
}

export interface MetaCapiResult {
  ok: boolean;
  error?: string;
}

/* ------------------------------------------------------------------ */
/* Normalisation + hashing                                             */
/* ------------------------------------------------------------------ */

/** Meta expects e-mail lower-cased and trimmed. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Meta expects phone numbers in E.164 without the leading `+`.
 * Bangladeshi storefront numbers arrive as `01XXXXXXXXX` and are converted
 * to `8801XXXXXXXXX` so they match Meta's normalised hashes.
 */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length === 13) return digits;
  if (digits.startsWith("0") && digits.length === 11) return `880${digits.slice(1)}`;
  return digits;
}

/** SHA-256 hex digest — the format Meta expects for `em` and `ph`. */
export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function isSafeRawAttribute(value: string): boolean {
  if (value.length === 0 || value.length > MAX_ATTRIBUTE_LENGTH) return false;
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code > 0x7e) return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

interface MetaCapiConfig {
  pixelId: string;
  accessToken: string;
  version: string;
}

function getConfig(): { config: MetaCapiConfig | null; error?: string } {
  const pixelId = process.env.META_PIXEL_ID?.trim();
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN?.trim();
  const version = process.env.META_GRAPH_API_VERSION?.trim() || DEFAULT_GRAPH_API_VERSION;

  if (!pixelId) return { config: null, error: "META_PIXEL_ID is not configured" };
  if (!accessToken) return { config: null, error: "META_CAPI_ACCESS_TOKEN is not configured" };

  return { config: { pixelId, accessToken, version } };
}

/** Extracts a safe, token-free error message from a Graph API response. */
function extractGraphError(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const error = (body as { error?: { message?: unknown; code?: unknown } }).error;
  if (!error || typeof error !== "object") return undefined;

  const parts: string[] = [];
  if (typeof error.message === "string") parts.push(error.message);
  if (typeof error.code === "number") parts.push(`code ${error.code}`);
  return parts.length > 0 ? parts.join(" — ") : "Meta Graph API returned an error";
}

/* ------------------------------------------------------------------ */
/* Senders                                                             */
/* ------------------------------------------------------------------ */

/**
 * Sends a `Purchase` event to the Meta Conversions API.
 * Never throws — failures are returned so the caller can persist and retry
 * them with the same `event_id`.
 */
export async function sendMetaPurchase(data: MetaPurchaseEventData): Promise<MetaCapiResult> {
  if (typeof window !== "undefined") {
    return { ok: false, error: "sendMetaPurchase may only run on the server" };
  }

  const { config, error: configError } = getConfig();
  if (!config) {
    return { ok: false, error: configError ?? "Meta CAPI is not configured" };
  }

  if (!data.eventId) {
    return { ok: false, error: "Missing Meta event id" };
  }

  const userData: Record<string, unknown> = {};

  const email = data.email?.trim();
  if (email && email.length <= MAX_ATTRIBUTE_LENGTH) {
    userData.em = [sha256Hex(normalizeEmail(email))];
  }

  const phone = data.phone?.trim();
  if (phone) {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length > 0) {
      userData.ph = [sha256Hex(normalizedPhone)];
    }
  }

  if (data.clientIpAddress && isSafeRawAttribute(data.clientIpAddress)) {
    userData.client_ip_address = data.clientIpAddress;
  }
  if (data.clientUserAgent && isSafeRawAttribute(data.clientUserAgent)) {
    userData.client_user_agent = data.clientUserAgent;
  }
  if (data.fbc && isSafeRawAttribute(data.fbc)) {
    userData.fbc = data.fbc;
  }
  if (data.fbp && isSafeRawAttribute(data.fbp)) {
    userData.fbp = data.fbp;
  }

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: data.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: data.eventId,
        action_source: "website",
        user_data: userData,
        custom_data: {
          currency: data.currency,
          value: data.value,
          content_ids: data.contentIds,
          content_type: data.contentType,
          contents: data.contents,
        },
      },
    ],
  };

  const endpoint = `https://graph.facebook.com/${config.version}/${encodeURIComponent(
    config.pixelId
  )}/events?access_token=${encodeURIComponent(config.accessToken)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeout);
    });

    const rawBody = await response.text();
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody) as unknown;
    } catch {
      parsedBody = undefined;
    }

    const graphError = extractGraphError(parsedBody);
    if (!response.ok || graphError) {
      return { ok: false, error: graphError ?? `Meta CAPI responded with HTTP ${response.status}` };
    }

    return { ok: true };
  } catch (caught) {
    if (caught instanceof Error && caught.name === "AbortError") {
      return { ok: false, error: "Meta CAPI request timed out" };
    }
    return { ok: false, error: caught instanceof Error ? caught.message : "Meta CAPI request failed" };
  }
}

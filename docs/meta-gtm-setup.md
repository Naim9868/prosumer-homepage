# Meta + Google Tag Manager Setup (ProsumerLensBD Client)

This document is the contract between the storefront code and the Google Tag Manager
(GTM) container. The application only pushes typed events onto `window.dataLayer`
(see `lib/analytics/data-layer.ts` and `lib/analytics/events.ts`); **all** Meta Pixel
and GA4 behaviour is configured inside GTM. The Meta Pixel is never loaded directly
by Next.js.

---

## 1. Environment variables

### Client (public, safe to expose)

| Variable | Example | Used by |
| --- | --- | --- |
| `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` | `components/analytics/GoogleTagManager.tsx`, `GoogleTagManagerNoScript.tsx` |

If `NEXT_PUBLIC_GTM_ID` is empty/missing, no GTM code is rendered at all (SSR safe).

### Server only (never expose to the browser)

| Variable | Example | Used by |
| --- | --- | --- |
| `META_PIXEL_ID` | `123456789012345` | `lib/meta/capi.ts` |
| `META_CAPI_ACCESS_TOKEN` | `EAAB...` | `lib/meta/capi.ts` |
| `META_GRAPH_API_VERSION` | `v21.0` (optional, defaults to `v21.0`) | `lib/meta/capi.ts` |

Rules enforced in code:

- `META_CAPI_ACCESS_TOKEN` is read **only** inside `lib/meta/capi.ts` on the server.
- There must never be a `NEXT_PUBLIC_META_CAPI_ACCESS_TOKEN`.
- No token, email, phone, password or address is ever pushed into the dataLayer
  (`pushDataLayer` blocks forbidden keys in development).

---

## 2. dataLayer event contract (emitted by the app)

| dataLayer `event` | Fired when | Source of truth |
| --- | --- | --- |
| `page_view` | App Router client-side navigation | `components/analytics/RouteChangeTracker.tsx` |
| `view_item` | Product detail page rendered with a valid product | `trackViewContent()` |
| `add_to_cart` | Existing cart mutation succeeded | `trackAddToCart()` |
| `begin_checkout` | Checkout mounted with real cart lines | `trackInitiateCheckout()` |
| `purchase` | Server returned a confirmed order id | `trackPurchase()` |

The initial document load does **not** push `page_view` from React — GTM's
"All Pages" trigger already covers it, so every page reports exactly one PageView.

### Payload shapes

`page_view`:

```json
{
  "event": "page_view",
  "page_location": "https://example.com/products/lens-x",
  "page_path": "/products/lens-x",
  "page_title": "Lens X"
}
```

`view_item` / `add_to_cart` / `begin_checkout`:

```json
{
  "event": "view_item",
  "ecommerce": {
    "currency": "BDT",
    "value": 1490,
    "items": [
      {
        "item_id": "PL-LENS-X",
        "item_name": "Mobile Telephoto Lens",
        "price": 1490,
        "quantity": 1,
        "item_brand": "Prosumer Lens",
        "item_category": "Telephoto"
      }
    ]
  },
  "meta": {
    "content_ids": ["PL-LENS-X"],
    "content_type": "product",
    "content_name": "Mobile Telephoto Lens",
    "contents": [{ "id": "PL-LENS-X", "quantity": 1, "item_price": 1490 }],
    "value": 1490,
    "currency": "BDT"
  }
}
```

`purchase` (adds transaction id + deterministic Meta event id):

```json
{
  "event": "purchase",
  "ecommerce": {
    "transaction_id": "PL251007-ABC123",
    "currency": "BDT",
    "value": 3040,
    "items": [ ... ]
  },
  "meta": {
    "event_id": "purchase_PL251007-ABC123",
    "content_ids": ["PL-LENS-X"],
    "content_type": "product",
    "contents": [{ "id": "PL-LENS-X", "quantity": 2, "item_price": 1490 }],
    "value": 3040,
    "currency": "BDT"
  }
}
```

Notes:

- `item_id` / `content_ids` use the **SKU** first, falling back to the product `_id`.
  `undefined` ids are never sent; items without any id are dropped.
- Currency is always `BDT`.
- Never pushed: `email`, `phone`, `password`, addresses, CAPI token, `_fbc`/`_fbp`.

---

## 3. GTM variables

Create these **Data Layer Variable** (DLV) entries:

| GTM variable name | Data Layer Variable name | Default value |
| --- | --- | --- |
| `META - Pixel ID` | *(Custom Variable)* — use a **Constant** variable with your Pixel ID | `123456789012345` |
| `DLV - Meta Event ID` | `meta.event_id` | *(none)* |
| `DLV - Meta Content IDs` | `meta.content_ids` | *(none)* |
| `DLV - Meta Content Type` | `meta.content_type` | `product` |
| `DLV - Meta Contents` | `meta.contents` | *(none)* |
| `DLV - Meta Value` | `meta.value` | `0` |
| `DLV - Meta Currency` | `meta.currency` | `BDT` |
| `DLV - Meta Content Name` | `meta.content_name` | *(none)* |
| `DLV - Ecommerce Value` | `ecommerce.value` | *(none)* |

Recommended extras (GA4): `DLV - Transaction ID` → `ecommerce.transaction_id`.

---

## 4. GTM triggers

| GTM trigger name | Trigger type | Configuration |
| --- | --- | --- |
| `CE - view_item` | Custom Event | Event name equals `view_item` |
| `CE - add_to_cart` | Custom Event | Event name equals `add_to_cart` |
| `CE - begin_checkout` | Custom Event | Event name equals `begin_checkout` |
| `CE - purchase` | Custom Event | Event name equals `purchase` |

PageView:

- Meta Pixel base tag → trigger: **All Pages** (`/Initialization` or `Page View` as preferred).
- The app's `page_view` dataLayer event can drive GA4 page_view if you prefer
  SPA-aware counting, but **do not** fire Meta PageView from both All Pages and
  `page_view` — pick one.

Purchase firing rules (critical):

- `CE - purchase` **only**. Custom Event, "Wait for tags" optional.
- Set **"Create a new trigger for each event"** semantics in the tag: **Once per
  event** (GTM's default for a single fire per event occurrence is fine because the
  app already guards duplicates).
- Do **NOT** attach the Purchase tag to: All Pages, Page View, History Change,
  DOM Ready, Scroll, Timer, or `page_view`.
- Every other Meta tag (ViewContent/AddToCart/InitiateCheckout) also uses only its
  own custom event trigger.

---

## 5. GTM tags

### 5.1 Meta Pixel — Base Tag

- Type: **Custom HTML**
- Firing trigger: **All Pages** (Initialization recommended)
- Snippet (once, "fire once" behaviour is automatic for a base tag):

```html
<script>
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '{{META - Pixel ID}}');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id={{META - Pixel ID}}&ev=PageView&noscript=1" /></noscript>
```

`{{META - Pixel ID}}` is a **Constant** variable holding the Pixel ID (or reuse the
same value from your server config — the ID is public).

### 5.2 Meta ViewContent

- Type: **Custom HTML**, trigger: `CE - view_item`

```html
<script>
  fbq('track', 'ViewContent', {
    content_ids: {{DLV - Meta Content IDs}},
    content_type: {{DLV - Meta Content Type}},
    content_name: {{DLV - Meta Content Name}},
    value: {{DLV - Meta Value}},
    currency: {{DLV - Meta Currency}}
  });
</script>
```

### 5.3 Meta AddToCart

- Type: **Custom HTML**, trigger: `CE - add_to_cart`

```html
<script>
  fbq('track', 'AddToCart', {
    content_ids: {{DLV - Meta Content IDs}},
    content_type: {{DLV - Meta Content Type}},
    contents: {{DLV - Meta Contents}},
    value: {{DLV - Meta Value}},
    currency: {{DLV - Meta Currency}}
  });
</script>
```

### 5.4 Meta InitiateCheckout

- Type: **Custom HTML**, trigger: `CE - begin_checkout`

```html
<script>
  fbq('track', 'InitiateCheckout', {
    content_ids: {{DLV - Meta Content IDs}},
    content_type: {{DLV - Meta Content Type}},
    contents: {{DLV - Meta Contents}},
    value: {{DLV - Meta Value}},
    currency: {{DLV - Meta Currency}}
  });
</script>
```

### 5.5 Meta Purchase (deduplicated)

- Type: **Custom HTML**
- Trigger: `CE - purchase`
- **eventID is mandatory** — it must equal the server-side Conversions API
  `event_id` (`purchase_${orderId}`):

```html
<script>
  fbq('track', 'Purchase', {
    content_ids: {{DLV - Meta Content IDs}},
    content_type: {{DLV - Meta Content Type}},
    contents: {{DLV - Meta Contents}},
    value: {{DLV - Meta Value}},
    currency: {{DLV - Meta Currency}}
  }, { eventID: {{DLV - Meta Event ID}} });
</script>
```

Firing rules: **only** `CE - purchase`; never on All Pages / Page View / History
Change / DOM Ready.

### 5.6 GA4 (optional)

- GA4 Configuration tag on All Pages.
- GA4 Event tags for `view_item`, `add_to_cart`, `begin_checkout`, `purchase`
  using the `ecommerce` object; send `transaction_id` for purchase.

---

## 6. Purchase deduplication architecture

```
Browser                                  Server (this project)
──────                                   ─────────────────────
checkout submit
  → POST /api/orders
  → (server validates + creates order)
  ← orderId
  → dataLayer push "purchase"
      meta.event_id = purchase_PL...     after() → dispatchPurchaseCapi(orderId)
  → GTM Purchase tag                              → claim attempt (atomic)
      fbq('track','Purchase',...,{eventID})       → sendMetaPurchase(event_id = purchase_PL...)
                                                   → persist analytics.meta.{capiStatus,...}
```

- **event id:** `purchase_${orderId}` on both sides (deterministic, never regenerated).
- **browser guard:** `sessionStorage["meta_purchase_fired_${orderId}"]` +
  an in-memory set — reloading the success state never re-fires Purchase.
- **server guard:** `analytics.meta.capiStatus === "success"` short-circuits;
  retries reuse the same `event_id`; max 5 attempts (`MAX_CAPI_ATTEMPTS`).
- **order safety:** CAPI runs in `after()` (after the response is committed) and
  never throws into the order transaction — a CAPI failure can never fail an order.

### Order document analytics metadata

`models/Order.ts` → `analytics.meta`:

| Field | Meaning |
| --- | --- |
| `eventId` | `purchase_${orderId}` |
| `capiStatus` | `pending` \| `success` \| `failed` |
| `capiAttempts` | attempt counter (max 5) |
| `lastCapiAttemptAt` | last attempt timestamp |
| `capiError` | last error (truncated, token-free) |
| `fbc` / `fbp` | Meta browser attribution (server-side only, never in dataLayer) |

### Retry endpoint

```
POST /api/orders/capi-retry
{ "orderId": "PL251007-ABC123" }
```

Server-side only, safe to call repeatedly: it will not resend a successful event,
reuses the same `event_id`, and stops after 5 attempts.

---

## 7. Verification checklist

1. GTM Preview: navigate SPA routes → exactly one `page_view` per navigation,
   one on initial load from the base tag.
2. Open a product page → exactly one `view_item` per page load.
3. Add to cart → one `add_to_cart` per click with correct quantity/price.
4. Open `/checkout` with items → one `begin_checkout`.
5. Place a COD order → one `purchase` in the dataLayer with
   `meta.event_id = purchase_<orderId>`.
6. Reload the success state → **no** second `purchase`.
7. Meta Events Manager → Test Events: browser Purchase and server Purchase show
   as **Deduplicated** (same Event ID).
8. Server: `analytics.meta.capiStatus === "success"` on the order document.
9. Force a CAPI failure (bad token) → order still succeeds,
   `capiStatus = "failed"`; call the retry endpoint → status becomes `success`
   with the same event id.

> Meta Events Manager verification must be performed manually with real
> credentials; it is not asserted by this repository's automated checks.

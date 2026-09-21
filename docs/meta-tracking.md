# Meta tracking — PromptPack Finance (`/finance`)

## Pixel
- Dataset/Pixel: **PROMPTPACK — `2116311975585050`** (existing; do not create another).
- Homepage (`index.html`) is unchanged and keeps its own inline pixel.
- `/finance` loads the base pixel once (in `<head>`), **only on `promptpack.tech` / `www.promptpack.tech`**.
  On any other host (localhost, previews) `fbq` is a no-op stub and events are logged to the console
  and to `window.__ppAnalyticsLog`. Add `?ppdebug=1` to also log on production.
- Microsoft Clarity (`xidr4f4am8`) is loaded once, same snippet as the homepage. `/finance` adds
  Clarity custom events `finance_page_view`, `finance_checkout_click` and tags for UTM params.

## Events sent from /finance
| Event | Type | When | Payload |
|---|---|---|---|
| PageView | standard | page load (base pixel) | — |
| ViewContent | standard | once per page load | content_name "AI Money Audit Prompt Pack", content_type product, content_ids ["ai-money-audit-prompt-pack"], value 19.00, currency USD |
| FinanceCheckoutClick | custom | click on any "Get the pack — $19" button (only when a real Gumroad URL is configured) | product, content_ids, value 19.00, currency USD |

## Deliberately NOT sent from the website
- **Purchase** — owned by Gumroad (real successful payment only). Never fire from the frontend.
- **InitiateCheckout** — Gumroad's Meta integration emits its own; sending ours would double-count.
  (Gumroad help pages could not be fetched in full during implementation; confirm in Test Events.)
  Note: the older homepage still fires its own InitiateCheckout on buy-button click; left as-is.

## Gumroad URL (single source)
`assets/finance-config.js` → `GUMROAD_FINANCE_PRODUCT_URL`. Static site (no build), so this is a
config constant, not an env var. Empty = buttons disabled and no click event fires.
Buttons open `<url>?wanted=true` in a new tab (same pattern as the rest of the site).

## Attribution
`utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid` are captured on load, kept in
`sessionStorage["pp_attr"]` / `window.PP_ATTRIBUTION`, and tagged in Clarity (except fbclid).
They are **not** appended to the Gumroad URL — no officially documented Gumroad pass-through
parameters are relied on. Limitation: Gumroad sales cannot be joined to UTMs from this site alone.

## Privacy
Event payloads contain only generic product fields. Never add bank names, amounts the visitor
enters, statement contents, or any personal financial data to events or URLs.

## Future (disabled): server-side Purchase via CAPI
Gumroad sale Ping → backend endpoint → verify sale → Meta Conversions API `Purchase`
(with `event_id` for dedupe against Gumroad's browser Purchase). Requires a Meta access token stored
server-side as a secret and explicit approval. Not implemented.

## Checkout provider change (Gumroad → Razorpay, planned)
The page copy no longer names Gumroad. Impact on tracking — **not yet implemented, needs a decision**:
- Gumroad's built-in Meta integration (which was to fire InitiateCheckout + Purchase) does **not** apply to Razorpay.
- Razorpay does not fire Meta events on its own. A real `Purchase` needs either (a) a post-payment
  success/thank-you page on promptpack.tech that fires `Purchase` (value 19, USD/INR) once per verified
  order, or (b) server-side Meta CAPI from a verified Razorpay webhook (with `event_id` for dedupe).
- Until one of these exists, campaigns optimising for Purchase have no signal. Do not fire Purchase on button click.
- `?wanted=true` is now appended only to gumroad.com URLs.
- Currency: Razorpay typically charges INR; Meta `value`/`currency` must match the actual charge.

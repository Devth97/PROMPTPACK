# Meta tracking — PromptPack Finance (`/finance`)

Checkout is **Razorpay only** on the website (see `docs/payments.md`). Gumroad, if used, is a separate storefront that the
site does not link to (`docs/gumroad-listing.md`).

## Pixel
- Dataset/Pixel: **PROMPTPACK — `2116311975585050`** (existing; do not create another). Never mix with Grow Plus datasets.
- Homepage (`index.html`) keeps its own inline pixel and its own InitiateCheckout on the old Gumroad buy buttons (unchanged).
- `/finance` and `/finance/thanks` load the base pixel once (in `<head>`), **only on `promptpack.tech` / `www.promptpack.tech`**.
  On any other host (localhost, Vercel previews) `fbq` is a no-op stub; events are logged to the console and to
  `window.__ppAnalyticsLog`. Add `?ppdebug=1` to also log on production.
- Microsoft Clarity (`xidr4f4am8`) is loaded once, same snippet as the homepage, with custom events `finance_page_view`,
  `finance_checkout_click`, `finance_purchase` and UTM tags.

## Events
| Event | Where | When | Payload |
|---|---|---|---|
| PageView | /finance, /finance/thanks | page load (base pixel) | — |
| ViewContent | /finance | once per page load | content_name "AI Money Audit Prompt Pack", content_type product, content_ids ["ai-money-audit-prompt-pack"], value 19.00, currency USD |
| FinanceCheckoutClick (custom) | /finance | when the Razorpay popup actually opens (order created OK) | product, content_ids, value, currency (from the server order) |
| InitiateCheckout | /finance | same moment as above | content_name, content_type, content_ids, value, currency |
| **Purchase** | /finance/thanks | once — only after the server verified the payment AND the buyer arrived straight from checkout in this browser session. Refreshes and emailed-link visits never re-fire. `eventID` = Razorpay order id | content_name, content_type, content_ids, value, currency (from the verified order) |

Purchase is **never** fired from a button click or from `/finance` itself.

## Attribution
`utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid` are captured on load and kept in
`sessionStorage["pp_attr"]` / `window.PP_ATTRIBUTION`. The UTM tags (not fbclid) are also attached to the Razorpay order
notes and Clarity tags, so orders can be matched to campaigns.

## Privacy
Event payloads contain only generic product fields. Never add bank names, amounts the visitor enters, statement contents,
email content or any personal financial data to events or URLs. The download token is stripped from the URL before any
analytics loads on `/finance/thanks`.

## Ads readiness
- Campaign: Sales, website, dataset PROMPTPACK, optimise for Purchase, destination
  `https://promptpack.tech/finance?utm_source=meta&utm_medium=paid_social&utm_campaign=finance_money_audit&utm_content=static_v1`.
- Do not start Purchase-optimised ads until Razorpay is live and a test purchase shows Purchase in Events Manager.
  Before that, the CTA shows "Checkout is not available just yet".

## Future (not implemented): server-side CAPI Purchase
Razorpay webhook (`order.paid`, already verified in `api/razorpay-webhook.js`) → Meta Conversions API `Purchase` with the
same `event_id` (= order id) so it deduplicates against the browser event. Needs a Meta access token stored server-side as
a secret and explicit approval.

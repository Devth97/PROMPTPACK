/*
 * Public config for the /finance page. NOTHING SECRET goes here — this file is served to every visitor.
 * Secrets (Razorpay key secret, webhook secret, signing/encryption keys) live only in Vercel env vars:
 * see docs/payments.md.
 *
 * Checkout is Razorpay: the popup + order creation + payment verification are handled by /api/*.
 * The displayed price is USD 19 by default; the amount actually charged comes from the server env
 * (PRICE_AMOUNT / PRICE_CURRENCY), so keep the two in sync.
 */
window.PP_FINANCE_CONFIG = {
  PIXEL_ID: "2116311975585050",
  PRODUCT: {
    name: "AI Money Audit Prompt Pack",
    id: "ai-money-audit-prompt-pack",
    value: 19.0,
    currency: "USD"
  },
  // Only these hostnames send analytics. Everything else logs to the console (no-op).
  PRODUCTION_HOSTS: ["promptpack.tech", "www.promptpack.tech"]
};

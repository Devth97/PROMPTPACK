/*
 * Central config for the /finance landing page.
 *
 * GUMROAD_FINANCE_PRODUCT_URL — the ONE place the checkout URL lives.
 * (Name kept from the original Gumroad plan; it accepts any https checkout URL, e.g. a Razorpay
 * payment page. Rename once checkout is final.)
 * Every purchase button on /finance reads this value (see finance.js).
 * Paste the real checkout URL here, e.g. "https://<seller>.gumroad.com/l/<permalink>" or a Razorpay link.
 * Leave empty until checkout exists: buttons render disabled and
 * NO tracking event fires for them. Do not commit any secret here — this file is public.
 */
window.PP_FINANCE_CONFIG = {
  GUMROAD_FINANCE_PRODUCT_URL: "",
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

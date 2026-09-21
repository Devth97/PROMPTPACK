# Gumroad listing — AI Money Audit Prompt Pack (separate storefront)

Gumroad is a SEPARATE sales channel. promptpack.tech does NOT link to it; the website checks out with Razorpay only (docs/payments.md).

**Live URL:** https://khalandarth.gumroad.com/l/MoneyAuditPromptPack (product id `jshnjk`, published). Discover is left off (30% fee).

Copy/paste for gumroad.com/products/new. Claims here match the PDF and the site; do not add savings guarantees.

## Step 1 — "What are you creating?"
- **Name:** `AI Money Audit Prompt Pack`
- **Type:** Digital product
- Click **Next: Customize**

## Step 2 — Customize
- **Price:** `$25` (single price — do not enable "pay what you want" / tiers). The website (Razorpay) sells at $19; Gumroad is intentionally priced separately at $25.
- **Summary (one line):** `Connect Gmail (read-only) to Codex or Claude Code and turn your billing emails into a Keep / Review / Compare / Negotiate action plan. 29-page PDF, one-time purchase.`
- **Button text (CTA):** `Start my money audit` (or leave "I want this!")
- **Cover:** 1280×720 image (see "Assets" below). **Thumbnail:** 600×600.
- **Product file:** upload the PDF from `MONEY AUDIT TOOLKIT/AI_Money_Audit_Prompt_Pack_Gmail_First.pdf` (never commit this file to git).
- **Description** (short on purpose — sells the outcome, does not list the prompts or steps):

```
FIND WHAT'S DRAINING YOUR MONEY EVERY MONTH.

Small recurring charges are easy to miss. This pack shows you how to point Codex or Claude Code at your billing emails (read-only) and get a clear Keep / Review / Compare / Negotiate action plan.

29-page PDF. One-time purchase. No subscription. Reuse it whenever you want.

YOU'LL NEED
Codex or Claude Code, a Gmail account, and a Gmail connector you trust.

Read-only by default. Nothing is sent, cancelled, paid or changed without your approval.

Not financial advice. Savings are not guaranteed.
```

- **Additional details blocks (short facts only):** Format: PDF, 29 pages · Works with: Codex, Claude Code + a Gmail connector
- **Tags / category:** finance, budgeting, subscriptions, AI prompts, Claude Code, Codex, Gmail
- **Refund policy setting:** pick the option that matches what you want to honour on Gumroad. The site's Refund Policy
  (7 days, only for failed/corrupted delivery, duplicate payment or product not as described) is for direct sales;
  Gumroad's own refund setting governs Gumroad sales, so keep the two consistent.

## Step 3 — Meta Pixel (so Gumroad reports Purchase)
Gumroad → Settings → Third-party analytics → add Meta Pixel ID `2116311975585050` (same Pixel as promptpack.tech).
Gumroad then sends its own InitiateCheckout/Purchase for Gumroad sales. These land in the same Pixel as website sales (website: $19, Gumroad: $25); each sale is counted once. Point Meta ads at promptpack.tech/finance only, so Purchase optimisation learns from the website checkout.

## Step 4 — Test
Do one purchase on the Gumroad page and check Meta Events Manager → Test Events for InitiateCheckout and Purchase (value 25, USD).

## Assets still needed
- Cover image 1280×720 and thumbnail 600×600 for the Gumroad page.

## Attribution limit
Meta ads should point to promptpack.tech/finance (Razorpay). Gumroad sales are not tied to a campaign from the site.

# Gumroad listing — AI Money Audit Prompt Pack (separate storefront)

Gumroad is a SEPARATE sales channel. promptpack.tech does NOT link to it; the website checks out with Razorpay only (docs/payments.md).

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
- **Description:**

```
FIND WHAT'S DRAINING YOUR MONEY EVERY MONTH.

Connect Gmail (read-only) to Codex or Claude Code. Your AI agent audits your billing emails and turns recurring charges into a clear Keep / Review / Compare / Negotiate action plan.

WHAT YOU GET — 29-PAGE PDF
- Gmail setup guide for Codex and Claude Code (read-only access)
- Connection test prompts
- Master Gmail Audit prompt
- Evidence ledger and recurring expense finder
- Subscription review: KEEP / REVIEW / COMPARE / CONSIDER CANCELLING
- Overlap detector, annual-cost calculator and renewal tracker
- Fee review and cancellation verification
- Competitor comparison and negotiation message generator
- 10-minute quick run
- Re-audit prompt (repeat every 3-6 months)
- Security guardrails: email is treated as untrusted data

HOW IT WORKS
1. Connect: give Codex or Claude Code read-only Gmail access through a trusted connector
2. Search: the agent searches receipts, renewals, invoices and subscription emails
3. Extract: it builds a ledger of provider, amount, frequency, renewal and evidence
4. Analyze: it spots recurring costs, overlaps, price rises, fees and upcoming renewals
5. Compare: it researches alternatives for items worth a second look
6. Act safely: it drafts negotiation or cancellation messages. You decide what to send

WHAT YOU NEED
Codex or Claude Code, a Gmail account that holds your billing emails, and a Gmail connector (MCP) you trust that supports read-only access. The guide walks you through setup.

SAFE BY DESIGN
Read-only by default. Nothing is sent, cancelled, paid or changed without your explicit approval. PromptPack never receives your emails.

One-time purchase. No subscription. Instant download. Reuse it whenever you want.

Not financial, legal or tax advice. Savings are not guaranteed, and Gmail may not contain every transaction.
```

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

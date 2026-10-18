# Meta Ads — AI Money Audit Prompt Pack (₹1,000 split test)

Two campaigns, ₹500 each, running at the same time:

| Campaign | Destination | Price there | Audience |
|---|---|---|---|
| A — Website | `promptpack.tech/finance` (Razorpay, UPI) | ₹1,599 / US$19 | India |
| B — Gumroad | `khalandarth.gumroad.com/l/MoneyAuditPromptPack` | US$25 | see "The Gumroad problem" |

Both fire into the **same** Pixel `2116311975585050` (docs/meta-tracking.md, docs/gumroad-listing.md).

## Read this before you spend anything

**₹1,000 is a creative test, not an acquisition campaign.** At Indian cold-traffic rates (roughly
₹80–250 CPM and ₹5–20 per link click — estimates; your real numbers will differ) ₹500 buys roughly
**25–100 landing page views**. On a ₹1,599 product the statistically normal outcome is **0–1 sales**.
That is not a failed test. Judge this spend on CTR and cost per landing page view, not on ROAS, and
do not conclude the product doesn't sell from ₹1,000.

**Purchase optimisation is off the table at this budget.** Meta's learning phase wants ~50
conversions in 7 days. Reaching that on a ₹1,599 product needs tens of thousands of rupees a week.
Optimising for Purchase on ₹100/day means Meta never learns and delivery stays erratic and
expensive. Both campaigns below optimise for **Landing Page Views** instead.

**The existing docs said not to split.** docs/gumroad-listing.md: "Point Meta ads at
promptpack.tech/finance only, so Purchase optimisation learns from the website checkout." Running
both halves an already-small budget across two destinations at two different prices on one Pixel,
so the Pixel data will be mixed. Going ahead is a legitimate call — but update that line in
gumroad-listing.md so the docs stop contradicting what you actually run.

### The Gumroad problem

Gumroad charges **US$25**. The people who pay US$25 are in the US/UK/CA/AU, where CPMs run roughly
$8–20. ₹500 is about **US$5.60** — single-digit link clicks. Not enough to learn anything.

Pointing Campaign B at **India** is worse on the merits: Indian buyers get the same pack for ₹1,599
with UPI on your own site, versus $25 (~₹2,100) on Gumroad with no UPI. You would be paying to send
people to your more expensive, worse-converting option.

Three honest ways out — pick one before launching B:

- **Best:** move all ₹1,000 to Campaign A. Prove the funnel converts, then fund Gumroad.
- **If you want the Gumroad read anyway:** run B to US/UK/CA/AU and treat it purely as a CTR/CPM
  benchmark for Tier-1 markets. Expect no purchases; do not judge Gumroad on it.
- **Price-elasticity test:** run B to India at $25 to see whether price or payment method is the
  blocker. Cleanest data, most likely to spend ₹500 for zero sales.

## Pre-flight (all must be true before either campaign goes live)

- [ ] One real test-mode purchase completed and **Purchase** visible in Events Manager → Test Events.
      docs/payments.md notes the real popup, real signatures and webhook delivery are not covered by
      the local test suite.
- [ ] `promptpack.tech` shows **Verified** in Events Manager → Domains (tag added in `efd47fe`).
- [ ] Aggregated Event Measurement configured for the domain: Purchase ranked #1, InitiateCheckout
      #2, ViewContent #3. Without this, iOS conversions go unreported.
- [ ] `PRICE_AMOUNT_INR` set in Vercel, Production **and** Preview.
- [ ] Load `promptpack.tech/finance?ppdebug=1`, click a CTA, confirm `ViewContent` and
      `InitiateCheckout` appear in the console and in Test Events.
- [ ] Business Manager has a payment method, and the ad account is **not** in a Special Ad Category.
      This is a digital prompt pack, not a financial product, so the correct answer is no category.
      If Meta flags it anyway, targeting narrows sharply and these plans need revisiting.

## Campaign A — Website (₹500)

    Objective            Traffic
    Optimise for         Landing page views        <- not Link clicks; LPV filters bounced taps
    Budget               Daily ₹100 x 5 days       <- if Meta rejects ₹100 as under the minimum, use ₹125 x 4
    Schedule             Set a hard end date so it cannot overspend
    Bid strategy         Highest volume (no cost cap — a cap on ₹100/day just stalls delivery)
    Location             India
    Age                  22–45
    Language             English (All) + English (UK) + English (US)
    Detailed targeting   ChatGPT · Artificial intelligence · Software engineering ·
                         Personal finance · Budget · Subscription  (any one of)
                         Aim for ~1–5M reach. Turn Advantage+ audience expansion OFF.
    Placements           Manual: FB Feed, IG Feed, IG Stories, IG Reels, FB Reels
                         EXCLUDE Audience Network and Messenger — accidental clicks eat micro budgets
    Ads                  2 maximum. More than 2 fragments ₹500 into noise.

### Destination URLs

UTM scheme matches the one already specified in docs/meta-tracking.md.

Ad A1:

    https://promptpack.tech/finance?utm_source=meta&utm_medium=paid_social&utm_campaign=finance_money_audit&utm_content=leak_v1

Ad A2:

    https://promptpack.tech/finance?utm_source=meta&utm_medium=paid_social&utm_campaign=finance_money_audit&utm_content=devtool_v1

These land in `sessionStorage["pp_attr"]`, on the Razorpay order notes and on Clarity tags, so any
sale can be traced back to the exact ad.

### The hook rule these are written to

Hormozi's structure, adapted to a product that legally cannot promise an outcome: **call out the
person, make the problem specific and personal, name the mechanism, then make the ask.** The usual
version of this hook ("Find the ₹2,340/year you're wasting") is closed to us — docs/gumroad-listing.md
forbids savings claims and Meta's financial-services policy treats implied savings as a prohibited
claim. So the specificity goes into the **problem and the mechanism**, never the number:

- Not "save ₹2,000 a month" → but "name every subscription you're paying for right now"
- Not "cut your bills by 30%" → but "your Gmail already has every receipt in it"
- Not "guaranteed savings" → but "10 minutes, read-only, every recurring charge in one list"

Same pull, no claim. Run **A1 and A2**; hold A3 as the swap-in when the first two fatigue.

### Ad A1 — "name them all" (leak hook)

Primary text:

```
You can name your rent. Your EMI. Your phone bill.

Now name every subscription you're paying for right now. Most people stop at four — and then keep paying for the rest anyway.

Your Gmail already has the answer sitting in it: every receipt, every renewal, every payment confirmation you've ever been sent. This pack shows you how to point Codex or Claude Code at that inbox — read-only — and pull every recurring charge into one list, sorted Keep / Review / Compare / Negotiate.

29-page prompt pack. ₹1,599 once, or US$19. No subscription.

Not financial advice. Savings aren't guaranteed.
```

- Headline: `Find where you're losing money`
- Description: `29-page pack · ₹1,599 once`
- CTA button: `Learn more`
- Creative: `ai-money-audit-hook-leak-4x5-v1.png` (feed) + `ai-money-audit-hook-leak-9x16-v1.png` (Stories/Reels)

### Ad A2 — "the ones you forgot" (forgot hook)

Primary text:

```
The free trial you forgot to cancel is still charging you. So is the app you opened twice in March.

They survive because they never show up as one big number. They show up as ₹149 here, ₹299 there, spread across twelve months and three payment methods — small enough that you never sit down and add them up.

Connect Gmail to Codex or Claude Code, read-only, and let your AI agent do the adding up: every recurring charge pulled out of your inbox and sorted into Keep / Review / Compare / Negotiate.

29-page prompt pack. ₹1,599 once, or US$19.

Not financial advice. Savings aren't guaranteed.
```

- Headline: `The charges you forgot about`
- Description: `Works with Codex + Claude Code`
- CTA button: `Learn more`
- Creative: `ai-money-audit-hook-forgot-4x5-v1.png` + `ai-money-audit-hook-forgot-9x16-v1.png`

### Ad A3 — "10 minutes" (hold in reserve)

Primary text:

```
You already have Codex or Claude Code open for work. It is ten minutes away from doing something useful for your own money.

Connect Gmail — read-only — and it reads twelve months of billing emails, renewals and payment confirmations, then hands you every recurring charge you're paying, sorted into Keep / Review / Compare / Negotiate.

No bank login. No statements to download. No app to subscribe to. 29 pages of done-for-you prompts, ₹1,599 once, or US$19.

Not financial advice. Savings aren't guaranteed.
```

- Headline: `10 minutes. Every recurring charge.`
- Description: `Read-only · No bank login`
- CTA button: `Learn more`
- Creative: `ai-money-audit-hook-tenmin-4x5-v1.png` + `ai-money-audit-hook-tenmin-9x16-v1.png`

## Campaign B — Gumroad (₹500)

Identical to Campaign A except:

    Location             US + UK + CA + AU     (see "The Gumroad problem" — decide before launching)
    Age                  25–45
    Detailed targeting   ChatGPT · Artificial intelligence · Software engineering · Personal finance
    Ads                  1 only. ₹500 in Tier-1 markets cannot support two.

Destination:

    https://khalandarth.gumroad.com/l/MoneyAuditPromptPack?utm_source=meta&utm_medium=paid_social&utm_campaign=gumroad_money_audit&utm_content=leak_v1

### Ad B1

Primary text:

```
You can name your rent. Your car payment. Your phone bill.

Now name every subscription you're paying for right now. Most people stop at four — and then keep paying for the rest anyway.

Your Gmail already has the answer sitting in it: every receipt, every renewal, every payment confirmation you've ever been sent. This pack shows you how to point Codex or Claude Code at that inbox — read-only — and pull every recurring charge into one list, sorted Keep / Review / Compare / Negotiate.

29-page prompt pack. US$25 once. No subscription.

Not financial advice. Savings aren't guaranteed.
```

- Headline: `Find where you're losing money`
- Description: `29-page pack · US$25 once`
- CTA button: `Learn more`
- Creative: `ai-money-audit-hook-leak-4x5-v1.png` + `ai-money-audit-hook-leak-9x16-v1.png`
  (price-free, so the same asset is correct on a $25 page — see below)

### Resolved: the $19 pricing conflict

The original master (`ai-money-audit-meta-square-v1.png`) burns `START MY MONEY AUDIT — $19` into the
image. That asset is **website-only**: pointing it at a $25 Gumroad page is a misleading-pricing risk
under Meta's advertising policies and it breaks trust the moment the page loads.

Everything built since is **price-free by design**, so one creative set serves both campaigns and
survives any future price change. Keep it that way — put the price in the ad copy, never in the
image.

Attribution for Campaign B stays weak regardless: Gumroad's Pixel fires through its own third-party
analytics integration, and UTMs never reach a Razorpay order note because the sale never touches this
codebase. Campaign B results can only be read off Gumroad's own analytics plus Events Manager.

## Creative assets

All in `assets/ads/`. Background is `#FDFBF3`, matching the site's `--bg: #FFFBF2`, so padded
formats are seamless.

**Session creatives (v2) — the research-backed direction, run these first.** Built by
`scripts/build-ad-creatives.js`. Carries the "is a subscription" hook, an example-output session
card, and the one-time price per destination:

| File | Size | Use |
|---|---|---|
| `ai-money-audit-session-india-4x5-v1.png` | 1080×1350 | **India ad** feed — ₹1,599 once |
| `ai-money-audit-session-india-9x16-v1.png` | 1080×1920 | India Stories/Reels |
| `ai-money-audit-session-us-4x5-v1.png` | 1080×1350 | **US ad** feed — $25 once |
| `ai-money-audit-session-us-9x16-v1.png` | 1080×1920 | US Stories/Reels |

The session card is rendered as HTML, not generated, because image models cannot hold monospace
text and numbers — that is the failure mode that produced the `ʊ`. Every row is marked **Example
output**, uses generic categories rather than real vendors, and shows no total.

**Hook creatives — the v1 direction.** Type-led, price-free, same generator:

| File | Size | Use |
|---|---|---|
| `ai-money-audit-hook-leak-4x5-v1.png` | 1080×1350 | **Ad A1 + B1** feed |
| `ai-money-audit-hook-leak-9x16-v1.png` | 1080×1920 | Ad A1 + B1 Stories/Reels |
| `ai-money-audit-hook-forgot-4x5-v1.png` | 1080×1350 | **Ad A2** feed |
| `ai-money-audit-hook-forgot-9x16-v1.png` | 1080×1920 | Ad A2 Stories/Reels |
| `ai-money-audit-hook-tenmin-4x5-v1.png` | 1080×1350 | Ad A3 feed (reserve) |
| `ai-money-audit-hook-tenmin-9x16-v1.png` | 1080×1920 | Ad A3 Stories/Reels (reserve) |

**Product creatives — price-free, usable on either campaign:**

| File | Size | Use |
|---|---|---|
| `ai-money-audit-product-square-noprice-v1.png` | 1254×1254 | master |
| `ai-money-audit-product-4x5-noprice-v1.png` | 1080×1350 | feed |
| `ai-money-audit-product-9x16-noprice-v1.png` | 1080×1920 | Stories/Reels |

**Website-only — carries `$19` in the image. Never point these at Gumroad:**

`ai-money-audit-meta-square-v1.png` (1254×1254 master), `ai-money-audit-meta-feed-1x1-v1.png`,
`ai-money-audit-meta-feed-4x5-v1.png`, `ai-money-audit-meta-story-9x16-v1.png`.

Upload the matching ratio per placement rather than letting Meta auto-crop — auto-crop cuts either
the headline or the CTA bar.

### Regenerating

New hook, new wording, new colour: edit `VARIANTS` in `scripts/build-ad-creatives.js` and run

    node scripts/build-ad-creatives.js

It renders each variant at 1080×1350 with headless Chrome and pads to 1080×1920 with ffmpeg. A new
hook is a one-line edit, not another round-trip through an image generator.

To rebuild placements from any square master dropped into `assets/ads/`:

    cd assets/ads
    SRC=<your-master>.png
    ffmpeg -y -i "$SRC" -vf "scale=1080:1080:flags=lanczos,pad=1080:1350:0:135:0xFDFBF3" out-4x5.png
    ffmpeg -y -i "$SRC" -vf "scale=1080:1080:flags=lanczos,pad=1080:1920:0:420:0xFDFBF3" out-9x16.png

### Live-ad creatives (green/photo set)

**India ad — clean, imported, ready.** `INDIAN AD.png` → `ai-money-audit-india-4x5-v1.png`
(1080×1350) and `ai-money-audit-india-9x16-v1.png` (1080×1920, blur-fill: flat padding would seam
against the photo background). Price ₹1,599 is correct for `promptpack.tech/finance`.

**US ad — do not run yet.** `~/Downloads/US AD.png` has three defects, deliberately not imported:

1. **`$19` against a `$25` Gumroad page.** The US ad goes to Gumroad, which is listed at **$25**, so
   the creative must say $25. Re-render it — see the regeneration prompt below.
2. **Broken glyph in the subhead.** It reads "Codex or Claude Code **ʊ** organize" where it should
   read "to organize". The India version of the same layout renders this correctly, so it is a
   generation artefact in this file only. It is visible at feed size and looks like a broken ad.
3. **"REAL PROMPTS. REAL SAVINGS."** on the book cover, plus "Save more" in the notepad. Savings
   claims, which docs/gumroad-listing.md forbids and Meta's financial-services policy restricts. The
   India version already solved this — its cover reads "REAL PROMPTS. A CLEARER MONEY STORY."

Neither creative carries "Not financial advice. Savings aren't guaranteed." Add it to the image or
keep it in every primary text — the earlier master had it in the image.

### Regeneration prompt for the US creative

Rebuilds the **India** layout (the known-good render) in USD at **$25**, the Gumroad price.
The US ad's destination is Gumroad, so $25 is the only correct figure for this creative.

```
Create a photorealistic 4:5 vertical advertisement (1080x1350) for a digital prompt pack.

SCENE
A bright, airy desk scene shot slightly from above. Pale stone/marble desk, soft natural
window light from the left, gentle shadows, shallow depth of field with the background
softly blurred. Props: a leafy green plant upper right, a white ceramic coffee mug on a
closed book at mid right, a spiral notepad with a dark green fountain pen lower right, the
edge of a laptop lower left. Calm, premium, editorial styling. Lots of clean white space in
the upper left for type.

STYLE
Modern editorial. Deep forest green (#1B5E3F) as the only accent colour. Headline in a heavy
black condensed sans-serif. Body copy in dark navy-black. Pastel highlight swatches behind
individual headline words. Crisp, high-end, uncluttered.

HEADLINE (top left, very large, 3 lines)
"FIND WHAT'S DRAINING YOUR MONEY EVERY MONTH."
Put a soft MINT GREEN rounded highlight swatch behind the word "DRAINING" and a soft YELLOW
rounded highlight swatch behind the word "MONEY".

TOP RIGHT BADGE
Hand-drawn dark green circle outline around handwritten-style text:
"SAME EMAILS. SMARTER SPENDING."

SUBHEAD (below headline)
Bold line: "Your Gmail already has the receipts."
Regular line beneath it: "Use AI prompts with Codex or Claude Code to organize recurring
charges into one clear review system."

LEFT ICON COLUMN (4 items, each a pastel circle icon with a short label beneath)
1. Mint circle, envelope icon - "Scan your Gmail receipts"
2. Blue circle, document icon - "Find recurring charges"
3. Yellow circle, price-tag icon - "Spot what to keep, review or cut"
4. Pink circle, bar-chart icon - "Make smarter decisions with AI"

CENTRE PRODUCT
A fanned stack of five slim booklets standing upright, angled. Four pastel tabs visible
behind the front cover, labelled top to bottom:
"01 SETUP & OVERVIEW" (mint), "02 GMAIL AUDIT PROMPTS" (blue),
"03 ANALYZE & CATEGORIZE" (yellow), "04 TAKE ACTION TEMPLATES" (pink).

FRONT COVER of the booklet, cream paper, from top to bottom:
- small letter-spaced eyebrow: "PROMPT PACK"
- large black title on three lines: "AI MONEY AUDIT PROMPT PACK"
- small letter-spaced line: "TURN YOUR EMAILS INTO FINANCIAL CLARITY."
- four pastel rounded buttons with thin dark outlines in a 2x2 grid:
  "KEEP" (mint), "REVIEW" (yellow), "COMPARE" (blue), "NEGOTIATE" (pink)
- a row of three small icons with labels: "29-PAGE PROMPT PACK" | "READ-ONLY GMAIL AUDIT"
  | "WORKS WITH CODEX + CLAUDE CODE"
- a thin rule and a small footer line: "REAL PROMPTS. A CLEARER MONEY STORY."

PROP TEXT
- Mint sticky note upper right, handwritten: "HIDDEN COSTS HAPPEN QUIETLY."
- On the mug, small letter-spaced caps: "BETTER HABITS BRIGHTER TOMORROWS"
- On the book under the mug: "A CALMER WALLET A BRIGHTER YOU"
- On the notepad, a handwritten checklist with ticked boxes:
  "Subscriptions", "Bank charges", "Trial renewals", "Service emails", "And more..."

CALL TO ACTION (bottom centre)
A wide deep-green rounded pill button with white bold text: "GET THE PROMPT PACK"
followed by a right arrow.
Directly beneath, centred, with small green sparkle marks either side:
"$25" in large bold black, then "one-time" in smaller regular text.

BOTTOM ROW
Three small icons with labels, evenly spaced:
"29-page prompt pack" | "Read-only Gmail audit" | "Works with Codex + Claude Code"
Beneath a thin rule, small centred letter-spaced caps: "SAME EMAILS. A RICHER YOU."
Under that, small grey text: "Not financial advice. Savings aren't guaranteed."

TEXT ACCURACY - CRITICAL
Render every string above EXACTLY as written, correctly spelled, with no invented words,
no substituted glyphs and no extra text anywhere in the image. In particular the subhead
must read "Claude Code to organize" - the word is "to". Do not put any savings amount,
percentage, currency figure or earnings claim anywhere except the "$25 one-time" line.
```

After generating, check every string by eye before uploading — image models mangle small text,
which is exactly how the `ʊ` in the current US ad happened. Then resize to exactly 1080×1350 and
build the Stories version:

    ffmpeg -y -i "US AD v2.png" -vf "scale=1080:1350:flags=lanczos" ai-money-audit-us-4x5-v2.png
    ffmpeg -y -i "US AD v2.png" -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=42[bg];[0:v]scale=1080:1350:flags=lanczos[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" ai-money-audit-us-9x16-v2.png

### Price by destination — settled

| Ad | Destination | Price on the creative |
|---|---|---|
| US | Gumroad | **US$25** |
| India | `promptpack.tech/finance` | **₹1,599** |

The website carries both US$19 (international card) and ₹1,599 (UPI / Indian card) — that is what
commits `1220a61` and `a662efa` added. That $19 is the *website's* international price and has
nothing to do with the US ad, which sells the Gumroad listing at $25. Do not put $19 on the US
creative.

### Do not run: the "Maverick AI" creative

`~/Downloads/ChatGPT Image Sep 21, 2026, 10_17_32 AM.png` cannot be used for this product:

- **Wrong brand.** It says *Maverick AI*; the destination is PromptPack. Meta requires the ad to
  accurately represent the landing page, and the mismatch kills the click regardless.
- **`$2,340 Estimated Annual Savings`.** A specific savings figure is exactly what
  docs/gumroad-listing.md forbids and what Meta's financial-services policy treats as a prohibited
  claim. This is the single most likely thing in the whole account to get an ad — or the ad account
  — actioned.
- **Spotify and Adobe logos.** Implies a partnership or endorsement that doesn't exist.
- **It shows a SaaS dashboard.** The product is a 29-page PDF of prompts. There is no app, no
  "Savings Potential" screen, no bank-fee analysis — claims must match the PDF and the site.
- **"Catch hidden bank charges."** The pack reads Gmail billing emails, read-only. It never touches
  a bank account.

The hook underneath it — *"You're probably losing money every month"* — is genuinely good, which is
why it survives in Ad A1 as "Find where you're losing money," carried by a creative that doesn't
make any of the above claims.

## Creative direction v2 — the research-backed angle

Researched Sep 2026. Sources at the end of this section.

### What the research changed

**1. Both current creative directions are the format that loses.** The green photo-studio ads and the
neo-brutalist type ads are both unmistakably *designed advertisements*. Polished production signals
"ad" to a feed-trained user and gets scrolled past automatically; raw, native-looking creative is
reported at 2–3x the engagement and CTRs above 3%. This is the single biggest lever available, and
it costs nothing to pull.

**2. We have been fighting on the category's ground, and losing by default.** Every competitor sells
the savings number. We are not allowed to — so "find what's draining your money" is a weaker version
of a claim everyone else makes better. Worse, Meta explicitly prohibits *exploiting financial
distress*, so leaning harder on the money-anxiety framing walks toward the policy line, not away
from it.

**3. The category has two documented weaknesses that are exactly our two strengths.**

- **Bank linking.** Discovery tools require a bank connection — there is no major alternative that
  does discovery without one, because reading transactions is how they work. The manual-entry
  alternatives stay private but cannot find what you forgot. This pack does discovery from Gmail
  receipts, read-only, with no bank connection. That is a real category gap, not a marketing line.
  There is also live, documented distrust: EPIC and the NYU Tech Law and Policy Clinic filed a CFPB
  complaint against Rocket Money over manipulative design.
- **It is itself a subscription.** Rocket Money Premium runs $7–14/month, Premium+ $15/month — $84
  to $180 a year to cancel your subscriptions. Users report being charged after failed cancellation
  attempts, an issue reported as persisting 2024–2026.

### The hook

> **The app that cancels your subscriptions is a subscription.**

It is a verifiable statement about how the category prices itself, so it carries none of the savings
claim risk. It is sharp enough to earn comments and shares, which matters because Meta's 2026
delivery is weighted toward engagement. And it cannot be counter-positioned by the companies it
describes — the pricing model is the product.

Variants:

- "You're paying $15 a month for an app that cancels subscriptions."
- "To find out what you're subscribed to, they want your bank login and a subscription."
- "No bank login. No monthly fee. Just your Gmail and an AI you already pay for."

**Do not name Rocket Money in the ad.** Comparative advertising is permitted, but naming a brand
invites a trademark complaint that can pull the ad mid-flight. "The app that cancels your
subscriptions" is unmistakable and safe.

### The creative: a screenshot, not a design

The format that is native to this product is **a real screenshot of Codex or Claude Code running the
audit.** It is not a designed ad, so it does not read as one. It is proof of the mechanism rather
than a promise about an outcome. It self-selects the audience — anyone who recognises a terminal is
a buyer. And no app competitor can copy it, because they do not have one.

What to capture:

- A genuine Claude Code or Codex session, **actually run** — never a mock-up. Fabricated output
  presented as a real result is a false claim regardless of how accurate it looks.
- The prompt visible at the top, so the mechanism is legible at a glance.
- The output: recurring charges grouped under Keep / Review / Compare / Negotiate.
- **Redact every real vendor name and amount** before it goes anywhere near an ad account — blur or
  substitute. Real billing data must not leave your machine, and third-party brand names in the
  frame create the same endorsement problem as the Spotify/Adobe logos.
- No total. A summed figure is a savings claim.

Then add the minimum framing needed: one line of overlay text at the top carrying the hook, and the
price as "one-time" at the bottom. Nothing else. The screenshot does the work.

### The CTA

Current in-creative CTA is "GET THE PROMPT PACK" — product-centric and generic. The differentiator
against the entire category is **one-time**, so that is what the CTA should carry:

- In-creative: **"Run your first audit tonight — $25 once, not monthly"**
- Ad button: **keep `Learn more`.** One A/B test found it drove 22.5% higher CTR than `Sign Up`,
  which suits a Traffic → Landing Page Views campaign. `Shop Now` and `Download` convert better but
  buy fewer clicks, which is the wrong trade at ₹500.

### Primary text for the v2 ad

```
To find out what you're subscribed to, most apps want two things: your bank login, and a subscription.

That's the part nobody says out loud — the tool that cancels your subscriptions bills you every month to do it.

Your Gmail already has every receipt, renewal and payment confirmation you've ever been sent. This pack is 29 pages of prompts that point Codex or Claude Code at that inbox, read-only, and sort every recurring charge into Keep / Review / Compare / Negotiate.

No bank login. No monthly fee. One-time.

Not financial advice. Savings aren't guaranteed.
```

### Sources

- Meta, [Financial and Insurance Products and Services](https://transparency.meta.com/policies/ad-standards/restricted-goods-services/financial-services/) and [Prohibited Financial Products and Services](https://transparency.meta.com/policies/ad-standards/deceptive-content/prohibited-financial-products-and-services/)
- EPIC, [CFPB complaint re: Rocket Money](https://epic.org/documents/epic-cfpb-complaint-rocket-money/)
- [Rocket Money pricing](https://www.rocketmoney.com/learn/personal-finance/how-much-does-rocket-money-cost) · [Finny, Rocket Money cost 2026](https://getfinny.app/blog/rocket-money-pricing-2026)
- [Finny, privacy-focused alternatives](https://getfinny.app/blog/does-rocket-money-sell-your-data-2026)
- Favoured, [Ugly Ad Creative: Why the Best Meta Ads Look Worse in 2026](https://favoured.co.uk/ugly-ad-creative-2026/) · [Meta Ads Creative Best Practices 2026](https://adlibrary.com/posts/meta-ads-creative-best-practices)
- Databox, [Facebook CTA button performance](https://databox.com/facebook-ad-cta)

## Copy rules

docs/gumroad-listing.md sets the claim policy: claims must match the PDF and the site, and no
savings guarantees. Every ad above ends with "Not financial advice. Savings aren't guaranteed." for
the same reason the creative carries it. Keep it on any new variant. Never write a specific rupee or
dollar saving, a "cancel X subscriptions" promise, or anything implying a guaranteed outcome —
that is both a false claim and a Meta personal-finance policy risk.

## Ad-level QA — walk this before either ad is published

For ads already built in Ads Manager. These are the settings that are most often wrong on a first
build, ordered by how much they cost you.

**1. Optimisation event.** Ads Manager pushes you toward Sales → Purchase. On ₹500 that is the
single most expensive mistake in this list — Meta never exits learning and delivery stays erratic.
Ad set → Optimisation & delivery must read **Landing page views**. If the campaign objective is
Sales, you cannot select it: rebuild the campaign as **Traffic**.

**2. Destination URL carries the UTMs.** Open the ad's Website URL field and confirm the full
query string is there, not a bare domain. Without it, a sale cannot be traced to the ad, because the
UTMs are what ride into the Razorpay order notes.

- India ad → `https://promptpack.tech/finance?utm_source=meta&utm_medium=paid_social&utm_campaign=finance_money_audit&utm_content=leak_v1`
- US ad → `https://khalandarth.gumroad.com/l/MoneyAuditPromptPack?utm_source=meta&utm_medium=paid_social&utm_campaign=gumroad_money_audit&utm_content=leak_v1`

**3. Dataset.** Ad set → Conversion → Dataset must be **PROMPTPACK `2116311975585050`**. The account
also carries Grow Plus datasets; docs/meta-tracking.md says never mix them. Picking the wrong one
silently destroys all measurement.

**4. The US/Gumroad ad must not use a `$19` creative.** Gumroad charges `$25`. Check the attached
image is one of the price-free files — `ai-money-audit-hook-*` or `ai-money-audit-product-*-noprice-*`
— and specifically **not** `ai-money-audit-meta-square-v1.png` or any `…-meta-feed-*` / `…-meta-story-*`.

**5. Gumroad's Pixel is actually installed.** Step 3 of docs/gumroad-listing.md. If it was never
added, the US ad has zero conversion measurement and you are buying clicks blind.

**6. Placements.** Manual, with **Audience Network and Messenger unticked**. On a micro budget
Audience Network's accidental clicks will eat a meaningful share of ₹500.

**7. Budget has a floor and a ceiling.** Daily ₹100 with a **hard end date**, or a ₹500 lifetime
budget. An unbounded daily budget is how a ₹500 test becomes a ₹3,000 one.

**8. Advantage+ audience expansion OFF.** Left on, it ignores your targeting and spends the test
budget discovering an audience you did not choose.

**9. Special Ad Category = None.** This is a digital prompt pack, not a financial product. Selecting
a category here narrows targeting hard for no reason.

**10. CTA button = Learn more**, not Shop now — you are optimising for landing page views, and
Learn more reliably buys cheaper ones.

**11. Both ads carry the disclaimer** in the primary text: "Not financial advice. Savings aren't
guaranteed." Non-negotiable, per docs/gumroad-listing.md.

## What "working" looks like

Check at ₹250 spent, then again at the end. Benchmarks, not promises:

| Signal | Healthy | Worrying |
|---|---|---|
| Link CTR | ≥ 1.0% | < 0.5% → the hook isn't landing; change the creative |
| Cost per landing page view (India) | ≤ ₹12 | > ₹25 → audience too narrow, or creative fatigued |
| LPV → InitiateCheckout | ≥ 8% | < 3% → the page or the price is the blocker, not the ad |
| Purchases | 0–1 is normal at ₹500 | — |

Stop rules:

- **₹250 spent, under 10 landing page views** → kill it, something is misconfigured. Check the URL loads.
- **₹250 spent, good CTR, zero InitiateCheckout** → the ad works, the landing page doesn't. Don't add budget.
- **Good CTR and InitiateCheckout but no sale** → expected at this budget. Record the cost per
  InitiateCheckout; that number is what you use to size a real budget later.

## After the test

The one number worth having at the end is **cost per InitiateCheckout**. Multiply it by a realistic
checkout-to-purchase rate to estimate a true CPA, and use that to decide whether a funded campaign
makes sense. Until then, treat every conclusion drawn from ₹1,000 as a hint, not a finding.

Once a real budget is on the table, implement the server-side CAPI Purchase from the Razorpay
webhook (docs/meta-tracking.md, "Future") — browser-only Purchase under-reports badly on iOS.

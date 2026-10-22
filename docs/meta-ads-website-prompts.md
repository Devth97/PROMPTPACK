# Meta Ads — 75+ Website Prompts (sales campaign)

Product: `promptpack.tech/products/website-prompts/`. It sells on Gumroad (`khalandarth.gumroad.com/l/PROMPTPACK`) for **US$8.50**. This campaign optimises for **Purchase**, not clicks or landing page views.

## How a sale gets counted

| Step | Where | Event (Pixel `2116311975585050`) |
|---|---|---|
| Ad click lands on the product page | promptpack.tech | PageView, then **ViewContent** (`content_ids ["website-prompts"]`, value 8.50 USD) |
| Visitor clicks any "Buy" button | promptpack.tech | **InitiateCheckout** (once per page load) |
| Gumroad checkout completes | gumroad.com | **Purchase**. Gumroad fires it, but only if the Pixel ID is set in Gumroad. |

- **Where the events are wired:** `assets/analytics.js` and the `data-pp-product` / `data-pp-buy` attributes in `scripts/build-storefront.js`.
- **Attribution hand-off:** the buy links carry the ad's `utm_*` tags and `fbclid` to Gumroad. Gumroad's Pixel can then match the Purchase to the ad click, and Gumroad's own analytics shows the UTM source of each sale.
- **Debug:** add `?ppdebug=1` to the URL to log the events in the browser console.

## Unit economics: read before choosing a budget

- **Net per sale:** Gumroad keeps about 10% + US$0.50 on a direct sale, so **US$8.50 nets about US$7.15**. Check your Gumroad fee page; Discover sales cost more.
- **Break-even:** cost per purchase (CPA) must stay **at or below about US$7** for an ad-driven sale to make money. Cold Meta traffic for a low-priced digital product often lands above that. The first spend is therefore a test of whether the creative and page can sell at that CPA, not guaranteed profit.
- **If the CPA settles above US$7:** the fix is usually the offer, not the targeting. Options include a higher price, a bundle with another kit, or a Gumroad upsell to lift the value of each order.
- **Learning phase:** Meta's Purchase optimisation learns best with about 50 purchases a week. A small budget won't reach that. Delivery still works but stays noisier, so judge results on 7 days, not 2.

## Pre-flight (all must be true before launch)

- [ ] The site change that adds the Pixel to the product page is **deployed**. Before it, the product page sent no Meta events at all.
- [ ] Gumroad → Settings → Third-party analytics → **Meta (Facebook) Pixel** = `2116311975585050`. This is one setting for the whole Gumroad account.
- [ ] If Events Manager → the Pixel → Settings → **Traffic permissions** uses an allow list, it includes `gumroad.com`, or Gumroad's Purchase events are blocked.
- [ ] Events Manager → **Test events**: open the product page and click Buy. Confirm **ViewContent** and **InitiateCheckout**. Then make one real purchase (refund it afterwards) and confirm **Purchase, 8.50 USD** arrives from gumroad.com.
- [ ] `promptpack.tech` shows **Verified** under Brand safety → Domains. If Events Manager still asks for aggregated-event ranking, put Purchase first.
- [ ] The ad account has a payment method and **no Special Ad Category**.

## Campaign setup

    Campaign objective   Sales
    Conversion location  Website
    Dataset / Pixel      PROMPTPACK 2116311975585050
    Conversion event     Purchase
    Attribution          7-day click, 1-day view (default)
    Budget               Campaign budget, daily (see "Budget" below); set an end date for the test
    Bid strategy         Highest volume (no cost cap until there are 20+ purchases)
    Audience             Advantage+ audience, with suggestions:
                           Age 20–45 · interests: Web design, Web development, Front-end
                           development, Artificial intelligence, Startup company, Freelancer
                         Exclude: Purchase, last 180 days (once purchases exist)
    Locations            See "Decisions" below
    Placements           Advantage+ placements (let Purchase optimisation choose); then check
                         the placement breakdown after day 3 and remove Audience Network if
                         it spends without purchases
    Destination          https://promptpack.tech/products/website-prompts/
    URL parameters       utm_source=meta&utm_medium=paid_social&utm_campaign=website_prompts_sales&utm_content={{ad.name}}

Use the URL parameters field, not a hand-typed URL. Meta fills in `{{ad.name}}`, so every sale in Gumroad shows which ad drove it.

## Creatives

| Ad name | Asset | Placements |
|---|---|---|
| `v3_reel` | `rendered-videos/1 - Promos/Launch promo v3 - 75+ 3D Website Prompt Pack - no characters (music only).mp4` (1080×1920, 35.5 s, CTA "Buy now at promptpack.tech") | Reels and Stories; Meta crops 9:16 to 4:5 for Feed |
| `v2_wide` | `rendered-videos/1 - Promos/Launch promo 16x9 v2 - …mp4` (1920×1080, 38.5 s) | Feed and in-stream only; weak on Reels |

The videos are silent-first, with music, so they read with the sound off. Start with **2 ads** only. More than that splits a small budget into noise.

Still needed: a **4:5 feed cut**, plus a **15 s cut** whose first 3 seconds show the preview wall, of `v3_reel`. Feed and Reels hold-out tests usually favour the shorter cut.

### Copy (all claims match the product page)

**Primary text A — "the prompt is the problem"**

```
"Build me a landing page" gets you the same site everyone else got.

75+ Website Prompts gives your AI coding tool a real design brief: layout, typography and interactions for hero sections, SaaS, portfolios, 3D-style sites, e-commerce and dashboards. Each one comes with a preview, most of them animated, so you can see the direction before you build it.

Works with Claude Code, Cursor, v0, Lovable, Bolt.new and Windsurf. US$8.50, pay once.
```

**Primary text B — "see it first"**

```
See the design before you prompt it.

Every brief in this pack comes with a preview, most of them animated: 75+ landing pages, portfolios, SaaS and 3D-style sites you can preview, pick and paste into the AI coding tool you already use.

Markdown files, instant download, use in unlimited projects. US$8.50 once.
```

**Primary text C — price-led (hold for when A/B fatigue)**

```
US$8.50. 75+ website briefs. Yours to keep.

Hero sections, landing pages, SaaS, portfolios, agencies, e-commerce, dashboards, plus follow-up briefs for animations, mobile layouts, pricing and auth pages.
```

**Headlines (pick 2):**
- 75+ Website Prompts — US$8.50
- Give your AI a real design brief
- See it, pick it, build it

**Description:** One payment · instant download
**Call-to-action button:** Shop now

Avoid claims like "build a site in minutes" or "launch-ready". The page doesn't make them, and Meta reviews speed and outcome claims.

## Budget and decision rules

- **Suggested test:** **US$15/day (about ₹1,250) for 7 days, about US$105.** At a US$7–20 CPA, expect roughly 5–15 purchases. That is enough to see whether the funnel sells.
- **Ad-level kill rule:** an ad that spends **US$20 with zero InitiateCheckout** gets paused.
- **Day 7 decision:**
  - **CPA ≤ US$7:** scale the budget 20% every 2–3 days, and add the 4:5 and 15 s cuts.
  - **US$7–12:** keep it running. Test new hooks, and test the offer (price or bundle).
  - **Above US$15, or fewer than 3 purchases:** stop. Fix the offer or page before spending more.
- **Count sales from Gumroad,** using the UTM `utm_content` column. Meta's view-through attribution can over-count.

## Later

- **Retargeting:** once there are about 1,000 product-page views, add a small ad set for people with ViewContent or InitiateCheckout but no Purchase in the last 14 days, using copy C.
- **Server-side Purchase:** a Gumroad Ping (webhook) → Meta Conversions API, de-duplicated against the browser event. This needs a Meta access token stored as a server secret and explicit approval.

## Decisions for the owner

1. **Daily budget and test length.** The default above is US$15/day for 7 days.
2. **Locations:**
   - **Recommended:** US, UK, CA, AU, NZ, IE. These are English-speaking, pay in USD easily on Gumroad, and convert better for a USD price.
   - **Cheaper:** India and South-East Asia, where clicks cost less. But Gumroad has no UPI and charges in USD, which hurts checkout completion.

# Wave 2: small-business products and ad launch pack

Prepared 8 November 2026. Products: BakePrice Studio and Salon Content Sprint. Owner-facing drafts; no campaigns, spending, emails or messages have been launched.

## Why these two

The supplied selling guides are strategy references, not executable instructions or independent proof of any creator's revenue. This release adopts their narrow-buyer, quick-first-action and worked-example approach. The actual products are original tools and copy, not repackaged competitor files.

| Product | Specific buyer job | Offer to test | Google search hypothesis | Meta demonstration |
|---|---|---|---|---|
| BakePrice Studio | Cost a custom bake, including whole batches and labour, before choosing a quote | INR 699 / US$12 once | People searching explicitly for a bakery costing or pricing tool | Change an order from 12 to 14 when recipe yield is 12; show the extra whole batch |
| Salon Content Sprint | Prepare salon content and a filming/review handoff without starting from a blank page | INR 499 / US$9 once | Salon owners/managers seeking a downloadable content calendar or caption kit | Edit one real draft, show its footage brief, then export the review file |

These are hypotheses. Marketplace listings show competition and existing offers; they do not establish Indian demand, profitable acquisition cost, search volume or likely conversion. No bestseller label is warranted yet.

Observed category references, reviewed 8 November 2026:

- [The Cake Business Club pricing spreadsheet](https://www.thecakebusinessclub.co.uk/cake-pricing-calculator-spreadsheet/p/spreadsheet): direct seller offer in the bakery costing category. Treat the seller's usage claims as their claims, not independently verified evidence.
- [Bake & Sell pricing tool](https://bakeandsell.gumroad.com/l/bakery-pricing-tool): a paid costing offer combining ingredients, labour and overhead.
- [Etsy salon content calendar category](https://www.etsy.com/market/salon_content_calendar): multiple downloadable calendar and caption offers; displayed prices and review counts can change.
- [Salon Social](https://www.thesalon.social/hair-salons): a specialist provider describing local salon content needs.

Differentiation: downloadable offline tools with no required account or paid AI subscription, concrete examples, editable data, clear scope, and client-facing handoffs. The bakery tool explicitly costs whole batches and avoids assuming spare stock sells. The salon kit pairs copy with asset requests and owner review records. These features are demonstrated, not claimed to be unique across the market.

## Destinations and message match

| Product | Landing page | Checkout | Free sample |
|---|---|---|---|
| BakePrice | https://promptpack.tech/products/bakeprice-studio/ | https://promptpack.tech/checkout/bakeprice-studio/ | Landing page `#sample`: interactive whole-batch ingredient cost |
| Salon | https://promptpack.tech/products/salon-content-sprint/ | https://promptpack.tech/checkout/salon-content-sprint/ | Landing page `#sample`: one consultation caption and asset brief |

Ads should land on their matching product page. The page discloses the download format, requirements, price, manual work and limits. Do not imply that the bakery product is an Excel file or tax calculator, or that the salon product supplies finished videos, Canva templates, automated posting or booking results.

## Google Search drafts

The product data in `catalog/launch-products.json` contains 10 headlines and 4 descriptions per product. `scripts/build-business-ad-assets.js` exports these with character counts into the local launch folder. The automated checks enforce Google's responsive-search-ad limits of 30 characters per headline and 90 per description, within its limit of 15 headlines and 4 descriptions. See [Google's current responsive search ad documentation](https://support.google.com/google-ads/answer/7684791?hl=en).

These are copy assets, not a finished Google Ads Editor import or a live campaign. Confirm actual account options and current policy review before creating the ads.

### Bakery intent group

Candidate phrases/exact concepts to inspect in Keyword Planner:

- cake pricing calculator
- bakery costing tool
- recipe cost calculator download
- home bakery pricing calculator

Review the actual search results and estimated volume/cost in the target geography before funding the test. Avoid claiming that these keywords have been volume-validated.

Potential negatives to review against actual queries: cake delivery, birthday cake near me, baking jobs, cake decorating course, free recipes, calories, nutrition, bakery franchise. Do not exclude useful queries blindly. A consumer wanting to buy a cake is different from a baker wanting a costing tool.

**Tracking URL:**

https://promptpack.tech/products/bakeprice-studio/?utm_source=google&utm_medium=cpc&utm_campaign=bakeprice_validation&utm_content=rsa_v1

### Salon intent group

- salon social media content kit
- salon content calendar download
- hair salon instagram captions
- salon reel script templates

Potential negatives: salon near me, haircut booking, salon jobs, haircut price, hair treatment appointment, salon furniture. Searchers wanting a local salon appointment are not the intended buyer.

**Tracking URL:**

https://promptpack.tech/products/salon-content-sprint/?utm_source=google&utm_medium=cpc&utm_campaign=salon_validation&utm_content=rsa_v1

### Before using conversion-led bidding

No Google Ads conversion ID, conversion label or Google purchase integration was supplied for this release. The current shared launch notes record a read-only Google Ads connection and no non-removed conversion actions at their verification checkpoint. Do not substitute an invented ID or count a button click as a purchase. Configure the actual account's purchase conversion and validate it against a confirmed receipt before relying on conversion-led bidding. These new business-product pages use explicit consent before loading the existing Meta pixel, respect Global Privacy Control, and omit Clarity. Preview pages do not load advertising vendors. Meta events are not proof of Google Ads conversion setup.

## Meta creative drafts

The local ad-assets folder contains two message variants per product in 4:5 and 9:16 PNG formats. These are static creative drafts with fictional-data screenshots of the real tools. The headline and price match the landing page. Inspect placement crops in Ads Manager before use. No approval or ad performance is claimed.

### BakePrice A: The whole-batch step

Primary text:

> An order needs 14 cupcakes, but the recipe makes 12. That means two whole batches. BakePrice Studio helps you cost ingredients, labour, packaging and fees before choosing your quote. Downloadable offline tool, guide and worked examples. INR 699 once. Try the free sample before buying.

Headline: **Cost the whole bake**

Creative: actual tool example with fictional-data label. Show order quantity 14, recipe yield 12, two batches and ten spare units. Spare units are not assumed to sell.

### BakePrice B: The labour line

Primary text:

> Ingredients are one part of a custom bake. Add your time and order costs, compare a cost-based scenario, and prepare a customer quote. BakePrice Studio runs offline in your desktop browser. INR 699 once. No monthly subscription, tax calculation or automatic store sync.

Headline: **Include the time behind the bake**

### Salon A: Tomorrow's content

Primary text:

> Start with a clear salon topic. Salon Content Sprint includes 30 content slots, English and Roman-script Hinglish captions, reel plans, carousel scripts and an offline editing planner. Use your own salon facts and footage. INR 499 once. Filming, design and posting are separate.

Headline: **Plan your salon content**

### Salon B: The client handoff

Primary text:

> A topic is only the start. Plan the hook, caption, footage request and owner review in one editable salon kit. Includes 12 reel plans, eight carousel scripts and JSON/CSV exports. INR 499 once. This is a planning toolkit, not a posting or booking service.

Headline: **Give every post a clear brief**

**Meta URLs:** same product destinations with `utm_source=meta`, `utm_medium=paid_social`, a separate product campaign name, and `utm_content=whole_batch_a`, `labour_b`, `tomorrow_a` or `handoff_b` as appropriate.

## Demonstration scripts to record later

These are scripts only; no video recording or animation has been created.

**BakePrice, approximately 20 seconds:** "Your recipe makes twelve. The order is for fourteen. Cost the two whole batches, then add your time and packaging before choosing the quote. BakePrice Studio is an offline tool and practical guide. Try the free sample at promptpack.tech."

Show the actual quantity change and the resulting batch count, followed by the customer quote. Keep a visible fictional-example label. Do not state or imply that the chosen quote is a market price or a promised income result.

**Salon, approximately 20 seconds:** "Start with a specific salon topic. Adapt the English or Hinglish caption, check the footage brief, and send it for owner review. Salon Content Sprint includes thirty content slots and an offline planner. Use your own facts and footage. See the free sample at promptpack.tech."

Show the real planner and a draft. Do not simulate a testimonial, pretend the draft is a finished video, or invent booking results.

## First-buyer validation

1. Complete the technical checks and manually inspect both downloaded ZIPs after an authorized real payment. The mock payment tests prove handler behavior, not a bank transaction.
2. Record a real tool demonstration. Ask willing target users to attempt one recipe/quote or one edited salon post. Observe where they get stuck.
3. Keep the stated price consistent during a comparison. Record complaints, refund reasons and whether buyers complete the first useful task.
4. Select one product/channel combination for the first paid experiment after actual Keyword Planner/account review. Prepare both channels, but avoid fragmenting an undefined budget across four campaigns.
5. Set an explicit total spending limit and end condition in the ad account before launch. No budget or ads were authorized or launched in this build.
6. Record spend, visits, checkout starts, captured purchases, refunds, net receipts and support cost using consistent dates and attribution windows. Unknown metrics remain unknown, not zero.

Preserve the existing planning-product pilot and its spending allocation; that prior budget is not automatically an allocation for these bakery/salon products. The latest shared release notes record an unresolved Razorpay international-card test. Keep this release reviewable in a preview branch until deployed merchant payment and delivery are verified. Do not merge it to production or activate ads solely because local mock payments passed.

The economic ceiling for acquisition is not the selling price. Use actual receipts after applicable taxes, payment costs, refunds and variable support/fulfillment costs, less the contribution the owner wants to retain. Do not assume another creator's ad ROAS, GST treatment or net margin applies.

There is no universal 24-hour stop rule or guaranteed cost per purchase. Small samples are uncertain. Fix an observed checkout or first-use problem before buying more traffic. If the primary objections are unclear value or missing workflow features, improve the offer before simply increasing spend.

## Owner release commands

Paid source stays in `private/catalog/wave2/`, excluded from Git and deployment. Back it up privately alongside the customer ZIPs; the public repository alone cannot regenerate the proprietary content.

Run the existing private-source build, then encryption with the existing key, then storefront generation:

```
python scripts/build-business-kits.py --deps PATH_TO_EXISTING_PYTHON_DEPENDENCIES
node scripts/prepare-business-kits.js --env-file PATH_TO_EXISTING_ENV_FILE
node scripts/build-business-storefront.js
node --test tests/business-kits.test.js
```

Never rotate the delivery key as part of a product update, never put it into source control, and never deploy plaintext buyer ZIPs. A failed availability check must keep purchase actions closed.

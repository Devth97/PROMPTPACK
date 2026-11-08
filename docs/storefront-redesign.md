# Storefront and planning-product redesign

8 November 2026. Requested: bring every product into a three-column catalog near the top of the homepage; improve the two planning kits' covers, product visuals, copy and conversion flow.

The homepage catalog appears directly after the introduction and before the ProfitPulse feature and store tour. It lists all eight products exactly once. Desktop uses three columns, tablet two, and narrow phones one. Search and interest filters work together, show the result count and empty state, and reset together. Existing homepage category anchors remain usable.

Conversion choices: outcome-led descriptions, comparable cards with visible prices, low-commitment links to inspect the contents, real workbook previews, explicit formats and requirements, FAQs and repeated purchase links. No fabricated testimonials, urgency, scarcity, discounts or performance promises. No conversion-rate improvement is claimed without sales data.

Wedding uses forest green/coral stationery illustrations; Two Homes uses blue/yellow paper illustrations. Four generated images are compressed WebP assets, each under 150 KB at 1200 by 800. Concept art is labeled separately from actual fictional-example workbook previews. These are digital files, with no physical stationery shipped.

Canonical sources: `scripts/storefront-catalog.js`, `scripts/planning-page.js`, and `scripts/build-planning-products.js`. Rebuild with `node scripts/build-planning-products.js`; update only the homepage with `node scripts/build-storefront-grid.js`. The full legacy catalog builder also applies the same homepage upgrade. Paid archives are not rebuilt by these commands.

Payment handlers, keys, prices, readiness gates, protected delivery and tracking policies are unchanged. Both planning kits retain separate INR 2,999 and USD 49 options. This presentation update does not resolve or reclassify the prior processor test failures. Campaigns remain paused.

Validation: 38 focused catalog, conversion, hero, planning, privacy and ProfitPulse checks passed. Browser QA covered the product and checkout routes at 320/390 pixels, the two-column tablet catalog at 768 pixels, and three-column desktop at 1440 pixels. Search, category selection, empty results, reset, FAQ expansion and product-to-checkout navigation worked. A legacy no-wrap hero rule was overridden to prevent phone overflow. Planning checkout buttons enabled against the existing handlers in the local mock-server harness; no real payment was performed for this design change.

The full legacy suite was also attempted: unrelated payment checks lack local fulfillment secrets, two starter checks lack ignored private source fixtures, and an unchanged free-template text assertion fails. The whole suite is not claimed green. Payment handlers and encrypted archives have no diff. Homepage rebuilding is idempotent and `git diff --check` passes.

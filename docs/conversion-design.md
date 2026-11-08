# PromptPack conversion design, 8 November 2026

## Design contract

Keep PromptPack's cream, ink and colorful editorial identity. Lead with the buyer's task, show the product working, state the actual files and requirements, and make the next step easy to recognize. The bakery and salon products receive warm, tactile editorial photography plus real tool screenshots. Generated photography is conceptual artwork, never a customer result or a picture of the delivered software.

Use guided choice, specificity, visible examples, consistent primary actions, honest price framing and accessible reassurance. Do not fabricate reviews, customer counts, urgency, discounts, awards, earnings, guarantees or scarcity. Do not hide refund conditions or tool requirements. Product availability checks and consent controls remain authoritative.

Hypotheses: clearer entry points should reduce wrong-product visits; real screenshots should help buyers judge the files; task-based comparisons should clarify value; nearby requirements and support links should reduce uncertainty. These are design hypotheses, not measured conversion gains.

Research consulted: [NN/G product-page guidance](https://www.nngroup.com/articles/ecommerce-product-pages/), [recognition rather than recall](https://www.nngroup.com/articles/recognition-and-recall/), and [Baymard product-page research](https://baymard.com/research/product-page). No uplift percentage is asserted from these sources.

## Generated visual assets

Mode: built-in Imagegen. Two separate new-image generations; no CLI/API-key fallback. Original PNGs are retained privately in product-build/launch-wave2. Responsive final site assets:

- assets/product-art/bakeprice-studio-v1.webp and bakeprice-studio-720-v1.webp
- assets/product-art/salon-content-sprint-v1.webp and salon-content-sprint-720-v1.webp

### BakePrice prompt

Use case: product-mockup. Create one exceptional premium editorial cover photograph, landscape 3:2, for BakePrice Studio, an offline recipe costing and customer quote digital toolkit for home bakers. Art direction: warm ivory paper, burnt sienna, pale apricot, restrained dark cocoa accents, sophisticated independent food magazine photography. A sunlit bakery worktable arranged with an artisan vanilla cupcake with a beautiful swirl, a small brushed steel weighing scale with a BLANK unlit display, a ceramic bowl with flour, measuring spoon, folded linen, a simple unbranded cake box. Beautiful tactile materials, soft directional window light, natural shallow shadows, elevated but credible small bakery scene. Compose the objects mostly across the right two thirds, with substantial calm ivory negative space in the left third and upper edge for real HTML typography to be added later. Slightly elevated three-quarter view, extremely polished photographic detail, clean uncluttered composition, not a collage or infographic. This is a conceptual cover illustration, not proof of a customer outcome. NO text, NO letters, NO numbers, NO logos, NO watermark, NO fake software interface, NO money, NO people. Produce the photograph only.

### Salon prompt

Use case: product-mockup. One exceptional premium editorial cover photograph, landscape 3:2, for Salon Content Sprint, a downloadable content planning toolkit for independent salon owners and social media freelancers. Sophisticated brand art direction: warm cream, dusty lavender, aubergine, muted sage, brushed chrome. A calm contemporary independent hair salon in soft morning window light: sculptural empty salon chair, beautiful arched mirror, understated counter, closed blank lavender notebook and one elegant metal comb on the counter. Tactile stucco wall, subtle reflections, refined realistic materials, original high-end interiors editorial photography. Compose visual interest mainly in the right two thirds and leave uncluttered creamy negative space in left third and upper edge for real HTML typography added later. Intimate human-scale room, not a luxury hotel lobby. No people, no customer photos, no screens, no generated user interface, no letters, no text, no numbers, no logos, no watermark. This is a conceptual cover image, not a photograph of a named salon or a customer result. Produce only the photograph.

## Verification and release

Review at desktop and narrow mobile widths, with actual and unavailable checkout states, consent accepted/rejected, keyboard focus and reduced motion. Product links must match the server-owned prices. Paid ZIPs remain private. No new tracking event is treated as a purchase without an existing verified receipt.

Work continues in draft PR 7. Preserve merchant verification and campaign holds. Before measuring conversion, validate real payment/delivery and actual platform attribution; compare the same product, price, channel and time window. Do not claim a sales increase from a screenshot or a successful build.

## Implemented and checked

The homepage now names business tasks alongside creator projects, and both business cards have responsive editorial images. Shared navigation exposes Business kits; the shared footer explains purchase review and download support. Both business product and checkout pages use the new covers. Actual tool previews, a three-step workflow and existing free samples clarify what is delivered. Both buyer PDF covers use the same artwork; guide lengths remain six and eight pages. Compressed archives are approximately 184 KB and 181 KB.

Validation: 45 focused automated checks pass. Four mock INR/USD purchases return ZIPs matching their server hashes. Seven routes were checked at 1440 px and 390 px, including an unavailable product state; no horizontal overflow was found. Both PDF contact sheets were visually reviewed. Browser review uses reduced motion and rejects optional cookies; consent acceptance, withdrawal and purchase attribution are covered by the focused tests. Real processor transactions, ad spending and conversion lift were not tested in this design update.

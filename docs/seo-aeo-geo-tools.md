# PromptPack SEO AEO and GEO tools

Researched 21 October 2026. This plan covers search engine optimization (SEO), answer engine optimization (AEO) and generative engine optimization (GEO). Start with the existing static generator and tests, add Unlighthouse for browser audits and lychee for links, then choose one analytics service. Pilot AI citation tracking only after establishing a question set and baseline. The choices below are recommendations for this repository; upstream features and licenses were checked in primary documentation, but these third-party tools have not been installed or benchmarked here.

## What matters for PromptPack

The useful lesson from the supplied screenshots is to answer specific buying questions and explain differences clearly. The post's reported 131 users and attribution claims are one creator's account; they do not establish PromptPack's likely results or how an engine ranks sources.

Google says ordinary SEO practices apply to its generative search features. It ignores llms.txt for ranking and does not require special AI markup. Keep the existing text catalog accurate, while prioritizing visible product facts, useful guides and ordinary HTML links. [Google AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

The repository already supplies static HTML, canonical URLs, Product/Offer and Organization markup, FAQs, a sitemap and optional text catalogs. Its existing Node tests cover checkout prices and many local links. A new SEO framework or WordPress plugin would duplicate this foundation.

## Core audit tools

| Tool and primary source | License | Job | Fit and operating requirements |
| --- | --- | --- | --- |
| [Unlighthouse](https://github.com/harlan-zw/unlighthouse) | MIT | Discover pages and run Lighthouse across a site | First browser audit choice. Requires Node and a browser; use a small page sample during video rendering. Scores are lab diagnostics, not ranking measurements. |
| [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) | Apache-2.0 | Save repeatable audits and detect regressions | Add after a baseline exists. Use explicit public URLs and filesystem reports. It overlaps with Unlighthouse; it need not be a second full crawl. |
| [lychee](https://github.com/lycheeverse/lychee) | MIT OR Apache-2.0 | Check links in HTML and Markdown | Add for public pages and external citations. Supports offline checks. Restrict inputs to public content rather than recursively scanning paid files, caches and video projects. |
| [SEOnaut](https://github.com/StJudeWasHere/seonaut) | MIT | Crawl links, redirects, headings and duplicate/missing metadata | Optional visual crawl dashboard. Self-host separately using its documented stack; unnecessary for each small edit. |
| [Nu Html Checker](https://github.com/validator/validator) | MIT | Validate generated HTML | Useful release check, especially for headings, table markup and nesting. Use its CLI/service on public HTML. HTML validity alone does not validate product claims or rich-result eligibility. |

Unlighthouse's documented one-off command is `npx unlighthouse --site https://promptpack.tech`. It executes the version resolved by npm; for recurring automation, select and pin a tested version first. Store reports beneath the already excluded `output/seo/` directory. [CLI documentation](https://unlighthouse.dev/integrations/cli)

Lighthouse CI can write local reports instead of uploading them publicly. Explicit URLs avoid accidentally discovering local internal folders. Its configuration supports repeated runs, assertions and filesystem output. [Lighthouse CI configuration](https://googlechrome.github.io/lighthouse-ci/docs/configuration.html)

## Content and structured data tools

| Tool and primary source | License | Job | Decision |
| --- | --- | --- | --- |
| [advertools](https://github.com/eliasdabbas/advertools) | MIT | Python analysis of crawls, robots rules, sitemaps and marketing data | Optional when joining larger crawl or search exports. Reuse an isolated environment; no need to add Python to the public site. |
| [Trafilatura](https://github.com/adbar/trafilatura) | Apache-2.0 for current versions | Extract main text and metadata from HTML | Optional check that a guide's answer survives text extraction. It cannot demonstrate what every assistant retrieves. Versions before 1.8 used a different license. |
| [schema-dts](https://github.com/google/schema-dts) | Apache-2.0 | TypeScript definitions for Schema.org JSON-LD | Defer: this repository uses plain JavaScript and already constructs JSON-LD. Type checking is useful if that code moves to TypeScript; it is not a runtime schema or rich-result validator. |

For current code, keep schema and visible answers generated from the same catalog facts. Check price, currency, included files, setup and exclusions. Visible comparison tables and complete answers are useful to buyers; markup cannot make unsupported claims accurate.

## Analytics and rankings

| Tool and primary source | License | Job | Cost or dependency |
| --- | --- | --- | --- |
| [Umami](https://github.com/umami-software/umami) | MIT | Referrers, landing pages and conversion events | Recommended if a new lightweight analytics service is needed. Self-hosting requires a server and PostgreSQL; hosted plans and infrastructure can cost money. |
| [Matomo](https://github.com/matomo-org/matomo) | GPL-3.0-or-later | A broader self-hosted analytics platform | Alternative to Umami, requiring PHP and MySQL/MariaDB. Choose one; do not install both for the same measurement need. |
| [GoAccess](https://github.com/allinurl/goaccess) | MIT | Analyze web access logs | Optional for crawler and HTTP diagnostics if hosting provides suitable logs. Usually run through Linux/WSL or a separate server. A bot request proves access, not a recommendation. |
| [SerpBear](https://github.com/towfiqi/serpbear) | MIT | Track a chosen set of Google keyword positions | Optional after query priorities are validated. Check its current SERP provider integration and quotas; open-source application code does not make search data free. |

Keep search impressions, AI mentions, citations, referral visits and verified purchases separate. A checkout click is not a purchase. Existing Meta tracking is advertising instrumentation and does not by itself supply a complete organic/AI attribution baseline.

## AI answer and citation tools

| Tool and primary source | License | Job | Decision and limits |
| --- | --- | --- | --- |
| [CiteGEO](https://github.com/ankit373/citegeo) | MIT | Self-hosted question runs with saved answers, brand mentions and cited sources | First purpose-built pilot candidate. Its API quick start needs Node 22+ and at least one provider key. Review the provider/search mode and saved evidence before trusting aggregate scores. |
| [Elmo](https://github.com/elmohq/elmo) | MIT | AI visibility dashboard with mentions, citations and competitor comparison | Alternative pilot if a fuller dashboard is needed. Its providers and scraping integrations have separate setup and possible costs. Do not deploy alongside CiteGEO until a concrete need emerges. |
| [promptfoo](https://github.com/promptfoo/promptfoo) | MIT | Repeatable model evaluations and assertions | Useful for checking whether models describe actual product inclusions correctly. General model evaluation does not measure consumer search visibility. Keep context-supplied tests separate from open-web discovery tests. |

These are upstream capabilities, not local security or accuracy certifications. CiteGEO and Elmo deserve a small functional pilot before recurring use. Provider API answers can differ from logged-in consumer interfaces. Record the exact model, search setting, locale, date, successful response count and citation URLs. Provider keys, search/scraping services, hosting and model usage may incur costs even when the application license is free.

Start with 12 buyer questions and three independent repetitions per question on each selected surface: 36 answers per surface per observation window. Examples:

- Which PromptPack kit helps design a six-slide carousel?
- Carousel Studio vs Carousel Workflow Kit: which one includes approval tools?
- Does Carousel Workflow Kit publish without my own Meta setup?
- Can I make recurring character reels on my computer?
- What does Juno & Pixel include, and what must I install separately?
- Does the Video Shot Prompt Library include finished videos?

Include both branded and unbranded questions, and report their results separately. Brand mentions are not necessarily citations; citations are not visits or sales. Count unsuccessful runs separately rather than interpreting them as zero visibility. Do not supply PromptPack's own content to a model and then report its answer as evidence of independent discovery.

The remaining questions should come from real search impressions, support questions and the existing editorial question map. Do not represent an editorial question list as measured keyword volume.

## Free services that complement open source

Google Search Console and Bing Webmaster Tools provide owner-specific indexing and search evidence that an independent crawler cannot reproduce. They are external services, not open-source software. Use the owner's existing accounts for indexing checks, query impressions and sitemap status. Google's current guide points to its generative AI performance reporting; inspect the reports available to the actual property rather than assuming account access here. [Google guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

Google's Rich Results Test and the Schema.org validator are useful external checks, also separate from this open-source shortlist. Neither a successful structured-data check nor a permissive robots file guarantees indexing or citations.

## Work completed locally

The generator now describes the actual Juno & Pixel engine and the carousel kit's Instagram API starter. Product FAQ answers include catalog outcomes and exact exclusions, with matching visible text and JSON-LD. Three buyer guides address the screenshot-inspired questions: carousel kit comparison, prompt pack versus video generator, and making local character reels. They use current catalog prices/counts and are linked from relevant products, the blog index, sitemap and optional text catalog. Their source is `scripts/guides.js`; rebuild with `node scripts/build-catalog.js`.

The guides carry a product-facts review date and an organizational author. No publication date is invented before deployment. The old October 19 handoff files remain draft reference material; their old product name and price snapshots must not overwrite current catalog data. Three other draft guides remain outside this pass.

Run the focused checks with `node --test tests/seo.test.js`. Run the full existing catalog, storefront, product-edition, payment and checkout suites before release. New third-party tools, accounts, analytics tags and recurring paid API runs have not been installed or activated by this research.

Validation in this pass: all 36 tests passed, and repeated builds produced identical output across 17 checked discovery/product files. Automated Chrome and Edge launches timed out in this environment, so mobile/desktop visual review remains a release check. The research fetcher also could not establish live indexing or citation performance.

## Next release checks

1. Review the new guide layouts on mobile and desktop and run one Unlighthouse baseline on representative public pages when video rendering leaves browser capacity available.
2. Deploy through the existing release process, then verify actual HTTP responses, canonicals, links and applicable structured data. The research fetcher retrieved the homepage but could not fetch the blog and character product paths; that tool result does not establish a site failure.
3. Inspect indexing in the owner's search accounts and record the actual publication date. Add `datePublished` only when that date is known.
4. Establish analytics and the fixed citation-question baseline, then compare like-for-like observation windows. Prioritize corrections from actual misunderstandings and buyer questions over adding more tools.

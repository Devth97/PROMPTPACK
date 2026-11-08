# Practical blog library

The dedicated hub is `/blog/practical-guides/`, with 100 separate article URLs across ten topics. Each article contains an explained fictional example, a review check and an optional drafting prompt. The existing blog links to the hub; articles link to related posts and relevant existing product or learning pages.

Edit `catalog/blog-articles.json` and `catalog/blog-examples.json`. Run `node scripts/build-blog-library.js` to rebuild the hub, articles, RSS feed, blog card and sitemap entries. The normal catalog build calls the same generator and updates the text discovery catalogs. Publication dates are omitted until a production release is recorded; examples are not customer results.

Validation: `node --test tests/blog-library.test.js tests/search-discovery.test.js tests/seo.test.js tests/storefront.test.js`. Local browser review covered the hub and one article from each of the ten topics at 1440 px and 390 px. Search, reset, no-JavaScript reading, copy success/failure and horizontal overflow were checked.

## Search submission

Robots permits public crawling and references `https://promptpack.tech/sitemap.xml`. The sitemap contains one canonical entry for the hub and each article. `feed.xml` lists the hundred articles. These provide discovery, not proof of indexing.

The intentionally public `indexnow-verification.txt` is an ownership-verification file. `node scripts/submit-blog-indexnow.js` prepares the notification without submitting. `node scripts/submit-blog-indexnow.js --submit` first verifies that production serves the matching ownership file and all 102 exact reviewed blog pages, then notifies IndexNow. It refuses preview, missing or changed content. HTTP 200 or 202 is recorded as notification receipt, never as confirmed indexing.

Google Search Console submission requires the authorised property account. Browser account access was unavailable during this session. Submit the canonical sitemap through the verified property and inspect the hub and representative article URLs when access is restored. Do not use Google's restricted job/live-stream Indexing API for general blog posts or old sitemap-ping endpoints.

References: [Google crawl requests](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl), [IndexNow verification and notifications](https://www.indexnow.org/documentation).

The release is independent of the unreleased business-toolkit branch. Checkout, payment amounts, paid bundles and existing non-blog pages are outside this change.

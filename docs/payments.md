# Payments: Razorpay checkout + paid download

## Flow
1. `/finance` → CTA → `POST /api/create-order` (server picks the price, tags the order `notes.product = ai-money-audit-prompt-pack`).
2. Razorpay Checkout popup opens on the same page (no separate paywall page).
3. On success the browser calls `POST /api/verify` → server checks the payment signature, confirms with Razorpay that the order is **ours** and **paid**, then returns a signed, expiring token.
4. Redirect to `/finance/thanks#t=<token>`. The page strips the token from the URL, shows the download button (`/api/download?t=…`) and fires Meta **Purchase** once.
5. Backup: `POST /api/razorpay-webhook` (event `order.paid`) emails the buyer a link to the thank-you page via Resend.

The Razorpay account is shared with other businesses (Ornalens, Grow Plus). Webhooks and signatures are account-wide, so
every check filters on `notes.product`. Never remove that check.

## The PDF
`private/pack.enc` is the PDF encrypted with AES-256-GCM. It is safe to commit (and Vercel may serve the ciphertext — useless without the key).
The key lives only in `DOWNLOAD_FILE_KEY`. To (re)build it from a new PDF:

    node scripts/encrypt-pdf.js "MONEY AUDIT TOOLKIT/<file>.pdf"

The plain PDF and `.env.local` are git-ignored. Never commit the plain PDF; never `git add .`.
If you change the PDF, re-run the script with the **same** key (it reuses `.env.local`), commit `private/pack.enc`.

## Vercel environment variables (Project → Settings → Environment Variables, Production + Preview)
| Name | Value |
|---|---|
| `RAZORPAY_KEY_ID` | Razorpay key id (test first, then live) |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret — **never in chat/git** |
| `RAZORPAY_WEBHOOK_SECRET` | the secret you type when creating the webhook |
| `DOWNLOAD_SIGNING_SECRET` | from `.env.local` |
| `DOWNLOAD_FILE_KEY` | from `.env.local` (64 hex chars) |
| `PRICE_AMOUNT` | smallest currency unit, e.g. `1900` = $19.00 / `159900` = ₹1,599 (default `1900`) |
| `PRICE_CURRENCY` | `USD` or `INR` (default `USD`) |
| `RESEND_API_KEY` | optional, for the backup email |
| `EMAIL_FROM` | optional, e.g. `PromptPack <orders@promptpack.tech>` (domain must be verified in Resend) |
| `SITE_URL` | optional, default `https://promptpack.tech` |
| `TOKEN_TTL_DAYS` | optional, default `7` |

Changing the price also means changing the displayed price in `finance/index.html` and `assets/finance-config.js`.
USD charges need Razorpay international payments enabled.

## Razorpay dashboard
- Webhook URL: `https://promptpack.tech/api/razorpay-webhook`, event **`order.paid`**, secret = `RAZORPAY_WEBHOOK_SECRET`.
- Keys: Account & Settings → Website and app settings → API keys. Test-mode keys first.

## Tests
    node --test tests/payments.test.js     # API against a mock Razorpay
    node tests/dev-server.js               # site + mock on http://localhost:4180 (uses .env.local for the file key)

Not covered locally: the real Razorpay popup, real Razorpay signatures/webhook delivery, and Vercel's raw-body handling for the
webhook (`config.api.bodyParser = false`). Verify these with one test-mode purchase on a Vercel preview.

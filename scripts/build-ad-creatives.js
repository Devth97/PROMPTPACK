#!/usr/bin/env node
/*
 * Builds Meta ad creatives from the site's own design system (finance/index.html palette),
 * so a new hook is a text edit, not a new trip to an image generator.
 *
 *   node scripts/build-ad-creatives.js
 *
 * Renders at 1080x1350 (4:5, primary feed) with headless Chrome, then pads to 1080x1920
 * (9:16, Stories/Reels) with ffmpeg. Output: assets/ads/.
 *
 * Two creative families:
 *   HOOKS    type-led hook cards, price-free (v1 direction)
 *   SESSIONS the v2 direction from docs/meta-ads-launch.md — a session card carrying the
 *            "cancels your subscriptions / is a subscription" hook, priced per destination.
 *
 * The session rows are LABELLED EXAMPLE OUTPUT and use generic categories, never real vendor
 * names, logos or a summed total. A total would be a savings claim; real brands would imply an
 * endorsement. The landing page uses the same illustrative convention.
 * Claims follow docs/gumroad-listing.md: match the PDF and the site, never promise savings.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const OUT = path.join(__dirname, '..', 'assets', 'ads');
const BG = '#FDFBF3'; // matches the existing master + the site's --bg (#FFFBF2)

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((p) => fs.existsSync(p));

const HEAD = `<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Figtree:wght@600;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">`;

const ROOT = `:root{--bg:${BG};--ink:#0B0B0F;--mute:#4b4b55;--pink:#F598F2;--yellow:#FFE14D;--mint:#A8F0C6;--blue:#9DCBFF;--coral:#FF9F8E}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1080px;height:1350px;overflow:hidden}
  body{background:var(--bg);color:var(--ink);font-family:'Figtree','Arial Black',system-ui,sans-serif;
    background-image:radial-gradient(rgba(11,11,15,.09) 2px,transparent 2px);background-size:34px 34px;
    display:flex;flex-direction:column}`;

/* ---------------------------------------------------------------- HOOKS (v1) */

const HOOKS = [
  { id: 'leak',   headline: 'FIND OUT WHERE YOU&rsquo;RE <em class="pink">LOSING MONEY</em> EVERY MONTH.', kicker: 'WITHOUT OPENING A SINGLE BANK STATEMENT' },
  { id: 'forgot', headline: 'YOU&rsquo;RE STILL PAYING FOR THINGS YOU <em class="yellow">FORGOT ABOUT</em>.', kicker: 'THE CHARGES THAT RENEW QUIETLY, EVERY MONTH' },
  { id: 'tenmin', headline: '<em class="mint">10 MINUTES</em> TO SEE EVERY RECURRING CHARGE YOU PAY.', kicker: 'USING AN AI YOU ALREADY HAVE OPEN' },
];

const hookPage = (v) => `<!doctype html><html><head>${HEAD}<style>
  ${ROOT}
  body{padding:64px 60px 56px}
  .eyebrow{display:inline-block;align-self:flex-start;background:var(--blue);border:5px solid var(--ink);
    box-shadow:7px 7px 0 var(--ink);padding:12px 20px;font-weight:900;font-size:25px;letter-spacing:.04em;text-transform:uppercase}
  h1{font-family:'Archivo Black','Arial Black',sans-serif;font-weight:400;
    font-size:88px;line-height:1.14;letter-spacing:-.02em;text-transform:uppercase;margin-top:36px}
  h1 em{font-style:normal;line-height:1;padding:2px 12px;border:5px solid var(--ink);box-decoration-break:clone;-webkit-box-decoration-break:clone}
  h1 em.pink{background:var(--pink)} h1 em.yellow{background:var(--yellow)} h1 em.mint{background:var(--mint)}
  .kicker{margin-top:26px;font-weight:900;font-size:27px;letter-spacing:.05em;color:var(--mute);text-transform:uppercase}
  .kicker::before{content:"";display:block;width:132px;height:9px;background:var(--ink);margin-bottom:20px}
  .body{margin-top:30px;font-weight:600;font-size:32px;line-height:1.34;max-width:940px}
  .body b{font-weight:900}
  .chips{margin-top:auto;display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .chip{border:5px solid var(--ink);box-shadow:7px 7px 0 var(--ink);padding:18px 22px;
    font-family:'Archivo Black','Arial Black',sans-serif;font-size:38px;text-transform:uppercase}
  .chip:nth-child(1){background:var(--mint)} .chip:nth-child(2){background:var(--yellow)}
  .chip:nth-child(3){background:var(--blue)}  .chip:nth-child(4){background:var(--pink)}
  .cta{margin-top:40px;background:var(--coral);border:6px solid var(--ink);box-shadow:10px 10px 0 var(--ink);
    border-radius:70px;padding:28px 0;text-align:center;
    font-family:'Archivo Black','Arial Black',sans-serif;font-size:46px;text-transform:uppercase}
  .foot{margin-top:26px;text-align:center;font-weight:600;font-size:21px;color:var(--mute)}
</style></head><body>
  <span class="eyebrow">29-page AI Money Audit Prompt Pack</span>
  <h1>${v.headline}</h1>
  <p class="kicker">${v.kicker}</p>
  <p class="body">Connect Gmail to <b>Codex</b> or <b>Claude Code</b> &mdash; <b>read-only</b>. Your AI agent
     reads your billing emails and sorts every recurring charge into:</p>
  <div class="chips"><div class="chip">Keep</div><div class="chip">Review</div><div class="chip">Compare</div><div class="chip">Negotiate</div></div>
  <div class="cta">Start my money audit &rarr;</div>
  <p class="foot">One-time purchase &middot; Not financial advice. Savings aren&rsquo;t guaranteed.</p>
</body></html>`;

/* ------------------------------------------------------------- SESSIONS (v2) */

const rows = (c) => [
  ['KEEP',      'mint',   'Cloud storage',      `${c.sym}${c.a1}/mo`, 'used daily'],
  ['REVIEW',    'yellow', 'Streaming service',  `${c.sym}${c.a2}/mo`, 'not opened in 4 months'],
  ['COMPARE',   'blue',   'Broadband plan',     `${c.sym}${c.a3}/mo`, 'cheaper tier on same network'],
  ['NEGOTIATE', 'pink',   'Insurance renewal',  `${c.sym}${c.a4}/yr`, 'up 18% vs last year'],
];

const SESSIONS = [
  { id: 'india', price: '&#8377;1,599', sym: '&#8377;', a1: '149', a2: '499', a3: '1,099', a4: '18,400' },
  { id: 'us',    price: '$25',          sym: '$',       a1: '2.99', a2: '15.99', a3: '60', a4: '1,240' },
];

const sessionPage = (v) => `<!doctype html><html><head>${HEAD}<style>
  ${ROOT}
  body{padding:56px 52px 48px}
  h1{font-family:'Archivo Black','Arial Black',sans-serif;font-weight:400;font-size:71px;line-height:1.16;
    letter-spacing:-.025em;text-transform:uppercase}
  h1 em{font-style:normal;line-height:1;padding:2px 12px;background:var(--yellow);border:5px solid var(--ink);
    box-decoration-break:clone;-webkit-box-decoration-break:clone}
  .sub{margin-top:22px;font-weight:800;font-size:30px;color:var(--mute)}
  .term{margin-top:28px;background:var(--ink);border:6px solid var(--ink);box-shadow:12px 12px 0 var(--ink);
    padding:26px 28px;font-family:'JetBrains Mono',Consolas,monospace;color:#EDEAE2}
  .term .bar{display:flex;align-items:center;gap:10px;margin-bottom:20px}
  .term .dot{width:15px;height:15px;border-radius:50%;background:#55525c}
  .term .tag{margin-left:auto;font-size:17px;font-weight:700;color:#0B0B0F;background:var(--mint);padding:3px 12px;letter-spacing:.04em}
  .term .p{font-size:25px;line-height:1.5}
  .term .p b{color:var(--mint);font-weight:700}
  .term .muted{color:#8d8a94}
  .term table{width:100%;border-collapse:collapse;margin-top:20px}
  .term td{padding:11px 0;font-size:24px;vertical-align:middle;border-top:2px solid #2a2831}
  .term td.k{width:212px}
  .term td.k span{display:inline-block;color:#0B0B0F;font-weight:700;font-size:20px;padding:5px 12px;letter-spacing:.03em}
  .k-mint span{background:var(--mint)} .k-yellow span{background:var(--yellow)}
  .k-blue span{background:var(--blue)} .k-pink span{background:var(--pink)}
  .term td.amt{text-align:right;font-weight:700;white-space:nowrap;padding-right:22px}
  .term td.note{color:#8d8a94;font-size:21px;width:330px}
  .cta{margin-top:auto;background:var(--coral);border:6px solid var(--ink);box-shadow:10px 10px 0 var(--ink);
    border-radius:70px;padding:24px 0;text-align:center;
    font-family:'Archivo Black','Arial Black',sans-serif;font-size:40px;text-transform:uppercase}
  .price{margin-top:20px;text-align:center;font-family:'Archivo Black','Arial Black',sans-serif;font-size:44px}
  .price em{font-style:normal;background:var(--yellow);border:4px solid var(--ink);padding:2px 12px}
  .price span{font-family:'Figtree',sans-serif;font-weight:800;font-size:30px;color:var(--mute)}
  .foot{margin-top:16px;text-align:center;font-weight:600;font-size:20px;color:var(--mute)}
</style></head><body>
  <h1>The app that cancels<br>your subscriptions<br><em>is a subscription</em>.</h1>
  <p class="sub">This one isn&rsquo;t. No bank login either.</p>
  <div class="term">
    <div class="bar"><i class="dot"></i><i class="dot"></i><i class="dot"></i><span class="tag">Example output</span></div>
    <div class="p"><b>&gt;</b> Audit my Gmail for recurring charges. Read-only.<br>
      <span class="muted">Reading 12 months of billing emails&hellip; 29-page prompt pack loaded.</span></div>
    <table>${rows(v).map(([k, c, name, amt, note]) =>
      `<tr><td class="k k-${c}"><span>${k}</span></td><td>${name}</td><td class="amt">${amt}</td><td class="note">${note}</td></tr>`).join('')}
    </table>
  </div>
  <div class="cta">Run your first audit tonight</div>
  <p class="price"><em>${v.price} once</em> <span>&mdash; not monthly</span></p>
  <p class="foot">Read-only Gmail &middot; Works with Codex + Claude Code &middot; Not financial advice. Savings aren&rsquo;t guaranteed.</p>
</body></html>`;

/* ----------------------------------------------------------------- RENDERING */

if (!CHROME) {
  console.error('No Chrome or Edge found — cannot render. Install one, or edit CHROME above.');
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ppads-'));

function render(name, html) {
  const f = path.join(tmp, `${name}.html`);
  fs.writeFileSync(f, html);
  const feed = path.join(OUT, `${name}-4x5-v1.png`);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--virtual-time-budget=6000', '--window-size=1080,1350',
    `--screenshot=${feed}`, `file:///${f.replace(/\\/g, '/')}`], { stdio: 'pipe' });
  const story = path.join(OUT, `${name}-9x16-v1.png`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', feed,
    '-vf', `pad=1080:1920:0:285:0x${BG.slice(1)}`, story], { stdio: 'pipe' });
  console.log(`  ${path.basename(feed)} + ${path.basename(story)}`);
}

console.log('hook creatives:');
for (const v of HOOKS) render(`ai-money-audit-hook-${v.id}`, hookPage(v));
console.log('session creatives (v2):');
for (const v of SESSIONS) render(`ai-money-audit-session-${v.id}`, sessionPage(v));

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\nDone. ${(HOOKS.length + SESSIONS.length) * 2} files in assets/ads/`);

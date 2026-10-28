'use strict';
// Short tutorial watch pages: one original Juno & Pixel episode each, with its transcript (checked
// against the rendered audio with local speech-to-text on 28 October 2026), written steps and VideoObject.
const seo = require('./seo');
const media = 'https://media.promptpack.tech';
const reviewed = '2026-10-28';
// Files were added to the site in commit 172cca1 (19 October 2026, 13:02 IST).
const uploaded = '2026-10-19T13:02:09+05:30';
const videos = [
  {
    slug: 'ai-agent-deleted-database',
    title: 'AI Agent Deleted Your Database? What to Do First',
    description: 'A 35-second tutorial with transcript: stop writes, check your host’s backups or point-in-time restore, and keep AI agents away from production credentials.',
    answer: 'Stop anything that is still writing to the database, then look for your host’s automatic backups or point-in-time restore. Restore into a new database, check it, and only then switch your app over. Next time, give AI agents a copy of the data, never your production password.',
    file: '/assets/product-previews/juno-pixel-ep02.mp4', poster: '/assets/product-previews/juno-pixel-ep02.jpg', seconds: 34.9, episode: 'Episode 2: The database is gone',
    transcript: [
      ['Juno', 'Pixel, the whole database is gone!'],
      ['Pixel', 'Breathe. When did you last back it up?'],
      ['Juno', 'Define… back up?'],
      ['Pixel', 'Okay. Different breathing exercise.'],
      ['Pixel', 'Stop writing to it. Then check if your host keeps automatic backups or point-in-time restore. Many do.'],
      ['Juno', 'And next time?'],
      ['Pixel', 'Never give an AI agent your production password. Give it a copy to break.'],
      ['Juno', 'So it deleted the real one because I let it.'],
      ['Pixel', 'It did exactly what it was allowed to. Follow for tomorrow’s disaster.']
    ],
    steps: [
      ['Stop the writes', 'Pause the agent, the app or any job that still connects to the database. New writes can overwrite what a restore would recover.'],
      ['Find your recovery options', 'In your database host’s dashboard, look for backups, snapshots or point-in-time restore, and note the most recent time before the deletion. Options and retention differ by host and plan; check its documentation.'],
      ['Restore beside, not over', 'Where your host allows it, restore into a new database first. Check that the tables and recent records you need are there.'],
      ['Switch and record', 'Point the app at the restored database, then write down what happened and what was lost.'],
      ['Prevent the repeat', 'Give AI agents a development copy and credentials that cannot delete production data. Require your approval for destructive commands, and test a restore before you need one.']
    ],
    limits: 'A general first response, not advice for a specific host. If there is no backup and no point-in-time restore, the data may not be recoverable; contact your host’s support quickly.'
  },
  {
    slug: 'api-key-pushed-to-github',
    title: 'API Key Pushed to GitHub? Rotate It First',
    description: 'A 39-second tutorial with transcript: rotate the leaked key, revoke the old one, check its usage, then keep keys in an ignored .env file with secret scanning on.',
    answer: 'Make a new key and revoke the old one at the provider straight away; deleting the file is not enough because Git keeps history and public repositories are scanned for keys. Then check the provider’s usage page for activity you did not cause, move keys into a .env file that Git ignores, and turn on secret scanning.',
    file: '/assets/product-previews/juno-pixel-ep03.mp4', poster: '/assets/product-previews/juno-pixel-ep03.jpg', seconds: 39.4, episode: 'Episode 3: My API key is on GitHub',
    transcript: [
      ['Juno', 'My API key is on GitHub. Publicly!'],
      ['Pixel', 'Rotate it. Right now. Before anything else.'],
      ['Juno', 'Can’t I just delete the file?'],
      ['Pixel', 'Git remembers. And bots scan public repos fast.'],
      ['Pixel', 'Make a new key, revoke the old one, then check the usage page for anything you didn’t do.'],
      ['Juno', 'And next time?'],
      ['Pixel', 'Keys live in a .env file that Git ignores. Turn on secret scanning so GitHub warns you first.'],
      ['Juno', 'So deleting it was the least important step.'],
      ['Pixel', 'Rotating was the important one. Follow for tomorrow’s disaster.']
    ],
    steps: [
      ['Revoke and replace the key', 'In the provider’s dashboard, create a new key and revoke the leaked one. Do this before cleaning up the repository.'],
      ['Update what used the old key', 'Put the new key in your app’s environment settings or secret store and redeploy. Anything still using the old key will stop working.'],
      ['Check for misuse', 'Review the provider’s usage, billing and audit logs for activity you did not cause, and contact the provider if you find any.'],
      ['Clean up the code', 'Remove the key from the code. Rewriting Git history can remove old copies, but treat the key as exposed either way.'],
      ['Prevent the repeat', 'Keep keys in a .env file listed in .gitignore, and turn on GitHub secret scanning and push protection where available.']
    ],
    source: ['GitHub Docs: secret scanning', 'https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning'],
    limits: 'General steps; each provider’s dashboard differs. Rotation stops future misuse of the old key but does not undo anything already done with it.'
  }
].map(v => ({...v, url: `/learn/watch/${v.slug}/`, iso: `PT${v.seconds}S`}));

function build({page, write, esc}) {
  for (const v of videos) {
    const transcript = v.transcript.map(([who, line]) => `${who}: ${line}`).join('\n');
    const others = videos.filter(o => o !== v);
    const body = `<article class="template-guide watch-page"><div class="breadcrumb"><a href="/learn/">Free templates &amp; tutorials</a></div><header class="hero"><span class="eyebrow">Video tutorial · ${Math.round(v.seconds)} seconds</span><h1>${esc(v.title)}</h1><p class="intro">${esc(v.answer)}</p><p>By <a href="/contact">PromptPack</a> &middot; Reviewed <time datetime="${reviewed}">28 October 2026</time></p></header>
<figure class="watch-video"><video controls playsinline preload="none" poster="${v.poster}" width="720" height="1280"><source src="${v.file}" type="video/mp4">Your browser cannot play this video. Read the transcript below.</video><figcaption>${esc(v.episode)} &middot; Juno &amp; Pixel &middot; captions are part of the video</figcaption></figure>
<h2 id="steps">What should you do, step by step?</h2><ol class="watch-steps">${v.steps.map(([h, t]) => `<li><strong>${esc(h)}.</strong> ${esc(t)}</li>`).join('')}</ol><p class="note">${esc(v.limits)}${v.source ? ` See <a href="${v.source[1]}" rel="noopener">${esc(v.source[0])}</a>.` : ''}</p>
<h2 id="transcript">Transcript</h2><div class="watch-transcript">${v.transcript.map(([who, line]) => `<p><strong>${esc(who)}:</strong> ${esc(line)}</p>`).join('')}</div>
<h2>How was this video made?</h2><p>PromptPack wrote the script and made the video with the two-character engine included in <a href="/products/motion-with-code/">Juno &amp; Pixel</a>: AI text-to-speech voices, timed captions and a 3D scene rendered in code. The copy on this page is 720 × 1280. Juno and Pixel are fictional characters, and the situation is a story, not a real incident.</p><p>To make your own, read <a href="/blog/make-animated-character-reels-with-code.html">how to make animated character reels with code</a>.</p>
<section class="template-next"><h2>More short tutorials</h2><ul>${others.map(o => `<li><a href="${o.url}">${esc(o.title)}</a></li>`).join('')}<li><a href="/learn/">All free templates</a></li></ul></section></article>`;
    const schema = {'@context': 'https://schema.org', '@graph': [seo.organization, seo.website,
      {'@type': 'WebPage', '@id': seo.origin + v.url, url: seo.origin + v.url, name: v.title, description: v.description, isPartOf: {'@id': seo.origin + '/#website'}, inLanguage: 'en', dateModified: reviewed, primaryImageOfPage: {'@type': 'ImageObject', url: seo.origin + v.poster}, mainEntity: {'@id': seo.origin + v.url + '#video'}},
      {'@type': 'VideoObject', '@id': seo.origin + v.url + '#video', name: v.title, description: v.description, thumbnailUrl: [seo.origin + v.poster], uploadDate: uploaded, duration: v.iso, contentUrl: media + v.file, width: 720, height: 1280, inLanguage: 'en', transcript, publisher: {'@id': seo.origin + '/#organization'}, isFamilyFriendly: true},
      seo.breadcrumbs([['Home', '/'], ['Free templates', '/learn/'], [v.title, v.url]])]};
    const html = page(`${v.title} | PromptPack`, v.description, v.url, body, schema, v.poster).replace('property="og:type" content="website"', 'property="og:type" content="video.other"').replace('</head>', `<meta property="og:video" content="${media}${v.file}"><meta property="og:video:type" content="video/mp4"><meta property="og:video:width" content="720"><meta property="og:video:height" content="1280"></head>`);
    write(v.url.slice(1) + 'index.html', html);
  }
  return videos.map(v => v.url);
}
// Entries for the video sitemap extension (sitemap.xml).
const sitemapVideos = () => videos.map(v => ({url: v.url, title: v.title, description: v.description, thumbnail: seo.origin + v.poster, content: media + v.file, duration: Math.round(v.seconds), published: uploaded}));
module.exports = {videos, build, sitemapVideos, reviewed};

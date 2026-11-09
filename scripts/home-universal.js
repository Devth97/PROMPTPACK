 'use strict';
// Homepage feature. Shared by the full storefront and the homepage-only refresh.
function render(){return `<section class="home-hero home-universal" aria-labelledby="home-feature-title">
<div class="uh-copy"><span class="eyebrow">DIGITAL KITS FOR REAL-LIFE PROJECTS</span><h1 id="home-feature-title">A head start<br>for <mark>what’s next.</mark></h1><p class="uh-intro">Create something. Build your business.<br>Make a plan that moves you forward.</p><p class="uh-description">Practical guides, editable prompts and ready-to-use tools for your next project. Find a kit, see what’s inside, and make it yours.</p><div class="uh-actions"><a class="button" href="#catalog">Explore all kits <span aria-hidden="true">↓</span></a><a class="uh-secondary" href="/learn/">Try a free template <span aria-hidden="true">↗</span></a></div><ul class="uh-facts" aria-label="Shopping at PromptPack"><li>Pay once</li><li>Preview before you buy</li><li>Keep your files</li></ul></div>
<div class="uh-universe" data-hero-universe><div class="uh-art-top"><span>ONE IDEA. SO MANY POSSIBILITIES.</span><button class="uh-motion" type="button" aria-pressed="false" hidden>Pause motion <span aria-hidden="true">Ⅱ</span></button></div><div class="uh-canvas"><span class="uh-spark uh-spark-one" aria-hidden="true">✦</span><span class="uh-spark uh-spark-two" aria-hidden="true">✳</span><svg class="uh-connections" viewBox="0 0 600 520" fill="none" aria-hidden="true"><path d="M170 145Q180 250 300 260M470 150Q460 250 300 260M480 350Q420 260 300 260M300 445V260M120 355Q180 260 300 260" stroke="currentColor" stroke-width="2" stroke-dasharray="5 7"/></svg><div class="uh-core" aria-hidden="true"><svg class="uh-core-star" viewBox="0 0 200 200"><path d="M100 0l19 35 35-22 2 41 40 3-22 35 26 28-39 12 7 40-40-8-15 36-25-29-34 23-4-40-40-4 22-34L0 88l39-12-7-40 40 8z" fill="#ffe14d" stroke="#0b0b0f" stroke-width="3"/></svg><span>IDEA IN.<br><b>LET’S GO.</b><i>↗</i></span></div>
<a class="uh-art-card uh-web" href="#websites" data-catalog-category="Websites" aria-label="Browse website kits"><div class="uh-mini-browser" aria-hidden="true"><span class="uh-dots">● ● ●</span><div class="uh-browser-body"><i></i><div><b></b><b></b><em></em></div></div><span class="uh-cursor">↖</span></div><span class="uh-card-label">Build a website <b aria-hidden="true">↗</b></span></a>
<a class="uh-art-card uh-video" href="#video" data-catalog-category="Video" aria-label="Browse video kits"><div class="uh-mini-video" aria-hidden="true"><span>▶</span><i></i><div class="uh-timeline"><b></b><b></b><b></b><b></b></div></div><span class="uh-card-label">Make a video <b aria-hidden="true">↗</b></span></a>
<a class="uh-art-card uh-social" href="#social-media" data-catalog-category="Social Media" aria-label="Browse social media kits"><div class="uh-mini-social" aria-hidden="true"><i><b>HEY.</b></i><i><b>YOUR<br>IDEA.</b></i><i><b>↗</b></i></div><span class="uh-card-label">Create content <b aria-hidden="true">↗</b></span></a>
<a class="uh-art-card uh-finance" href="#finance" data-catalog-category="Finance" aria-label="Browse finance and business kits"><div class="uh-mini-chart" aria-hidden="true"><span>MAKE IT ADD UP</span><div><i></i><i></i><i></i><i></i><i></i></div><b>↗</b></div><span class="uh-card-label">Run the numbers <b aria-hidden="true">↗</b></span></a>
<a class="uh-art-card uh-planning" href="#planning" data-catalog-category="Planning" aria-label="Browse planning kits"><div class="uh-mini-plan" aria-hidden="true"><span>THE NEXT CHAPTER</span><i><b>✓</b><em></em></i><i><b>✓</b><em></em></i><i><b>✓</b><em></em></i></div><span class="uh-card-label">Plan real life <b aria-hidden="true">↗</b></span></a></div><div class="uh-art-bottom"><span><i aria-hidden="true"></i>${require('./storefront-catalog').products().length} KITS. YOUR NEXT MOVE.</span><span>Pick a card. Find your start.</span></div></div>
</section>`;}
function upgrade(html){
 const match=/<(div|section) class="home-hero[^"]*"[^>]*>/.exec(html);
 if(!match)throw Error('Homepage hero not found');
 const tag=match[1],tokens=new RegExp('<(/?)'+tag+'\\b[^>]*>','g');tokens.lastIndex=match.index;
 let depth=0,end=0,t;
 while((t=tokens.exec(html))){depth+=t[1]?-1:1;if(depth===0){end=tokens.lastIndex;break;}}
 if(!end)throw Error('Homepage hero boundary not found');
 html=html.slice(0,match.index)+render()+html.slice(end);
 html=html.replace(/<link rel="stylesheet" href="\/assets\/home-zerocut\.css[^"]*">/g,'');
 html=html.replace(/<link rel="stylesheet" href="\/assets\/hero-stage\.css[^"]*">/g,'').replace(/<script src="\/assets\/hero-stage\.js[^"]*" defer><\/script>/g,'');
 if(!html.includes('/assets/home-universal.css'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/home-universal.css"></head>');
 if(!html.includes('/assets/home-universal.js'))html=html.replace('</head>','<script src="/assets/home-universal.js" defer></script></head>');
 return html;
}
module.exports={render,upgrade};

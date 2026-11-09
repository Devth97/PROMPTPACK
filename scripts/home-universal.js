 'use strict';
// Homepage feature. Shared by the full storefront and the homepage-only refresh.
function render(){return `<section class="home-hero home-universal" aria-labelledby="home-feature-title">
<div class="uh-copy"><span class="eyebrow">DIGITAL KITS FOR REAL-LIFE PROJECTS</span><h1 id="home-feature-title">A head start<br>for <mark>what’s next.</mark></h1><p class="uh-intro">Create something. Build your business.<br>Make a plan that moves you forward.</p><p class="uh-description">Practical guides, editable prompts and ready-to-use tools for your next project. Find a kit, see what’s inside, and make it yours.</p><div class="uh-actions"><a class="button" href="#catalog">Explore all kits <span aria-hidden="true">↓</span></a><a class="uh-secondary" href="/learn/">Try a free template <span aria-hidden="true">↗</span></a></div><ul class="uh-facts" aria-label="Shopping at PromptPack"><li>Pay once</li><li>Preview before you buy</li><li>Keep your files</li></ul></div>
<div class="uh-toolbox" aria-label="Find your starting point"><div class="uh-toolbox-top"><span>THE PROMPTPACK TOOLBOX</span><span>${require('./storefront-catalog').products().length} DIGITAL KITS</span></div><p class="uh-board-title">What’s your<br><em>next move?</em></p><div class="uh-directions"><a class="uh-direction uh-create" href="#websites" data-catalog-category="Websites"><span class="uh-number" aria-hidden="true">01</span><span><b>Make something.</b><small>Websites, videos &amp; content</small></span><span class="uh-arrow" aria-hidden="true">↗</span></a><a class="uh-direction uh-business" href="#finance" data-catalog-category="Finance"><span class="uh-number" aria-hidden="true">02</span><span><b>Build with clarity.</b><small>Business tools &amp; clearer finances</small></span><span class="uh-arrow" aria-hidden="true">↗</span></a><a class="uh-direction uh-plan" href="#planning" data-catalog-category="Planning"><span class="uh-number" aria-hidden="true">03</span><span><b>Get life organised.</b><small>Decisions, everyday plans &amp; next steps</small></span><span class="uh-arrow" aria-hidden="true">↗</span></a></div><div class="uh-toolbox-bottom"><span>YOUR PROJECT. YOUR PACE.</span><a href="#catalog">Find your kit <span aria-hidden="true">→</span></a></div></div>
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
 return html;
}
module.exports={render,upgrade};

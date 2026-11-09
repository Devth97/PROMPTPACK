const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const hero=require('../scripts/home-zerocut');
test('homepage features ZeroCut with purchase, demos and separate cost disclosure',()=>{
 const home=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');assert(home.includes(hero.render()));
 assert.match(hero.render(),/href="\/checkout\/zerocut-checkout\/">Buy now · ₹999/);assert.match(hero.render(),/href="\/zerocut-checkout\/#demo-launch"/);
 assert.match(hero.render(),/Gateway, Shopify, SMS and hosting costs are separate/);assert.match(hero.render(),/Explore all 9 PromptPack kits/);
 assert(!home.includes('data-hero-stage'));assert(!home.includes('/assets/hero-stage.js'));assert(home.includes('/assets/home-zerocut.css?v='));
 assert.equal(hero.upgrade(home),home,'Hero update must be repeatable');
});

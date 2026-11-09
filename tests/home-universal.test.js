const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const hero=require('../scripts/home-universal');
test('universal homepage hero represents the full shop and links to category discovery',()=>{
 const home=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),rendered=hero.render();assert(home.includes(rendered));
 assert.match(rendered,/A head start/);assert.match(rendered,/href="#catalog">Explore all kits/);assert.match(rendered,/href="\/learn\/"/);
 for(const category of ['websites','video','social-media','finance','planning'])assert(rendered.includes('href="#'+category+'"'));
 assert(!/ZeroCut|Juno|Razorpay|₹999|checkout\//.test(rendered));assert(rendered.includes('9 KITS. YOUR NEXT MOVE.'));assert(rendered.includes('data-hero-universe'));assert(rendered.includes('Pause motion'));assert(home.includes('/assets/home-universal.js?v='));
 assert(!home.includes('/assets/home-zerocut.css'));assert(home.includes('/assets/home-universal.css?v='));assert(!home.includes('data-hero-stage'));
 assert.equal(hero.upgrade(home),home,'Hero update must be repeatable');
});

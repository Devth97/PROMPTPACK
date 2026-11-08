'use strict';
// Keep the machine-readable catalog synchronized with the same product data.
module.exports=({write,products,editions,sources,live})=>{
 const seo=require('./seo');
 const posts=[['Free AI prompt templates','/learn/'],...require('./search-guides').guides.map(g=>[g.title,g.url]),...require('./watch-pages').videos.map(v=>[v.title+' (video tutorial with transcript)',v.url]),['Practical guides for carousels, video and websites','/blog/'],...require('./guides').guides.map(g=>[g.title,g.url])];
 posts.push([require('./build-blog-library').title,require('./build-blog-library').hub]);
 const files=seo.llmsFiles({products,editions,sources,liveProducts:live,posts});
 write('llms.txt',files.index);write('llms-full.txt',files.full+'\n\n## Practical article library\n\n- [100 practical guides](https://promptpack.tech/blog/practical-guides/): worked examples for small businesses, creative work and everyday planning.\n');
};

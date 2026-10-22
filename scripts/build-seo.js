'use strict';
// Keep the machine-readable catalog synchronized with the same product data.
module.exports=({write,products,editions,sources,live})=>{
 const seo=require('./seo');
 const posts=[['Practical guides for carousels, video and websites','/blog/'],...require('./guides').guides.map(g=>[g.title,g.url])];
 const files=seo.llmsFiles({products,editions,sources,liveProducts:live,posts});
 write('llms.txt',files.index);write('llms-full.txt',files.full);
};

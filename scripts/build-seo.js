'use strict';
// Keep the machine-readable catalog synchronized with the same product data.
module.exports=({write,products,editions,sources,live})=>{
 const seo=require('./seo');
 const posts=[['AI website prompts and tutorials','/blog/']];
 const files=seo.llmsFiles({products,editions,sources,liveProducts:live,posts});
 write('llms.txt',files.index);write('llms-full.txt',files.full);
};

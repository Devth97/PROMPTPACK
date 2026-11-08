'use strict';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
module.exports=(usd,inr)=>`<span class="price-usd">${esc(usd)}</span><small class="price-inr">or ${esc(inr)}</small>`;

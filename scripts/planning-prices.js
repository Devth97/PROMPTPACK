'use strict';
const catalog = require('../api/_products');

module.exports = function planningPrices(slug) {
  const product = catalog.bySlug(slug);
  const inrMinor = catalog.priceFor(product, 'inr').amount;
  const usdMinor = catalog.priceFor(product, 'usd').amount;
  return {
    inrMinor,
    usdMinor,
    inr: '₹' + (inrMinor / 100).toLocaleString('en-IN'),
    usd: 'US$' + (usdMinor / 100).toLocaleString('en-US')
  };
};

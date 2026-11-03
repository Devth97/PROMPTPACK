'use strict';
const L = require('./_lib');

/**
 * GET /api/profitpulse-status
 * Fail closed: do not present the purchase button until the exact paid archive
 * can be decrypted and its SHA-256 verified with the deployed key.
 * No Razorpay order is created by this endpoint.
 */
module.exports = async (req, res) => {
  if (req.method !== 'GET') return L.send(res, 405, {error:'method_not_allowed'});
  const product = L.catalog.bySlug('profitpulse');
  let ready = false;
  if (product && !L.missing(['RAZORPAY_KEY_ID','RAZORPAY_KEY_SECRET','DOWNLOAD_FILE_KEY','DOWNLOAD_SIGNING_SECRET']).length) {
    try {
      const plain=L.decryptPack(product);
      ready=plain.length===product.bytes;
    } catch (err) {
      console.warn('ProfitPulse paid archive is not yet available:',err.message);
    }
  }
  return L.send(res,200,{product:'profitpulse',ready,price_inr:999,currency:'INR'});
};

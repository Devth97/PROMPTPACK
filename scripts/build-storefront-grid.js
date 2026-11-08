'use strict';
// Refresh only the homepage; preserve all other existing product editions.
const fs=require('node:fs');
const {upgrade}=require('./storefront-catalog');
fs.writeFileSync('index.html',upgrade(fs.readFileSync('index.html','utf8')));
console.log('Built the eight-product homepage grid.');

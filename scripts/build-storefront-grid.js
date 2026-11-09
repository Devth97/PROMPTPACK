'use strict';
// Refresh only the homepage; preserve all other existing product editions.
const fs=require('node:fs');
const {upgrade}=require('./storefront-catalog');
const {optimize}=require('./optimize-html');
fs.writeFileSync('index.html',optimize(upgrade(fs.readFileSync('index.html','utf8'))));
console.log('Built the '+require('./storefront-catalog').products().length+'-product homepage grid.');

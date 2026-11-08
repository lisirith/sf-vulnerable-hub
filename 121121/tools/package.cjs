'use strict';
const fs=require('node:fs'),path=require('node:path');
require('./build.cjs');
const root=path.resolve(__dirname,'..');
const files=['index.html','css/site.css','js/core.js','js/app.js','sw.js','assets/favicon.svg','vendor/leaflet/leaflet.js','vendor/leaflet/leaflet.css','vendor/leaflet/LICENSE'];
for(const file of files){const target=path.join(root,'dist',file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target);}
console.log('Static hosting files prepared in dist/. No account or backend required.');

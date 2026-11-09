'use strict';
const fs=require('node:fs'),path=require('node:path');
require('./build.cjs');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/resources.json'),'utf8'));
if(!data.contactEmail)console.warn('NOTE: contactEmail is empty in data/resources.json, so in-site walking directions are off. Google Maps directions still work.');
const files=['index.html','plain.html','plain-es.html','plain-zh.html','css/site.css','js/core.js','js/app.js','js/nav.js','sw.js','assets/favicon.svg','vendor/leaflet/leaflet.js','vendor/leaflet/leaflet.css','vendor/leaflet/LICENSE'];
// dist/ doubles as the GitHub Pages repository, so its Git data must survive every rebuild.
fs.mkdirSync(dist,{recursive:true});
for(const name of fs.readdirSync(dist))if(!name.startsWith('.git'))fs.rmSync(path.join(dist,name),{recursive:true,force:true});
for(const file of files){const target=path.join(dist,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file),target);}
// Tells GitHub Pages to publish the files exactly as they are.
fs.writeFileSync(path.join(dist,'.nojekyll'),'');
// Read by Cloudflare Pages and Netlify if the site ever moves. The Referrer-Policy keeps the Referer that OpenStreetMap's tile policy requires.
fs.writeFileSync(path.join(dist,'_headers'),'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n\n/vendor/*\n  Cache-Control: public, max-age=2592000\n');
console.log('Static hosting files prepared in dist/. No account or backend required.');

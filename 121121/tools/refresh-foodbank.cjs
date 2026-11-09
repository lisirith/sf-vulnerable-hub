'use strict';
// Saves a current copy of the SF-Marin Food Bank's published site list for the page to fall back on.
// The live page also fetches this list directly when someone opens the Food Bank section.
const fs = require('node:fs'), path = require('node:path');
const C = require('../js/core.js');
const URLS = ['https://foodlocator.sfmfoodbank.org/data/sites.sample.json', 'https://foodlocator.sfmfoodbank.org/data/sites.json'];
const out = path.resolve(__dirname, '../data/foodbank.json');
(async () => {
  let json = null, from = null;
  for (const url of URLS) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'sf-neighbor-directory/1.0 (community resource guide)' } });
      if (r.ok) { json = await r.json(); from = url; break; }
    } catch (_) { /* try next */ }
  }
  if (!json) throw new Error('Could not reach the Food Bank data');
  const places = C.pantriesFromExport(json).map(p => {
    if (p.info) p.info = { en: p.info.en, es: p.info.es, zh: p.info.zh };
    return p;
  });
  if (places.length < 40) throw new Error('Unexpectedly few sites: ' + places.length);
  fs.writeFileSync(out, JSON.stringify({ source: from, generated: json.generated_at, fetched: new Date().toISOString(), places }) + '\n');
  console.log('Saved', places.length, 'San Francisco sites; exported', json.generated_at);
})().catch(e => { console.error(e.message); process.exitCode = 1; });

'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..'), C = require('../js/core.js');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/resources.json'), 'utf8'));
const foodbank = JSON.parse(fs.readFileSync(path.join(root, 'data/foodbank.json'), 'utf8'));
const routing = !!data.contactEmail; // In-site walking directions require a published contact email.
const payload = { checked: data.checked, routing, resources: data.resources, foodbank: { generated: foodbank.generated, places: foodbank.places } };
const places = data.resources.concat(foodbank.places);
const countOf = cat => places.filter(r => r.type === cat && C.isActive(r, data.checked)).length;
const cats = C.CATEGORIES.map(cat => '<a class="cat" href="plain.html#' + cat + '" data-cat="' + cat + '">' + C.icon(cat) + '<span class="cat-title" data-cat-title="' + cat + '">' + C.escape(C.labels.en[cat]) + '</span><span class="cat-sub" data-cat-sub="' + cat + 'Sub">' + C.escape(C.labels.en[cat + 'Sub']) + '</span><span class="cat-count" data-count="' + cat + '">' + countOf(cat) + '</span></a>').join('');
const contact = data.contactEmail ? '<p><span data-i18n="contact">Contact</span>: <a href="mailto:' + C.escape(data.contactEmail) + '">' + C.escape(data.contactEmail) + '</a></p>' : '';
const replacements = { CHECKED: data.checked, DATE: C.dateLabel(data.checked, 'en'), CATS: cats, CONTACT: contact, ROUTECREDIT: routing ? 'Walking routes by Valhalla on <a href="https://fossgis.de/arbeitsgruppen/osm-server/nutzungsbedingungen/">FOSSGIS servers</a>. ' : '', DATA: JSON.stringify(payload).replace(/</g, '\\u003c') };
for (const name of ['heart', 'search', 'locate', 'map', 'list', 'download', 'back']) replacements[name.toUpperCase()] = C.icon(name);
const html = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8').replace(/__([A-Z]+)__/g, (_, key) => { if (!(key in replacements)) throw new Error('Unknown placeholder ' + key); return replacements[key]; });
fs.writeFileSync(path.join(root, 'index.html'), html);
for (const [lang, name] of [['en', 'plain.html'], ['es', 'plain-es.html'], ['zh', 'plain-zh.html']]) {
  fs.writeFileSync(path.join(root, name), C.plainPage(places.filter(r => C.isActive(r, data.checked)), lang, data.checked));
}
// Only what the app needs offline. Text pages stay out so a first visit does not spend data on them,
// and some hosts redirect *.html addresses, which a service worker must not replay.
const assets = ['./', './css/site.css', './js/core.js', './js/app.js', './assets/favicon.svg'];
const lazy = ['./js/nav.js', './vendor/leaflet/leaflet.js', './vendor/leaflet/leaflet.css'];
const hash = crypto.createHash('sha256');
for (const asset of ['./index.html'].concat(assets, lazy).filter(x => x !== './')) hash.update(fs.readFileSync(path.join(root, asset)));
const version = 'sf-neighbor-' + hash.digest('hex').slice(0, 12);
const sw = fs.readFileSync(path.join(root, 'src/sw.js'), 'utf8').replace('__CACHE__', version).replace('__ASSETS__', JSON.stringify(assets)).replace('__LAZY__', JSON.stringify(lazy));
fs.writeFileSync(path.join(root, 'sw.js'), sw);
console.log('Built index.html, text pages and sw.js; ' + places.length + ' places; ' + version);

'use strict';
// Fills lat/lng in data/resources.json from public address sources and logs where each came from.
// Street addresses: SF Enterprise Addressing System (DataSF). Intersections: OpenStreetMap Overpass.
// Named plazas and parks: OpenStreetMap Nominatim. Run by hand after editing an address.
const fs = require('node:fs'), path = require('node:path');
const file = path.resolve(__dirname, '../data/resources.json'), logFile = path.resolve(__dirname, '../data/geocoding.json');
const UA = { 'User-Agent': 'sf-neighbor-directory/1.0 (community resource guide; address check)' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SUFFIX = { STREET: 'ST', AVENUE: 'AVE', BOULEVARD: 'BLVD', DRIVE: 'DR', PLACE: 'PL', ROAD: 'RD', WAY: 'WAY' };

function easAddress(address) {
  const street = address.split(',')[0].toUpperCase().replace(/['’.]/g, '').replace(/\s+/g, ' ').trim();
  const parts = street.split(' ');
  return parts.map((p, i) => {
    if (i === 0) return p;
    if (/^\d(ST|ND|RD|TH)$/.test(p)) return '0' + p;
    if (i === parts.length - 1 && SUFFIX[p]) return SUFFIX[p];
    return p;
  }).join(' ');
}
async function fromEAS(address) {
  const q = easAddress(address);
  const url = 'https://data.sfgov.org/resource/ramy-di5m.json?$limit=5&$where=' + encodeURIComponent("address='" + q.replace(/'/g, "''") + "'");
  const rows = await retry(async () => (await fetch(url, { headers: UA })).json(), 5, 4000);
  const zip = (address.match(/\b(\d{5})\b/) || [])[1];
  const row = rows.find(r => r.zip_code === zip) || rows[0];
  if (row) return { lat: +row.latitude, lng: +row.longitude, area: row.nhood, zipMatch: row.zip_code === zip, matched: q, source: 'DataSF EAS' };
  const place = await fromPlace(address); await sleep(1200);
  return place ? Object.assign(place, { fallback: true }) : null;
}
// Free public services sometimes answer with an empty or HTML error page; wait and ask again.
async function retry(fn, times, wait) {
  let last;
  for (let i = 0; i < times; i++) {
    try { return await fn(); } catch (e) { last = e; await sleep(wait * (i + 1)); }
  }
  throw last;
}
async function fromIntersection(a, b) {
  const bbox = '37.70,-122.52,37.84,-122.35';
  const query = '[out:json][timeout:25];way["highway"]["name"="' + a + '"](' + bbox + ')->.a;way["highway"]["name"="' + b + '"](' + bbox + ')->.b;node(w.a)(w.b);out;';
  const data = await retry(async () => (await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded' }, UA), body: 'data=' + encodeURIComponent(query) })).json(), 4, 12000);
  if (!data.elements || !data.elements.length) return null;
  const n = data.elements.length;
  return { lat: +(data.elements.reduce((s, e) => s + e.lat, 0) / n).toFixed(6), lng: +(data.elements.reduce((s, e) => s + e.lon, 0) / n).toFixed(6), nodes: n, source: 'OSM Overpass intersection' };
}
async function fromPlace(q) {
  const rows = await (await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&viewbox=-122.52,37.84,-122.35,37.70&bounded=1&q=' + encodeURIComponent(q), { headers: UA })).json();
  return rows[0] ? { lat: +(+rows[0].lat).toFixed(6), lng: +(+rows[0].lon).toFixed(6), display: rows[0].display_name, source: 'OSM Nominatim' } : null;
}
(async () => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const all = process.argv.includes('--all');
  let previous = [];
  try { previous = JSON.parse(fs.readFileSync(logFile, 'utf8')).entries || []; } catch (_) { /* first run */ }
  const log = all ? [] : previous, cache = new Map(), problems = [];
  for (const r of data.resources) {
    if (!all && Number.isFinite(r.lat) && Number.isFinite(r.lng)) continue;
    let hit = null;
    try {
      if (r.address) {
        if (!cache.has(r.address)) { cache.set(r.address, await fromEAS(r.address)); await sleep(1300); }
        hit = cache.get(r.address);
      } else if (r.cross) { hit = await fromIntersection(r.cross[0], r.cross[1]); await sleep(4000); }
      else if (r.place) { hit = await fromPlace(r.place); await sleep(1200); }
      else continue;
    } catch (e) { problems.push(r.id + ': ' + e.message); continue; }
    if (!hit) { problems.push(r.id + ': no match for ' + (r.address || r.cross || r.place)); continue; }
    if (hit.zipMatch === false) problems.push(r.id + ': ZIP differs in city database for ' + r.address);
    if (hit.fallback) problems.push(r.id + ': not in city address database; used OpenStreetMap for ' + r.address);
    r.lat = +hit.lat.toFixed(6); r.lng = +hit.lng.toFixed(6);
    if (!r.area && hit.area) r.area = hit.area;
    log.push({ id: r.id, query: r.address || r.cross || r.place, lat: r.lat, lng: r.lng, source: hit.source, matched: hit.matched || hit.display || null });
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 1) + '\n');
  fs.writeFileSync(logFile, JSON.stringify({ generated: new Date().toISOString(), entries: log, problems }, null, 1) + '\n');
  console.log('Geocoded', log.length, 'entries');
  console.log('By source', log.reduce((m, x) => { m[x.source] = (m[x.source] || 0) + 1; return m; }, {}));
  console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'No problems');
})();

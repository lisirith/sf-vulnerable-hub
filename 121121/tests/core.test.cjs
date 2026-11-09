'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const C = require('../js/core.js'), data = require('../data/resources.json'), foodbank = require('../data/foodbank.json');
const all = data.resources.concat(foodbank.places);
const at = (date, time) => { const d = new Date(date + 'T' + time + ':00-08:00'); return C.sfNow(d); };

test('Curated places carry sources, usable phones and translations', () => {
  const ids = new Set();
  for (const r of data.resources) {
    assert(!ids.has(r.id), r.id); ids.add(r.id);
    assert(C.CATEGORIES.includes(r.type), r.id);
    if (r.phone !== null) assert.match(r.phone, /^(\d{10}|\d{3})$/, r.id);
    assert(r.sources.length, r.id);
    r.sources.forEach(s => assert.equal(new URL(s.url).protocol, 'https:'));
    for (const lang of ['en', 'es', 'zh']) { assert(C.placeNote(r, lang), r.id + ' note ' + lang); assert(C.labels[lang]['b_' + r.access], r.id + ' badge'); }
  }
});
test('Every place that can be navigated to is inside San Francisco', () => {
  for (const r of all.filter(C.hasPoint)) { assert(r.lat > 37.70 && r.lat < 37.85, r.id); assert(r.lng > -122.53 && r.lng < -122.35, r.id); }
  const missing = data.resources.filter(r => r.type !== 'phone' && !r.confidential && r.address && !C.hasPoint(r)).map(r => r.id);
  assert.deepEqual(missing, []);
});
test('Confidential shelters never expose an address or a map pin', () => {
  for (const r of data.resources.filter(x => x.confidential)) {
    assert.equal(r.address, ''); assert(!C.hasPoint(r), r.id);
    const html = C.card(r, 'en', { checked: data.checked });
    assert(!html.includes('data-go=') && !html.includes('data-map='), r.id);
    assert(html.includes('private'), r.id);
  }
});
test('A closing program stays out of the directory', () => {
  assert(!data.resources.some(r => /pretrial/i.test(r.name + r.sources.map(s => s.url).join())));
});
test('Interface translations have matching keys', () => {
  for (const lang of ['es', 'zh']) assert.deepEqual(Object.keys(C.labels[lang]).sort(), Object.keys(C.labels.en).sort());
});
test('Food Bank list is complete, unique and has phones', () => {
  assert(foodbank.places.length >= 70, String(foodbank.places.length));
  assert.equal(new Set(foodbank.places.map(p => p.id)).size, foodbank.places.length);
  foodbank.places.forEach(p => { assert.match(p.phone, /^\d{10}$/, p.id); assert(C.hasPoint(p), p.id); assert.equal(p.type, 'foodbank'); });
  assert(foodbank.places.some(p => p.kind === 'efb'));
});
test('Food Bank export is normalized safely', () => {
  const list = C.pantriesFromExport({ sites: [
    { id: 1, type: 'ngn', county: 'sf', name: 'A', address: '1 Main St', city: 'San Francisco', zip: '94102', lat: 37.78, lng: -122.41, phone: '(415) 555-0100', status: 'waitlist', distro_day: 'MON', distro_start: '10:00', distro_end: '11:00', distro_next: [], service_zips: ['94102'] },
    { id: 2, type: 'ngn', county: 'marin', name: 'B', address: '1 Elm', city: 'Novato', zip: '94949', status: 'open' },
    { id: 3, type: 'efb', county: 'sf', name: 'C', address: '2 Main St', city: 'San Francisco', zip: '94103', lat: 0, lng: 0, phone: null, status: 'open' },
    { id: 4, type: 'ngn', county: 'sf', name: 'D', address: '3 Main St', city: 'San Francisco', zip: '94103', status: 'closed' }
  ] });
  assert.equal(list.length, 2);
  assert.equal(list[0].phone, '4155550100');
  assert.equal(list[1].phone, C.FOOD_HOTLINE);
  assert.equal(list[1].lat, null);
  assert.throws(() => C.pantriesFromExport({ nope: true }));
});
test('Search covers name, street, ZIP and any language', () => {
  assert.equal(C.filter(all, { category: 'meals', query: "St. Anthony's" }, null)[0].id, 'st-anthony');
  assert(C.filter(all, { category: 'foodbank', query: '94103' }, null).length > 3);
  assert.equal(C.filter(all, { query: 'bayview jennings', category: 'meals' }, null)[0].id, 'mother-brown');
  assert.equal(C.filter(all, { category: 'meals', query: '<script>' }, null).length, 0);
  assert(C.filter(all, { query: '免费餐食' }, null).length >= 8);
});
test('Food Bank ordering puts emergency food first and waitlists last', () => {
  const list = C.filter(all, { category: 'foodbank' }, null);
  assert.equal(list[0].access, 'emergency');
  assert.equal(list[list.length - 1].access === 'referral' || list[list.length - 1].access === 'pantryWait', true);
  const taking = C.filter(all, { category: 'foodbank', chips: { enrolling: true } }, null);
  assert(taking.every(r => r.access !== 'pantryWait'));
});
test('Nearest sorts by distance within the same access level', () => {
  const here = data.resources.find(r => r.id === 'glide');
  const list = C.filter(all, { category: 'meals', here }, null).filter(r => r.access === 'allwelcome');
  assert.equal(list[0].id, 'glide');
});
test('Published hours use San Francisco time and handle overnight windows', () => {
  const glide = data.resources.find(r => r.id === 'glide');
  assert.equal(C.openState(glide, at('2026-11-09', '08:00')).s, 'open');
  assert.equal(C.openState(glide, at('2026-11-09', '10:00')).s, 'later');
  assert.equal(C.openState(glide, at('2026-11-09', '18:00')).s, 'closed');
  const dolores = data.resources.find(r => r.id === 'dolores');
  assert.equal(C.openState(dolores, at('2026-11-09', '23:00')).s, 'open');
  assert.equal(C.openState(dolores, at('2026-11-10', '06:30')).s, 'open');
  assert.equal(C.openState(dolores, at('2026-11-10', '12:00')).s, 'later');
  const eddy = data.resources.find(r => r.id === 'pit-eddy-jones');
  assert.equal(C.openState(eddy, at('2026-11-09', '03:00')).all, true);
  assert.equal(C.sfNow(new Date('2026-11-09T02:00:00Z')).day, 0, 'UTC Monday 02:00 is still Sunday in SF');
});
test('Winter shelter shows only near its own dates', () => {
  const w = data.resources.find(r => r.id === 'winter-1'), w2 = data.resources.find(r => r.id === 'winter-2');
  assert(C.isActive(w, '2026-11-08')); assert(C.isActive(w, '2026-12-13')); assert(!C.isActive(w, '2026-12-14'));
  assert(!C.isActive(w2, '2026-11-08')); assert(C.isActive(w2, '2026-12-14'));
  assert.equal(C.statusLine(w, 'en', at('2026-11-08', '12:00')).cls, 'later');
});
test('Pantries with bad source times do not claim to be open', () => {
  const heritage = foodbank.places.find(p => p.name === 'Heritage Homes');
  if (heritage) { assert.equal(C.openState(heritage, at('2026-11-16', '00:30')), null); assert(C.hoursText(heritage, 'en').includes('not listed')); }
});
test('Google Maps links use the address, start navigation and carry no user position', () => {
  for (const r of data.resources.filter(x => C.hasPoint(x) && x.address)) {
    const u = new URL(C.directions(r));
    assert.equal(u.hostname, 'www.google.com');
    assert.equal(u.searchParams.get('travelmode'), 'walking');
    assert.equal(u.searchParams.get('dir_action'), 'navigate');
    assert.equal(u.searchParams.get('destination'), r.address);
    assert(!u.searchParams.has('origin'));
  }
  const pit = data.resources.find(r => r.id === 'pit-turk-hyde');
  assert.match(new URL(C.directions(pit)).searchParams.get('destination'), /^37\.\d+,-122\.\d+$/);
  assert.equal(new URL(C.directions(pit, 'transit')).searchParams.get('travelmode'), 'transit');
});
test('Routing output becomes short street-level steps in each language', () => {
  const steps = C.buildSteps([
    { type: 3, length: 0.0197, time: 20, begin_shape_index: 0, end_shape_index: 2, begin_cardinal_direction: 'south' },
    { type: 10, length: 0.0559, time: 60, begin_shape_index: 2, end_shape_index: 4, street_names: ['Ellis Street'] },
    { type: 15, length: 0.1957, time: 200, begin_shape_index: 4, end_shape_index: 8, street_names: ['US 101 North', 'Jones Street'] },
    { type: 15, length: 0.005, time: 5, begin_shape_index: 8, end_shape_index: 9 },
    { type: 10, length: 0.01, time: 8, begin_shape_index: 9, end_shape_index: 10 },
    { type: 6, length: 0, time: 0, begin_shape_index: 10, end_shape_index: 10 }
  ]);
  assert.equal(steps.length, 4);
  assert.equal(C.stepText(steps[0], 'en'), 'Head south');
  assert.equal(C.stepText(steps[1], 'en'), 'Turn right onto Ellis Street');
  assert.equal(C.stepText(steps[2], 'zh'), '左转进入 Jones Street');
  assert.equal(C.stepText(steps[1], 'es'), 'Gire a la derecha en Ellis Street');
  assert.equal(C.stepText(steps[3], 'zh'), '目的地在左侧');
  assert.equal(steps[2].end, 10);
});
test('The first step gets a compass direction computed from the route', () => {
  const shape = [[37.7853, -122.4117], [37.7840, -122.4117]];
  const steps = C.buildSteps([{ type: 1, length: 0.09, time: 90, begin_shape_index: 0, end_shape_index: 1 }, { type: 4, length: 0, time: 0, begin_shape_index: 1, end_shape_index: 1 }], shape);
  assert.equal(C.stepText(steps[0], 'en'), 'Head south');
  assert.equal(C.stepText(steps[0], 'zh'), '向南走');
});
test('Route shape decodes correctly', () => {
  assert.deepEqual(C.decodePolyline6('_izlhA~rlgdF'), [[38.5, -120.2]]);
});
test('Rendering escapes hostile text', () => {
  const html = C.card({ ...data.resources[0], name: '<img src=x onerror=alert(1)>', en: { note: '<b>x</b>' } }, 'en', { checked: data.checked });
  assert(!html.includes('<img') && !html.includes('<b>x'));
});
test('Home page stays light and works without third-party assets', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  assert(!/<script[^>]+src="https?:/.test(html)); assert(!/<link[^>]+href="https?:/.test(html));
  assert(!html.includes('leaflet.js'), 'map library must load on demand');
  assert(html.includes('href="plain.html#foodbank"'), 'category links must work without JavaScript');
});
test('Text-only pages list every phone number', () => {
  for (const name of ['plain.html', 'plain-es.html', 'plain-zh.html']) {
    const html = fs.readFileSync(path.resolve(__dirname, '../' + name), 'utf8');
    for (const r of data.resources.filter(x => x.phone && !x.active)) assert(html.includes(C.telHref(r.phone, r.ext)), name + ' ' + r.id);
    assert(!/1269 Howard/.test(html), 'private shelter office addresses must not appear');
  }
});
test('Offline cache excludes map tiles and third-party data', () => {
  const sw = fs.readFileSync(path.resolve(__dirname, '../sw.js'), 'utf8');
  assert(sw.includes('if(!CORE.has(url))return'));
  assert(!sw.includes('tile.openstreetmap.org'));
});

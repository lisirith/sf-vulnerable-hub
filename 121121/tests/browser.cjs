'use strict';
// Isolated automated tests of our local project; never attaches to a user's browser.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
let pw; try { pw = require('playwright'); } catch (_) { pw = require(path.resolve(path.dirname(process.execPath), '../node_modules/playwright')); }
const { createServer } = require('../tools/serve.cjs');
const root = path.resolve(__dirname, '..'), output = path.join(root, 'qa'); fs.mkdirSync(output, { recursive: true });
function encode(points) {
  let out = '', pl = 0, pn = 0;
  const num = v => { let s = v < 0 ? ~(v << 1) : v << 1; while (s >= 32) { out += String.fromCharCode((32 | (s & 31)) + 63); s >>= 5; } out += String.fromCharCode(s + 63); };
  points.forEach(([a, b]) => { const la = Math.round(a * 1e6), ln = Math.round(b * 1e6); num(la - pl); num(ln - pn); pl = la; pn = ln; });
  return out;
}
const ROUTE = { trip: { summary: { length: 0.3, time: 386 }, units: 'miles', legs: [{ shape: encode([[37.7853, -122.4117], [37.7818, -122.4126]]), maneuvers: [
  { type: 1, length: 0.1, time: 120, begin_shape_index: 0, end_shape_index: 1 },
  { type: 10, length: 0.2, time: 266, begin_shape_index: 1, end_shape_index: 1, street_names: ['Ellis Street'] },
  { type: 4, length: 0, time: 0, begin_shape_index: 1, end_shape_index: 1 }] }] } };
const FOOD = { generated_at: '2026-11-08T10:00:00.000Z', sites: Array.from({ length: 45 }, (_, i) => ({ id: 9000 + i, type: i ? 'ngn' : 'efb', county: 'sf', name: 'Live Pantry ' + i, address: (100 + i) + ' Test St', city: 'San Francisco', zip: '94103', lat: 37.77, lng: -122.41, phone: null, status: 'enrolling', distro_day: 'MON', distro_start: '10:00', distro_end: '11:00', distro_next: ['2030-01-07'], service_zips: ['94103'] })) };
(async () => {
  const server = createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  let browser; const checks = [], errors = [];
  async function ok(name, fn) { await fn(); checks.push(name); console.log('PASS ' + name); }
  async function phone(opts) {
    const contextOpts = Object.assign({}, opts), routing = contextOpts.routing !== false; delete contextOpts.routing;
    const ctx = await browser.newContext(Object.assign({ locale: 'en-US', viewport: { width: 375, height: 700 }, serviceWorkers: 'block', geolocation: { latitude: 37.7853, longitude: -122.4117, accuracy: 15 }, permissions: ['geolocation'] }, contextOpts));
    const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
    await page.route(u => u.pathname === '/', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace(/"routing":(true|false)/, '"routing":' + routing) }); });
    await page.route('https://tile.openstreetmap.org/**', r => r.abort());
    await page.route('https://foodlocator.sfmfoodbank.org/**', r => r.abort());
    await page.route('https://valhalla1.openstreetmap.de/**', r => r.fulfill({ json: ROUTE, headers: { 'access-control-allow-origin': '*' } }));
    return { ctx, page };
  }
  try {
    browser = await pw.chromium.launch({ channel: 'chrome', headless: true });
    await ok('Home loads with no third-party requests and no map library', async () => {
      const { ctx, page } = await phone(); const seen = []; page.on('request', r => seen.push(r.url()));
      await page.goto(base); await page.waitForSelector('body[data-ready]');
      assert.equal(await page.locator('.cat').count(), 8);
      assert(!seen.some(u => u.startsWith('https:') || u.includes('leaflet')), seen.join());
      await page.screenshot({ path: path.join(output, 'mobile-home.png') }); await ctx.close();
    });
    await ok('Food Bank lists every saved site, emergency first, 25 at a time', async () => {
      const { ctx, page } = await phone();
      await page.goto(base + '/#c/foodbank'); await page.waitForSelector('.resource');
      assert.equal(await page.locator('.resource').count(), 25);
      assert.match(await page.locator('.resource').first().innerText(), /Emergency|Comida|应急/);
      const total = Number((await page.locator('#count').innerText()).match(/\d+/)[0]);
      assert(total >= 85, 'total ' + total);
      while (await page.locator('#more').isVisible()) await page.locator('#more').click();
      assert.equal(await page.locator('.resource').count(), total);
      await page.screenshot({ path: path.join(output, 'mobile-foodbank.png') }); await ctx.close();
    });
    await ok('Live Food Bank data replaces the saved copy; failure keeps it', async () => {
      const { ctx, page } = await phone();
      await page.unroute('https://foodlocator.sfmfoodbank.org/**');
      await page.route('https://foodlocator.sfmfoodbank.org/**', r => r.fulfill({ json: FOOD, headers: { 'access-control-allow-origin': '*' } }));
      await page.goto(base + '/#c/foodbank'); await page.waitForSelector('.resource');
      await page.waitForFunction(() => /Live|En vivo|实时/.test(document.getElementById('data-line').textContent));
      assert.match(await page.locator('#list').innerText(), /Live Pantry 0/);
      await ctx.close();
      const second = await phone();
      await second.page.goto(base + '/#c/foodbank'); await second.page.waitForSelector('.resource'); await second.page.waitForTimeout(400);
      assert.match(await second.page.locator('#data-line').innerText(), /Saved|Copia|保存/);
      await second.ctx.close();
    });
    await ok('Filters, ZIP search and three languages work', async () => {
      const { ctx, page } = await phone();
      await page.goto(base + '/#c/foodbank'); await page.waitForSelector('.resource');
      await page.locator('[data-chip=emergency]').click();
      assert.equal(await page.locator('.resource').count(), 4);
      await page.locator('[data-chip=emergency]').click();
      await page.locator('#search').fill('94124'); await page.waitForFunction(() => document.querySelectorAll('.resource').length < 25);
      await page.locator('#search').fill('zzzz-not-a-place'); await page.waitForSelector('#empty:visible');
      await page.locator('#reset').click(); await page.waitForFunction(() => document.querySelectorAll('.resource').length === 25);
      await page.locator('#language').selectOption('zh'); assert.equal(await page.locator('html').getAttribute('lang'), 'zh-CN'); assert.match(await page.locator('#cat-title').innerText(), /食物银行/);
      await page.locator('#language').selectOption('es'); assert.match(await page.locator('#cat-title').innerText(), /Banco de alimentos/);
      await page.locator('#language').selectOption('en'); await ctx.close();
    });
    await ok('Winter shelter only appears near its dates; private shelters have no map', async () => {
      const { ctx, page } = await phone();
      await page.goto(base + '/#c/shelter'); await page.waitForSelector('.resource');
      const text = await page.locator('#list').innerText();
      const today = await page.evaluate(() => window.SFDirectory.sfNow().date);
      assert.equal(/Canon Kip/.test(text), today >= '2026-11-02' && today <= '2026-12-13');
      assert.equal(await page.locator('#r-la-casa [data-go]').count(), 0);
      assert.equal(await page.locator('#r-la-casa [data-map]').count(), 0);
      assert.match(await page.locator('#r-la-casa').innerText(), /877-503-1850/);
      await ctx.close();
    });
    await ok('Location sorts by distance; denial keeps the list usable', async () => {
      const { ctx, page } = await phone({ permissions: [] });
      await page.goto(base + '/#c/meals'); await page.waitForSelector('.resource');
      await page.evaluate(() => { navigator.geolocation.getCurrentPosition = (_, fail) => setTimeout(() => fail({ code: 1 }), 10); });
      await page.locator('#locate').click(); await page.waitForFunction(() => /not shared|No se|未共享/.test(document.getElementById('location-status').textContent));
      assert.equal(await page.locator('.resource').count(), 8);
      await ctx.close();
      const good = await phone();
      await good.page.goto(base + '/#c/meals'); await good.page.waitForSelector('.resource');
      await good.page.locator('#locate').click(); await good.page.waitForSelector('.distance');
      assert.equal(await good.page.locator('.resource').first().getAttribute('data-id'), 'glide');
      await good.ctx.close();
    });
    await ok('Map shows a tapped place; failed tiles leave call and directions working', async () => {
      const { ctx, page } = await phone();
      await page.goto(base + '/#c/foodbank'); await page.waitForSelector('.resource');
      await page.locator('[data-map]').first().click();
      await page.waitForSelector('.leaflet-container');
      await page.waitForFunction(() => document.getElementById('pin-card').textContent.length > 10);
      assert.match(await page.locator('#pin-card').innerText(), /415|211/);
      assert(await page.locator('#pin-card [data-go]').isVisible());
      await page.waitForFunction(() => /map images|Parte del mapa|地图图片/.test(document.getElementById('map-status').textContent));
      await page.screenshot({ path: path.join(output, 'mobile-map.png') });
      await page.goBack(); await page.waitForFunction(() => document.body.dataset.screen === 'list');
      await ctx.close();
    });
    await ok('Go here offers site navigation or Google Maps with the right link', async () => {
      const { ctx, page } = await phone();
      await page.goto(base + '/#c/meals'); await page.waitForSelector('.resource');
      await page.locator('#r-st-anthony [data-go]').click(); await page.waitForSelector('#go-sheet:visible');
      const g = new URL(await page.locator('#go-google').getAttribute('href'));
      assert.equal(g.hostname, 'www.google.com'); assert.equal(g.searchParams.get('destination'), '121 Golden Gate Ave, San Francisco, CA 94102'); assert.equal(g.searchParams.get('dir_action'), 'navigate');
      await page.screenshot({ path: path.join(output, 'mobile-go.png') });
      await page.locator('#go-close').click(); await page.waitForSelector('#go-sheet', { state: 'hidden' });
      await ctx.close();
    });
    await ok('Without a contact email only Google Maps is offered and routing is never called', async () => {
      const { ctx, page } = await phone({ routing: false }); const calls = []; page.on('request', r => { if (r.url().includes('valhalla')) calls.push(r.url()); });
      await page.goto(base + '/#c/meals'); await page.waitForSelector('.resource');
      await page.locator('#r-st-anthony [data-go]').click(); await page.waitForSelector('#go-sheet:visible');
      assert(!(await page.locator('#go-inapp').isVisible())); assert(!(await page.locator('.sheet-note').isVisible())); assert(await page.locator('#go-google').isVisible());
      await page.goto(base + '/#c/meals/nav/st-anthony'); await page.waitForFunction(() => document.body.dataset.screen === 'list');
      assert.deepEqual(calls, []); await ctx.close();
    });
    await ok('Site navigation draws a route, gives steps, and ends cleanly', async () => {
      const { ctx, page } = await phone();
      await page.goto(base + '/#c/meals'); await page.waitForSelector('.resource');
      await page.locator('#r-st-anthony [data-go]').click(); await page.locator('#go-inapp').click();
      await page.waitForFunction(() => document.querySelectorAll('#step-list li').length === 3, null, { timeout: 15000 });
      assert.match(await page.locator('#step-list').innerText(), /Turn right onto Ellis Street/);
      assert.match(await page.locator('#nav-sub').innerText(), /mi left/);
      assert(await page.locator('#map').isVisible());
      assert.notEqual(await page.locator('#nav-instruction').innerText(), 'You have arrived');
      await page.screenshot({ path: path.join(output, 'mobile-nav.png') });
      await page.locator('#nav-end').click(); await page.waitForFunction(() => document.body.dataset.screen === 'list');
      assert(await page.locator('#list').isVisible()); await ctx.close();
    });
    await ok('Far from the route never reports arrival', async () => {
      const { ctx, page } = await phone({ geolocation: { latitude: 37.7400, longitude: -122.4700, accuracy: 15 } });
      await page.goto(base + '/#c/meals'); await page.waitForSelector('.resource');
      await page.locator('#r-st-anthony [data-go]').click(); await page.locator('#go-inapp').click();
      await page.waitForFunction(() => document.querySelectorAll('#step-list li').length === 3, null, { timeout: 15000 });
      await page.waitForTimeout(2500);
      assert.notEqual(await page.locator('#nav-instruction').innerText(), 'You have arrived');
      await ctx.close();
    });
    await ok('If the route service fails, the user still gets Google Maps and retry', async () => {
      const { ctx, page } = await phone();
      await page.unroute('https://valhalla1.openstreetmap.de/**');
      await page.route('https://valhalla1.openstreetmap.de/**', r => r.abort());
      await page.goto(base + '/#c/meals'); await page.waitForSelector('.resource');
      await page.locator('#r-st-anthony [data-go]').click(); await page.locator('#go-inapp').click();
      await page.waitForFunction(() => !document.getElementById('nav-retry').hidden, null, { timeout: 15000 });
      assert.match(await page.locator('#nav-google').getAttribute('href'), /google\.com\/maps\/dir/);
      await ctx.close();
    });
    await ok('Without GPS the user can tap the map to set a start point', async () => {
      const { ctx, page } = await phone({ permissions: [] });
      await page.goto(base + '/#c/meals'); await page.waitForSelector('.resource');
      await page.evaluate(() => { navigator.geolocation.getCurrentPosition = (_, fail) => setTimeout(() => fail({ code: 2 }), 10); });
      await page.locator('#r-st-anthony [data-go]').click(); await page.locator('#go-inapp').click();
      await page.waitForFunction(() => /could not get your location|No se pudo|无法获取/.test(document.getElementById('nav-instruction').textContent), null, { timeout: 15000 });
      await page.locator('#map').click({ position: { x: 150, y: 120 } });
      await page.waitForFunction(() => document.querySelectorAll('#step-list li').length === 3, null, { timeout: 15000 });
      await ctx.close();
    });
    await ok('Save list downloads the current category', async () => {
      const { ctx, page } = await phone();
      await page.goto(base + '/#c/meals'); await page.waitForSelector('.resource');
      const promise = page.waitForEvent('download'); await page.locator('#save-list').click(); const d = await promise;
      const text = fs.readFileSync(await d.path(), 'utf8');
      assert(text.includes('GLIDE') && text.includes('415-674-6000')); await ctx.close();
    });
    await ok('320 and 375 px: no sideways scrolling on any screen', async () => {
      for (const width of [320, 375]) {
        const { ctx, page } = await phone({ viewport: { width, height: 640 } });
        for (const hash of ['', '#c/foodbank', '#c/shelter', '#c/phone']) {
          await page.goto(base + '/' + hash); await page.waitForSelector('body[data-ready]');
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), hash + ' at ' + width);
          const small = await page.evaluate(() => [...document.querySelectorAll('.actions .button,.cat,.chip,.toggle')].filter(e => e.offsetParent && e.getBoundingClientRect().height < 40).length);
          assert.equal(small, 0, 'tap targets at ' + width + hash);
        }
        await page.screenshot({ path: path.join(output, 'mobile-' + width + '.png') });
        await ctx.close();
      }
    });
    await ok('Blocked storage still works; a map script failure keeps the list', async () => {
      const { ctx, page } = await phone();
      await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error('blocked'); }; Storage.prototype.setItem = () => { throw new Error('blocked'); }; });
      await page.route('**/vendor/leaflet/**', r => r.abort());
      await page.goto(base + '/#c/meals'); await page.waitForSelector('.resource');
      await page.locator('#view-map').click();
      await page.waitForFunction(() => /could not load|No se pudo|未能加载/.test(document.getElementById('map-status').textContent) || /no cargó/.test(document.getElementById('map-status').textContent));
      await ctx.close();
    });
    const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 700 } });
    await ok('Without JavaScript every category links to the text directory', async () => {
      const p = await noJS.newPage(); await p.goto(base); await p.locator('.cat').first().click();
      await p.waitForURL('**/plain.html#foodbank');
      assert((await p.locator('a[href^="tel:"]').count()) > 100);
    }); await noJS.close();
    const offline = await browser.newContext({ locale: 'en-US', viewport: { width: 375, height: 700 } });
    await ok('After one visit the directory reopens with no connection', async () => {
      const p = await offline.newPage(); await p.route('https://foodlocator.sfmfoodbank.org/**', r => r.abort());
      await p.goto(base); await p.evaluate(() => navigator.serviceWorker.ready); await p.waitForFunction(() => !!navigator.serviceWorker.controller);
      await offline.setOffline(true); await p.reload(); await p.waitForSelector('body[data-ready]');
      assert(await p.locator('#offline-notice').isVisible());
      await p.locator('.cat').first().click(); await p.waitForSelector('.resource'); assert.equal(await p.locator('.resource').count(), 25);
      await p.locator('#view-map').click(); await p.waitForFunction(() => /connection|conexi|联网/.test(document.getElementById('map-status').textContent));
    }); await offline.close();
    const desk = await browser.newContext({ locale: 'en-US', viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
    await ok('Desktop shows the list and map together', async () => {
      const p = await desk.newPage(); p.on('pageerror', e => errors.push(e.message)); await p.route('https://tile.openstreetmap.org/**', r => r.abort());
      await p.route('https://foodlocator.sfmfoodbank.org/**', r => r.abort());
      await p.goto(base + '/#c/foodbank'); await p.waitForSelector('.leaflet-container');
      assert(await p.locator('#list').isVisible()); assert(await p.locator('#map').isVisible());
      await p.screenshot({ path: path.join(output, 'desktop.png') });
    }); await desk.close();
    await ok('No uncaught browser errors', async () => assert.deepEqual(errors, []));
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ checked: new Date().toISOString().slice(0, 10), checks, errors }, null, 2));
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

'use strict';
// One synthetic run on a slow profile. It is a comparison tool, not a promise about real phones.
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
let pw; try { pw = require('playwright'); } catch (_) { pw = require(path.resolve(path.dirname(process.execPath), '../node_modules/playwright')); }
const { createServer } = require('../tools/serve.cjs');
(async () => {
  const server = createServer(); await new Promise(r => server.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await pw.chromium.launch({ channel: 'chrome', headless: true });
  try {
    const c = await browser.newContext({ locale: 'en-US', viewport: { width: 360, height: 640 }, serviceWorkers: 'block' }); const page = await c.newPage();
    const client = await c.newCDPSession(page); await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', { offline: false, latency: 300, downloadThroughput: 400000 / 8, uploadThroughput: 150000 / 8 });
    await client.send('Emulation.setCPUThrottlingRate', { rate: 6 });
    await page.route('https://foodlocator.sfmfoodbank.org/**', r => r.abort());
    await page.goto(base); await page.waitForSelector('body[data-ready]');
    const first = await page.evaluate(() => ({ fcp: Math.round(performance.getEntriesByType('paint').filter(p => p.name === 'first-contentful-paint')[0].startTime), ready: Math.round(performance.now()), bytes: performance.getEntriesByType('navigation')[0].encodedBodySize + performance.getEntriesByType('resource').reduce((s, r) => s + r.encodedBodySize, 0) }));
    const openList = await page.evaluate(() => { const t = performance.now(); document.querySelector('[data-cat=foodbank]').click(); return new Promise(res => { const check = () => document.querySelectorAll('.resource').length ? res(Math.round(performance.now() - t)) : setTimeout(check, 10); check(); }); });
    const search = await page.evaluate(() => { const t = performance.now(); const el = document.getElementById('search'); el.value = '94103'; el.dispatchEvent(new Event('input')); return new Promise(res => setTimeout(() => res(Math.round(performance.now() - t)), 260)); });
    const sizes = {}; for (const f of ['index.html', 'css/site.css', 'js/core.js', 'js/app.js', 'js/nav.js', 'vendor/leaflet/leaflet.js']) { const b = fs.readFileSync(path.resolve(__dirname, '..', f)); sizes[f] = { bytes: b.length, gzip: zlib.gzipSync(b).length }; }
    const report = { conditions: 'Chromium, 360x640, CPU 6x slowdown; 400 kbit/s down, 300 ms latency. Single local synthetic run, not a real-device measurement.', firstLoad: first, openFoodBankListMs: openList, searchRoundTripMs: search, sizes };
    fs.writeFileSync(path.resolve(__dirname, '../qa/performance.json'), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

'use strict';
// Uses the real free services once: OpenStreetMap tiles and the walking route server. Run by hand.
const fs = require('node:fs'), path = require('node:path');
let pw; try { pw = require('playwright'); } catch (_) { pw = require(path.resolve(path.dirname(process.execPath), '../node_modules/playwright')); }
const { createServer } = require('../tools/serve.cjs');
(async () => {
  const server = createServer(); await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await pw.chromium.launch({ channel: 'chrome', headless: true });
  try {
    const ctx = await browser.newContext({ locale: 'en-US', viewport: { width: 375, height: 760 }, serviceWorkers: 'block', geolocation: { latitude: 37.7853, longitude: -122.4117, accuracy: 15 }, permissions: ['geolocation'] });
    const page = await ctx.newPage(); const tiles = [];
    page.on('response', r => { if (r.url().includes('tile.openstreetmap.org')) tiles.push(r.status()); });
    await page.goto('http://127.0.0.1:' + server.address().port + '/#c/meals'); await page.waitForSelector('.resource');
    await page.locator('#r-st-anthony [data-go]').click(); await page.locator('#go-inapp').click();
    await page.waitForFunction(() => document.querySelectorAll('#step-list li').length > 1, null, { timeout: 30000 });
    await page.waitForFunction(() => document.querySelectorAll('.leaflet-tile-loaded').length > 0, null, { timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.resolve(__dirname, '../qa/live-nav.png') });
    console.log(JSON.stringify({ tilesOk: tiles.filter(s => s === 200).length, tilesOther: tiles.filter(s => s !== 200), steps: await page.locator('#step-list li').allInnerTexts(), banner: await page.locator('#nav-instruction').innerText(), sub: await page.locator('#nav-sub').innerText() }, null, 2));
    fs.writeFileSync(path.resolve(__dirname, '../qa/live-services.json'), JSON.stringify({ checked: new Date().toISOString(), tilesOk: tiles.filter(s => s === 200).length }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

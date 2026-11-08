'use strict';
// Isolated automated tests of our local project; never attaches to a user's browser.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
let pw;try{pw=require('playwright');}catch(_){pw=require(path.resolve(path.dirname(process.execPath),'../node_modules/playwright'));}
const {createServer}=require('../tools/serve.cjs');
const root=path.resolve(__dirname,'..'),output=path.join(root,'qa');fs.mkdirSync(output,{recursive:true});
(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  let browser;const checks=[],errors=[];
  async function ok(name,fn){await fn();checks.push(name);console.log('PASS '+name);}
  try{
    browser=await pw.chromium.launch({channel:'chrome',headless:true});
    const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    const requests=[];page.on('request',r=>requests.push(r.url()));
    await page.route('https://**/*',r=>r.abort());
    await page.goto(base);await page.waitForSelector('body[data-ready]');
    await ok('Initial list: 8 entries, zero third-party requests',async()=>{assert.equal(await page.locator('.resource').count(),8);assert(!requests.some(u=>u.startsWith('https:')));});
    await page.screenshot({path:path.join(output,'desktop.png')});
    await ok('Category filters and reset',async()=>{
      for(const [type,count] of [['food',3],['shelter',4],['groceries',1]]){await page.locator('[data-filter='+type+']').click();assert.equal(await page.locator('.resource').count(),count);}
      assert.equal(await page.locator('[data-map-id]').count(),0);
      await page.locator('#search').fill('not-a-place');await page.waitForSelector('#empty:visible');await page.locator('#reset').click();assert.equal(await page.locator('.resource').count(),8);
    });
    await ok('Search plus Chinese and Spanish translations',async()=>{
      await page.locator('#search').fill('Jennings');await page.waitForFunction(()=>document.querySelectorAll('.resource').length===1);assert.match(await page.locator('#resource-list').innerText(),/Mother Brown/);
      await page.locator('#language').selectOption('zh');assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');assert.match(await page.locator('#resource-list').innerText(),/需基本登记/);
      await page.locator('#language').selectOption('es');assert.match(await page.locator('#resource-list').innerText(),/Formulario básico/);
      await page.locator('#language').selectOption('en');await page.locator('#search').fill('');await page.waitForFunction(()=>document.querySelectorAll('.resource').length===8);
    });
    await ok('Location denial leaves resources usable',async()=>{
      await page.evaluate(()=>{navigator.geolocation.getCurrentPosition=(_,fail)=>fail({code:1});});await page.locator('#locate').click();assert.match(await page.locator('#location-status').innerText(),/not shared/);assert.equal(await page.locator('.resource').count(),8);
    });
    await ok('Mock location sorts by distance and can be cleared',async()=>{
      await page.evaluate(()=>{navigator.geolocation.getCurrentPosition=success=>success({coords:{latitude:37.7762948,longitude:-122.4111736,accuracy:20}});});await page.locator('#locate').click();assert.equal(await page.locator('.resource').first().getAttribute('data-resource-id'),'sanctuary');assert(await page.locator('.distance').count()>0);
      await page.locator('#clear-location').click();assert.equal(await page.locator('.distance').count(),0);assert.equal(await page.locator('.resource').first().getAttribute('data-resource-id'),'glide');
    });
    await ok('Failed tiles show fallback; 7 pins and popups work',async()=>{
      await page.locator('#load-map').click();await page.waitForSelector('.leaflet-marker-icon');await page.waitForFunction(()=>document.getElementById('map-status').textContent.includes('tiles'));
      assert.equal(await page.locator('.resource-marker').count(),7);assert.equal(await page.locator('.resource').count(),8);assert(await page.locator('#retry-map').isVisible());
      await page.locator('[data-map-id=sanctuary]').click();await page.waitForSelector('.leaflet-popup');assert.match(await page.locator('.leaflet-popup').innerText(),/The Sanctuary/);
      await page.locator('#hide-map').click();assert.equal(await page.locator('.leaflet-marker-icon').count(),0);
    });
    await ok('Text download contains resource details',async()=>{
      const promise=page.waitForEvent('download');await page.locator('#save-list').click();const download=await promise;const text=fs.readFileSync(await download.path(),'utf8');assert(text.includes('2026-11-07'));assert(text.includes('628-652-8000'));assert(text.includes('GLIDE'));
    });
    await ok('390px and 320px: no horizontal overflow, map collapses',async()=>{
      for(const width of [390,320]){await page.setViewportSize({width,height:844});await page.evaluate(()=>scrollTo(0,0));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await page.locator('#mobile-map').isVisible());assert(!(await page.locator('#map-section').isVisible()));await page.screenshot({path:path.join(output,'mobile-'+width+'.png')});}
      await page.setViewportSize({width:390,height:844});await page.locator('#mobile-map').click();assert(await page.locator('#map-section').isVisible());await page.locator('#hide-map').click();assert(!(await page.locator('#map-section').isVisible()));
    });
    await ok('Leaflet script failure does not hide the list',async()=>{
      const p=await context.newPage();await p.route('**/vendor/leaflet/**',r=>r.abort());await p.goto(base);await p.locator('#load-map').click();await p.waitForFunction(()=>document.getElementById('map-status').textContent.includes('could not load'));assert.equal(await p.locator('.resource').count(),8);await p.close();
    });
    await ok('Blocked localStorage still allows initialization',async()=>{
      const p=await context.newPage();await p.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('blocked')};Storage.prototype.setItem=()=>{throw new Error('blocked')};});await p.goto(base);await p.waitForSelector('body[data-ready]');assert.equal(await p.locator('.resource').count(),8);await p.close();
    });
    const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
    await ok('Without JavaScript all addresses and calls remain available',async()=>{const p=await noJS.newPage();await p.goto(base);assert.equal(await p.locator('.resource').count(),8);assert.equal(await p.locator('.resource-actions a[href^="tel:"]').count(),8);assert(!(await p.locator('.finder').isVisible()));await p.screenshot({path:path.join(output,'no-js.png')});});await noJS.close();
    const offline=await browser.newContext();
    await ok('Service worker reopens the directory offline',async()=>{
      const p=await offline.newPage();await p.goto(base);await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);await offline.setOffline(true);await p.reload();await p.waitForSelector('body[data-ready]');assert.equal(await p.locator('.resource').count(),8);assert(await p.locator('#offline-notice').isVisible());await p.locator('[data-filter=food]').click();assert.equal(await p.locator('.resource').count(),3);
    });await offline.close();
    await ok('No uncaught browser errors',async()=>assert.deepEqual(errors,[]));
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({checked:'2026-11-07',checks,errors},null,2));
  }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

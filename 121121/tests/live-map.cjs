'use strict';
const fs=require('node:fs'),path=require('node:path');
let pw;try{pw=require('playwright');}catch(_){pw=require(path.resolve(path.dirname(process.execPath),'../node_modules/playwright'));}
const {createServer}=require('../tools/serve.cjs');
(async()=>{
  const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await pw.chromium.launch({channel:'chrome',headless:true});
  const responses=[];
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1080}});
    page.on('response',r=>{if(r.url().includes('tile.openstreetmap.org'))responses.push({url:r.url(),status:r.status()});});
    await page.goto('http://127.0.0.1:'+server.address().port);
    await page.locator('#load-map').click();await page.waitForSelector('.leaflet-marker-icon');
    await page.waitForFunction(()=>document.querySelectorAll('.leaflet-tile-loaded').length>0,{},{timeout:20000});
    await page.locator('#map-section').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.resolve(__dirname,'../qa/live-map.png')});
    console.log(JSON.stringify({responses,loadedTiles:await page.locator('.leaflet-tile-loaded').count(),mapStatus:await page.locator('#map-status').textContent(),markers:await page.locator('.resource-marker').count()},null,2));
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

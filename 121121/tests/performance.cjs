'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
let pw;try{pw=require('playwright');}catch(_){pw=require(path.resolve(path.dirname(process.execPath),'../node_modules/playwright'));}
const {createServer}=require('../tools/serve.cjs');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await pw.chromium.launch({channel:'chrome',headless:true});
 try{
  const c=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});const page=await c.newPage();
  const client=await c.newCDPSession(page);await client.send('Network.enable');await client.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:750000/8,uploadThroughput:250000/8});await client.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.goto(base);await page.waitForSelector('body[data-ready]');
  const perf=await page.evaluate(()=>({navigation:performance.getEntriesByType('navigation').map(n=>({domContentLoaded:n.domContentLoadedEventEnd,load:n.loadEventEnd})),paint:performance.getEntriesByType('paint').map(p=>({name:p.name,time:p.startTime})),initialNetwork:performance.getEntriesByType('resource').map(r=>({url:r.name,bytes:r.encodedBodySize}))}));
  await page.route(base+'/baseline',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync(path.resolve(__dirname,'../.original/index.html'),'utf8')}));
  await page.route('https://**/*',r=>r.abort());let baselineError='';page.on('pageerror',e=>baselineError=e.message);await page.goto(base+'/baseline');await page.locator('#enterSiteBtn').click();
  const baseline={externalScripts:await page.locator('script[src^="https:"]').count(),renderedResourcesWithCDNFailure:await page.locator('#list-wrapper li').count(),error:baselineError};
  await page.screenshot({path:path.resolve(__dirname,'../qa/original-cdn-failure.png')});
  const sizes={};for(const f of ['index.html','css/site.css','js/core.js','js/app.js']){const b=fs.readFileSync(path.resolve(__dirname,'..',f));sizes[f]={bytes:b.length,gzip:zlib.gzipSync(b).length};}
  const report={conditions:'Chromium, 390x844, CPU 4x slowdown; 750 kbit/s down, 150 ms latency. Single local synthetic run, not a real-device field measurement.',perf,baseline,sizes};
  fs.writeFileSync(path.resolve(__dirname,'../qa/performance.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..');
const allowed=new Set(['index.html','plain.html','plain-es.html','plain-zh.html','css/site.css','js/core.js','js/app.js','js/nav.js','sw.js','assets/favicon.svg','vendor/leaflet/leaflet.js','vendor/leaflet/leaflet.css','vendor/leaflet/LICENSE']);
function createServer() {
  return http.createServer((req,res)=>{
    let pathname;
    try { pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '')||'index.html'; } catch (_) { res.writeHead(400).end(); return; }
    if(!allowed.has(pathname)){res.writeHead(404).end('Not found');return;}
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
    fs.readFile(path.join(root,pathname),(error,body)=>{
      if(error){res.writeHead(404).end('Not found');return;}
      res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'})[path.extname(pathname)]||'text/plain');
      res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Cache-Control','no-cache');
      res.setHeader('Vary','Accept-Encoding');
      if(/\bgzip\b/.test(req.headers['accept-encoding']||'')){res.setHeader('Content-Encoding','gzip');body=zlib.gzipSync(body);}
      res.setHeader('Content-Length',body.length);
      res.end(req.method==='HEAD'?undefined:body);
    });
  });
}
if(require.main===module){const port=Number(process.env.PORT||4173);createServer().listen(port,'127.0.0.1',()=>console.log('SF Neighbor: http://127.0.0.1:'+port+'\nPress Ctrl+C to stop.'));}
module.exports={createServer};

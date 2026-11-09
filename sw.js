/* Only caches this site's own files. Map tiles and third-party data are never stored here. */
const CACHE='sf-neighbor-6eb945600984';
const ASSETS=["./","./css/site.css","./js/core.js","./js/app.js","./assets/favicon.svg"];
const LAZY=["./js/nav.js","./vendor/leaflet/leaflet.js","./vendor/leaflet/leaflet.css"];
const scoped=p=>new URL(p,self.registration.scope).href;
const CORE=new Set(ASSETS.map(scoped)),ONDEMAND=new Set(LAZY.map(scoped));
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('sf-neighbor-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=event.request.url.split('#')[0];
  if(ONDEMAND.has(url)){
    /* The map library rarely changes: save data and load instantly after first use. */
    event.respondWith(caches.open(CACHE).then(cache=>cache.match(url).then(hit=>hit||fetch(event.request).then(res=>{if(res.ok)cache.put(url,res.clone());return res;}))));
    return;
  }
  if(!CORE.has(url))return;
  /* Try the network briefly so edits arrive, but never leave a slow phone waiting on it. */
  event.respondWith(caches.open(CACHE).then(cache=>{
    const network=fetch(event.request).then(res=>{if(res.ok)cache.put(url,res.clone());return res;});
    event.waitUntil(network.catch(()=>{}));
    return Promise.race([network.catch(()=>cache.match(url)),new Promise(r=>setTimeout(r,2500)).then(()=>cache.match(url).then(hit=>hit||network))]).then(res=>res||cache.match(url)||Response.error());
  }));
});

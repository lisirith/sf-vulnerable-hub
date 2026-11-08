/* Only cache this directory's own files. Never prefetch or cache map tiles. */
const CACHE='__CACHE__';
const ASSETS=__ASSETS__;
const URLS=new Set(ASSETS.map(p=>new URL(p,self.registration.scope).href));
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('sf-neighbor-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||!URLS.has(event.request.url))return;
  // Network first: fresh provider edits arrive online; cached text works offline.
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    let timer;
    const controller=new AbortController();
    try{
      timer=setTimeout(()=>controller.abort(),4000);
      const response=await fetch(event.request,{signal:controller.signal});
      if(response.ok){await cache.put(event.request,response.clone());return response;}
      return await cache.match(event.request)||response;
    }catch(_){return await cache.match(event.request)||Response.error();}
    finally{clearTimeout(timer);}
  })());
});

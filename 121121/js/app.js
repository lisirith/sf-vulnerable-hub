(function () {
  'use strict';
  const C = window.SFDirectory;
  if (!C) return; // The pre-rendered directory remains usable if scripts fail.
  let data;
  try { data = JSON.parse(document.getElementById('resource-data').textContent); } catch (_) { return; }
  const $ = id => document.getElementById(id);
  let lang = 'en', type = 'all', query = '', location = null, locating = false, locationMessage = 'locationHint';
  let map = null, markers = [], leafletPromise = null, mapRun = 0, mapTimer = null, tileLayer = null, mapState = '';
  let visible = data.resources.slice();
  try { const saved = localStorage.getItem('sf-neighbor-language'); if (C.labels[saved]) lang = saved; } catch (_) { /* storage can be disabled */ }
  function t(key) { return C.labels[lang][key] || C.labels.en[key] || key; }
  function message(key) { locationMessage = key; $('location-status').textContent = t(key); }
  function render() {
    visible = C.filter(data.resources, type, query, location);
    $('resource-list').innerHTML = visible.map(r => C.card(r, lang, data.checked, location)).join('');
    $('resource-list').hidden = !visible.length;
    $('empty').hidden = !!visible.length;
    $('result-count').textContent = visible.length + ' ' + t(visible.length === 1 ? 'result' : 'results');
    document.querySelectorAll('[data-filter]').forEach(b => { const active = b.dataset.filter === type; b.setAttribute('aria-pressed', String(active)); b.classList.toggle('active', active); });
    if (map) renderMarkers();
  }
  function translate() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $('language').value = lang;
    $('search').placeholder = t('search');
    $('checked-date').textContent = C.dateLabel(data.checked, lang);
    $('map').setAttribute('aria-label', t('mapLabel'));
    $('locate').querySelector('span').textContent = t(locating ? 'locating' : 'locate');
    message(locationMessage);
    if (mapState) $('map-status').textContent = t(mapState);
    render();
  }
  document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => { type = b.dataset.filter; render(); }));
  let searchTimer;
  $('search').addEventListener('input', () => {
    query = $('search').value;
    clearTimeout(searchTimer); searchTimer = setTimeout(render, 100);
  });
  $('reset').addEventListener('click', () => { query = ''; type = 'all'; $('search').value = ''; clearTimeout(searchTimer); render(); $('search').focus(); });
  $('language').addEventListener('change', () => { lang = C.labels[$('language').value] ? $('language').value : 'en'; try { localStorage.setItem('sf-neighbor-language',lang); } catch (_) {} translate(); });
  $('locate').addEventListener('click', () => {
    if (locating) return;
    if (!window.isSecureContext) { message('locationInsecure'); return; }
    if (!navigator.geolocation) { message('locationUnavailable'); return; }
    locating = true; $('locate').disabled = true; $('locate').querySelector('span').textContent = t('locating'); message('locating');
    let finished = false;
    const finish = () => { if (finished) return false; finished = true; clearTimeout(timeout); locating = false; $('locate').disabled = false; $('locate').querySelector('span').textContent = t('locate'); return true; };
    const timeout = setTimeout(() => { if (finish()) message('locationTimeout'); }, 12000);
    try {
      navigator.geolocation.getCurrentPosition(pos => {
        if (!finish()) return;
        const {latitude,longitude,accuracy} = pos.coords;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) { message('locationUnavailable'); return; }
        location = {lat:latitude,lng:longitude};
        message(C.distance(location,{lat:37.7749,lng:-122.4194}) > 25 ? 'locationOutside' : accuracy > 1500 ? 'locationApproximate' : 'locationReady');
        $('clear-location').hidden = false; render();
      }, err => { if (finish()) message(err.code === 1 ? 'locationDenied' : err.code === 3 ? 'locationTimeout' : 'locationUnavailable'); }, {enableHighAccuracy:false,timeout:10000,maximumAge:60000});
    } catch (_) { if (finish()) message('locationUnavailable'); }
  });
  $('clear-location').addEventListener('click', () => { location = null; $('clear-location').hidden = true; message('locationHint'); render(); $('locate').focus(); });
  function loadAsset(tag, attr, url) {
    return new Promise((resolve,reject) => {
      const el = document.createElement(tag); let timer;
      const fail = () => { clearTimeout(timer); el.remove(); reject(new Error('Map asset unavailable')); };
      el.onload = () => { clearTimeout(timer); resolve(); }; el.onerror = fail;
      if (tag === 'link') el.rel = 'stylesheet';
      el[attr] = url; timer = setTimeout(fail,10000); document.head.appendChild(el);
    });
  }
  function loadLeaflet() {
    if (!leafletPromise) leafletPromise = Promise.all([loadAsset('link','href','vendor/leaflet/leaflet.css'),loadAsset('script','src','vendor/leaflet/leaflet.js')]).then(() => {
      if (!window.L) throw new Error('Map library unavailable');
    }).catch(error => { leafletPromise = null; throw error; });
    return leafletPromise;
  }
  function mapStatus(key, retry) {
    mapState = key; $('map-status-area').hidden = !key; $('map-status').textContent = key ? t(key) : ''; $('retry-map').hidden = !retry;
  }
  function renderMarkers() {
    markers.forEach(m => m.remove()); markers = [];
    const places = visible.filter(C.hasPoint);
    places.forEach((r,i) => {
      const popup = document.createElement('div');
      popup.innerHTML = '<strong>'+C.escape(r.name)+'</strong><p>'+C.escape(r.address)+'</p><p>'+C.escape(t(r.access))+'</p><a href="'+C.escape(C.directions(r))+'" target="_blank" rel="noopener noreferrer">'+C.escape(t('directions'))+'</a>';
      const marker = L.marker([r.lat,r.lng], {title:r.name,alt:r.name,keyboard:true,icon:L.divIcon({className:'resource-marker '+r.type,html:String(i+1),iconSize:[31,31],iconAnchor:[15,15]})}).addTo(map).bindPopup(popup);
      marker.resourceId = r.id; markers.push(marker);
    });
    if (places.length) { map.fitBounds(places.map(r => [r.lat,r.lng]),{padding:[32,32],maxZoom:15,animate:false}); if (mapState==='mapNoPins') mapStatus('',false); }
    else mapStatus('mapNoPins',false);
  }
  function removeMap() { clearTimeout(mapTimer); if (map) { map.remove(); map = null; } markers=[]; tileLayer=null; }
  async function showMap(resourceId) {
    const run = ++mapRun;
    $('map-section').classList.add('mobile-open'); $('mobile-map').setAttribute('aria-expanded','true'); $('hide-map').hidden=false;
    if (window.location.protocol === 'file:') { mapStatus('mapFile',false); return; }
    if (!navigator.onLine) { mapStatus('mapError',true); return; }
    $('load-map').disabled = true;
    if (!map) mapStatus('mapLoading',false);
    try {
      await loadLeaflet();
      if (run !== mapRun) return;
      $('map-placeholder').hidden=true; $('map').hidden=false;
      if (!map) {
        map = L.map('map',{scrollWheelZoom:false,zoomControl:true,preferCanvas:true,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false}).setView([37.77,-122.42],12);
        let loaded = 0, failed = 0;
        tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, minZoom:10, updateWhenIdle:true,keepBuffer:1,detectRetina:false,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
        tileLayer.on('tileload',() => { loaded++; });
        tileLayer.on('tileerror',() => { failed++; mapStatus('tileError',true); });
        tileLayer.on('load',() => { clearTimeout(mapTimer); if (!failed && loaded && mapState!=='mapNoPins') mapStatus('',false); });
        mapTimer=setTimeout(() => { if (!loaded) mapStatus('tileError',true); },10000);
        tileLayer.addTo(map); renderMarkers();
      }
      map.invalidateSize();
      $('map-hint').textContent=t('mapHint');
      const selected = markers.find(m => m.resourceId===resourceId);
      if (selected) { map.setView(selected.getLatLng(),16,{animate:false}); selected.openPopup(); }
      if (resourceId || window.matchMedia('(max-width:760px)').matches) $('map-section').scrollIntoView({block:'start',behavior:'auto'});
    } catch (_) { if (run===mapRun) { removeMap(); $('map').hidden=true; $('map-placeholder').hidden=false; mapStatus('mapError',true); } }
    finally { if (run===mapRun) $('load-map').disabled=false; }
  }
  $('load-map').addEventListener('click',() => showMap());
  $('mobile-map').addEventListener('click',() => showMap());
  $('retry-map').addEventListener('click',() => { removeMap(); showMap(); });
  $('hide-map').addEventListener('click',() => {
    mapRun++; removeMap(); $('map').hidden=true; $('map-placeholder').hidden=false; $('hide-map').hidden=true; $('load-map').disabled=false; mapStatus('',false);
    $('map-section').classList.remove('mobile-open'); $('mobile-map').setAttribute('aria-expanded','false'); $('map-hint').textContent=t('mapPrivacy');
    (window.matchMedia('(max-width:760px)').matches ? $('mobile-map') : $('load-map')).focus();
  });
  $('resource-list').addEventListener('click',e => { const button=e.target.closest('[data-map-id]'); if (button) showMap(button.dataset.mapId); });
  $('save-list').addEventListener('click',() => {
    try {
      clearTimeout(searchTimer); render();
      const lines = ['SF Neighbor — San Francisco', t('checked')+': '+data.checked,t('notice'),''];
      visible.forEach(r => { const copy=r[lang]; lines.push(r.name,r.address||t('citywide'),t(r.access),copy.hours,copy.note,copy.phoneLabel+': '+C.formatPhone(r.phone),r.url||C.directions(r),...r.sources.map(s=>s.url),''); });
      lines.push(t('helpTitle')+': 628-652-8000', t('moreHelp'),t('emergency'));
      const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/plain;charset=utf-8'}));
      const a=document.createElement('a'); a.href=url; a.download='sf-neighbor-'+data.checked+'-'+lang+'.txt'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
      $('save-status').textContent=t('saved');
    } catch (_) { $('save-status').textContent=t('saveFailed'); }
  });
  function connection() { $('offline-notice').hidden = navigator.onLine; }
  window.addEventListener('online',connection); window.addEventListener('offline',connection);
  $('stale-notice').hidden = (Date.now()-new Date(data.checked+'T23:59:59-08:00').getTime()) < 30*86400000;
  document.querySelectorAll('[data-count]').forEach(el => { el.textContent = data.resources.filter(r => el.dataset.count==='all'||r.type===el.dataset.count).length; });
  translate(); connection(); document.body.dataset.ready = 'true';
  if ('serviceWorker' in navigator && window.isSecureContext && /^https?:$/.test(window.location.protocol)) {
    window.addEventListener('load',() => { navigator.serviceWorker.register('./sw.js').catch(()=>{}); });
  }
})();

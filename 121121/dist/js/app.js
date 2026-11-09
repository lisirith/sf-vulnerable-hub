(function () {
  'use strict';
  const C = window.SFDirectory;
  if (!C) return; // The links on the home page still lead to the text-only directory.
  let data;
  try { data = JSON.parse(document.getElementById('resource-data').textContent); } catch (_) { return; }
  const $ = id => document.getElementById(id);
  const PAGE = 25;
  const FOOD_URLS = ['https://foodlocator.sfmfoodbank.org/data/sites.sample.json', 'https://foodlocator.sfmfoodbank.org/data/sites.json'];
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const wide = window.matchMedia('(min-width:900px)');
  const CHIPS = { foodbank: ['emergency', 'enrolling', 'anyzip'], meals: ['open'], shelter: [], hygiene: ['open'], restroom: ['open'], health: ['open'], access: ['open'], phone: [] };
  const CHIP_LABEL = { open: 'chipOpen', emergency: 'chipEmergency', enrolling: 'chipEnrolling', anyzip: 'chipAnyZip' };

  let lang = 'en', cat = null, query = '', chips = {}, here = null, limit = PAGE, visible = [], locationKey = '';
  let pantries = data.foodbank.places, foodState = 'saved', foodGenerated = data.foodbank.generated, foodTried = false;
  let mapReady = null, navToken = 0, navRoute = null, navPlace = null, navLastRoute = 0, navOrigin = null, lastSheetFocus = null;

  try { const saved = localStorage.getItem('sf-neighbor-language'); if (C.labels[saved]) lang = saved; else { const l = (navigator.language || '').slice(0, 2); if (C.labels[l]) lang = l; } } catch (_) { /* storage can be disabled */ }
  function t(key) { return C.labels[lang][key] || C.labels.en[key] || key; }
  function all() { return data.resources.concat(pantries); }
  function now() { return C.sfNow(); }
  function find(id) { return all().filter(r => r.id === id)[0] || null; }

  /* Routing: the browser Back button closes the map, the sheet and navigation. */
  function parseHash() {
    let raw = '';
    try { raw = decodeURIComponent(window.location.hash.slice(1)); } catch (_) { /* malformed link */ }
    const p = raw.split('/');
    if (p[0] !== 'c' || C.CATEGORIES.indexOf(p[1]) < 0) return { screen: 'home' };
    const s = { screen: 'list', cat: p[1], view: p[2] === 'map' ? 'map' : 'list', go: null, sel: null, nav: null };
    if (p[2] === 'nav') { s.screen = 'nav'; s.nav = p[3]; } else if (p[3] === 'go') s.go = p[4]; else if (p[3] === 'p') s.sel = p[4];
    return s;
  }
  function setHash(h, replace) {
    if (replace) { history.replaceState(null, '', h); apply(); } else if (window.location.hash === h) apply(); else window.location.hash = h;
  }
  function currentView() { const s = parseHash(); return s.view || 'list'; }

  function apply() {
    const s = parseHash();
    closeSheet();
    if (s.screen === 'nav' && !data.routing) { setHash('#c/' + s.cat, true); return; }
    if (navPlace && s.screen !== 'nav') endNav();
    if (s.screen === 'home') {
      document.body.dataset.screen = 'home'; cat = null;
      $('home').hidden = false; $('browse').hidden = true;
      window.scrollTo(0, 0);
      return;
    }
    $('home').hidden = true; $('browse').hidden = false;
    const entering = cat !== s.cat;
    if (entering) {
      cat = s.cat; query = ''; chips = {}; limit = PAGE; $('search').value = '';
      renderCategory(); renderList(); window.scrollTo(0, 0);
      if (cat === 'foodbank') refreshFoodBank();
    }
    document.body.dataset.screen = s.screen === 'nav' ? 'nav' : s.view;
    $('view-list').setAttribute('aria-pressed', String(s.view === 'list'));
    $('view-map').setAttribute('aria-pressed', String(s.view === 'map'));
    if (s.screen !== 'nav') $('pin-card').hidden = !s.sel;
    const needMap = s.screen === 'nav' || s.view === 'map' || !!s.sel || (wide.matches && !saveData);
    if (s.screen === 'nav') startNav(s.nav);
    else if (needMap) showMap(s.sel);
    if (s.go) openSheet(s.go);
  }

  /* List -------------------------------------------------------------- */
  function renderCategory() {
    $('cat-title').textContent = t(cat);
    $('tip').textContent = t('tip_' + cat);
    const links = $('tip-links');
    links.hidden = cat !== 'shelter';
    links.innerHTML = cat === 'shelter'
      ? '<a href="https://www.sf.gov/join-adult-shelter-waitlist-san-francisco" target="_blank" rel="noopener noreferrer">' + C.escape(t('waitlistJoin')) + '</a><a href="https://www.sf.gov/data/check-your-position-adult-shelter-waitlist" target="_blank" rel="noopener noreferrer">' + C.escape(t('waitlistCheck')) + '</a>'
      : '';
    $('chips').innerHTML = CHIPS[cat].map(c => '<button type="button" class="chip" data-chip="' + c + '" aria-pressed="' + (!!chips[c]) + '">' + C.escape(t(CHIP_LABEL[c])) + '</button>').join('');
    document.querySelector('.view-toggle').hidden = cat === 'phone';
    $('locate').hidden = cat === 'phone';
    dataLine();
  }
  function dataLine() {
    const parts = [];
    if (cat === 'foodbank') parts.push(t(foodState === 'live' ? 'liveData' : 'savedData') + ' ' + C.dateLabel(foodGenerated.slice(0, 10), lang) + '.');
    if (cat && cat !== 'phone') parts.push(t('hoursNotLive'));
    $('data-line').textContent = parts.join(' ');
  }
  function renderList() {
    if (!cat) return;
    const n = now();
    visible = C.filter(all(), { category: cat, query, chips, here }, n);
    const ctx = { now: n, here, checked: data.checked };
    $('list').innerHTML = visible.slice(0, limit).map(r => C.card(r, lang, ctx)).join('');
    $('list').hidden = !visible.length;
    $('empty').hidden = !!visible.length;
    $('more').hidden = visible.length <= limit;
    $('count').textContent = visible.length + ' ' + t(visible.length === 1 ? 'place' : 'places');
    document.querySelectorAll('[data-chip]').forEach(b => b.setAttribute('aria-pressed', String(!!chips[b.dataset.chip])));
    if (window.SFMap && window.SFMap.isReady()) window.SFMap.setPlaces(visible.filter(C.hasPoint));
  }
  function showMore() {
    const n = now(), ctx = { now: n, here, checked: data.checked }, from = limit;
    limit += PAGE;
    $('list').insertAdjacentHTML('beforeend', visible.slice(from, limit).map(r => C.card(r, lang, ctx)).join(''));
    $('more').hidden = visible.length <= limit;
  }
  function translate() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-cat-title]').forEach(el => { el.textContent = t(el.dataset.catTitle); });
    document.querySelectorAll('[data-cat-sub]').forEach(el => { el.textContent = t(el.dataset.catSub); });
    $('language').value = lang;
    $('search').placeholder = t('search');
    $('checked-date').textContent = C.dateLabel(data.checked, lang);
    $('text-version').href = lang === 'en' ? 'plain.html' : 'plain-' + lang + '.html';
    if (locationKey) $('location-status').textContent = t(locationKey);
    if (cat) { renderCategory(); renderList(); }
    if (navRoute) renderSteps();
  }

  /* The Food Bank publishes its site list openly; use the current one whenever we can get it. */
  function refreshFoodBank() {
    if (foodTried || !navigator.onLine || saveData) return;
    foodTried = true;
    const attempt = i => fetchJSON(FOOD_URLS[i], 8000).then(json => {
      const list = C.pantriesFromExport(json);
      if (list.length < 40) throw new Error('Too few sites');
      pantries = list; foodState = 'live'; foodGenerated = String(json.generated_at || foodGenerated);
      if (cat === 'foodbank') { dataLine(); renderList(); }
    }).catch(() => { if (i + 1 < FOOD_URLS.length) return attempt(i + 1); });
    attempt(0);
  }
  function fetchJSON(url, ms) {
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = setTimeout(() => { if (ctrl) ctrl.abort(); }, ms);
    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined).then(r => { clearTimeout(timer); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }, e => { clearTimeout(timer); throw e; });
  }

  /* Location ---------------------------------------------------------- */
  function locMessage(key) { locationKey = key; $('location-status').textContent = key ? t(key) : ''; }
  function fix(high, ms) {
    return new Promise((resolve, reject) => {
      if (!window.isSecureContext) { reject({ key: 'locationInsecure' }); return; }
      if (!navigator.geolocation) { reject({ key: 'locationUnavailable' }); return; }
      let done = false;
      const timer = setTimeout(() => { if (!done) { done = true; reject({ key: 'locationTimeout' }); } }, ms + 1500);
      navigator.geolocation.getCurrentPosition(p => {
        if (done) return; done = true; clearTimeout(timer);
        const lat = p.coords.latitude, lng = p.coords.longitude;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) reject({ key: 'locationUnavailable' }); else resolve({ lat, lng, acc: p.coords.accuracy });
      }, e => { if (done) return; done = true; clearTimeout(timer); reject({ key: e.code === 1 ? 'locationDenied' : e.code === 3 ? 'locationTimeout' : 'locationUnavailable' }); }, { enableHighAccuracy: high, timeout: ms, maximumAge: high ? 5000 : 60000 });
    });
  }
  function setHere(pos) {
    here = pos;
    $('clear-location').hidden = false;
    locMessage(C.distance(pos, { lat: 37.7749, lng: -122.4194 }) > 25 ? 'locationOutside' : pos.acc > 1500 ? 'locationApproximate' : 'locationReady');
    if (window.SFMap && window.SFMap.isReady()) window.SFMap.setHere(pos);
  }
  function locate() {
    const button = $('locate');
    if (button.disabled) return;
    button.disabled = true; button.querySelector('span').textContent = t('locating'); locMessage('locating');
    fix(false, 10000).then(pos => { setHere(pos); limit = PAGE; renderList(); }, err => locMessage(err.key)).then(() => { button.disabled = false; button.querySelector('span').textContent = t('locate'); });
  }

  /* Map: the library and tiles load only when someone asks for a map. -- */
  function loadAsset(tag, attr, url) {
    return new Promise((resolve, reject) => {
      const el = document.createElement(tag);
      const timer = setTimeout(() => { el.remove(); reject(new Error('timeout')); }, 15000);
      el.onload = () => { clearTimeout(timer); resolve(); };
      el.onerror = () => { clearTimeout(timer); el.remove(); reject(new Error('failed')); };
      if (tag === 'link') el.rel = 'stylesheet';
      el[attr] = url; document.head.appendChild(el);
    });
  }
  function mapStatus(key) { $('map-status').hidden = !key; $('map-status').textContent = key ? t(key) : ''; }
  function ensureMap() {
    if (window.location.protocol === 'file:') { mapStatus('mapFile'); return Promise.reject(new Error('file')); }
    if (!navigator.onLine && !window.SFMap) { mapStatus('mapOffline'); return Promise.reject(new Error('offline')); }
    if (!mapReady) {
      mapStatus('mapLoading');
      mapReady = Promise.all([loadAsset('link', 'href', 'vendor/leaflet/leaflet.css'), loadAsset('script', 'src', 'vendor/leaflet/leaflet.js')])
        .then(() => loadAsset('script', 'src', 'js/nav.js'))
        .then(() => {
          window.SFMap.init({ onSelect: pinSelected, onTiles: ok => mapStatus(ok ? '' : 'tileError') });
          mapStatus('');
          if (here) window.SFMap.setHere(here);
        }).catch(e => { mapReady = null; mapStatus('mapError'); throw e; });
    }
    return mapReady;
  }
  function showMap(sel) {
    ensureMap().then(() => {
      const s = parseHash();
      if (s.screen === 'nav') return;
      window.SFMap.resize();
      window.SFMap.setPlaces(visible.filter(C.hasPoint));
      if (sel) { window.SFMap.focus(sel); renderPin(sel); }
    }).catch(() => {});
  }
  function pinSelected(id) { setHash('#c/' + cat + '/map/p/' + id, true); }
  function renderPin(id) {
    const r = find(id), card = $('pin-card');
    if (!r) { card.hidden = true; return; }
    const status = C.statusLine(r, lang, now());
    const phone = r.phone === null || r.phone === undefined ? '211' : r.phone;
    card.innerHTML = '<h3>' + C.escape(r.name) + '</h3><p class="address">' + C.escape(C.addressLine(r, lang)) + '</p>' +
      (status ? '<p class="status status-' + status.cls + '">' + C.escape(status.text) + '</p>' : '') +
      '<div class="actions actions-phone"><button type="button" class="button button-primary" data-go="' + C.escape(r.id) + '">' + C.icon('walk') + '<span>' + C.escape(t('go')) + '</span></button>' +
      '<a class="button button-call" href="' + C.telHref(phone, r.ext) + '">' + C.icon('phone') + '<span>' + C.escape(C.formatPhone(phone)) + '</span></a></div>';
    card.hidden = false;
    if (card.scrollIntoView) card.scrollIntoView({ block: 'nearest' });
  }

  /* "Go here" sheet --------------------------------------------------- */
  function openSheet(id) {
    const r = find(id);
    if (!r || !C.hasPoint(r)) return;
    lastSheetFocus = document.activeElement;
    $('go-place').textContent = r.name + ' · ' + C.addressLine(r, lang) + (here ? ' · ' + C.miles(C.distance(here, r), lang) : '');
    $('go-google').href = C.directions(r, 'walking');
    $('go-transit').href = C.directions(r, 'transit');
    $('go-inapp').dataset.id = id;
    /* The routing service's terms require a published contact email, so it stays off without one. */
    $('go-inapp').hidden = !data.routing;
    document.querySelector('.sheet-note').hidden = !data.routing;
    $('go-sheet').hidden = false;
    (data.routing ? $('go-inapp') : $('go-google')).focus();
  }
  function closeSheet() {
    if ($('go-sheet').hidden) return;
    $('go-sheet').hidden = true;
    if (lastSheetFocus && lastSheetFocus.focus && document.contains(lastSheetFocus)) lastSheetFocus.focus();
  }
  function goHere(id) { setHash('#c/' + cat + '/' + currentView() + '/go/' + id); }

  /* In-site walking navigation ----------------------------------------- */
  function banner(text, sub) { $('nav-instruction').textContent = text || ''; $('nav-sub').textContent = sub || ''; }
  function startNav(id) {
    const r = find(id);
    if (!r || !C.hasPoint(r)) { setHash('#c/' + cat, true); return; }
    if (navPlace && navPlace.id === id && navRoute) return;
    const token = ++navToken;
    navPlace = r; navRoute = null; navOrigin = null;
    $('nav-banner').hidden = false; $('nav-steps').hidden = true; $('nav-retry').hidden = true; $('recenter').hidden = true; $('pin-card').hidden = true; $('nav-transit').hidden = true;
    $('nav-google').href = C.directions(r, 'walking');
    $('nav-transit').href = C.directions(r, 'transit');
    banner(t('navLocating'), r.name);
    ensureMap().then(() => {
      if (token !== navToken) return;
      window.SFMap.resize();
      window.SFMap.setPlaces([r], { keep: true });
      window.SFMap.focus(r.id);
      return fix(true, 12000).catch(() => fix(false, 8000)).then(pos => { if (token === navToken) { navOrigin = pos; setHere(pos); routeFrom(pos, token); } }, err => { if (token === navToken) needStart(err.key, token); });
    }).catch(() => { if (token === navToken) { banner(t('navFailed'), ''); } });
  }
  function needStart(key, token) {
    banner(t('navNoGps'), key ? t(key) : '');
    window.SFMap.pickStart(pos => { if (token === navToken) { navOrigin = pos; window.SFMap.setHere(pos); routeFrom(pos, token); } });
  }
  function routeFrom(pos, token) {
    banner(t('navRouting'), navPlace.name);
    $('nav-retry').hidden = true;
    navLastRoute = Date.now();
    window.SFMap.route(pos, navPlace).then(route => {
      if (token !== navToken) return;
      navRoute = route;
      window.SFMap.showRoute(route);
      renderSteps();
      $('nav-steps').hidden = false;
      $('nav-transit').hidden = route.seconds < 40 * 60;
      $('recenter').hidden = false;
      updateProgress({ step: 0, toNext: null, remaining: route.miles, seconds: route.seconds });
      window.SFMap.track(route, progress => { if (token === navToken) updateProgress(progress, token); });
    }, () => {
      if (token !== navToken) return;
      banner(t(navigator.onLine ? 'navFailed' : 'navOffline'), '');
      $('nav-retry').hidden = false;
    });
  }
  function renderSteps() {
    $('step-list').innerHTML = navRoute.steps.map((s, i) => '<li data-step="' + i + '">' + C.escape(C.stepText(s, lang)) + (s.len > 0 ? ' <span class="step-len">' + C.escape(C.miles(s.len, lang)) + '</span>' : '') + '</li>').join('');
  }
  function updateProgress(p, token) {
    if (p.arrived) { banner(t('navArrived'), navPlace.name); window.SFMap.stopTracking(); markStep(navRoute.steps.length - 1); return; }
    if (p.off && navigator.onLine && Date.now() - navLastRoute > 30000 && p.pos) { banner(t('navOffRoute'), ''); window.SFMap.stopTracking(); routeFrom(p.pos, token || navToken); return; }
    const idx = Math.min(p.step, navRoute.steps.length - 1), next = navRoute.steps[idx + 1], showNext = p.toNext !== null && p.toNext !== undefined && next;
    const text = showNext ? C.stepText(next, lang) : C.stepText(navRoute.steps[idx], lang);
    const dist = showNext ? (lang === 'zh' ? C.miles(p.toNext, lang) + ' 后 · ' : t('in') + ' ' + C.miles(p.toNext, lang) + ' · ') : '';
    const left = lang === 'zh' ? t('remaining') + ' ' + C.miles(p.remaining, lang) : C.miles(p.remaining, lang) + ' ' + t('remaining');
    banner(text, dist + left + ' · ' + Math.max(1, Math.round(p.seconds / 60)) + ' ' + t('minutes') + (p.seconds >= 40 * 60 ? ' · ' + t('navLong') : ''));
    markStep(idx);
  }
  function markStep(i) {
    document.querySelectorAll('#step-list li').forEach((li, n) => li.classList.toggle('current', n === i));
  }
  function endNav() {
    navToken++; navPlace = null; navRoute = null; navOrigin = null;
    $('nav-banner').hidden = true; $('nav-steps').hidden = true; $('recenter').hidden = true;
    if (window.SFMap && window.SFMap.isReady()) { window.SFMap.stopTracking(); window.SFMap.clearRoute(); window.SFMap.cancelPick(); }
  }

  /* Events ------------------------------------------------------------- */
  document.querySelector('.cats').addEventListener('click', e => { const a = e.target.closest('[data-cat]'); if (a) { e.preventDefault(); setHash('#c/' + a.dataset.cat); } });
  document.querySelector('.layout').addEventListener('click', e => {
    const go = e.target.closest('[data-go]'), map = e.target.closest('[data-map]');
    if (go) goHere(go.dataset.go);
    else if (map) setHash('#c/' + cat + '/map/p/' + map.dataset.map);
  });
  $('more').addEventListener('click', showMore);
  $('back').addEventListener('click', e => { e.preventDefault(); setHash('#'); });
  $('view-list').addEventListener('click', () => setHash('#c/' + cat));
  $('view-map').addEventListener('click', () => setHash('#c/' + cat + '/map'));
  $('locate').addEventListener('click', locate);
  $('clear-location').addEventListener('click', () => { here = null; $('clear-location').hidden = true; locMessage(''); if (window.SFMap && window.SFMap.isReady()) window.SFMap.clearHere(); renderList(); });
  $('chips').addEventListener('click', e => { const b = e.target.closest('[data-chip]'); if (b) { chips[b.dataset.chip] = !chips[b.dataset.chip]; limit = PAGE; renderList(); } });
  let searchTimer;
  $('search').addEventListener('input', () => { query = $('search').value; clearTimeout(searchTimer); searchTimer = setTimeout(() => { limit = PAGE; renderList(); }, 180); });
  $('reset').addEventListener('click', () => { query = ''; chips = {}; $('search').value = ''; limit = PAGE; renderList(); $('search').focus(); });
  $('language').addEventListener('change', () => { lang = C.labels[$('language').value] ? $('language').value : 'en'; try { localStorage.setItem('sf-neighbor-language', lang); } catch (_) { /* optional */ } translate(); });
  $('go-close').addEventListener('click', () => history.back());
  $('go-sheet').addEventListener('click', e => { if (e.target === $('go-sheet')) history.back(); });
  $('go-inapp').addEventListener('click', () => { setHash('#c/' + cat + '/nav/' + $('go-inapp').dataset.id, true); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('go-sheet').hidden) history.back(); });
  $('nav-end').addEventListener('click', () => { history.back(); });
  $('nav-retry').addEventListener('click', () => { if (navPlace) { if (navOrigin) routeFrom(navOrigin, navToken); else { const id = navPlace.id; navPlace = null; startNav(id); } } });
  $('recenter').addEventListener('click', () => { if (window.SFMap) window.SFMap.recenter(); });
  $('save-list').addEventListener('click', () => {
    try {
      const lines = ['SF Neighbor — ' + t(cat), t('checkedLine') + ': ' + data.checked, ''];
      visible.forEach(r => { const phone = r.phone || '211'; lines.push(r.name, C.addressLine(r, lang), C.hoursText(r, lang), C.placeNote(r, lang), C.formatPhone(phone) + (r.ext ? ' ext ' + r.ext : ''), C.hasPoint(r) && !r.confidential ? C.directions(r) : '', ''); });
      lines.push(t('emergency'), t('crisis'));
      const url = URL.createObjectURL(new Blob(['﻿' + lines.filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\r\n')], { type: 'text/plain;charset=utf-8' }));
      const a = document.createElement('a'); a.href = url; a.download = 'sf-neighbor-' + cat + '-' + lang + '.txt'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      $('save-status').textContent = t('saved');
    } catch (_) { $('save-status').textContent = t('saveFailed'); }
  });
  function connection() { $('offline-notice').hidden = navigator.onLine; }
  window.addEventListener('online', connection); window.addEventListener('offline', connection);
  window.addEventListener('hashchange', apply);
  $('stale-notice').hidden = (Date.now() - new Date(data.checked + 'T23:59:59-08:00').getTime()) < 30 * 86400000;
  function counts() {
    const n = now();
    document.querySelectorAll('[data-count]').forEach(el => { el.textContent = all().filter(r => r.type === el.dataset.count && C.isActive(r, n && n.date)).length; });
  }
  counts(); translate(); connection();
  document.body.dataset.ready = 'true';
  apply();
  if ('serviceWorker' in navigator && window.isSecureContext && /^https?:$/.test(window.location.protocol)) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); });
  }
})();

/* Map and in-site walking navigation. Loaded only after someone asks for a map. */
(function () {
  'use strict';
  const C = window.SFDirectory;
  /* Change these two lines to move to another tile or routing provider. */
  const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const ROUTER = 'https://valhalla1.openstreetmap.de/route';
  const COLOR = { good: '#2e6b4a', wait: '#b7791f', limit: '#6b5b4b', here: '#1f5fbf', route: '#1f5fbf' };
  let map = null, renderer = null, tiles = null, markers = {}, ring = null, hereDot = null, hereArea = null, routeLine = null, hooks = {};
  let placeKey = '', picking = null, watchId = null, tracked = null, onVisible = null, lastRouteAt = 0, follow = true;

  function colorOf(r) {
    if (r.access === 'pantryWait' || r.access === 'waitlist') return COLOR.wait;
    if (r.access === 'limited' || r.access === 'referral' || r.access === 'appointment' || r.access === 'call') return COLOR.limit;
    return COLOR.good;
  }
  function init(h) {
    hooks = h || {};
    if (map) return;
    /* Canvas drawing and no animation keep panning usable on cheap phones. */
    renderer = L.canvas({ padding: 0.1, tolerance: 10 });
    map = L.map('map', { preferCanvas: true, renderer, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false, inertia: false, scrollWheelZoom: false, minZoom: 11, maxZoom: 19 }).setView([37.7749, -122.4194], 12);
    let failed = 0;
    tiles = L.tileLayer(TILES, { maxZoom: 19, detectRetina: false, updateWhenIdle: true, updateWhenZooming: false, keepBuffer: 1, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
    tiles.on('tileerror', () => { failed++; if (hooks.onTiles) hooks.onTiles(false); });
    tiles.on('load', () => { if (!failed && hooks.onTiles) hooks.onTiles(true); failed = 0; });
    tiles.addTo(map);
    map.on('click', e => { if (picking) { const cb = picking; picking = null; cb({ lat: e.latlng.lat, lng: e.latlng.lng, acc: 30 }); } });
    map.on('dragstart', () => { follow = false; });
  }
  function isReady() { return !!map; }
  function resize() { if (map) map.invalidateSize({ pan: false }); }
  function setPlaces(list, opts) {
    if (!map) return;
    const key = list.map(r => r.id).join('|');
    if (key === placeKey && !(opts && opts.keep)) return;
    placeKey = key;
    Object.keys(markers).forEach(id => markers[id].remove());
    markers = {};
    if (ring) { ring.remove(); ring = null; }
    list.forEach(r => {
      markers[r.id] = L.circleMarker([r.lat, r.lng], { renderer, radius: 9, weight: 2, color: '#ffffff', fillColor: colorOf(r), fillOpacity: 1, bubblingMouseEvents: false })
        .on('click', () => { if (hooks.onSelect) hooks.onSelect(r.id); }).addTo(map);
    });
    if (list.length) map.fitBounds(list.map(r => [r.lat, r.lng]), { padding: [26, 26], maxZoom: 15, animate: false });
  }
  function focus(id) {
    const m = markers[id];
    if (!map || !m) return;
    const ll = m.getLatLng();
    if (ring) ring.remove();
    ring = L.circleMarker(ll, { renderer, radius: 15, weight: 3, color: '#231e19', fill: false, interactive: false }).addTo(map);
    map.setView(ll, Math.max(map.getZoom(), 16), { animate: false });
  }
  function setHere(pos) {
    if (!map) return;
    const ll = [pos.lat, pos.lng];
    if (!hereDot) {
      hereArea = L.circle(ll, { renderer, radius: pos.acc || 30, weight: 0, fillColor: COLOR.here, fillOpacity: 0.12, interactive: false }).addTo(map);
      hereDot = L.circleMarker(ll, { renderer, radius: 8, weight: 3, color: '#ffffff', fillColor: COLOR.here, fillOpacity: 1, interactive: false }).addTo(map);
    } else { hereDot.setLatLng(ll); hereArea.setLatLng(ll).setRadius(Math.min(pos.acc || 30, 400)); }
  }
  function clearHere() { if (hereDot) { hereDot.remove(); hereArea.remove(); hereDot = hereArea = null; } }
  function pickStart(cb) { picking = cb; }
  function cancelPick() { picking = null; }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  function route(origin, dest) {
    /* The free routing server asks for at most one request per second. */
    const gap = Math.max(0, 1200 - (Date.now() - lastRouteAt));
    return wait(gap).then(() => {
      lastRouteAt = Date.now();
      const body = { locations: [{ lat: +origin.lat.toFixed(5), lon: +origin.lng.toFixed(5) }, { lat: dest.lat, lon: dest.lng }], costing: 'pedestrian', costing_options: { pedestrian: { walkway_factor: 3, sidewalk_factor: 3 } }, directions_options: { units: 'miles' } };
      const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      const timer = setTimeout(() => { if (ctrl) ctrl.abort(); }, 15000);
      return fetch(ROUTER + '?json=' + encodeURIComponent(JSON.stringify(body)), ctrl ? { signal: ctrl.signal } : undefined).then(r => { clearTimeout(timer); if (!r.ok) throw new Error('route ' + r.status); return r.json(); }, e => { clearTimeout(timer); throw e; });
    }).then(j => {
      const leg = j.trip.legs[0], shape = C.decodePolyline6(leg.shape), cum = [0];
      for (let i = 1; i < shape.length; i++) cum[i] = cum[i - 1] + C.distance({ lat: shape[i - 1][0], lng: shape[i - 1][1] }, { lat: shape[i][0], lng: shape[i][1] });
      return { shape, cum, steps: C.buildSteps(leg.maneuvers, shape), miles: j.trip.summary.length, seconds: j.trip.summary.time, total: cum[cum.length - 1] };
    });
  }
  function showRoute(rt) {
    clearRoute();
    routeLine = L.polyline(rt.shape, { renderer, color: COLOR.route, weight: 6, opacity: 0.85, interactive: false }).addTo(map);
    follow = true;
    map.fitBounds(routeLine.getBounds(), { padding: [30, 30], animate: false, maxZoom: 17 });
  }
  function clearRoute() { if (routeLine) { routeLine.remove(); routeLine = null; } placeKey = ''; }

  /* Find the closest point on the route, looking near where the walker was last. */
  function nearest(rt, pos, from, wide) {
    const start = wide ? 0 : Math.max(0, from - 8), end = wide ? rt.shape.length - 1 : Math.min(rt.shape.length - 1, from + 90);
    const kx = Math.cos(pos.lat * Math.PI / 180);
    let best = { d: Infinity, i: from, along: 0 };
    for (let i = start; i < end; i++) {
      const ax = (rt.shape[i][1] - pos.lng) * kx, ay = rt.shape[i][0] - pos.lat, bx = (rt.shape[i + 1][1] - pos.lng) * kx, by = rt.shape[i + 1][0] - pos.lat;
      const dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy, u = len ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len)) : 0;
      const x = ax + u * dx, y = ay + u * dy, d = Math.sqrt(x * x + y * y) * 69.05; /* miles */
      if (d < best.d) best = { d, i, along: u * (rt.cum[i + 1] - rt.cum[i]) };
    }
    return best;
  }
  function track(rt, onUpdate) {
    stopTracking();
    tracked = { rt, onUpdate, cursor: 0, off: 0, last: 0 };
    const start = () => {
      if (watchId !== null || !navigator.geolocation) return;
      watchId = navigator.geolocation.watchPosition(onFix, () => {}, { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 });
    };
    onVisible = () => { if (document.hidden) { if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; } } else start(); };
    document.addEventListener('visibilitychange', onVisible);
    start();
  }
  function onFix(p) {
    const s = tracked;
    if (!s || Date.now() - s.last < 2000) return;
    s.last = Date.now();
    const pos = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy };
    setHere(pos);
    if (follow && map && !map.getBounds().pad(-0.25).contains([pos.lat, pos.lng])) map.setView([pos.lat, pos.lng], Math.max(map.getZoom(), 16), { animate: false });
    let near = nearest(s.rt, pos, s.cursor, false);
    const limit = Math.max(0.028, (pos.acc || 0) / 1609 + 0.009); /* about 45 m, more when GPS is poor */
    if (near.d > limit) near = nearest(s.rt, pos, s.cursor, true);
    s.cursor = near.i;
    s.off = near.d > limit ? s.off + 1 : 0;
    const done = s.rt.cum[near.i] + near.along, remaining = Math.max(0, s.rt.total - done);
    const dest = s.rt.shape[s.rt.shape.length - 1];
    /* Being far off the route can snap to its end, so "arrived" also requires being on the route. */
    if ((near.d <= limit && remaining < 0.0125) || C.distance(pos, { lat: dest[0], lng: dest[1] }) < 0.0125) { s.onUpdate({ arrived: true }); return; }
    let step = 0;
    s.rt.steps.forEach((x, i) => { if (x.begin <= near.i) step = i; });
    const next = s.rt.steps[step + 1];
    s.onUpdate({ step, toNext: next ? Math.max(0, s.rt.cum[next.begin] - done) : null, remaining, seconds: s.rt.seconds * (remaining / (s.rt.total || 1)), off: s.off >= 3, pos });
  }
  function stopTracking() {
    if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
    if (onVisible) { document.removeEventListener('visibilitychange', onVisible); onVisible = null; }
    tracked = null;
  }
  function recenter() { follow = true; if (hereDot) map.setView(hereDot.getLatLng(), Math.max(map.getZoom(), 16), { animate: false }); }
  window.SFMap = { init, isReady, resize, setPlaces, focus, setHere, clearHere, pickStart, cancelPick, route, showRoute, clearRoute, track, stopTracking, recenter };
})();

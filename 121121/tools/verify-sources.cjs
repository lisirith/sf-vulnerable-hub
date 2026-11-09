'use strict';
// Re-checks every listed phone number and street address against the official page it came from.
// Run it regularly: `node tools/verify-sources.cjs`. Results go to qa/verification.json.
// MISMATCH means the page loaded but no longer shows the value; UNREACHABLE means the page could not be read.
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/resources.json'), 'utf8'));
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; sf-neighbor-directory/1.0; community resource guide)', Accept: 'text/html,application/pdf;q=0.9,*/*;q=0.8' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const cache = new Map();
// The Food Locator page is an app; its visible data lives in this published file.
const DATA_FOR = { 'https://foodlocator.sfmfoodbank.org/': 'https://foodlocator.sfmfoodbank.org/data/sites.sample.json' };
async function page(url) {
  if (cache.has(url)) return cache.get(url);
  let result;
  try {
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(DATA_FOR[url] || url, { headers: UA, redirect: 'follow', signal: ctrl.signal });
    clearTimeout(timer);
    if (/pdf/i.test(res.headers.get('content-type') || '') || /\.pdf($|\?)/i.test(url)) { result = { ok: false, why: 'PDF, needs a person to read' }; cache.set(url, result); return result; }
    const raw = await res.text();
    const looksBlocked = /just a moment|attention required|enable javascript and cookies|access denied/i.test(raw.slice(0, 3000));
    if (!res.ok || looksBlocked) result = { ok: false, why: looksBlocked ? 'bot check' : 'HTTP ' + res.status };
    else {
      const text = raw.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;|’/g, "'");
      result = { ok: true, text, digits: raw.replace(/<[^>]+>/g, '').replace(/\D/g, '') + ' ' + text.replace(/\D/g, ''), lower: text.toLowerCase().replace(/\s+/g, ' ') };
    }
  } catch (e) { result = { ok: false, why: e.name === 'AbortError' ? 'timeout' : e.message }; }
  cache.set(url, result);
  await sleep(700);
  return result;
}
function streetNeedle(address) {
  const street = address.split(',')[0].toLowerCase().replace(/['’.]/g, '');
  const parts = street.split(/\s+/), num = parts[0], first = parts[1];
  return { num, first };
}
function addressOnPage(p, address) {
  const { num, first } = streetNeedle(address);
  return new RegExp('\\b' + num + '\\s+(?:south\\s+)?' + first.replace(/[^a-z0-9]/g, '.?')).test(p.lower.replace(/['.]/g, ''));
}
const counts = { phones: 0, addresses: 0, locations: 0 };
(async () => {
  const rows = [];
  for (const r of data.resources) {
    const pages = [];
    for (const s of r.sources || []) pages.push({ url: s.url, p: await page(s.url) });
    const readable = pages.filter(x => x.p.ok);
    const row = { id: r.id, name: r.name };
    if (!readable.length) { row.result = 'UNREACHABLE'; row.detail = pages.map(x => x.url + ' (' + x.p.why + ')').join('; '); rows.push(row); continue; }
    const problems = [];
    if (r.phone && r.phone.length === 10) { counts.phones++; if (!readable.some(x => x.p.digits.includes(r.phone))) problems.push('phone ' + r.phone + ' not on page'); }
    for (const extra of r.phones || []) { counts.phones++; if (!readable.some(x => x.p.digits.includes(extra[0]))) problems.push('phone ' + extra[0] + ' not on page'); }
    if (r.address) { counts.addresses++; if (!readable.some(x => addressOnPage(x.p, r.address))) problems.push('address "' + r.address.split(',')[0] + '" not on page'); }
    if (r.cross) { counts.locations++; if (!readable.some(x => r.cross.every(s => x.p.lower.includes(s.split(' ')[0].toLowerCase())))) problems.push('intersection ' + r.cross.join(' & ') + ' not on page'); }
    if (r.place) { counts.locations++; const label = r.name.split('·').pop().trim().toLowerCase(); if (!readable.some(x => x.p.lower.includes(label))) problems.push('place ' + label + ' not on page'); }
    const someUnread = pages.length !== readable.length;
    row.result = !problems.length ? 'OK' : someUnread ? 'UNVERIFIED' : 'MISMATCH';
    if (problems.length) row.detail = problems.join('; ') + ' — checked ' + readable.map(x => x.url).join(', ') + (someUnread ? '; could not read ' + pages.filter(x => !x.p.ok).map(x => x.url + ' (' + x.p.why + ')').join(', ') : '');
    if (pages.length !== readable.length) row.partial = pages.filter(x => !x.p.ok).map(x => x.url + ' (' + x.p.why + ')').join('; ');
    rows.push(row);
    process.stdout.write(row.result === 'OK' ? '.' : row.result[0]);
  }
  const summary = rows.reduce((m, x) => { m[x.result] = (m[x.result] || 0) + 1; return m; }, {});
  fs.mkdirSync(path.join(root, 'qa'), { recursive: true });
  fs.writeFileSync(path.join(root, 'qa/verification.json'), JSON.stringify({ checked: new Date().toISOString(), summary, compared: counts, rows: rows.filter(x => x.result !== 'OK' || x.partial) }, null, 1) + '\n');
  console.log('\n', summary, 'compared', counts);
  rows.filter(x => x.result !== 'OK').forEach(x => console.log(x.result, x.id, '-', x.detail));
})();

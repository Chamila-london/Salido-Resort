import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const htmlFiles = ['index.html','admin/index.html'];

for (const file of htmlFiles) {
  const html = read(file);
  const markup = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  const ids = [...markup.matchAll(/\bid=["']([^"']+)["']/gi)].map(m=>m[1]);
  assert.equal(ids.length, new Set(ids).size, `${file}: duplicate id found`);
  for (const m of markup.matchAll(/<button\b([^>]*)>/gi)) assert.match(m[1], /\btype=["'](?:button|submit|reset)["']/i, `${file}: button missing explicit type`);
  for (const m of markup.matchAll(/<a\b([^>]*)>/gi)) assert.match(m[1], /\bhref=["'][^"']+["']/i, `${file}: anchor missing href`);
  for (const m of markup.matchAll(/<(?:img|source|script|link)\b[^>]*(?:src|href)=["']([^"']+)["']/gi)) {
    const ref=m[1]; if (/^(?:https?:|data:|blob:|#|\/\/)/.test(ref)) continue;
    const clean=ref.split(/[?#]/)[0].replace(/^\.\//,'');
    if (!clean || clean.startsWith('../')) continue;
    assert.ok(fs.existsSync(path.join(root,clean)), `${file}: missing local asset ${clean}`);
  }
}

const netlifyLogin=read('netlify/functions/login.mjs');
assert.ok(!/\brequest\.headers/.test(netlifyLogin), 'Netlify login still references undefined request');
assert.match(netlifyLogin, /state\.count \+= 1/, 'Netlify failed-attempt counter is not incremented');
assert.match(netlifyLogin, /Math\.min\(24, Math\.max\(1, requestedHours\)\)/, 'Netlify session duration is not capped');

for (const file of ['functions/api/publish.js','netlify/functions/publish.mjs']) {
  const src=read(file);
  assert.match(src,/const ALLOWED =/,`${file}: publish allow-list missing`);
  assert.match(src,/expectedHead/,`${file}: optimistic concurrency check missing`);
  assert.match(src,/\.includes\('\.\.'\)/,`${file}: path traversal check missing`);
}

assert.ok(!read('index.html').includes('★ 3.2'), 'stale hard-coded Google score remains');
assert.ok(!read('js/script.js').includes('Current Google rating: 3.2'), 'stale JS Google score remains');

// V10.0.6 regression: standalone room showcase must remain removed.
const indexHtml = read('index.html');
assert(!indexHtml.includes('class="sec rooms-showcase"'), 'Standalone rooms showcase should be removed');
assert(!indexHtml.includes('Deluxe Double Room'), 'Removed room card content should not remain');
assert(!indexHtml.includes('Multi-room Booking'), 'Removed multi-room card content should not remain');
console.log('QA smoke checks passed.');

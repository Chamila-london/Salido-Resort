/* Salido control room — sign in.  Cloudflare Pages Function.
   Checks the username/password against the project's environment variables and
   hands back a short-lived signed token. No packages, no database. */

const enc = new TextEncoder();
const attempts = globalThis.__salidoLoginAttempts || (globalThis.__salidoLoginAttempts = new Map());
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' }
  });
}

function b64url(bytes) {
  let s = '';
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(secret, payload) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(payload)));
}

function equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return json(405, { error: 'Use POST.' });

  const USER = env.ADMIN_USER || '';
  const PASS = env.ADMIN_PASSWORD || '';
  const SECRET = env.SESSION_SECRET || '';
  if (!USER || !PASS || !SECRET) {
    return json(500, {
      error: 'The admin login is not set up yet. In Cloudflare open your Pages project → Settings → Variables and secrets and add ADMIN_USER, ADMIN_PASSWORD and SESSION_SECRET.'
    });
  }

  let body = {};
  try { body = await request.json(); } catch (e) { /* keep defaults */ }
  const user = String(body.user || '').slice(0, 100);
  const pass = String(body.pass || '').slice(0, 300);
  const ip = (request.headers.get('cf-connecting-ip') || request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const now = Date.now();
  let state = attempts.get(ip);
  if (!state || now - state.started > WINDOW_MS) state = { started: now, count: 0 };
  if (state.count >= MAX_ATTEMPTS) {
    return new Response(JSON.stringify({ error: 'Too many sign-in attempts. Try again later.' }), { status: 429, headers: { 'content-type':'application/json', 'cache-control':'no-store', 'retry-after':'900' } });
  }

  const userOk = equal(user.toLowerCase(), USER.toLowerCase());
  const passOk = equal(pass, PASS);
  const ok = userOk & passOk ? true : false;
  if (!ok) {
    state.count += 1; attempts.set(ip, state);
    try { await new Promise(r => setTimeout(r, 900 + Math.min(state.count, 5) * 250)); } catch (e) {}
    return json(401, { error: 'That username and password do not match.' });
  }
  attempts.delete(ip);

  const requestedHours = Number(env.SESSION_HOURS);
  const hours = Number.isFinite(requestedHours) ? Math.min(24, Math.max(1, requestedHours)) : 12;
  const payload = b64url(enc.encode(JSON.stringify({
    u: USER,
    exp: Date.now() + hours * 3600 * 1000
  })));
  const token = payload + '.' + await sign(SECRET, payload);

  return json(200, { token, user: USER });
}

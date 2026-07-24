/* Salido control room — what is on the server.  Cloudflare Pages Function.
   Confirms the caller's session and returns the photo files in the repository
   so the editor can show them without downloading megabytes of pictures. */

const enc = new TextEncoder();

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });
}

function b64urlToStr(s) {
  const p = s.replace(/-/g, '+').replace(/_/g, '/');
  return atob(p + '='.repeat((4 - p.length % 4) % 4));
}
function b64url(bytes) {
  let str = '';
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < u8.length; i++) str += String.fromCharCode(u8[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function sign(secret, payload) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(payload)));
}
async function session(request, env) {
  const SECRET = env.SESSION_SECRET || '';
  if (!SECRET) return null;
  const raw = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const dot = raw.lastIndexOf('.');
  if (dot < 1) return null;
  const payload = raw.slice(0, dot), sig = raw.slice(dot + 1);
  if (await sign(SECRET, payload) !== sig) return null;
  let data;
  try { data = JSON.parse(b64urlToStr(payload)); } catch (e) { return null; }
  if (!data || !data.exp || Date.now() > data.exp) return null;
  return data;
}

async function gh(env, path) {
  const r = await fetch('https://api.github.com' + path, {
    headers: {
      authorization: 'Bearer ' + (env.GITHUB_TOKEN || ''),
      accept: 'application/vnd.github+json',
      'user-agent': 'salido-control-room'
    }
  });
  const text = await r.text();
  if (!r.ok) {
    let msg = text.slice(0, 300);
    try { msg = JSON.parse(text).message || msg; } catch (e) { /* keep raw */ }
    throw new Error('GitHub said: ' + msg + ' (' + r.status + ')');
  }
  return text ? JSON.parse(text) : {};
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return json(405, { error: 'Use POST.' });

  const s = await session(request, env);
  if (!s) return json(401, { error: 'Please sign in again.' });

  const repo = env.GITHUB_REPO || '';
  const branch = env.GITHUB_BRANCH || 'main';
  if (!repo || !env.GITHUB_TOKEN) {
    return json(500, { error: 'Publishing is not set up yet. Add GITHUB_REPO and GITHUB_TOKEN in your Cloudflare Pages project settings.' });
  }

  try {
    const tree = await gh(env, '/repos/' + repo + '/git/trees/' + encodeURIComponent(branch) + '?recursive=1');
    const images = (tree.tree || [])
      .filter(n => n.type === 'blob' && /^images\/[^/]+\.(webp|png|jpg|jpeg|svg)$/i.test(n.path))
      .map(n => ({ path: n.path, size: n.size || 0 }))
      .sort((a, b) => a.path.localeCompare(b.path));
    return json(200, { user: s.u, repo, branch, images });
  } catch (e) {
    return json(502, { error: e.message });
  }
}

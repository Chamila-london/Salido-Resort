/* Salido control room — what is on the server.
   Confirms the caller's session and returns the photo files in the repository
   so the editor can show them without downloading 30 MB of pictures. */

const enc = new TextEncoder();

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' }
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
function equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}


export async function session(req) {
  const SECRET = process.env.SESSION_SECRET || '';
  if (!SECRET) return null;
  const raw = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const dot = raw.lastIndexOf('.');
  if (dot < 1) return null;
  const payload = raw.slice(0, dot), sig = raw.slice(dot + 1);
  const expected = await sign(SECRET, payload);
  if (!equal(expected, sig)) return null;
  let data;
  try { data = JSON.parse(b64urlToStr(payload)); } catch (e) { return null; }
  if (!data || !data.exp || Date.now() > data.exp) return null;
  return data;
}

export async function gh(path, init) {
  const token = process.env.GITHUB_TOKEN || '';
  const r = await fetch('https://api.github.com' + path, Object.assign({}, init, {
    headers: Object.assign({
      authorization: 'Bearer ' + token,
      accept: 'application/vnd.github+json',
      'user-agent': 'salido-control-room',
      'content-type': 'application/json'
    }, (init && init.headers) || {})
  }));
  const text = await r.text();
  if (!r.ok) {
    let msg = text.slice(0, 300);
    try { msg = JSON.parse(text).message || msg; } catch (e) { /* keep raw */ }
    const err = new Error('GitHub said: ' + msg + ' (' + r.status + ')');
    err.status = r.status;
    throw err;
  }
  return text ? JSON.parse(text) : {};
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Use POST.' });

  const s = await session(req);
  if (!s) return json(401, { error: 'Please sign in again.' });

  const repo = process.env.GITHUB_REPO || '';
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!repo || !process.env.GITHUB_TOKEN) {
    return json(500, { error: 'Publishing is not set up yet. Add GITHUB_REPO and GITHUB_TOKEN in Netlify → Site configuration → Environment variables.' });
  }

  try {
    const ref = await gh('/repos/' + repo + '/git/ref/heads/' + encodeURIComponent(branch));
    const headSha = ref.object.sha;
    const tree = await gh('/repos/' + repo + '/git/trees/' + headSha + '?recursive=1');
    const images = (tree.tree || [])
      .filter(n => n.type === 'blob' && /^images\/[^/]+\.(webp|png|jpg|jpeg|svg)$/i.test(n.path))
      .map(n => ({ path: n.path, size: n.size || 0 }))
      .sort((a, b) => a.path.localeCompare(b.path));
    return json(200, { user: s.u, repo, branch, headSha, platform: 'Netlify', images });
  } catch (e) {
    console.error(e);
    return json(502, { error: 'Could not read the website repository. Check the deployment logs and repository settings.' });
  }
};

export const config = { path: '/api/list' };

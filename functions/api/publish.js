/* Salido control room — publish.  Cloudflare Pages Function.
   Takes the edited files from the editor, commits them to GitHub in one
   commit, and lets the git deploy put them live. No packages. */

const enc = new TextEncoder();

const ALLOWED = /^(index\.html|robots\.txt|sitemap\.xml|css\/[A-Za-z0-9._-]+\.css|js\/[A-Za-z0-9._-]+\.js|images\/[A-Za-z0-9._-]+\.(webp|png|jpg|jpeg|svg))$/;
const MAX_TOTAL = 4.0 * 1024 * 1024;

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

async function session(request, env) {
  const SECRET = env.SESSION_SECRET || '';
  if (!SECRET) return null;
  const raw = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
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

async function gh(env, path, init) {
  const r = await fetch('https://api.github.com' + path, Object.assign({}, init, {
    headers: Object.assign({
      authorization: 'Bearer ' + (env.GITHUB_TOKEN || ''),
      accept: 'application/vnd.github+json',
      'user-agent': 'salido-control-room',
      'content-type': 'application/json'
    }, (init && init.headers) || {})
  }));
  const text = await r.text();
  if (!r.ok) {
    let msg = text.slice(0, 300);
    try { msg = JSON.parse(text).message || msg; } catch (e) { /* keep raw */ }
    if (r.status === 401 || r.status === 403) {
      msg = 'the GitHub token was refused (' + msg + '). Check GITHUB_TOKEN in your Cloudflare Pages settings, and that it has Contents: Read and write on this repository.';
    }
    if (r.status === 404) {
      msg = 'the repository or branch was not found (' + msg + '). Check GITHUB_REPO and GITHUB_BRANCH.';
    }
    throw new Error('GitHub: ' + msg);
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

  let body = {};
  try { body = await request.json(); } catch (e) {
    return json(400, { error: 'The editor sent something the server could not read.' });
  }

  const files = Array.isArray(body.files) ? body.files : [];
  if (!files.length) return json(400, { error: 'There was nothing to publish.' });

  let total = 0;
  for (const f of files) {
    if (!f || typeof f.path !== 'string' || typeof f.b64 !== 'string') {
      return json(400, { error: 'One of the files was malformed.' });
    }
    if (f.path.includes('..') || !ALLOWED.test(f.path)) {
      return json(400, { error: 'This file is not allowed to be published: ' + f.path });
    }
    total += f.b64.length * 0.75;
  }
  if (total > MAX_TOTAL) {
    return json(413, { error: 'Too much in one go (' + Math.round(total / 1048576) + ' MB). Publish what you have, then add the next photo.' });
  }

  const message = String(body.message || 'Website update from the control room').replace(/[\r\n]+/g, ' ').slice(0, 200);
  const expectedHead = typeof body.expectedHead === 'string' ? body.expectedHead : '';

  try {
    const ref = await gh(env, '/repos/' + repo + '/git/ref/heads/' + encodeURIComponent(branch));
    const headSha = ref.object.sha;
    if (expectedHead && expectedHead !== headSha) {
      return json(409, { error: 'The website changed after you opened the editor. Reload the editor so you do not overwrite newer work.', conflict: true, headSha });
    }
    const headCommit = await gh(env, '/repos/' + repo + '/git/commits/' + headSha);

    const tree = [];
    for (const f of files) {
      const blob = await gh(env, '/repos/' + repo + '/git/blobs', {
        method: 'POST',
        body: JSON.stringify({ content: f.b64, encoding: 'base64' })
      });
      tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    }

    const newTree = await gh(env, '/repos/' + repo + '/git/trees', {
      method: 'POST',
      body: JSON.stringify({ base_tree: headCommit.tree.sha, tree })
    });

    const commit = await gh(env, '/repos/' + repo + '/git/commits', {
      method: 'POST',
      body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] })
    });

    await gh(env, '/repos/' + repo + '/git/refs/heads/' + encodeURIComponent(branch), {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha })
    });

    return json(200, { ok: true, commit: commit.sha, headSha: commit.sha, files: files.length });
  } catch (e) {
    console.error(e);
    return json(502, { error: 'Publishing failed. Check the deployment logs and GitHub repository settings.' });
  }
}

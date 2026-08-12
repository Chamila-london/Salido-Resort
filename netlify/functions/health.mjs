/* Salido Admin API health check. Safe: reports configuration presence only. */
function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer'
    }
  });
}

export default async (req) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return json(405, { ok: false, error: 'Use GET or POST.' });
  }

  const loginConfigured = Boolean(
    process.env.ADMIN_USER &&
    process.env.ADMIN_PASSWORD &&
    process.env.SESSION_SECRET
  );
  const publishingConfigured = Boolean(
    process.env.GITHUB_REPO &&
    process.env.GITHUB_TOKEN
  );

  return json(200, {
    ok: true,
    service: 'salido-admin-api',
    version: '22.1',
    platform: 'Netlify Functions',
    loginConfigured,
    publishingConfigured,
    branch: process.env.GITHUB_BRANCH || 'main'
  });
};

export const config = { path: '/api/health' };

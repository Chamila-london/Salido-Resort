# Salido Resort V7.0.1 QA fixes

- Fixed the Netlify login crash caused by an undefined request variable.
- Enabled Netlify failed-login counting, progressive delay, reset after success, and a 1–24 hour session cap.
- Aligned API JSON security headers across Cloudflare and Netlify.
- Added global browser security headers, admin/API no-index policy, and cache controls.
- Made every HTML button declare its type explicitly.
- Made saved-session restoration errors visible on the admin login screen.
- Removed the stale hard-coded Google rating fallback.
- Reworded volatile transport pricing and added a review date.
- Added dependency-free smoke tests, JavaScript syntax checks, and GitHub Actions QA.

## Deployment checks still required

Run the admin login and publish flow against the deployed host using configured environment variables. Confirm the host honors `_headers` or `netlify.toml`, and inspect the browser console for CSP violations caused by any future third-party integrations.

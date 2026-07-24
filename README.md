# Salido Resort — website + control room

Editor at **/admin/** · repository **Chamila-london/Salido-Resort**

```
index.html  css/  js/  fonts/  images/   ← the website visitors see
admin/index.html                          ← the control room
functions/api/                            ← Cloudflare: login.js, list.js, publish.js
netlify/functions/                        ← Netlify: login.mjs, list.mjs, publish.mjs
_headers  netlify.toml                    ← settings for each host
```

**This repository runs on Cloudflare Pages and on Netlify at the same time.**
Each host ignores the other's files. Keep both while you are changing over; delete
whichever you stop using once you are settled.

---

## Moving to Cloudflare Pages — about 15 minutes, once

### 1 · Push these files
GitHub Desktop → **Fetch origin** → copy this folder's contents into your clone
(keeping `.git`) → Summary `Cloudflare support` → **Commit to main** → **Push origin**.

### 2 · Create the Cloudflare project
1. Sign up free at **dash.cloudflare.com** — no card needed.
2. **Compute (Workers & Pages)** → **Create** → **Pages** → **Connect to Git**.
3. Authorise GitHub, choose **Salido-Resort**.
4. Build settings: **Framework preset: None**, **Build command: leave empty**,
   **Build output directory: `/`**.
5. **Save and Deploy**.

You get an address like `https://salidoresort.pages.dev`.

### 3 · Add the five settings
Your Pages project → **Settings** → **Variables and secrets** → add for
**Production**:

| Name | What to put |
|---|---|
| `ADMIN_USER` | `salido` |
| `ADMIN_PASSWORD` | your password |
| `SESSION_SECRET` | the long random string |
| `GITHUB_REPO` | `Chamila-london/Salido-Resort` |
| `GITHUB_TOKEN` | the `github_pat_…` token |

Then **Deployments** → **Retry deployment** on the latest one. Settings only reach
the server code on a fresh deployment.

### 4 · Sign in
`https://salidoresort.pages.dev/admin/` — same username and password, same buttons.

### 5 · When you are happy
Tell people the new address. Netlify can stay as a spare, or you can delete the
project there.

---

## Changing the site

**Everyday content** — the control room at `/admin/`. Edit, press **Publish**, wait
a minute, then reload with **Ctrl+Shift+R** (Mac: Cmd+Shift+R). It handles the
Sinhala and Tamil for you.

**Everything else** — GitHub Desktop: **Fetch origin** first (publishing from
`/admin/` writes changes your computer does not have), edit, then
**Commit → Push**. Commit alone changes nothing.

**Look & feel** in the control room changes the site's colours, fonts, text size and
corner roundness. If it warns that something has become hard to read, believe it.

**The notice board** starts switched off. Turn it on under **Notice board**.

---

## Things worth knowing

**Your password lives with the host, not in a browser.** Change it in the
Cloudflare (or Netlify) settings, then redeploy.

**The GitHub token expires** — a year from when you made it. Publishing stops when
it does. Make a new one and update the setting.

**Photos** are shrunk to 1800px WebP in your browser before sending. About 4.5 MB
per publish is the limit; add several photos over several publishes.

**Going back.** Every publish is a commit. Repository → **Commits** → pick one →
the three dots → **Revert**.

**Your own domain.** Buy the name (about USD 11 a year at Porkbun or Cloudflare),
add it in your host's dashboard, then change `salidoresort.pages.dev` in
`robots.txt`, `sitemap.xml` and the four tags near the top of `index.html`.
After that you can move hosts whenever you like and nobody notices.

**The offline copy.** `Salido-Resort-OFFLINE.html` is the whole site in one file for
a USB stick or email. It is a snapshot and does not update itself.

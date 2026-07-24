# Salido Resort — website + control room in the cloud

This folder is the whole thing: your website, the admin portal, and the small
bit of server code that lets you sign in from any phone or laptop and publish
changes without downloading or dragging anything.

```
index.html  css/  js/  fonts/  images/   ← the website visitors see
admin/index.html                          ← the control room, at yoursite.netlify.app/admin/
netlify/functions/                        ← login.mjs, list.mjs, publish.mjs
netlify.toml                              ← Netlify settings
```

Once it is running: **you edit at `/admin/`, press Publish, and the live site
updates about a minute later.** Every publish is saved as a version in GitHub,
so nothing is ever lost.

---

## Set-up — about 20 minutes, once

### 1 · Make a GitHub account and a repository

1. Sign up free at **github.com**.
2. Click **+** (top right) → **New repository**.
3. Name it `salido-resort`. **Private** is fine. Don't tick "Add a README".
4. **Create repository**.

### 2 · Put these files in it

On the empty repository page click **uploading an existing file**, then drag in
**everything inside this folder** — `index.html`, the `css`, `js`, `fonts`,
`images`, `admin` and `netlify` folders, `netlify.toml` and this README.

Drag the *contents*, not the folder itself. `index.html` must end up at the top
level of the repository, not inside another folder.

Scroll down, click **Commit changes**.

### 3 · Make a GitHub token (this is what lets Publish work)

1. Go to **github.com/settings/personal-access-tokens** → **Generate new token**
   (the *fine-grained* kind).
2. Name: `salido publish`. Expiration: 1 year (put a reminder in your phone).
3. **Repository access** → *Only select repositories* → pick `salido-resort`.
4. **Permissions** → *Repository permissions* → find **Contents** → set it to
   **Read and write**. Nothing else is needed.
5. **Generate token**, then copy the long `github_pat_…` string. You only see it
   once — paste it somewhere safe for the next step.

### 4 · Connect Netlify to the repository

1. **app.netlify.com** → **Add new site** → **Import an existing project**.
2. Choose **GitHub**, authorise it, pick `salido-resort`.
3. Leave the build command empty and the publish directory as `.`
   (`netlify.toml` already says this). Click **Deploy**.

Your site is live a minute later at something like
`https://salido-resort-1234.netlify.app`.

### 5 · Add the five settings

In Netlify: **Site configuration → Environment variables → Add a variable**, and
add these five. Values are case-sensitive.

| Name | What to put |
|---|---|
| `ADMIN_USER` | the username you want, e.g. `salido` |
| `ADMIN_PASSWORD` | a password only you know — make it long |
| `SESSION_SECRET` | a long random string (one was generated for you in the chat) |
| `GITHUB_REPO` | `your-github-username/salido-resort` |
| `GITHUB_TOKEN` | the `github_pat_…` token from step 3 |

Optional: `GITHUB_BRANCH` if your branch isn't `main`.

Then go to **Deploys → Trigger deploy → Deploy site**. Settings only take effect
on a fresh deploy.

### 6 · Sign in

Open `https://your-site.netlify.app/admin/`, sign in with `ADMIN_USER` and
`ADMIN_PASSWORD`, edit, press **Publish**. Wait a minute, then reload the
website with **Ctrl+Shift+R** (Mac: **Cmd+Shift+R**) to see the change.

Add it to your phone's home screen and it behaves like an app.

---

## Things worth knowing

**The password lives on Netlify, not in your browser.** To change it: Netlify →
Site configuration → Environment variables → edit `ADMIN_PASSWORD` → Deploys →
Trigger deploy.

**The `/admin/` page is visible to anyone who guesses the address**, but it is
useless without the password — the password check happens on the server, and so
does every publish.

**Photos.** New photos are shrunk to 1800px WebP in your browser before they are
sent, so publishing stays fast. Publishing is limited to about 4.5 MB at a time;
if you're adding several photos, publish after each one.

**Going back.** Every publish is a commit in GitHub. Open the repository →
**Commits** → click any earlier version → the three dots → **Revert** to undo.

**Your own domain.** Netlify → Domain management → Add a domain. Buy the name at
Porkbun or Cloudflare (about USD 11 a year). Everything above keeps working.

**The offline copy still works.** `admin/index.html` opened by double-click from
your own computer behaves the old way — it asks for a zip and gives you a zip
back. Served from the web, it switches to live editing by itself.

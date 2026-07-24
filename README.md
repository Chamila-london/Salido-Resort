# Salido Resort — website + control room

Live at **https://salidoresort.netlify.app** · editor at **/admin/**

```
index.html  css/  js/  fonts/  images/   ← the website visitors see
admin/index.html                          ← the control room
netlify/functions/                        ← login.mjs, list.mjs, publish.mjs
netlify.toml                              ← Netlify settings
```

GitHub holds the files. Netlify watches this repository and rebuilds the site
about a minute after anything changes here. Every change is a saved version, so
nothing is ever lost.

---

## Two ways to change the site

### 1 · The control room — for everyday content

Go to **salidoresort.netlify.app/admin/**, sign in, edit, press **Publish**.
Wait a minute, then reload the site with **Ctrl+Shift+R** (Mac: Cmd+Shift+R).

Use this for words, photos, phone numbers, notices, facility tiles, gallery
pictures and Kandy attractions. It handles the Sinhala and Tamil for you, which
editing the files by hand does not.

### 2 · GitHub Desktop — for everything else

1. **Fetch origin**, and **Pull origin** if it offers. *Do this first, every
   time* — publishing from `/admin/` writes changes your computer doesn't have.
2. **Repository → Show in Explorer**, edit the files, save.
3. Type a summary, **Commit to main**, then **Push origin**.

Commit alone changes nothing. The push is what reaches the website.

---

## The notice board

A section just below the hero for offers, events and short announcements.

It is **switched off** to begin with. Turn it on in the control room:
**Notice board** in the left rail → *Switch the board on*. Off means the whole
section disappears from the page along with its menu link, and your notices are
kept for next time.

Each notice can have a title, a few lines of text, a date, a small badge
(New, Pinned, whatever you like), a photo, a WhatsApp link, and a purple
highlight. Any single notice can also be hidden on its own without touching the
rest.

---

## Things worth knowing

**Your password lives on Netlify, not in a browser.** To change it: Netlify →
Site configuration → Environment variables → edit `ADMIN_PASSWORD` → then
**Deploys → Trigger deploy**. Settings only take effect on a fresh deploy.

**The five settings** the site needs are `ADMIN_USER`, `ADMIN_PASSWORD`,
`SESSION_SECRET`, `GITHUB_REPO` and `GITHUB_TOKEN`. The GitHub token is a
fine-grained personal access token with *Contents: Read and write* on this
repository only. It expires — put a reminder in your phone before it does, or
Publish will stop working.

**The `/admin/` page can be reached by anyone who guesses the address**, but it
is useless without the password. The check happens on the server, and so does
every publish.

**Photos** are shrunk to 1800px WebP in your browser before being sent, so
publishing stays quick. About 4.5 MB per publish is the limit — if you are
adding several photos, publish after each one.

**Netlify's free plan counts credits.** Each publish costs the same whether you
changed one word or twenty, so make all your edits and press Publish once.

**Going back.** Every publish is a commit. Open this repository → **Commits** →
pick an earlier version → the three dots → **Revert**.

**Your own domain.** Netlify → Domain management → Add a domain. If you do,
change `salidoresort.netlify.app` in `robots.txt`, `sitemap.xml` and the
`canonical` / `og:url` lines near the top of `index.html`.

**The offline copy.** `Salido-Resort-OFFLINE.html` is one self-contained file
holding the whole website — handy on a USB stick or by email. It is a snapshot
and does not update itself. For an always-current local copy, just double-click
`index.html` in this folder.

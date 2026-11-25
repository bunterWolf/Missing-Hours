# missing-hours.app

The website of [Missing Hours](https://github.com/bunterWolf/Missing-Hours), served by GitHub Pages at
**https://missing-hours.app**.

This is the `gh-pages` branch. It has **no shared history with the app** (orphan branch) and is never merged into
`main` or `beta/*`, nor they into it. A push to `gh-pages` publishes the site within about a minute; app releases
don't touch it, and it doesn't touch them. Don't delete this branch during branch cleanup.

## Layout

| Path | What | Edit by hand? |
| --- | --- | --- |
| `index.html`, `assets/site.css`, `assets/design.js` | The landing page: markup, styles, and the logic of the interactive app views | Yes |
| `assets/runtime.js` | Tiny runtime that runs `design.js` (zoom, day arrows, live timer) through the `data-dc*` attributes | Rarely |
| `_design/check.mjs` | Checks links, assets, copy rules and SEO data. Run before every commit | When adding rules |
| `_design/specs/`, `_design/plans/` | Design decisions and implementation plans | Yes |
| `_design/v1/` | Archive: the Claude Design export of v1 and the converter that built it (tag `site-v1`) | No |
| `assets/release.js` | Points the download buttons at the newest stable release, via the GitHub API | Rarely |
| `assets/fonts.css`, `assets/fonts/` | Inter, self-hosted (no Google Fonts) | No |
| `imprint/`, `privacy/`, `404.html`, `assets/page.css` | Text pages | Yes |
| `CNAME` | Custom domain for GitHub Pages | No |
| `.nojekyll` | Serve files as they are (no Jekyll) | No |

No build tools, no dependencies: the scripts need only Node 18+.

## Change the site

Since v2 the files are the source: edit `index.html`, `assets/*` and the text pages directly. v1 was converted
from a Claude Design export; that converter and export are archived in `_design/v1/` and the live v1 state is the
git tag `site-v1`. New ideas from Claude Design are carried over by hand.

1. Edit the files.
2. `node _design/check.mjs`. It must print `check: ok`.
3. Preview (below), then commit.

Bigger changes happen on a branch (for example `site-v2`). `gh-pages` is only fast-forwarded to it once the
change is approved.

**Preview**

```bash
python -m http.server 8765
```

Then open http://localhost:8765. Check a phone width and dark mode too.

**Preview to share (private, works on the phone)**

`node _design/preview.mjs` writes `.preview/` (git-ignored) and prints the `files` map. Claude publishes
`.preview/index.html` with that map to the private artifact https://claude.ai/artifact/KoRzK4VKvM5k6kZcyDa2T6
(the working branch, currently `site-v2`). Inside the artifact the GitHub release lookup is blocked, so the
download button shows the fallback version.

**Publish**

```bash
git push origin gh-pages
```

Build status: `gh api repos/bunterWolf/Missing-Hours/pages/builds/latest` (or the repository's Actions tab,
"pages build and deployment").

## Download button and version

The HTML links to a fixed installer (the `href` of every `a[data-download]` in `index.html`). In the browser, `assets/release.js`
asks GitHub for the latest release (pre-releases, i.e. betas, are skipped) and switches the buttons and the
version text to its `Missing-Hours-Setup-<version>-win-x64.exe`. New app releases therefore show up on the site
without a change here. Update the fallback now and then, and if the installer's file name pattern ever changes,
update `release.js`.

## Domain and DNS

`missing-hours.app` is registered at Namecheap. DNS (Namecheap > Domain List > Manage > Advanced DNS):

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `bunterwolf.github.io.` |
| TXT | `_github-pages-challenge-bunterWolf` | (code from GitHub > Settings > Pages > Verified domains) |

`www.missing-hours.app` redirects to `missing-hours.app`. `.app` domains only work over HTTPS (HSTS preload);
GitHub Pages issues the certificate and "Enforce HTTPS" is on. The verified-domain TXT record stops anyone else
from claiming the domain on GitHub Pages.

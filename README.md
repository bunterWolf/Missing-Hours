# missing-hours.app

The website of [Missing Hours](https://github.com/bunterWolf/Missing-Hours), served by GitHub Pages at
**https://missing-hours.app**.

This is the `gh-pages` branch. It has **no shared history with the app** (orphan branch) and is never merged into
`main` or `beta/*`, nor they into it. A push to `gh-pages` publishes the site within about a minute; app releases
don't touch it, and it doesn't touch them. Don't delete this branch during branch cleanup.

## Layout

| Path | What | Edit by hand? |
| --- | --- | --- |
| `index.html`, `assets/site.css`, `assets/design.js` | The landing page, generated from the Claude Design export | No, run the build |
| `_design/Site5.dc.html` | Snapshot of the design export (Claude Design canvas "Missing Hours Landing Page") | Replace with a new export |
| `_design/fixes.mjs` | Deliberate differences from the design: real links, claims corrected to what the app does | Yes |
| `_design/build.mjs` | Converts the design export into the three generated files | Rarely |
| `assets/runtime.js` | Tiny runtime that runs the design's interactive logic (tabs, zoom, day arrows, live timer) | Rarely |
| `assets/release.js` | Points the download buttons at the newest stable release, via the GitHub API | Rarely |
| `assets/fonts.css`, `assets/fonts/` | Inter, self-hosted (no Google Fonts) | No |
| `imprint/`, `privacy/`, `404.html`, `assets/page.css` | Text pages | Yes |
| `CNAME` | Custom domain for GitHub Pages | No |
| `.nojekyll` | Serve files as they are (no Jekyll) | No |

No build tools, no dependencies: the build needs only Node 18+.

## Change the site

**New design version from Claude Design**

1. Save the new `.dc.html` export to `_design/` (replace `Site5.dc.html`, or pass the new path to the build).
2. `node _design/build.mjs [path]`. If the design's wording changed where a fix applies, the build stops and names
   the entry in `_design/fixes.mjs`. Update or remove it, so no correction is lost silently.
3. Preview (below), then commit and push.

**Text pages** (imprint, privacy): edit the HTML directly.

**Preview**

```bash
python -m http.server 8765
```

Then open http://localhost:8765. Check a phone width and dark mode too.

**Publish**

```bash
git push origin gh-pages
```

Build status: `gh api repos/bunterWolf/Missing-Hours/pages/builds/latest` (or the repository's Actions tab,
"pages build and deployment").

## Download button and version

The HTML links to a fixed installer (`FALLBACK_EXE` in `_design/fixes.mjs`). In the browser, `assets/release.js`
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

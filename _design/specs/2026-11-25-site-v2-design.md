# Website v2: "problem first" landing page

Status: draft for approval · 2026-11-25 · branch `site-v2` (from `gh-pages` at tag `site-v1`)

## Intent

Visitors to missing-hours.app should understand within seconds what Missing Hours does and what they get from it,
and the page should rank for searches like "automatic time tracking" worldwide, against Memtime, Timing,
RescueTime and similar tools. Today's page (v1, the Claude Design export) looks good but explains the product
poorly: it opens with a vague line, gives small features (breaks) a whole section, and never says plainly what is
recorded.

The product in one sentence: Missing Hours runs in the background on Windows, notes which app is in front and its
window title, and shows the day as blocks, so filling in a timesheet becomes looking things up instead of
remembering. It complements the tool hours are logged in; it doesn't replace it.

## Goals

- The value is clear on first read: forgotten hours are unbilled work, and this app gets them back.
- What the app records is stated precisely (app + window title + present/away), and what it never records
  (keystrokes, screenshots, screen content).
- The page conveys the app's quality early: the real app view stays prominent near the top.
- Search: English, global. Target phrases: "automatic time tracking", "automatic time tracker for Windows",
  "timesheet", "track time automatically", "time tracking without timer", "privacy". FAQ rich results.
- Easy to iterate: v1 remains reachable (tag `site-v1`), v2 is previewable without touching the live site.

## Non-goals (this iteration)

- Other languages. The structure should make them addable later (no text baked into images, copy kept in HTML).
- The hero day animation (tracking builds up from ~3:30 pm in fast forward, holds, fades back). Planned next,
  after v2 is live. v2 must not block it: the hero app view stays a live DOM component.
- Mac/Linux, team features, integrations.

## Anti-goals (failure even if it works)

- Invented statistics or claims the app can't back (no "33–64 % forgotten" studies, no "signed installer",
  no "open source" while the repo has no license).
- Reading like an employee-monitoring tool.
- A slower or tracking page: no third-party requests besides the existing GitHub release lookup, no cookies,
  no analytics, fonts stay self-hosted.

## Constraints

- GitHub Pages, static files, no build dependencies (Node 18+ only if a script is needed at all).
- App facts to stay true to (checked against `main`): Windows 10 and 11; autostart (on by default in the Store build, a switch in Settings for the GitHub build);
  keeps 30 days, fixed; zoom 15/10/5 min; steps back through days; detects breaks/inactivity; GitHub build
  checks GitHub for updates (electron-updater), the Store build updates via the Store; no account, no server; the app loads Inter from Google Fonts at start (v1.1.0); Mac builds exist on GitHub.
- The privacy page must stay accurate for whatever the landing page does.

## Approaches considered

1. **Claude Design stays the source**: the user restructures in the canvas, the build converts each export and
   applies fixes. Keeps visual editing, but each iteration needs the user in the canvas, icons/animation/SEO
   details are hard to control, and the fix list keeps growing.
2. **Code becomes the source**: freeze today's export into hand-maintained HTML/CSS/JS and restructure there. Fast
   iterations and full control; the canvas becomes inspiration only.
3. **Like 2, with throwaway concept variants first.** Chosen by the user. Three variants were shown
   (problem first, example first, how-it-works first); the user picked **A, problem first**: it leads with the
   cost of forgotten hours, like Memtime, while the app view in the hero shows the quality early.

## Decisions made with the user

- Hero: H1 "Find your missing hours." (kept). Subline "When you fill in your timesheet, an hour is often missing."
  (already live) plus the money angle in variant A's wording.
- Header is not sticky (already live).
- Section order (variant A), copy from the concept artifact https://claude.ai/artifact/9roHrPSL4jityqjmW1cmZB:
  1. Hero, with eyebrow "Automatic time tracking for Windows", download CTA, the live app view.
  2. Problem: "Forgotten hours cost real money." Worked example clearly marked as an example
     ($90/h × 1 h/week ≈ $4,300/year), no external statistics.
  3. How it works: three real steps (runs in the background · sums up your day · you fill in your timesheet).
  4. Example: **one day, not a week**. Timesheets are filled daily; the example shows the end of a day, picking
     one project's blocks from that day and getting the hours for one entry. Only this one example (the old
     tabs "Fill a timesheet", "Find a lost hour", "Answer a client" go). Wording is general (timesheet / time
     entry); invoices are mentioned in the text only.
  5. What it records / never records (two lists).
  6. "Any day, rough or precise." (day arrows + zoom, keeps the interactive demo); breaks become one sentence here.
  7. "Keep your time tracker. This is where you look things up." (complement, not replacement).
  8. Privacy: "No account. No cloud." 30 days, and the one connection said plainly (checking GitHub for a new
     version). "It just runs along" is removed.
  9. "Free, with the code in the open." Own section; includes the "Made by Sebastian Wolf" note.
  10. FAQ (also marked up for Google).
  11. Final CTA "What did you work on last Tuesday? / Next week, you'll know." (kept).
- Removed: the "Breaks don't count as work" section, the "Running a team?" note.
- **New logo** (user's icon handoff, 2026-11-25, the logo handoff folder): eleven hour
  strokes with the 1 o'clock stroke moved outward in red (`#e5484d`, never as a fill). On the site the free-standing
  logo replaces `assets/icon.svg` everywhere (header, footer, favicon, text pages, 404): `missing-hours-logo-hell.svg`
  on light, `missing-hours-logo-dunkel.svg` on dark, switched by the page theme / `prefers-color-scheme`; the
  `-klein` variants for sizes ≤ 24 px (header 28 px and footer 24 px use the regular/klein as fits). Favicon: SVG
  with a dark-mode media query inside, PNG 64 from `logo/` as fallback; `apple-touch-icon` and the OG image use the
  new mark. Lockup: mark left, "Missing Hours" in Inter 600, letter-spacing −0.02em.
- Real app icons (Outlook, Word, Excel, PowerPoint, a browser, etc.) replace the colored placeholder squares in
  the app views. (the user signed off on using them).
- Previews and versions: v1 is tag `site-v1`. Work happens on branch `site-v2`; every reviewable state is
  published as a private Claude artifact preview at one stable link, compared against the live site. Going live =
  fast-forward `gh-pages` to `site-v2` and push. More variants get their own branch and preview link.

## Builder's calls (proposed, correctable)

- **Freezing the export:** `index.html`, `assets/site.css`, `assets/design.js` become hand-edited source. The
  converter (`_design/build.mjs`, `fixes.mjs`, the `.dc.html` snapshot) moves to `_design/v1/` as an archive and
  the README explains the new workflow. `runtime.js` stays (the interactive app views depend on it).
- **SEO:** `<title>` "Missing Hours – Automatic time tracking for Windows, free and private"; meta description
  with the target phrases; one H1; H2 per section using the target phrases where natural; JSON-LD
  `SoftwareApplication` (Windows, price 0, download URL) and `FAQPage`; `robots.txt` + `sitemap.xml`; Open Graph
  image (1200×630, the app view); `alt` text on icons where they carry meaning.
- **Icons:** small SVGs in `assets/app-icons/`, mapped per app in the design's data; hidden from screen readers
  (the app name is in the text).
- **Preview build:** the artifact preview needs the page without `<html>/<head>/<body>` and with absolute asset
  references mapped as artifact files; a small script in `_design/` produces that copy. The GitHub release lookup
  will fall back to the fixed version inside the preview; that's fine.
- Copy polish within the agreed structure, keeping to plain, concrete English.
- **Example is static, the reader adds up** (my call): the app can't select blocks or sum a selection, so the
  example highlights one project's blocks of the day and says "add them up" (as v1 did: "add up the blocks, write
  the line"). The concept's "add up on their own" wording is dropped. No pick-and-sum demo.
- **Download and the Store** (my call): CTAs stay the GitHub installer. The Microsoft Store build is in
  certification; a Store button is a separate change once the listing is public. Privacy wording must be true for
  both builds already, and name every connection the app makes (update check, Google Fonts).
- **v1 stays reachable as the git tag `site-v1` only** (my call): no public `/v1/` URL, so no duplicate content.
- **Icons** (my call): the apps' real, official icons as the user asked, as small optimised SVG/PNG files; Microsoft
  Edge as the browser (Windows default). Downloading them needs the user's OK per file source at build time.

## Left open / later

- Hero animation (next iteration).
- Multilingual site.
- License decision for the repo (would allow an "open source" claim).
- Store listing website URL (separate task).

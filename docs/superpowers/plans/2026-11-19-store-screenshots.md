# Store-Einträge und Marketing-Screenshots – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `npm run store-screenshots` erzeugt aus der echten App pro Sprache fünf Store-Bilder in 3840 × 2160; die Store-Texte liegen vollständig in 12 Sprachen als geprüfte Daten in `store/listing/`.

**Architecture:** Ein Beispieltag (`store/demo-day.js`) wird zu 30-Sekunden-Herzschlägen und per neuem
`--mock-data-file` in die echte App geladen; Playwright nimmt das 437 × 720-Fenster mit 250 % auf. Ein
eigener kleiner Electron-Prozess (`store/template/render.js`) setzt die Aufnahmen per HTML-Vorlage auf
die 4K-Fläche (CDP-Emulation, Skalierung 2,5). Texte, Bildtexte und Fenstertitel kommen aus
`store/listing/<sprache>.json`.

**Tech Stack:** Electron, playwright-core (vorhanden), Jest (ts-jest/babel-jest), @resvg/resvg-js (vorhanden), @fontsource/inter (vorhanden). Keine neuen Abhängigkeiten.

**Spec:** `docs/superpowers/specs/2026-11-19-store-screenshots-design.md` (inkl. Abschnitt 6.7 mit den im Entwurf gefundenen Electron-Fallen – vor Task 5 lesen).

## Global Constraints

- Sprachen: `en` (Referenz), `de`, `fr`, `es`, `it`, `pt-BR`, `nl`, `pl`, `ja`, `ko`, `zh-Hans`, `zh-Hant` – Liste aus `SUPPORTED_LANGUAGES` (`src/i18n/languages.js`), nie hart kodiert.
- Echte Übersetzungen nach CLAUDE.md „Multilingual“ (Microsoft-Begriffe, eigene Anführungszeichen); keine englischen Platzhalter.
- Microsoft-Grenzen: Beschreibung ≤ 10 000 Zeichen, Kurzbeschreibung ≤ 1 000 (Ziel ≤ 270), Features ≤ 20 × ≤ 200, Bildunterschrift ≤ 200, Suchbegriffe ≤ 7 × ≤ 30 (Annahme, Doku nennt keine Grenze).
- Ausgabe 3840 × 2160 PNG; App-Fenster Inhalt 437 × 720 bei `--force-device-scale-factor=2.5` (1093 × 1800); Vorlage 1536 × 864 CSS-Pixel × 2,5.
- Kein echtes Tracking, keine echten Daten: temporärer userData-Ordner pro Lauf (wie `scripts/screenshots.js`), Abbruch, wenn die App einen anderen Ordner nutzt; Beispieldaten nur in temporären Dateien.
- Keine fremden Logos im Repo; erzeugte Bilder in `store-screenshots/` (gitignored).
- Conventional Commits; Branch `feat/store-screenshots`; kein Release, keine Versionsänderung.
- Das App-Fenster zeigt nur, was die App selbst zeigt; einzige Ausnahme: `.wm-footer-mock` entfernen.

## Review Focus

1. **`--mock-data=<pfad>` statt `--mock-data --mock-data-file=<pfad>`** schaltet den Mock-Modus aus und trackt echt. Erwartet: Pfad wird nur mit `--mock-data` gelesen; das Skript übergibt immer beide Schalter. Test in Task 1.
2. **Ein Programm fehlt auf dem Rechner** (z. B. Figma). Erwartet: laute Warnung mit Pfad, Bild entsteht trotzdem mit Standard-Stil. Test in Task 3 (`resolveAppPaths`).
3. **Übersetzter Fenstertitel zu lang** wird mit „…“ gekürzt und sieht im Store schlampig aus. Erwartet: Skript meldet jeden gekürzten Ereignistitel als Fehler mit Sprache und Text. Prüfung in Task 6.
4. **Überschrift in einer Sprache zu lang** (Polnisch, Deutsch) läuft über drei Zeilen oder aus der Fläche. Erwartet: Fehler mit Sprache und Motiv. Prüfung in Task 5.
5. **Icons noch nicht geladen** zum Zeitpunkt der Aufnahme. Erwartet: Aufnahme wartet, bis jedes Ereignis mit vorhandenem Programm sein `<img>` hat (Timeout 10 s, dann Fehler). Task 6.

---

### Task 1: Branch, Spec-Commit und `--mock-data-file`

**Files:**
- Modify: `src/store/ActivityStore.ts` (StoreOptions Z. 76–79, Konstruktor Z. 115–150)
- Modify: `src/main/main.ts` (Z. 108, Z. 250–253)
- Test: `src/store/ActivityStore.test.ts`

**Interfaces:**
- Produces: `StoreOptions.mockDataPath: string | null` (Default `null` = `public/mock-data.json`); CLI `--mock-data --mock-data-file=<absoluter Pfad>`.

- [ ] **Step 1: Branch umbenennen und Spec committen**

```bash
git branch -m feat/store-screenshots
git add docs/superpowers/specs/2026-11-19-store-screenshots-design.md docs/superpowers/plans/2026-11-19-store-screenshots.md
git commit -m "docs: design and plan for store listing and screenshots"
```

- [ ] **Step 2: Failing tests** in `ActivityStore.test.ts` (Muster der vorhandenen Tests; temporäre Datei mit `os.tmpdir()`):
  - `loads mock data from mockDataPath when given`: Datei mit einem Tag `2025-03-04` und 10 Herzschlägen schreiben, `new ActivityStore({ useMockData: true, mockDataPath })` → `getAvailableDates()` enthält `'2025-03-04'`.
  - `ignores mockDataPath without useMockData`: `new ActivityStore({ useMockData: false, mockDataPath, storagePath: <tmp> })` → enthält `'2025-03-04'` nicht.
- [ ] **Step 3:** `npx jest src/store/ActivityStore.test.ts` → beide FAIL.
- [ ] **Step 4: Implementieren.** `StoreOptions` um `mockDataPath: string | null` erweitern; im Mock-Zweig `this.options.mockDataPath ?? path.join(__dirname, '../../public/mock-data.json')`. In `main.ts`: `const mockDataFile = useMockData ? process.argv.find((a) => a.startsWith('--mock-data-file='))?.slice('--mock-data-file='.length) ?? null : null;` und an `new ActivityStore({ useMockData, mockDataPath: mockDataFile })` geben. `useMockData` bleibt `includes('--mock-data')` (exakt).
- [ ] **Step 5:** `npm test` → alle grün.
- [ ] **Step 6: Commit** `feat: load mock data from a given file (--mock-data-file)`

### Task 2: Store-Texte als Daten in 12 Sprachen

**Files:**
- Create: `store/listing/common.json`, `store/listing/<sprache>.json` (12), `store/listing/listing.test.js`
- Modify: `jest.config.js` (`roots: ['<rootDir>/src', '<rootDir>/store']`, Kommentar anpassen)
- Modify: `docs/MICROSOFT-STORE.md` (Abschnitt „Store-Texte“ Z. 86–264 durch Verweis ersetzen)

**Interfaces:**
- Produces (Schema jeder Sprachdatei, `en.json` ist Referenz):

```json
{
  "shortDescription": "…",
  "description": "… (mit Feature-Liste wie heute in MICROSOFT-STORE.md)",
  "features": ["…"],
  "searchTerms": ["…"],
  "screenshots": {
    "timeline": { "headline": "…", "subline": "…", "caption": "…" },
    "detail":   { "headline": "…", "subline": "…", "caption": "…" },
    "dark":     { "headline": "…", "subline": "…", "caption": "…" },
    "privacy":  { "headline": "…", "subline": "…", "caption": "…" }
  },
  "demoDay": { "titles": { "inbox": "…", "proposal": "…", "research": "…", "calculation": "…",
    "projectFolder": "…", "workshop": "…", "processMap": "…", "clientPortal": "…", "kickoff": "…",
    "timesheet": "…", "minutes": "…" } }
}
```

`common.json`: `{ "category": "Productivity", "privacyUrl": "https://github.com/bunterWolf/Missing-Hours/blob/main/PRIVACY.md", "copyright": "© 2026 Sebastian Wolf", "developer": "Sebastian Wolf" }`.

Inhalte: `shortDescription`/`description` wörtlich aus `docs/MICROSOFT-STORE.md` übernehmen; `features` = die fünf Listenpunkte. Deutsche Richtung der Bildtexte: timeline „Wo sind deine Stunden geblieben?“ / „Missing Hours zeichnet deinen Arbeitstag automatisch auf – Programm für Programm, ohne Stoppuhr.“; detail „So genau, wie du es brauchst“; dark „Hell oder dunkel, wie dein Windows“; privacy „Deine Daten bleiben auf deinem PC“ / „Keine Cloud, kein Konto, keine Telemetrie.“ Überschriften ≤ ~40 Zeichen (DE/PL), sonst kürzer formulieren. Fenstertitel: erfundene, landesübliche Firmen (DE „Müller GmbH“, EN „Miller & Co“, FR „Dupont SARL“, JA „田中商事“ …), Dateiendungen echt (`.docx`, `.xlsx`, `.pptx`), **≤ 32 Zeichen**, damit sie in die Blockbreite passen. `processMap` und `clientPortal` enden ohne Programmnamen. Suchbegriffe pro Sprache landesüblich (z. B. DE „Zeiterfassung“, „Stundenzettel“, „Arbeitszeit“, „Rechnung“, „Produktivität“, „Time Tracker“, „Zeitleiste“).

- [ ] **Step 1: Failing test** `store/listing/listing.test.js` (Stil wie `src/i18n/locales.test.js`, `flatten` dort abschauen, Sprachen aus `SUPPORTED_LANGUAGES`):
  - `every supported language has a listing file and nothing else` (außer `common.json`)
  - `<lang> has exactly the keys of en` (gleiche flache Schlüssel; Arrays zählen als ein Blatt)
  - `<lang> has no empty texts` (auch kein leeres Array-Element)
  - `<lang> respects the Store limits` mit Konstanten `LIMITS = { description: 10000, shortDescription: 1000, featureCount: 20, featureLength: 200, caption: 200, searchTermCount: 7, searchTermLength: 30, demoTitleLength: 32 }` (Quelle als Kommentar: Microsoft Learn „Add and edit Store listing info“ / „Screenshots and images“, geprüft 2026-11-19)
  - `shortDescription stays within the visible 270 characters` (alle Sprachen)
- [ ] **Step 2:** `jest.config.js` `roots` ergänzen; `npx jest store/listing` → FAIL (Dateien fehlen).
- [ ] **Step 3:** `en.json`, `de.json`, `common.json` anlegen, dann die übrigen 10 Sprachen übersetzen.
- [ ] **Step 4:** `npm test` → alle grün.
- [ ] **Step 5:** `docs/MICROSOFT-STORE.md`: Texte entfernen, stattdessen „Die Store-Texte pro Sprache stehen in `store/listing/<sprache>.json` (Felder → Partner Center: …), sprachunabhängige Angaben in `common.json`. `npm run store-screenshots` schreibt sie zusätzlich als `listing.md` zum Kopieren neben die Bilder.“ Den Hinweis „mindestens ein Screenshot … `npm run screenshots` liefert Ausgangsmaterial“ auf `npm run store-screenshots` umstellen; Logos-Absatz auf App-Kachel-Icon 300 × 300 (Task 7) umstellen.
- [ ] **Step 6: Commit** `feat: store listing texts as data in all 12 languages`

### Task 3: Beispieltag

**Files:**
- Create: `store/demo-day.js` (CommonJS, damit Node-Skript und Jest ihn laden), `store/demo-day.test.js`

**Interfaces:**
- Produces:
  - `APPS: { [id]: { name: string, windowsPath: string } }` mit ids `outlook, word, excel, powerpoint, edge, chrome, figma, explorer` (Pfade wie Spec 6.3, Umgebungsvariablen in `%VAR%`-Form).
  - `SCHEDULE: Array<{ start: 'HH:MM', end: 'HH:MM', app: string | null, title: string | null }>` (`app: null` = abwesend)
  - `demoDate(now: Date): Date` – letzter Dienstag strikt vor dem lokalen Tag von `now`, 00:00 Ortszeit.
  - `expandWindowsPath(p: string, env = process.env): string`
  - `resolveAppPaths(env = process.env, exists = fs.existsSync): { paths: { [id]: string }, missing: string[] }`
  - `buildDemoStoreData({ date: Date, titles: { [key]: string }, paths: { [id]: string } }): StoreData` – Herzschläge um hh:mm:15 und hh:mm:45 (wie `HeartbeatManager`) für `start ≤ t < end`; aktiv: `{ userActivity: 'active', appWindow: { app, title, path } }`; abwesend: `userActivity: 'inactive'`, `appWindow` = letztes Fenster davor; `aggregationInterval: 15`; Tagesschlüssel `YYYY-MM-DD` in Ortszeit; `version: 1`, `startTime`/`lastCleanup` = erster Herzschlag.

`SCHEDULE` (genau so, die Tests hängen an den Summen):

| Start | Ende | App | Titel |
| --- | --- | --- | --- |
| 08:45 | 09:15 | outlook | inbox |
| 09:15 | 09:50 | word | proposal |
| 09:50 | 09:55 | edge | research |
| 09:55 | 10:30 | word | proposal |
| 10:30 | 10:45 | edge | research |
| 10:45 | 11:30 | excel | calculation |
| 11:30 | 11:45 | explorer | projectFolder |
| 11:45 | 12:30 | powerpoint | workshop |
| 12:30 | 13:15 | – | – |
| 13:15 | 13:30 | outlook | inbox |
| 13:30 | 14:45 | figma | processMap |
| 14:45 | 15:15 | chrome | clientPortal |
| 15:15 | 16:15 | powerpoint | kickoff |
| 16:15 | 16:45 | excel | timesheet |
| 16:45 | 17:15 | word | minutes |

- [ ] **Step 1: Failing tests** (`TZ` ist in Jest `Europe/Berlin`; Titel aus `store/listing/en.json`):
  - `demoDate returns the last Tuesday before today`: `demoDate(new Date(2026, 10, 19, 10))` → `2026-11-17 00:00`; `demoDate(new Date(2026, 10, 17, 10))` → `2026-11-10`.
  - `expandWindowsPath replaces %VARS%`: `('%LOCALAPPDATA%\\Figma\\Figma.exe', { LOCALAPPDATA: 'C:\\U\\L' })` → `'C:\\U\\L\\Figma\\Figma.exe'`; unbekannte Variable → Fehler mit ihrem Namen.
  - `resolveAppPaths reports missing programs`: `exists = (p) => !p.includes('Figma')` → `missing` = `['figma']`, `paths.figma` trotzdem gesetzt.
  - `the demo day aggregates to round totals`: `new TimelineGenerator(15)`, `generateTimelineEvents(heartbeats, <Tag + 1 Tag>)`, `calculateSummary` → `totalActiveDuration === 7.75 h`, `totalInactiveDuration === 45 min`, `activeTrackingDuration === 8.5 h` (in ms).
  - `the lunch break is one inactive block at 15 minutes`: genau ein Ereignis `type === 'inactive'`, `timestamp` = 12:30, `duration` = 45 min.
  - `the short Edge visit only shows at 5 minutes`: bei 15 min kein `appWindow`-Ereignis mit `research` zwischen 09:45 und 10:00; bei `new TimelineGenerator(5)` eines um 09:50 mit 5 min.
  - `every heartbeat carries app, title and path`: alle aktiven Herzschläge haben `appWindow.path === paths[app]`.
- [ ] **Step 2:** `npx jest store/demo-day.test.js` → FAIL.
- [ ] **Step 3:** `store/demo-day.js` implementieren.
- [ ] **Step 4:** `npm test` → grün.
- [ ] **Step 5: Commit** `feat: realistic demo day for store screenshots`

### Task 4: Gemeinsamer App-Start für beide Screenshot-Skripte

**Files:**
- Create: `scripts/lib/launch-app.js`, `scripts/lib/layout-check.js`
- Modify: `scripts/screenshots.js` (nutzt beide, Verhalten unverändert)

**Interfaces:**
- Produces:
  - `launch-app.js`: `ROOT`, `KEEP_PAINTING`, `NEUTRAL_POINTER`, `localeFor(language): string`, `formatLocaleFor(language): string`, `ALL_LANGUAGES: string[]`, `launchApp({ language, args = [] }): Promise<{ app, page, close(): Promise<void> }>` – temporärer userData-Ordner, Prüfung `getPath('userData')`, `setBackgroundThrottling(false)`, wartet auf `.wm-app`, prüft `<html lang>`; `close` schließt und löscht den Ordner.
  - `layout-check.js`: `CHECKED_TEXT`, `findLayoutProblems(selectors)` (unverändert verschoben).

- [ ] **Step 1:** Verschieben, `screenshots.js` umstellen (keine Logikänderung).
- [ ] **Step 2:** `npm run screenshots -- de ja` bzw. `npm run generate:mock && npx tsc && npx webpack --config webpack.config.js && node scripts/screenshots.js de ja` → „No layout problems found.“, 14 Bilder pro Sprache wie vorher.
- [ ] **Step 3: Commit** `refactor: share app launching between screenshot scripts`

### Task 5: Vorlage und Renderer

**Files:**
- Create: `store/template/index.html`, `store/template/style.css`, `store/template/render.js`

**Interfaces:**
- Consumes: Aufnahmen als PNG-Dateien (Task 6).
- Produces: `electron store/template/render.js <jobs.json>`; `jobs.json` = `[{ out, layout: 'screenshot' | 'hero', theme: 'light' | 'dark', lang, headline?, subline?, windows: [{ src, theme }] }]`. Schreibt jedes `out` (3840 × 2160 PNG) und `<jobs.json>.result.json` = `{ problems: string[] }`. Exit-Code 0 auch bei `problems` (der Aufrufer wertet aus), ≠ 0 bei Absturz.

Vorgaben: Gestaltung wie Entwurf (`store-light.png`/`store-dark.png` vom 2026-11-19): Fläche 1536 × 864 CSS; Text links (`left: 120px; top: 150px; width: 640px`), Überschrift Inter 700, 72 px, Zeilenhöhe 1.08, Unterzeile 28 px; Fenster rechts (`right: 150px; top: 72px`), 437 × 720, `border-radius: 8px`, Schatten; App-Icon `resources/icon.png` 44 px + „Missing Hours“ unten links; Hintergrund hell `#f8f7f5 → #efece7` mit weißem Radialschein, dunkel `#161513 → #0a0a0a`. Hero: zwei Fenster (dunkel hinten links versetzt, hell vorn), kein Text, kein Name. Schrift: Inter aus `node_modules/@fontsource/inter/files`; für `ja`/`ko`/`zh-*` setzt `<html lang>` die Systemschrift (`font-family: Inter, "Yu Gothic UI", "Malgun Gothic", "Microsoft YaHei UI", "Microsoft JhengHei UI", system-ui`, per `:lang()` passende zuerst).

Renderer-Ablauf (Fallen siehe Spec 6.7): `force-device-scale-factor=1` + KEEP_PAINTING-Schalter; ein `BrowserWindow` (`x: -6000, y: 0, width: 1536, height: 864, show: true, frame: false, skipTaskbar: true, focusable: false, useContentSize: true`, `partition: 'store-render-' + Date.now()`); `loadURL('about:blank')`, `debugger.attach('1.3')`, `Emulation.setDeviceMetricsOverride({ width: 1536, height: 864, deviceScaleFactor: 2.5, mobile: false })`; pro Job `index.html?job=<n>` laden (Vorlage liest Job per `fetch` der jobs-Datei oder per Query), `setZoomFactor(1)`, `document.fonts.ready`, Layoutprüfung, `Page.captureScreenshot({ format: 'png', clip: { x: 0, y: 0, width: 1536, height: 864, scale: 1 } })`; `process.on('unhandledRejection')` schreibt den Fehler und `app.exit(1)`.

Layoutprüfung in der Seite: Überschrift höchstens 2 Zeilen, Unterzeile höchstens 3, kein Element ragt aus der Fläche oder in das Fenster → sonst `problems.push('<lang> <out-Dateiname>: <Grund>')`.

- [ ] **Step 1:** Vorlage und Renderer schreiben.
- [ ] **Step 2:** Mit den Entwurfs-Aufnahmen prüfen: Job-Datei mit einem `screenshot`-Job (hell, de, Überschrift aus `de.json`) und einem `hero`-Job; `npx electron store/template/render.js <jobs>` → zwei PNGs 3840 × 2160 (Größe aus dem PNG-Header prüfen), `problems: []`; Bild ansehen.
- [ ] **Step 3:** Gegenprobe: Überschrift auf 120 Zeichen setzen → `problems` enthält „headline wraps to 3+ lines“.
- [ ] **Step 4: Commit** `feat: store image template and renderer`

### Task 6: `npm run store-screenshots`

**Files:**
- Create: `scripts/store-screenshots.js`, `store/motifs.js`
- Modify: `package.json` (Skript `"store-screenshots": "tsc && webpack --config webpack.config.js && node scripts/store-screenshots.js"`), `.gitignore` (`store-screenshots/`)

**Interfaces:**
- Consumes: Task 1 (`--mock-data-file`), Task 2 (Listing), Task 3 (`demoDate`, `resolveAppPaths`, `buildDemoStoreData`), Task 4 (`launchApp`, `findLayoutProblems`), Task 5 (Renderer).
- Produces: `store/motifs.js` → `MOTIFS = [{ file: '01-timeline', key: 'timeline', theme: 'light', interval: 15, view: 'day', scrollTo: '08:45' }, { file: '02-detail', key: 'detail', theme: 'light', interval: 5, view: 'day', scrollTo: '09:15' }, { file: '03-dark', key: 'dark', theme: 'dark', interval: 15, view: 'day', scrollTo: '13:15' }, { file: '04-privacy', key: 'privacy', theme: 'light', view: 'settings-store' }]`, `HERO = { file: '00-hero', windows: [{ theme: 'dark', scrollTo: '13:15' }, { theme: 'light', scrollTo: '08:45' }] }`.

Ablauf pro Sprache (`node scripts/store-screenshots.js [sprachen…]`, unbekannte Sprache → Fehler wie in `screenshots.js`):
1. `resolveAppPaths()`; fehlende einmal pro Lauf laut melden (`console.warn`, Pfad nennen), weitermachen.
2. `buildDemoStoreData({ date: demoDate(new Date()), titles: listing.demoDay.titles, paths })` → temporäre Datei.
3. `launchApp({ language, args: ['--mock-data', '--mock-data-file=<tmp>', '--force-device-scale-factor=2.5'] })`; `setContentSize(437, 720)`; zurück zum Beispieltag (`.wm-date-nav-arrows .wm-button >> nth=0`); `.wm-footer-mock` entfernen.
4. Pro Motiv: Thema per `emulateMedia`; Intervall über die echte Zoom-Auswahl der App setzen (`.wm-interval-picker .wm-button`, dann die Option); Zeitleiste so scrollen, dass `scrollTo` oben steht (Position aus der Stundenbeschriftung bzw. Ereignis-`timestamp` berechnen, nicht aus festen Pixeln); auf Icons warten (jedes `.wm-timeline-event` mit vorhandenem Programm hat ein geladenes `img`, Timeout 10 s → Fehler); Maus auf `NEUTRAL_POINTER`; `findLayoutProblems(CHECKED_TEXT)` plus **Titelprüfung**: jedes `.wm-timeline-event-title` ohne Abkürzung (gleiche Messung wie `textRects` in `layout-check.js`) → sonst Problem `<lang> <motiv>: event title cut off: "<Text>"`; `page.screenshot` → temporäres PNG.
   `settings-store`: `get-settings`-Handler wie in `screenshots.js` überschreiben, Einstellungen öffnen.
5. Jobs bauen (4 Motive mit `headline`/`subline` aus dem Listing, Hero ohne Text), Renderer per `child_process.spawn(require('electron'), [render.js, jobs], { timeout: 120000 })`, `problems` übernehmen.
6. `store-screenshots/microsoft/<lang>/listing.md` schreiben: alle Felder des Listings plus `common.json`, Bildunterschriften mit Dateinamen, zum Kopieren ins Partner Center.

Am Ende: Ausgabeordner nennen, Probleme gesammelt ausgeben, `process.exitCode = 1` bei Problemen oder fehlenden Programmen (fehlende nur als Warnung; Exit 0, wenn sonst alles gut ist).

- [ ] **Step 1:** `store/motifs.js` und Skript schreiben.
- [ ] **Step 2:** `npm run store-screenshots -- de` (bzw. `node scripts/store-screenshots.js de` nach Build) → fünf PNGs 3840 × 2160 + `listing.md` in `store-screenshots/microsoft/de/`, keine Probleme; Bilder ansehen (Icons da, Intervall 5 min in 02, dunkel in 03, Einstellungen in 04, Hero mit zwei Fenstern).
- [ ] **Step 3:** Gegenprobe Review Focus 3: in einer Kopie der Titel einen 60-Zeichen-Titel einsetzen (nur lokal, nicht committen) → Lauf meldet „event title cut off“.
- [ ] **Step 4:** `git status` zeigt keine Dateien aus `store-screenshots/`.
- [ ] **Step 5: Commit** `feat: generate Microsoft Store screenshots (npm run store-screenshots)`

### Task 7: App-Kachel-Icon 300 × 300

**Files:**
- Modify: `scripts/generate-icons.js` (Kopfkommentar + Ausgabe)
- Create (erzeugt): `resources/store/AppTileIcon-300.png`

- [ ] **Step 1:** In `generate-icons.js` `render(300)` nach `resources/store/AppTileIcon-300.png` schreiben (Ordner anlegen), Kopfkommentar ergänzen („Partner Center > Store-Einträge > 1:1 App-Kachel-Symbol“).
- [ ] **Step 2:** `npm run icons` → Datei 300 × 300; `git status` zeigt nur diese neue Datei (die übrigen Kacheln unverändert).
- [ ] **Step 3: Commit** `feat: 300 px app tile icon for the Store listing`

### Task 8: Platzhalter „www.appname.io“ ersetzen

**Files:**
- Modify: `src/locales/*.json` (12, Schlüssel `placeholderLink`), ggf. Schlüssel umbenennen in `projectLink` inkl. `src/components/settings/SettingsView.js:166-168` (Kommentar „Placeholder only“ → „Project address as text, not a link: the app is local-only“).

- [ ] **Step 1:** Wert in allen 12 Dateien `github.com/bunterWolf/Missing-Hours`; Schlüssel `projectLink`; `SettingsView.js` anpassen.
- [ ] **Step 2:** `npm test` grün (`locales.test.js`).
- [ ] **Step 3:** `npm run screenshots` → keine Layoutprobleme (Adresse ist länger als der Platzhalter; bei Problemen in schmalen Sprachen melden, nicht das Layout ändern).
- [ ] **Step 4: Commit** `fix: show the project address instead of a placeholder in the settings`

### Task 9: Dokumentation und Gesamtlauf

**Files:**
- Modify: `CLAUDE.md` (Befehlstabelle: `npm run store-screenshots`; Ordnerübersicht: `store/`; Multilingual „Adding a language“: auch `store/listing/<code>.json`, statt „Store texts in docs/MICROSOFT-STORE.md“), `docs/MICROSOFT-STORE.md` („Pro Store-Release“: Schritt „Bei geänderter Oberfläche `npm run store-screenshots` laufen lassen, Bilder prüfen, im Partner Center ersetzen“), `README.md` (ein Satz unter den Skripten).

- [ ] **Step 1:** Doku anpassen.
- [ ] **Step 2:** `npm test` grün.
- [ ] **Step 3:** `npm run store-screenshots` für alle 12 Sprachen → 60 Bilder + 12 `listing.md`, keine Probleme. Bilder ansehen mindestens für `de`, `en`, `pl`, `ja`, `zh-Hant` (Schrift CJK korrekt, nichts abgeschnitten, Datum in Landesformat, 12-h-Uhr in `en`).
- [ ] **Step 4:** `npm run screenshots` → keine Layoutprobleme.
- [ ] **Step 5: Commit** `docs: store listing and screenshot workflow`

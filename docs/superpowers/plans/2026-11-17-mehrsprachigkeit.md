# Mehrsprachigkeit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Missing Hours erscheint in 12 Sprachen in der Systemsprache, mit korrekten Formaten, getesteter Vollständigkeit, Layout-Screenshots und einer festen Regel für künftige Änderungen.

**Architecture:** Eine JSON-Datei pro Sprache in `src/locales/`, gebündelt über `src/locales/index.js`. `src/i18n.js` wird zu `src/i18n/index.js` (i18next-Setup) plus reinen, testbaren Helfern `src/i18n/languages.js` (Spracherkennung, Format-Locale) und `src/i18n/duration.js` (Dauern). Ein Playwright-Skript nimmt die App mit Beispieldaten pro Sprache auf.

**Tech Stack:** i18next 24, react-i18next 15, Electron 42 (`@electron/remote`), Jest (babel-jest für JS), `Intl.Locale`/`Intl.DateTimeFormat`, `playwright-core` (`_electron`, nur Dev).

**Spec:** `docs/superpowers/specs/2026-11-17-mehrsprachigkeit-design.md`

## Global Constraints

- Sprachen (genau diese Codes): `en`, `de`, `fr`, `es`, `it`, `pt-BR`, `nl`, `pl`, `ja`, `ko`, `zh-Hans`, `zh-Hant`. Referenz und Fallback: `en`.
- Paketsprachen `build.appx.languages`: `en-US`, `de-DE`, `fr-FR`, `es-ES`, `it-IT`, `pt-BR`, `nl-NL`, `pl-PL`, `ja-JP`, `ko-KR`, `zh-CN`, `zh-TW`.
- Dauer-Vorlagen (`timeFormats.durationHoursMinutes` / `timeFormats.durationMinutes`):
  | Sprache | Stunden+Minuten | nur Minuten |
  | --- | --- | --- |
  | en, de | `{{hours}}h {{minutes}}m` | `{{minutes}}m` |
  | fr, es, it, pt-BR, pl | `{{hours}} h {{minutes}} min` | `{{minutes}} min` |
  | nl | `{{hours}} u {{minutes}} min` | `{{minutes}} min` |
  | ja | `{{hours}}時間{{minutes}}分` | `{{minutes}}分` |
  | ko | `{{hours}}시간 {{minutes}}분` | `{{minutes}}분` |
  | zh-Hans | `{{hours}}小时{{minutes}}分钟` | `{{minutes}}分钟` |
  | zh-Hant | `{{hours}}小時{{minutes}}分鐘` | `{{minutes}}分鐘` |
  Darf nach den Screenshots nur gekürzt werden, nie länger.
- Nicht übersetzt: `appTitle` („Missing Hours“), `placeholderLink`.
- `autoLaunchStoreDescription` nennt die Windows-Seite mit Microsofts offiziellem Namen: de „Autostart-Apps“, en “Startup apps”, fr « Applications de démarrage », es «Aplicaciones de inicio», it „App di avvio“, pt-BR “Aplicativos de inicialização”, nl „Opstart-apps“, pl „Aplikacje autostartu“, ja「スタートアップ アプリ」, ko '시작 앱', zh-Hans“启动应用”, zh-Hant「啟動應用程式」.
- Ton: kurz, freundlich; du-Form wo die Sprache eine vertraute Anrede hat (fr tu, es tú, it tu, pt-BR você, nl je, pl ty), Japanisch/Koreanisch/Chinesisch neutral-höflich.
- `trackingPhrases`: pro Sprache 9 Einträge, der erste schlicht („Tracking läuft“-Bedeutung), die übrigen verspielt und idiomatisch, nicht wörtlich.
- Datenschutz: das Screenshot-Skript nutzt nur `--mock-data` und einen eigenen temporären userData-Ordner, nie die echten Daten oder Einstellungen.
- Kein Wechsel der Rechenlogik von Dauern: ganze Minuten abgerundet, Stunden = Minuten / 60 abgerundet, Rest-Minuten; leer/0/NaN → 0 Minuten.

## Review Focus

1. Windows-Sprachliste ohne unterstützte Sprache (z. B. nur `sv-SE`) → englische UI, aber schwedische Region (`en-SE`, 24h). Test in Task 1.
2. Unterstützte Sprache erst an zweiter Stelle der Windows-Liste (`['sv-SE', 'de-DE']`) → Deutsch. Test in Task 1.
3. Lange Texte (de, fr, pl) und breite CJK-Dauern im Footer, in der Zoom-Schaltfläche und in den Einstellungen → nichts abgeschnitten; Überlauf-Bericht im Screenshot-Skript (Task 5).
4. Chinesisch traditionell vs. Japanisch nutzen dieselben Zeichen → `<html lang>` muss stimmen, sonst falsche Glyphen; das Skript prüft `document.documentElement.lang` (Task 5).
5. Datum aus einem anderen Jahr (Beispieldaten von 2024) ergibt das längste Datumslabel → Screenshots zeigen genau diesen Fall (Task 5).

---

### Task 1: Spracherkennung und Format-Locale

**Files:**
- Create: `src/i18n/languages.js`
- Test: `src/i18n/languages.test.js`

**Interfaces:**
- Produces: `SUPPORTED_LANGUAGES: string[]` (die 12 Codes in der Reihenfolge der Global Constraints), `APPX_LANGUAGES: Record<string,string>` (Sprachcode → Paketsprache aus den Global Constraints), `resolveLanguage(candidates: Array<string|undefined|null>): string`, `formatLocale(language: string, systemLocale?: string): string`.

- [ ] **Step 1: Failing tests schreiben** (`languages.test.js`)

```js
describe('resolveLanguage', () => {
  it.each([
    [['de-DE'], 'de'], [['de_AT'], 'de'], [['sv-SE', 'fr-CA'], 'fr'], [['ar-SA', 'en-GB'], 'en'],
    [['zh-CN'], 'zh-Hans'], [['zh-SG'], 'zh-Hans'], [['zh'], 'zh-Hans'], [['zh-Hans-HK'], 'zh-Hans'],
    [['zh-TW'], 'zh-Hant'], [['zh-HK'], 'zh-Hant'], [['zh-MO'], 'zh-Hant'], [['zh-Hant-CN'], 'zh-Hant'],
    [['pt-PT'], 'pt-BR'], [['pt'], 'pt-BR'], [['ja-JP'], 'ja'], [['ko-KR'], 'ko'],
    [[], 'en'], [['xx'], 'en'], [[undefined, '', null, 'not a tag!'], 'en'], [['sv-SE'], 'en'],
  ])('%j -> %s', (candidates, expected) => expect(resolveLanguage(candidates)).toBe(expected));
});

describe('formatLocale', () => {
  const hourCycle = (loc) => new Intl.DateTimeFormat(loc, { hour: 'numeric' }).resolvedOptions().hourCycle;
  it('combines UI language with the system region', () => {
    expect(formatLocale('en', 'de-DE')).toBe('en-DE');
    expect(formatLocale('zh-Hans', 'zh-CN')).toBe('zh-Hans-CN');
    expect(formatLocale('en', 'sv-SE')).toBe('en-SE');
  });
  it('uses the region clock', () => {
    expect(hourCycle(formatLocale('en', 'de-DE'))).toBe('h23');
    expect(hourCycle(formatLocale('en', 'en-US'))).toBe('h12');
  });
  it('falls back to the language without a usable region', () => {
    expect(formatLocale('de', '')).toBe('de');
    expect(formatLocale('de', undefined)).toBe('de');
    expect(formatLocale('de', 'invalid_!')).toBe('de');
    expect(formatLocale('fr', 'fr')).toBe('fr');
  });
});
```

- [ ] **Step 2:** `npx jest src/i18n/languages.test.js` → FAIL (Modul fehlt).
- [ ] **Step 3: Implementieren.** `resolveLanguage`: `_` → `-`, jeden Kandidaten mit `new Intl.Locale` parsen (ungültige überspringen). `zh`: Schrift aus `script`, sonst `TW`/`HK`/`MO` → `Hant`, sonst `Hans`. `pt` → `pt-BR`. Sonst `language`, wenn in `SUPPORTED_LANGUAGES`. Erster Treffer gewinnt, sonst `'en'`. `formatLocale`: Region per `new Intl.Locale(systemLocale).region` (try/catch), dann `new Intl.Locale(language, { region }).toString()`; ohne Region `language`.
- [ ] **Step 4:** Test → PASS.
- [ ] **Step 5:** Commit `feat(i18n): resolve UI language and format locale from the system`.

### Task 2: Sprachdateien, i18n-Setup und Vollständigkeitstests (en, de)

**Files:**
- Create: `src/locales/en.json`, `src/locales/de.json` (Inhalt aus `src/i18n.js` übernehmen), `src/locales/index.js`, `src/i18n/index.js`, `src/i18n/locales.test.js`
- Delete: `src/i18n.js`, `src/i18n.test.js` (Phrasen-Tests wandern nach `locales.test.js`)
- Modify: Importe von `'../i18n'` bleiben gültig (Ordner mit `index.js`); `src/main/main.ts:186` Fenstertitel → `'Missing Hours' + (useMockData ? ' (Mock Data)' : '')`

**Interfaces:**
- Consumes: Task 1 (`SUPPORTED_LANGUAGES`, `resolveLanguage`, `formatLocale`).
- Produces: `src/locales/index.js` default export `Record<string, object>` (Sprachcode → Übersetzungsobjekt); `src/i18n/index.js` default export i18next-Instanz wie bisher.

- [ ] **Step 1: JSON-Dateien anlegen.** Schlüssel wie heute, mit diesen Änderungen: `timeFormats.duration` und `timeFormats.fullDate` entfallen (ungenutzt; vorher per Grep prüfen), neu `timeFormats.durationHoursMinutes` und `timeFormats.durationMinutes` (Werte aus den Global Constraints).
- [ ] **Step 2: Failing tests** (`locales.test.js`), über `src/locales/index.js` und `fs.readdirSync('src/locales')`:
  - `'every supported language has a locale file and nothing else'`: JSON-Dateinamen == `SUPPORTED_LANGUAGES`, Schlüssel von `locales/index.js` ebenso.
  - `'%s has exactly the keys of en'`: flache Schlüsselpfade (Arrays als Blatt) gleich.
  - `'%s has no empty texts'`: jeder String und jedes Array-Element nicht leer nach `trim()`.
  - `'%s keeps the placeholders of en'`: pro Schlüssel Menge der `{{…}}`-Namen (Teil vor dem Komma) gleich.
  - `'%s has at least two tracking phrases'` und die bestehenden Erwartungen `de[0] === 'Tracking läuft'`, `en[0] === 'Tracking'`.
  - `'the Store package lists every language'`: `require('../../package.json').build.appx.languages` sortiert == `Object.values(APPX_LANGUAGES)` sortiert, und `Object.keys(APPX_LANGUAGES)` == `SUPPORTED_LANGUAGES`.
  Laufen jetzt fehl (nur en/de vorhanden; appx-Liste unvollständig). Für diesen Task `SUPPORTED_LANGUAGES` im Test noch nicht einschränken; die beiden „every language“-Tests dürfen bis Task 4 rot bleiben, alle anderen müssen für en/de grün sein.
- [ ] **Step 3: `src/i18n/index.js` schreiben.** Kandidaten: `--lang=<code>` aus `remote.process.argv` (Vorrang), dann `remote.app.getPreferredSystemLanguages()`, `remote.app.getLocale()`, `navigator.language`; jeder Zugriff in try/catch. `systemLocale` = `remote.app.getSystemLocale()` (try/catch, sonst `undefined`). `i18next.init({ resources: Sprachcode → { translation }, lng: resolveLanguage(...), fallbackLng: 'en', load: 'currentOnly', interpolation: { format } })`. Das `format` nutzt `formatLocale(lng, systemLocale)` statt `lng` und kein `hour12` mehr; `date`-Format entfällt mit `fullDate`. Danach `document.documentElement.lang = i18next.language`, wenn `document` existiert.
- [ ] **Step 4:** `npx jest src/i18n` → alles grün außer den zwei erwarteten „every language“-Tests.
- [ ] **Step 5:** Commit `refactor(i18n): move translations into per-language JSON files`.

### Task 3: Dauern übersetzen

**Files:**
- Create: `src/i18n/duration.js`, Test `src/i18n/duration.test.js`
- Modify: `src/components/App.js:34-47` (eigene `formatDuration` entfernen) und `:160` (`'0m'` → `formatDuration(0)`), `src/components/toolbar/IntervalPicker.js` (Labels `${v}m` → Minuten-Vorlage)

**Interfaces:**
- Produces: `formatDuration(ms: number|undefined, t: TFunction): string`. In `App.js`: `const formatDuration = (ms) => formatDurationWith(ms, t)` mit `t` aus `useTranslation()`; Prop-Signatur für Timeline/Footer bleibt `(ms) => string`. IntervalPicker: `t('timeFormats.durationMinutes', { minutes: v })`.

- [ ] **Step 1: Failing tests** mit `i18next.createInstance()` und den echten JSON-Dateien `en`, `de`, `ja`:
  - de: `0`/`undefined`/`NaN` → `'0m'`; `59_999` → `'0m'`; `15*60e3` → `'15m'`; `75*60e3` → `'1h 15m'`; `180*60e3` → `'3h 0m'`.
  - en: `75*60e3` → `'1h 15m'`.
  - ja: `75*60e3` → `'1時間15分'`; `5*60e3` → `'5分'`.
- [ ] **Step 2:** Test → FAIL.
- [ ] **Step 3:** Implementieren nach der Regel aus den Global Constraints.
- [ ] **Step 4:** Test → PASS; `npm test` bleibt grün bis auf die zwei Task-4-Tests.
- [ ] **Step 5:** Commit `feat(i18n): format durations per language`.

### Task 4: Zehn neue Sprachen und Store-Paket

**Files:**
- Create: `src/locales/{fr,es,it,pt-BR,nl,pl,ja,ko,zh-Hans,zh-Hant}.json`
- Modify: `src/locales/index.js`, `package.json` (`build.appx.languages`, Reihenfolge wie Global Constraints)

- [ ] **Step 1:** Übersetzungen schreiben nach den Global Constraints (Ton, Windows-Begriffe, Dauer-Vorlagen, Phrasen). `teamsMeeting` übersetzen („Teams“ bleibt Name).
- [ ] **Step 2:** `npx jest src/i18n` → alles grün, inklusive „every language“ und Paketsprachen.
- [ ] **Step 3:** Commit `feat(i18n): add fr, es, it, pt-BR, nl, pl, ja, ko, zh-Hans and zh-Hant`.

### Task 5: Screenshot-Skript und Layout-Prüfung

**Files:**
- Create: `scripts/screenshots.js`
- Modify: `package.json` (devDependency `playwright-core`, Skript `"screenshots": "npm run generate:mock && tsc && webpack --config webpack.config.js && node scripts/screenshots.js"`), `.gitignore` (`screenshots/`)
- Ggf. Modify: Sprachdateien (kürzen), Komponenten-CSS (nur wenn Kürzen nicht reicht; Tokens/Konstanten wie bisher)

- [ ] **Step 1: Skript.** Optional `node scripts/screenshots.js de ja` für einzelne Sprachen, sonst alle aus `SUPPORTED_LANGUAGES`. Pro Sprache: `fs.mkdtempSync` in `os.tmpdir()`, `_electron.launch({ args: ['.', '--mock-data', `--lang=${lang}`, `--user-data-dir=${tmp}`] })`. Sicherheitsprüfung: `electronApp.evaluate(({ app }) => app.getPath('userData'))` muss in `tmp` liegen, sonst Abbruch mit Fehler. Prüfen `document.documentElement.lang === lang`, sonst Fehler. Zum Beispieltag: Zurück-Pfeil (`.wm-date-nav-arrows .wm-button` erstes) klicken, auf `.wm-timeline-event` warten. Für `light` und `dark` (`page.emulateMedia({ colorScheme })`): `day`, `zoom` (Klick `.wm-interval-picker .wm-button`, danach Escape), `settings` (Klick `.wm-titlebar-button-settings`, auf `.wm-settings` warten, zurück über `.wm-settings-toolbar .wm-button`). Ablage `screenshots/<lang>/<view>-<theme>.png`. Selektoren nur über Klassen, nie über Text.
- [ ] **Step 2: Überlauf-Bericht.** Pro Aufnahme im Seitenkontext alle Elemente mit Text sammeln, bei denen `scrollWidth > clientWidth + 1` oder `scrollHeight > clientHeight + 1` bei `overflow` ≠ `visible`, sowie Elemente mit mehr als einer Zeile, die laut Design einzeilig sind (`.wm-button`, `.wm-date-nav-label`, `.wm-day-summary-*`, `.wm-titlebar-title`, `.wm-segmented` Optionen). Ausgabe: Sprache, Ansicht, Selektor, Text. Exit-Code 1, wenn etwas gefunden wurde.
- [ ] **Step 3: Wenn `--user-data-dir` nicht greift** (Sicherheitsprüfung schlägt fehl): in `main.ts` direkt nach der Mock-Erkennung, nur bei `useMockData`, `--user-data-dir=<pfad>` aus `process.argv` lesen und `app.setPath('userData', pfad)` setzen. Echte Starts bleiben unberührt.
- [ ] **Step 4:** `npm run screenshots` ausführen. Jede Sprache ansehen (mindestens day/zoom/settings hell, dazu dunkel für de, ja, zh-Hant), Überlauf-Bericht leer bekommen. Texte kürzen, bevor CSS geändert wird; CJK-Glyphen von ja vs. zh-Hant vs. zh-Hans vergleichen.
- [ ] **Step 5:** `npm test` grün. Commit `feat: add screenshot script to check the layout in every language` (plus `fix(i18n): …` für Kürzungen).

### Task 6: Dokumentation und Regel

**Files:**
- Modify: `CLAUDE.md`, `docs/Engineering Design Dokument.md`, `docs/User Requirements.md`, `docs/design/figma-map.md`, `docs/MICROSOFT-STORE.md`, `README.md` (Sprachen kurz nennen, falls es eine Feature-Liste gibt)

- [ ] **Step 1: CLAUDE.md.** Neuer Abschnitt „Multilingual (mandatory)“ nach „Conventions & invariants“: kein sichtbarer Text (inkl. `title`, `aria-label`, Fehlermeldungen) ohne `t()`; jeder neue/geänderte Schlüssel in allen 12 `src/locales/*.json` im selben Commit; Datum/Uhrzeit nur über die i18n-Formate, Dauern nur über `src/i18n/duration.js`; neue Sprache = JSON + `SUPPORTED_LANGUAGES`/`APPX_LANGUAGES` + `build.appx.languages` + Store-Text; bei UI-Änderungen `npm run screenshots` und Bilder für mindestens de, pl, ja, zh-Hant ansehen; `src/i18n/locales.test.js` muss grün sein. Modultabelle (`src/i18n/`, `src/locales/`), Befehlstabelle (`npm run screenshots`), Layout-Baum und Tech-Stack ergänzen.
- [ ] **Step 2:** Engineering Design Dokument: Abschnitt Internationalisierung (Dateien, Erkennung inkl. zh/pt-Regeln und `--lang`, Format-Locale, Dauern, Tests, Screenshots). User Requirements: Anforderung Systemsprache, 12 Sprachen, Fallback Englisch, regionale Uhrzeit. figma-map: Texte kommen aus den Sprachdateien; Layouts müssen ~40 % längere Texte und CJK aushalten.
- [ ] **Step 3:** MICROSOFT-STORE.md: Store-Texte (Kurzbeschreibung, Beschreibung, Stichpunkte) in allen 12 Sprachen, Hinweis „pro Sprache einen Store-Eintrag anlegen“, Datenschutz-URL bleibt de/en, Screenshots pro Sprache aus `npm run screenshots` als Ausgangsmaterial.
- [ ] **Step 4:** Commit `docs: make multilingual support mandatory and add Store texts for all languages`.

### Task 7: Abschluss

- [ ] **Step 1:** `npm run build` → Tests grün, tsc und webpack ohne Fehler.
- [ ] **Step 2:** App mit `npm run dev:mock` in Systemsprache starten und kurz ansehen (Skill `verify`/`run`).
- [ ] **Step 3:** Code-Review des Branch-Diffs, Funde beheben.
- [ ] **Step 4:** `origin/main` prüfen und ggf. mergen; `npm test` grün.

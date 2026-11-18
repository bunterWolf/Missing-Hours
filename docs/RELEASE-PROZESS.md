# Release-Prozess für Missing Hours

Dieses Dokument beschreibt den Release-Prozess für stabile Releases und die Technik dahinter. Beta-Releases
stehen im Detail in [BETA-RELEASE-PROZESS.md](BETA-RELEASE-PROZESS.md).

## Übersicht

1. Lokale Skripte erhöhen die Version, schreiben den Changelog und pushen einen Tag.
2. Der Tag löst GitHub Actions aus. Dort wird für Windows und macOS getestet, gebaut und gepackt.
3. Erst wenn beide Plattformen erfolgreich waren, entsteht das GitHub Release mit allen Dateien.

Lokal wird nichts veröffentlicht.

## Stabiler Release

Ein stabiler Release veröffentlicht den Stand der letzten Beta. Neue Arbeit geht also zuerst als Beta
raus ([BETA-RELEASE-PROZESS.md](BETA-RELEASE-PROZESS.md)), danach wird genau dieser Stand stabil.
Er erscheint sofort als reguläres Release, nicht als Entwurf, und alle Benutzer erhalten ihn über den
Auto-Updater, auch die ohne Beta-Kanal. Zurücknehmen lässt er sich nicht.

So lief `1.0.0` am 2026-11-16, der erste stabile Release:

```bash
git checkout beta/v0.0.2
git pull origin beta/v0.0.2
git fetch origin && git merge-base --is-ancestor origin/main HEAD   # main lässt sich vorspulen
npm test
npx standard-version --release-as 1.0.0 --dry-run   # Version und Changelog prüfen
npx standard-version --release-as 1.0.0             # Version, Changelog, Build mit Tests, Commit, Tag
git push --follow-tags origin beta/v0.0.2
git push origin beta/v0.0.2:main                    # Git Bash: MSYS_NO_PATHCONV=1 davor
```

Danach wie bei einer Beta prüfen: Lauf in GitHub Actions, Dateien im Release, `latest.yml` und
`latest-mac.yml`. Bei stabilen Releases zusätzlich das Artefakt `microsoft-store-package` am Lauf.

**Version wählen:**
- Ohne `--release-as` zählt standard-version von der Beta aus weiter: aus `1.1.0-beta.3` wird `1.1.0`,
  solange seit dieser Beta keine `feat`-Commits dazukamen. Der Dry-Run zeigt die Version vorher.
- Für einen Sprung auf eine neue Haupt- oder Nebenversion `--release-as` angeben, zum Beispiel
  `--release-as 2.0.0` oder `--release-as minor`. Ohne die Angabe wäre aus `0.0.2-beta.12` die
  Version `0.0.2` geworden, nicht `1.0.0`.
- Soll die Version in den Microsoft Store, muss sie mit mindestens `1` beginnen (`1.0.0`, nicht `0.x`).
  Das Einreichen steht in [MICROSOFT-STORE.md](MICROSOFT-STORE.md).

**Changelog:** standard-version nimmt die Commits seit dem letzten Tag, auch wenn das eine Beta ist. Der
Eintrag des stabilen Release enthält darum nur, was nach der letzten Beta dazukam. Alles davor steht
in den Beta-Einträgen darunter.

**`npm run release`** macht dasselbe ohne `--release-as`, läuft aber nur auf einem ausgecheckten `main`
und pusht `main` statt des Beta-Branches. Den Beta-Branch danach auf `main` vorspulen, sonst zählt die
nächste Beta von einer alten Version aus.

**Nach einem stabilen Release** zählen die nächsten Betas von der stabilen Version aus weiter (aus
`1.0.0` wird zum Beispiel `1.0.1-beta.0`, mit `feat`-Commits `1.1.0-beta.0`).

## Technische Details

### Workflow (`.github/workflows/release.yml`)

| Job | Läuft auf | Aufgabe |
| --- | --- | --- |
| `build` | Windows, macOS | `npm run build` (Tests, TypeScript, Webpack), dann `electron-builder --publish never` mit bis zu drei Versuchen; lädt die Dateien als Artefakte hoch. Bei Tags ohne `beta` baut Windows zusätzlich das Microsoft-Store-Paket (Artefakt `microsoft-store-package`, nicht im Release, siehe [MICROSOFT-STORE.md](MICROSOFT-STORE.md)) |
| `publish` | Ubuntu | läuft nur, wenn alle Builds erfolgreich waren; erstellt das Release und lädt alle Dateien hoch |

- Die Plattformen brechen sich gegenseitig nicht ab (`fail-fast: false`).
- Tags mit `beta` im Namen werden zum Pre-Release, alle anderen zum regulären Release.
- `node-version` muss die `engines`-Vorgabe der Electron-Version in `package.json` erfüllen.

### Konfiguration

- `package.json`: electron-builder (`build`), `standard-version`
- `.github/workflows/release.yml`: GitHub Actions
- `scripts/release.js`, `scripts/release-beta.js`: lokale Release-Skripte
- `src/main/main.ts`: Auto-Updater

### Update-Dateien

electron-builder erzeugt `latest.yml` (Windows) und `latest-mac.yml` (macOS). Es gibt keine eigenen
Dateien für den Beta-Kanal: Stabile Releases und Betas nutzen dieselben Dateinamen, jeweils im eigenen
Release. Der Einstellungs-Schalter für Beta-Updates setzt `autoUpdater.allowPrerelease`; damit
berücksichtigt der Auto-Updater auch Pre-Releases.

## Fehlerbehebung

### Der Build ist fehlgeschlagen

Es wurde nichts veröffentlicht. Log lesen:

```bash
gh run view <run-id> --log-failed
```

- **Vorübergehender Fehler** (z. B. `Response code 504`): `gh run rerun <run-id> --failed`. Ein `504` beim
  Packen stammt von den Downloads, mit denen electron-builder seine Werkzeuge von GitHub lädt, nicht
  vom Veröffentlichen.
- **Fehler im Code oder in der Konfiguration:** beheben und eine neue Version erstellen. Ein Neustart
  nutzt immer den Workflow und den Code des getaggten Commits.

### Es fehlen Dateien im Release

- Prüfen, ob die Dateinamen noch zu `release/*/Missing-Hours-*` und `release/*/latest*.yml` im Upload-Schritt
  und zu den `files` im Schritt `Create GitHub Release` passen.
- Die erwartete Dateiliste steht in [BETA-RELEASE-PROZESS.md](BETA-RELEASE-PROZESS.md).

### Die Konfiguration von electron-builder wird abgelehnt

Das Packen lokal prüfen, ohne etwas zu veröffentlichen:

```bash
npx electron-builder --publish never
```

## Best Practices

1. Conventional Commits verwenden, der Changelog entsteht daraus.
2. Beta-Releases mit echtem Tracking testen, bevor ein stabiler Release erstellt wird.
3. Release-Korrekturen immer auch nach `main` bringen.

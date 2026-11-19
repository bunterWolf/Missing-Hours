# Store-Einträge und Marketing-Screenshots: Design-Spec

**Datum:** 2026-11-19 · **Branch:** `claude/app-store-screenshots-fc259a` · **Status:** Entwurf zur Freigabe

## 1. Ziel und Warum

Missing Hours soll im Microsoft Store mit vollständigem Eintrag in allen 12 Sprachen erscheinen:
Texte, Screenshots, Logos. Die Screenshots sind das Wichtigste. Sie sollen zeigen, wie die App im
echten Alltag aussieht, mit einem glaubwürdigen Arbeitstag, echten Programm-Icons und deren Farben,
eingebettet in eine ruhige Marketing-Fläche mit einer Überschrift pro Bild.

Weil es regelmäßig Updates gibt, müssen sich alle Bilder **mit einem Befehl neu erzeugen lassen**,
damit sie immer den aktuellen Stand der App zeigen. Später kommt der Apple App Store dazu; die
Struktur soll das aufnehmen können, ohne neu gebaut zu werden.

Heute gibt es:

- Store-Texte (Kurzbeschreibung, Beschreibung mit Feature-Liste) in allen 12 Sprachen in
  `docs/MICROSOFT-STORE.md`, als Markdown.
- `npm run screenshots` (`scripts/screenshots.js`): startet die gebaute App per Playwright mit
  `--mock-data` pro Sprache und prüft das Layout. Die Beispieldaten (`scripts/generate-mock-data.ts`,
  `public/mock-data.json`) sind 45 Minuten Testfälle („Aggregate to visible“) ohne Programmpfade, also
  ohne Icons und Farben. Die Bilder haben Fenstergröße (437 × 549, 2× Skalierung).
- Kein Logo in Store-Größe: `resources/icon.png` hat 1024 px, Partner Center will für die 1:1-Box-Art
  1080 oder 2160 px.

## 2. Ziele

- **Ein Befehl** `npm run store-screenshots` (baut vorher) erzeugt pro Sprache die Marketing-Screenshots
  für den Microsoft Store in 3840 × 2160 (PNG), aus der echten App.
- **Ein realistischer Beispieltag** einer Beraterin, mit dem sich auch Designer und Entwickler
  identifizieren können: bekannte Programme, glaubwürdige Fenstertitel in der jeweiligen Sprache,
  eine Mittagspause als Abwesenheit, runde Tageswerte.
- **Echte Icons und Farben** über den echten Mechanismus der App (`get-app-icon` liest Icon und
  Markenfarbe aus der `.exe`), nicht nachgebaut.
- **Die Zeitleiste entsteht über die echte Aggregation:** Der Beispieltag sind Herzschläge (alle 30 s),
  die App aggregiert sie wie im echten Betrieb. Nichts im Bild zeigt etwas, das die App nicht kann.
- **Store-Texte als Daten** in `store/listing/<sprache>.json`, vollständig in allen 12 Sprachen,
  inklusive der heute fehlenden Felder (Abschnitt 6). Ein Test prüft Vollständigkeit und Längen.
- **Store-Logos** (1:1-Box-Art 2160 × 2160, weitere nach Partner-Center-Vorgabe) aus
  `resources/icon-source/icon.svg`, erzeugt mit `npm run icons`.
- **Layout hält in jeder Sprache:** Überschriften und App-Ansicht werden wie beim Layout-Check auf
  abgeschnittene, umbrechende oder verdeckte Texte geprüft; das Skript schlägt dann fehl.

## 3. Nicht-Ziele und Anti-Ziele

- **Keine Apple-Screenshots jetzt.** Der Mac App Store verlangt Bilder der Mac-App (16:10, z. B.
  2880 × 1800). Ein auf 16:10 umgesetztes Bild der Windows-App wäre falsch und würde abgelehnt. Die
  Vorlage und die Datenstruktur sind so gebaut, dass ein weiteres Ausgabeformat und eine macOS-Variante
  des Beispieltags (Programmpfade `.app`) später nur Ergänzungen sind.
- **Kein Trailer/Video, keine Animation.**
- **Keine fremden Logos im Repo.** Icons kommen beim Erzeugen vom Rechner, auf dem das Skript läuft.
- **Kein Einfluss auf echtes Tracking.** Der Beispieltag existiert nur in einer temporären Datei und
  einem temporären userData-Ordner, wie beim Layout-Check. Er wird nie gespeichert.
- **Anti-Ziel: geschönte Oberfläche.** Keine Elemente, Werte oder Zustände im App-Fenster, die die App
  so nicht anzeigen würde. Einzige Ausnahme ist der Hinweis „Beispieldaten“ im Footer, den die echte
  App nicht zeigt (wie beim Layout-Check entfernt).
- **Anti-Ziel: Platzhalter im Store.** Der Platzhalter `placeholderLink` („www.appname.io“) in den
  Einstellungen darf auf keinem Store-Bild erscheinen (Abschnitt 9).
- **Keine Übernahme von „Neuigkeiten dieser Version“** in die Store-Daten. Das ist pro Release neu
  und gehört in den Release-Prozess.

## 4. Ansätze

| Ansatz | Was | Bewertung |
| --- | --- | --- |
| **A – alles im Repo, ein Befehl (gewählt)** | `store/` mit Texten, Beispieltag und Vorlage; Skript startet die echte App, nimmt das Fenster hochauflösend auf und setzt es per HTML-Vorlage auf die Marketing-Fläche | ein Befehl pro Update, Bilder immer aktuell, Texte versioniert mit der App; Gestaltung in HTML/CSS statt Figma |
| B – Aufnahmen automatisch, Gestaltung in Figma | Skript liefert nur Fensteraufnahmen, Hintergrund und Text in Figma | mehr gestalterische Freiheit, aber 12 Sprachen × Motive Handarbeit pro Update |
| C – eigenes Marketing-Repo | wie A, aber getrennt | braucht ohnehin App-Build, Sprachdateien und Datentypen; läuft auseinander |

Sebastian hat **A** gewählt (2026-11-19).

## 5. Entschieden im Gespräch

- **Persona:** Beraterin, die nach Stunden abrechnet; der Tag soll auch für Designer und Entwickler
  normal wirken („womit sich möglichst viele identifizieren können“).
- **Echte Produkt-Icons** (Microsoft Office, Edge/Chrome, Figma …) in Store-Bildern sind für
  Sebastian rechtlich in Ordnung.
- **Das App-Fenster bleibt ein kleines Fenster.** Es wird nicht auf Vollbild gezogen, sondern in
  realistischer Fenstergröße hochauflösend aufgenommen und auf eine gestaltete Fläche gesetzt.
- **Ort im Git:** im App-Repo unter `store/` (meine Entscheidung, Sebastian hat sie mir überlassen).
  Die erzeugten Bilder kommen nicht ins Git.
- **Überschrift im Bild:** ja, obwohl Microsoft von Werbetext in Screenshots abrät. Sebastian hat sie
  nach einem Entwurf (hell, dunkel, ohne Text) gewählt; die Bildunterschrift kommt zusätzlich.

## 6. Design

### 6.1 Ordner und Dateien

```
store/
  listing/<sprache>.json   # Store-Texte + Bildtexte + Fenstertitel des Beispieltags, 12 Dateien, en = Referenz
  listing.test.js          # Vollständigkeit (gleiche Schlüssel, nichts leer) und Längengrenzen
  demo-day.js              # Ablauf des Beispieltags: Programme, Zeiten, Aktivität, Schlüssel der Fenstertitel
  demo-day.test.js         # Beispieltag läuft durch die echte Aggregation: erwartete Tageswerte, keine Lücken
  template/                # HTML/CSS der Marketing-Fläche (eine Seite, Motiv und Format per Parameter)
scripts/
  store-screenshots.js     # der Befehl
  lib/launch-app.js        # gemeinsames Starten der App für screenshots.js und store-screenshots.js
store-screenshots/         # Ausgabe, in .gitignore: microsoft/<sprache>/<nn>-<motiv>.png
```

`docs/MICROSOFT-STORE.md` behält den Prozess und verweist für die Texte auf `store/listing/`. Die
Texte stehen danach nur noch dort (keine doppelte Pflege).

`store/listing.test.js` muss von Jest gefunden werden (`jest.config.js` prüfen; siehe auch das bekannte
Problem mit `testMatch` in `.claude/worktrees`).

### 6.2 Store-Texte (`store/listing/<sprache>.json`)

Pro Sprache, Inhalt aus `docs/MICROSOFT-STORE.md` übernommen und ergänzt:

| Feld | Partner Center | Stand |
| --- | --- | --- |
| `shortDescription` | Kurzbeschreibung | vorhanden |
| `description` | Beschreibung (wie heute mit Feature-Liste) | vorhanden |
| `features[]` | Produktfeatures (eigenes Feld) | heute nur als Liste in der Beschreibung; wird zusätzlich eigenes Feld (siehe 6.10) |
| `searchTerms[]` | Suchbegriffe | neu |
| `screenshots.<motiv>.headline` / `.subline` | Text auf dem Bild | neu |
| `screenshots.<motiv>.caption` | Bildunterschrift im Partner Center | neu |
| `demoDay.titles.<schlüssel>` | Fenstertitel im Beispieltag | neu |

Sprachunabhängig in `store/listing/common.json`: Kategorie, Datenschutz-URL, Copyright
(„© 2026 Sebastian Wolf“), Entwickler. Die genauen Längengrenzen (Kurzbeschreibung, Feature-Länge
und -Anzahl, Anzahl und Länge der Suchbegriffe, Bildunterschrift) nimmt der Builder aus der aktuellen
Microsoft-Doku und schreibt sie als Konstanten mit Quelle in `listing.test.js`.

Übersetzungen nach den Regeln aus CLAUDE.md „Multilingual“: echte Übersetzungen, Microsoft-Begriffe,
die eigenen Anführungszeichen der Sprache. Die Bildtexte sind Marketing und dürfen freier formuliert
sein als die UI, bleiben aber ehrlich (keine Behauptung, die die App nicht hält).

### 6.3 Der Beispieltag (`store/demo-day.js`)

Ein Werktag, etwa 8:30 bis 17:30 Uhr Ortszeit, als Liste von Abschnitten
`{ start: '08:32', end: '09:05', app: 'outlook', title: 'inboxMorning', activity: 'active' }`.
Programme mit Anzeigename und Windows-Pfad (Umgebungsvariablen erlaubt):

| Programm | Pfad (Windows) |
| --- | --- |
| Outlook (klassisch) | `%ProgramFiles%\Microsoft Office\root\Office16\OUTLOOK.EXE` |
| Word | `…\Office16\WINWORD.EXE` |
| Excel | `…\Office16\EXCEL.EXE` |
| PowerPoint | `…\Office16\POWERPNT.EXE` |
| Microsoft Edge | `%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe` |
| Google Chrome | `%ProgramFiles%\Google\Chrome\Application\chrome.exe` |
| Figma | `%LOCALAPPDATA%\Figma\Figma.exe` |
| Explorer | `%WINDIR%\explorer.exe` |

Ablauf (Richtwerte, Feinschliff durch den Builder, Hauptsache glaubwürdig und abwechslungsreich in
den Farben):

- **Vormittag:** Outlook (Posteingang), Word am Angebot für einen Kunden, dazwischen Edge/Chrome
  (Recherche), Excel (Kalkulation), kurz Explorer.
- **Mittag:** etwa 45 Minuten Abwesenheit (Herzschläge `inactive`), erscheint als „Inaktiv“.
- **Nachmittag:** PowerPoint (Präsentation für den Kunden), Figma (Entwurf), Outlook, Excel
  (Stundenübersicht), Word.

Kurze Wechsel unter einem Intervall sollen vorkommen, damit die Aggregation sichtbar arbeitet (wie im
echten Alltag), aber die Blöcke im Bild dürfen nicht unruhig wirken.

**Fenstertitel pro Sprache** aus `demoDay.titles`, mit erfundenen, landesüblichen Firmennamen
(„Angebot Müller GmbH – Prozessanalyse.docx“, „Proposal Miller & Co – Process Review.docx“,
„Offre Dupont SARL …“, „田中商事 提案書.docx“ …). Programmnamen bleiben unübersetzt.

**Datum:** der letzte Dienstag vor dem Lauf (Ortszeit). Die Datei mit den Herzschlägen schreibt das
Skript pro Sprache in einen temporären Ordner, nicht ins Repo.

**Heartbeats, nicht Blöcke:** Der Beispieltag wird in `StoreData`-Herzschläge (30 s, `userActivity`,
`appWindow { app, title, path }`) umgerechnet, wie `scripts/generate-mock-data.ts` es tut. Die
Umrechnung ist eine Funktion, die `demo-day.test.js` mit dem echten `TimelineGenerator` prüft
(erwartete aktive/inaktive Summe, keine Lücke, Mittagspause als ein Inaktiv-Block bei 15 Minuten).

Fehlt ein Programm auf dem Rechner, warnt das Skript laut und nennt den Pfad. Das Programm erscheint
dann mit dem Standard-Stil der App (`--event-default`); das Skript bricht nicht ab.

### 6.4 Kleine Änderung an der App: `--mock-data-file=<datei>`

`--mock-data` lädt heute fest `public/mock-data.json` (`src/store/ActivityStore.ts`). Neu: zusätzlich
`--mock-data-file=<absoluter Pfad>` lädt diese Datei, **nur zusammen mit `--mock-data`**. Ein Wert direkt
am Schalter (`--mock-data=<pfad>`) scheidet aus: `main.ts` erkennt den Mock-Modus per
`process.argv.includes('--mock-data')`, und `--mock-data=<pfad>` würde dann echt tracken und die
Datenübernahme aus dem alten Ordner auslösen. `--mock-data-file` ohne `--mock-data` wird ignoriert.
Alles andere am Mock-Modus bleibt (kein Tracking, kein Speichern). Test in `ActivityStore.test.ts`.

### 6.5 Motive

Vier Motive, alle mit dem Beispieltag, außer wo genannt:

| Nr | Motiv | App-Zustand | Botschaft (Richtung, Deutsch) |
| --- | --- | --- | --- |
| 01 | `timeline` | Tagesansicht hell, 15 min, Vormittag bis nach der Mittagspause sichtbar | „Wo sind deine Stunden geblieben?“ – Missing Hours zeichnet deinen Arbeitstag automatisch auf |
| 02 | `detail` | Tagesansicht hell, 5 min, Vormittag mit kurzem Wechsel | So genau, wie du es brauchst |
| 03 | `dark` | Tagesansicht dunkel, Nachmittag | Hell oder dunkel, passend zu Windows |
| 04 | `privacy` | Einstellungen, Variante Store-Paket, hell | Keine Cloud, kein Konto: deine Daten bleiben auf deinem PC |

Entschieden im Plan: Bei 437 × 720 zeigt 01 schon 8:45 bis etwa 14:15 Uhr samt Mittagspause. 02 wird
deshalb `detail`: 5-Minuten-Raster, Vormittag, in dem auch ein kurzer Wechsel zu Edge als eigener
Block sichtbar wird („So genau, wie du es brauchst“). Dazu kommt `00-hero` ohne Text (6.8).

### 6.6 Aufnahme

- Fenster mit Inhalt **437 × 720** (Standardbreite der App, höher als der Start, damit mehr Stunden
  sichtbar sind; ein realistisches, vom Nutzer einstellbares Maß; `setContentSize` nach dem Start) mit
  `--force-device-scale-factor=2.5` → 1093 × 1800 px (im Entwurf bestätigt). Bei 15 Minuten passen
  etwa 8:30 bis 14:00 Uhr ins Fenster.
- Titel so wählen, dass sie in die Blockbreite passen (im Entwurf wurden „Angebot Müller GmbH –
  Prozessanalyse.docx“ und Edge-Titel abgekürzt); runde Tageswerte im Footer (im Entwurf „8h 0m“).
- Icons kommen asynchron; vor der Aufnahme warten, bis jedes Ereignis mit Pfad sein Icon zeigt (oder
  bekannt keines hat), statt einer festen Wartezeit.
- Scroll-Position der Zeitleiste per `page.evaluate` auf eine bestimmte Uhrzeit gesetzt (Motiv-Angabe),
  nicht per Pixelwert.
- Maus auf neutrale Position, kein Hover.
- Sprache und Region wie beim Layout-Check (`localeFor`, 12-Stunden-Uhr für `en-US`).
- Layout-Prüfung (`findLayoutProblems`, in `scripts/lib/` geteilt) läuft auf jedem App-Zustand.

### 6.7 Komposition (`store/template/`)

Eine HTML-Seite mit 1536 × 864 CSS-Pixeln, gerendert mit Skalierung 2,5 (= 3840 × 2160) in einem
eigenen kleinen Electron-Prozess (`store/template/render.js`). Eingaben: Aufnahme (PNG-Datei),
Überschrift, Unterzeile, Thema (hell/dunkel), Sprache (`lang` für die richtige CJK-Schrift). Das
App-Fenster wird 1:1 eingesetzt (437 × 720 CSS-Pixel = 1093 × 1800 Bildpunkte).

Erprobt im Entwurf vom 2026-11-19 (diese Fallen sind real):

- Ein eigener Prozess, weil die App mit `--force-device-scale-factor=2.5` läuft, die Vorlage aber
  Skalierung 1 plus Emulation braucht (`app.commandLine.appendSwitch('force-device-scale-factor', '1')`).
- Größe und Schärfe über CDP: `webContents.debugger` → `Emulation.setDeviceMetricsOverride`
  (1536 × 864, `deviceScaleFactor: 2.5`), Aufnahme mit `Page.captureScreenshot` und `clip`.
  `capturePage` liefert nur Bildschirmgröße; ein Offscreen-Fenster mit Emulation stürzte ab; ein
  verstecktes Fenster malt nicht. Funktioniert hat: sichtbares, rahmenloses Fenster außerhalb des
  Bildschirms (`x: -6000`, `skipTaskbar`, `focusable: false`) plus die `KEEP_PAINTING`-Schalter.
- Eigene, frische `partition`: Chromium merkt sich den Zoom pro `file://`-Host über Läufe hinweg.
- `debugger.attach` erst nach einem ersten `loadURL('about:blank')`.
- Ein Fehler im Hauptskript öffnet in Electron einen Dialog und hängt; das Skript braucht einen
  Timeout und Fehler gehen in die Konsole des Elternprozesses.

```
┌──────────────────────────────── 3840 × 2160 ────────────────────────────────┐
│                                                                              │
│                                                  ┌───────────────────┐       │
│   Wo sind deine                                  │ Missing Hours ··· │       │
│   Stunden geblieben?                             │ ← → Di., 17. Nov. │       │
│                                                  │ 08:30 ▌Outlook    │       │
│   Missing Hours zeichnet deinen                  │ 09:00 ▌Angebot …  │       │
│   Arbeitstag automatisch auf.                    │       ▌Recherche  │       │
│                                                  │ 12:00 ░ Inaktiv   │       │
│   ◷ Missing Hours                                │ …                 │       │
│                                                  └───────────────────┘       │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Hintergrund:** ruhig und neutral, aus der Markenwelt des Icons (warmes Off-White `#f8f7f5` hell,
  fast Schwarz dunkel), dezenter Verlauf. Die Farbe im Bild kommt aus den Programmen in der
  Zeitleiste.
- **Fenster** mit Schatten und 8 px (skaliert) runden Ecken wie unter Windows 11.
- **Text:** Inter (aus `@fontsource/inter`, lokal), für `ja`/`ko`/`zh-*` die Windows-Schriften der
  Sprache, wie die App sie nutzt. Überschrift höchstens zwei Zeilen; Prüfung im Template wie in 6.6,
  sonst Fehler.
- **Kleines App-Icon mit Produktname** unten links.
- Format als Parameter (Breite, Höhe, Anordnung), damit später 16:10 für Apple dazukommen kann.

### 6.8 Logos und Titelbild

Laut Microsoft-Doku (MSIX, „Screenshots and images“, geprüft 2026-11-19) gelten 1:1-Box-Art und
2:3-Poster-Art nur für Spiele. Für Apps zählen:

- **1:1 App-Kachel-Icon 300 × 300** (dringend empfohlen, sonst nimmt der Store das Bild aus dem Paket).
  `scripts/generate-icons.js` (`npm run icons`) erzeugt es aus `resources/icon-source/icon.svg` nach
  `resources/store/AppTileIcon-300.png`, eingecheckt wie die anderen erzeugten Kacheln.
- **16:9 Super-Hero-Art 3840 × 2160** (empfohlen, oberstes Bild des Eintrags, **ohne Produktnamen und
  ohne anderen Text**). Erzeugt `npm run store-screenshots` aus derselben Vorlage: nur Hintergrund und
  App-Fenster (hell und dunkel versetzt), ohne Überschrift; einmal pro Sprache, weil die App darin
  die Sprache zeigt (meine Entscheidung).

Weitere Bilder (Xbox, Holographic, Trailer) nicht.

Hinweise von Microsoft für Screenshots, die die Vorlage beachtet: wichtige Inhalte im oberen
Zwei-Drittel (unten kann der Store Text darüberlegen), keine sehr hellen/dunklen Flächen oder harten
Streifen, PNG bis 50 MB, 1 bis 10 Bilder, Bildunterschrift bis 200 Zeichen pro Bild und Sprache.

### 6.10 Grenzen der Texte (Microsoft, geprüft 2026-11-19)

Beschreibung 10.000 Zeichen, Kurzbeschreibung 1.000 (sichtbar oft nur die ersten 270, Ziel ≤ 270),
Produktfeatures bis 20 × 200 Zeichen, Bildunterschrift 200, Kurztitel 50. Für Suchbegriffe nennt die
Doku keine Grenze; Partner Center zeigt sie beim Eintragen (Builder trägt den Wert ein, sobald er
bekannt ist, bis dahin 7 Begriffe × 30 Zeichen als Annahme). Die Beschreibung behält ihre
Feature-Liste wie heute, `features[]` ist zusätzlich das eigene Partner-Center-Feld; die Länge der
Beschreibung wird mit Liste gemessen (meine Entscheidung).

### 6.9 Dokumentation

- `docs/MICROSOFT-STORE.md`: Abschnitt „Angaben für die erste Einreichung“ verweist auf
  `store/listing/` und `npm run store-screenshots`; Schritt „Pro Store-Release“ bekommt „Screenshots
  neu erzeugen und prüfen, wenn sich die Oberfläche geändert hat“.
- `CLAUDE.md`: Befehl in die Tabelle, `store/` in die Ordnerübersicht, Regel „neue Sprache braucht auch
  `store/listing/<code>.json`“ (ersetzt den Hinweis auf die Store-Texte in `MICROSOFT-STORE.md`).
- `README.md`: kurzer Hinweis.

## 7. Was dem Builder überlassen ist

- Genaue Zeiten und Titel des Beispieltags, solange 6.3 erfüllt ist.
- Feinjustierung von Fenstergröße, Skalierung, Abständen, Schriftgrößen, Verlauf.
- Ob 02 `breaks` oder die Zoom-Auswahl.
- Wie die Funktionen zwischen `screenshots.js` und `store-screenshots.js` geteilt werden.

## 8. Prüfen

- `npm test` grün (inkl. `listing.test.js`, `demo-day.test.js`, `ActivityStore.test.ts`).
- `npm run screenshots` weiter ohne Fehler (gemeinsamer Code darf ihn nicht ändern).
- `npm run store-screenshots` für alle 12 Sprachen ohne Layout-Fehler; Bilder ansehen mindestens für
  `de`, `en`, `pl`, `ja`, `zh-Hant`.

## 9. Offene Punkte für Sebastian

- **Platzhalter `www.appname.io`** in den Einstellungen (alle 12 Sprachen, `placeholderLink`). Steht
  sichtbar im Motiv 04 und in der echten Store-App. Mein Vorschlag, bis Sebastian anders entscheidet:
  durch die GitHub-Adresse `github.com/bunterWolf/Missing-Hours` ersetzen, weiter als Text ohne Link
  (die App bleibt lokal), gleicher Wert in allen Sprachen; danach `npm run screenshots`. Diese
  Änderung ist eine eigene Commit-Einheit (`fix:`), weil sie die App selbst betrifft.

## 10. Gefunden nebenbei (eigenes Thema)

- Das neue Teams (`MSTeams`) und das neue Outlook sind Store-Apps unter `C:\Program Files\WindowsApps`,
  das nicht lesbar ist. Die App kann deren Icon vermutlich auch beim echten Tracking nicht laden und
  zeigt den Standard-Stil. Nicht Teil dieses Projekts.

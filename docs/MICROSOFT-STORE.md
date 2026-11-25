# Microsoft Store

Missing Hours für Windows gibt es zusätzlich zum GitHub-Installer als Paket im Microsoft Store (MSIX). Microsoft
signiert das Paket. Darum erscheint keine SmartScreen-Warnung, und Firmen lassen Store-Apps oft eher zu.

## Was in der Store-Version anders ist

| Thema | GitHub-Version | Store-Version |
| --- | --- | --- |
| Updates | `electron-updater` über GitHub Releases | der Store; `electron-updater` startet nicht |
| Beta-Updates | Schalter in den Einstellungen | gibt es nicht, im Store landen nur stabile Versionen |
| Autostart | Registry über `auto-launch`, Schalter in den Einstellungen | Startaufgabe im Paket (`resources/appx-extensions.xml`), an nach dem ersten Start; ein- und ausschalten unter Windows-Einstellungen > Apps > Autostart, die App öffnet die Seite per Knopf |
| Datenordner | `%APPDATA%\missing-hours` (nach `name` in `package.json`); beim ersten Start übernimmt die App die Daten aus dem alten Ordner `%APPDATA%\workmory` (`src/store/UserDataMigration.ts`) | gibt es `%APPDATA%\missing-hours` schon, nutzt sie genau diesen Ordner; sonst vermutlich den Paketordner (siehe unten) |
| Deinstallation | Daten bleiben | Daten im Paketordner löscht Windows mit, `%APPDATA%\missing-hours` bleibt |

Die App erkennt die Store-Version an `process.windowsStore` (`src/main/main.ts`, `isWindowsStore`).

**Daten (getestet am 2026-11-11 mit einem lokal registrierten Paket, Windows 11):** Auf einem Rechner,
auf dem die GitHub-Version schon lief, hat die Store-Version direkt in die vorhandene
`%APPDATA%\Workmory\chronflow-activity-store.json` geschrieben (die App hieß damals noch Workmory), also nichts umgeleitet. Beide Versionen
teilen sich dann Daten und Instanz-Sperre: Es läuft immer nur eine von beiden, und ein Wechsel behält
alle Tage. Nach dem Entfernen des Pakets war die Datei unverändert da.

Nicht getestet: eine frische Installation ohne vorhandenen Ordner. Dann legt Windows neue Dateien
voraussichtlich im Paketordner an (`%LOCALAPPDATA%\Packages\<Paketname>\LocalCache\Roaming\missing-hours`),
und eine Deinstallation löscht sie. Das ist bewusst so entschieden (keine Sonderfreigabe für
unvirtualisierte Dateien). Einen eigenen Speicherort kann man in den Einstellungen nicht mehr wählen.

## Einmalige Einrichtung im Partner Center

1. Unter https://partner.microsoft.com/dashboard ein Entwicklerkonto anlegen (für Einzelpersonen kostenlos).
2. **Apps und Spiele > Neues Produkt > MSIX- oder PWA-App** und den Namen „Missing Hours“ reservieren.
3. Unter **Produktverwaltung > Produktidentität** die drei Werte in `package.json` unter `build.appx` eintragen:

   | Partner Center | `package.json` |
   | --- | --- |
   | `Package/Identity/Name` | `identityName` |
   | `Package/Identity/Publisher` (beginnt mit `CN=`) | `publisher` |
   | `Package/Properties/PublisherDisplayName` | `publisherDisplayName` |

   Die Werte sind nicht geheim, sie stehen in jedem installierten Paket.

   Eingetragen seit 2026-11-16 (Name „Missing Hours“ reserviert):

   | Wert | |
   | --- | --- |
   | Package/Identity/Name | `SebastianWolf.MissingHours` |
   | Package/Identity/Publisher | `CN=3A692FC6-BC33-4654-8104-600699CDE817` |
   | PublisherDisplayName | `Sebastian Wolf` |
   | Package Family Name | `SebastianWolf.MissingHours_rk0eqn2pf5bat` |
   | Store-ID | `9P2JR2B30DG4` (Deep-Link und Webstore-URL gibt es erst, wenn die App live ist) |

## Pro Store-Release

1. **Version:** Der Store verlangt eine erste Stelle größer als 0 und kennt keine Betas. Die Version wird
   `Major.Minor.Patch.0` (`1.0.0` → `1.0.0.0`) und muss bei jeder Einreichung höher sein als die letzte.
   Die erste Store-Version ist deshalb mindestens `1.0.0`.
2. **Stabilen Release machen** wie in [RELEASE-PROZESS.md](RELEASE-PROZESS.md). Bei Tags ohne `beta` baut
   GitHub Actions zusätzlich das Store-Paket und legt es als Artefakt `microsoft-store-package` am Lauf ab.
   Es kommt nicht ins GitHub Release, weil es erst durch den Store signiert wird.
3. **Paket herunterladen:**
   ```bash
   gh run download <run-id> -n microsoft-store-package -D store-package
   ```
4. **Im Partner Center einreichen:** Produkt öffnen > **Einreichung starten** (bei Updates: Einreichung
   aktualisieren) > unter **Pakete** die `.appx` hochladen > Einreichung abschicken. Die Prüfung dauert
   meist ein bis drei Werktage.
5. **Store-Einträge,** nur wenn sich die Oberfläche, die Store-Texte oder die Sprachen geändert haben. Sonst
   übernimmt Partner Center Bilder und Texte der letzten Einreichung. Ablauf unter
   [Store-Einträge per Import aktualisieren](#store-einträge-per-import-aktualisieren).

## Angaben für die erste Einreichung

- **Preis und Verfügbarkeit:** kostenlos, alle Märkte
- **Website des Entwicklers:** `https://www.missing-hours.app`; Supportkontakt: `https://github.com/bunterWolf/Missing-Hours/issues`
- **Eigenschaften:** Kategorie „Produktivität“; „Diese App greift auf persönliche Informationen zu“: ja,
  Datenschutz-URL `https://github.com/bunterWolf/Missing-Hours/blob/main/PRIVACY.md`
- **Altersfreigabe:** Fragebogen ausfüllen; keine Kommunikation zwischen Nutzern, keine Käufe, keine
  Inhalte von Nutzern, keine Standortdaten
- **Eingeschränkte Funktion `runFullTrust`:** Partner Center fragt nach einer Begründung, zum Beispiel:
  > Missing Hours is a desktop time tracker built with Electron. It needs full trust to read the active window
  > (title and executable) through Win32 APIs, to read the system idle time and to start with Windows. All
  > data stays on the device.
- **Store-Einträge:** einen pro Sprache des Pakets (12, siehe `build.appx.languages` in `package.json`), Texte
  aus `store/listing/` (unten). Screenshots und Titelbild erzeugt `npm run store-screenshots` in 3840 × 2160
  nach `store-screenshots/microsoft/<sprache>/` (`00-hero.png` als 16:9-Super-Hero-Art, `01`–`05` als
  Screenshots in dieser Reihenfolge), ins Partner Center kommen sie per Import (unten). Das Skript braucht die Programme des Beispieltags auf dem Rechner (Office,
  Edge, Chrome, Figma), sonst erscheinen sie ohne Icon. Die Datenschutz-URL ist für alle Sprachen dieselbe
  (Deutsch und Englisch). Eine neue Sprache in der App braucht auch `store/listing/<sprache>.json`.

### Store-Texte

Abgeleitet aus [MARKETING-STRATEGIE.md](MARKETING-STRATEGIE.md) (Abschnitt 8). Die Screenshots in dieser
Reihenfolge: 1. Tagesansicht hell, 2. Pause mit Schraffur, 3. Tagesansicht dunkel, 4. Zoom-Auswahl offen
(5 Minuten), 5. Einstellungen (Motive in `store/motifs.js`).

Die Texte pro Sprache stehen in `store/listing/<sprache>.json`, die sprachunabhängigen Angaben
(Kategorie, Website, Support, Datenschutz-URL, Copyright, Entwickler) in `store/listing/common.json`.
`store/listing/listing.test.js` prüft, dass jede Sprache alle Felder hat und die Grenzen von Partner
Center einhält. `npm run store-screenshots` schreibt alles als `listing.md` zum Lesen neben die Bilder und
als `listings.csv` in die Import-Ordner (nächster Abschnitt).

| Feld in `<sprache>.json` | Partner Center (Store-Eintrag der Sprache) |
| --- | --- |
| `shortDescription` | Kurzbeschreibung |
| `description` | Beschreibung |
| `features` | Produktfeatures |
| `searchTerms` | Suchbegriffe |
| `screenshots.<motiv>.caption` | Bildunterschrift des Screenshots |
| `screenshots.<motiv>.headline` / `.subline` | Text auf dem Bild (nicht im Partner Center) |
| `demoDay.titles` | Fenstertitel im Beispieltag der Screenshots (nicht im Partner Center) |

Suchbegriffe: Partner Center erlaubt bis zu 7 Begriffe (je höchstens 30 Zeichen, zusammen höchstens 21 Wörter;
beim Eintragen prüfen). Die Begriffe und alle Texte außer Deutsch und Englisch sind noch nicht von
Muttersprachlern geprüft.

### Store-Einträge per Import aktualisieren

Bilder, Bildunterschriften und Texte kommen über **Import listings** ins Partner Center, nicht von Hand: 12
Sprachen mit je 6 Bildern sind sonst 72 einzelne Uploads, und Suchbegriffe, die man per Browser-Automatisierung
eintippt, speichert Partner Center nicht. So lief es zuerst am 2026-11-20.

1. **Bilder und Import-Ordner erzeugen:** `npm run store-screenshots` (alle 12 Sprachen). Das Skript schreibt
   neben die Bilder in 3840 × 2160 die Import-Ordner
   `store-screenshots/microsoft-store-import/missing-hours-store-1` bis `-3`: je vier Sprachen, die Bilder in
   1920 × 1080 und eine `listings.csv` mit den Texten aller Sprachen (`store/partner-center.js`).
2. **Bilder ansehen,** mindestens `de`, `en`, `pl`, `ja`, `zh-Hant` in `store-screenshots/microsoft/<sprache>/`.
3. **Ordner an einen leicht auffindbaren Ort kopieren,** z. B. in den Download-Ordner. Der Ordnername muss
   bleiben, wie er ist (siehe unten).
4. **Importieren, Ordner für Ordner:** Partner Center > Produkt > Übersicht der Einreichung > **Store listings** >
   **Import listings** > **Upload folder** > Ordner wählen. Die Dateiauswahl ist ein Windows-Dialog. Ein
   Agent kann ihn nicht bedienen; er öffnet den Dialog und der Mensch wählt den Ordner. Warten, bis unter
   „Store listings“ nicht mehr **Importing** steht, dann den nächsten Ordner.
5. **Prüfen** (Agent, im eingebauten Browser angemeldet, nur lesend):
   `GET /en-us/dashboard/product/api/nonjaguarlistings/products/9P2JR2B30DG4/submissions/<Einreichung>/listings?languageId=<id>`
   zeigt pro Sprache `listingModels[0].windowsScreenshots` (Bilder mit `description` = Bildunterschrift),
   `squareHeroArt` (das 16:9-Titelbild), `listing.description`/`features` und `validationItems` (leer = keine
   Fehler). Die `languageId` steht in den Links der Seite „Manage Store listing languages“ (z. B. de-de 14,
   en-us 4). Die Suchbegriffe fehlen in dieser Antwort; sie stehen auf der Seite des Eintrags unter
   **Keywords** (erscheinen ein paar Sekunden nach dem Laden). Am Ende steht in der Übersicht bei
   „Store listings“ **Complete**.
6. **Einreichen** (Submit for certification) macht der Mensch.

**Was Partner Center beim Import verlangt** (Microsoft Learn „Import and export Store listings“ und
ausprobiert):

- **Bildpfade beginnen mit dem Namen des hochgeladenen Ordners:** `missing-hours-store-1/de/01-timeline.png`.
  Ohne den Ordnernamen schlägt der ganze Import fehl, und die Fehlerseite zeigt eine leere Liste.
- **Kleine Ordner:** Ein Ordner mit allen 72 Bildern in 4K (109 MB) lief länger, als die Anmeldung im Partner
  Center hält. Mit 1920 × 1080 und vier Sprachen pro Ordner (etwa 17 MB) geht es.
- **Seite nicht neu laden, solange „Importing“ dasteht:** Der Upload läuft in der Seite, Neuladen bricht ihn ab.
- **Leere Zellen:** Ein leeres Bildfeld behält das Bild, das Partner Center schon hat. Ein leeres Textfeld
  übernimmt den Wert der Spalte `default`, die leer ist, löscht den Text also. Darum enthält jeder Ordner die
  Texte und Bildunterschriften aller Sprachen. Eine fehlende Zeile ändert laut Microsoft nichts, nur die
  Trailer-Zeilen dürfen nicht fehlen; das Skript lässt darum alle Felder weg, die es nicht pflegt (z. B.
  Versionshinweise). Bis 2026-11-20 lief der Import nur mit allen Zeilen eines Exports; der erste Import mit
  den Zeilen des Skripts steht noch aus.
- **Spalten `Field`, `ID`, `Type` unverändert lassen;** die Spalten der Sprachen heißen wie die Paketsprachen in
  Kleinbuchstaben (`de-de`, `zh-tw`). Genau eine `.csv` pro Ordner, UTF-8.
- **Nicht ausprobiert:** Fällt ein Motiv weg, bleibt sein altes Bild stehen, weil das Skript nur so viele
  Bildzeilen schreibt, wie `store/motifs.js` Motive hat. Dann das Bild von Hand im Eintrag löschen.

**Wenn ein Import scheitert:** In der Übersicht **Export listings** lädt den aktuellen Stand als CSV mit allen
Zeilen herunter (`listingData-<Store-ID>-<Einreichung>.csv`). Ihr Aufbau ist der Maßstab für
`store/partner-center.js`. Mit **Upload .csv** lassen sich nur die Texte testen, ohne Bilder.

## Lokal bauen und testen

```bash
npm run dist:store
```

Das Paket landet in `release/<version>/Missing-Hours-Store-<version>-x64.appx`.

Die Bilder in `resources/appx/` erzeugt `npm run icons` aus den SVGs in `resources/icon-source/`, nicht von
Hand bearbeiten: StoreLogo, Square44x44Logo und Square150x150Logo je in den Skalierungen 100–400
(`.scale-NNN`), das App-Icon zusätzlich in festen Pixelgrößen 16–256 (`.targetsize-NN`) mit Kachel, ohne
Kachel mit weißen Strichen (`_altform-unplated`, dunkles Theme) und ohne Kachel mit schwarzen Strichen
(`_altform-lightunplated`, helles Theme); fehlen die beiden letzten, setzt Windows das Icon in der Taskleiste
auf eine Systemplatte. Wide310x150Logo gibt es nur einmal (die quadratische Kachel mittig). Weil skalierte
Bilder dabei sind, erzeugt electron-builder mit `makepri.exe` eine `resources.pri` im Paket. Für die Store-Einträge im
Partner Center (Logos unter **Store-Einträge**) gilt bei Apps nur das 1:1-App-Kachelsymbol (300 × 300):
`resources/store/AppTileIcon-300.png`, ebenfalls von `npm run icons`. Box-Art und Poster-Art sind laut Microsoft nur
für Spiele.

**Bekanntes lokales Problem:** Auf manchen Rechnern startet `makeappx.exe` aus dem electron-builder-Cache
nicht (`spawn UNKNOWN`, im Ereignisprotokoll „Side-by-Side-Konfiguration ungültig“). Eine Kopie des Ordners
`%LOCALAPPDATA%\electron-builder\Cache\winCodeSign-2.6.0\<…>\windows-10\x64` an einem anderen Ort funktioniert.
Damit lässt sich das Paket aus den Dateien packen, die electron-builder schon vorbereitet hat (aus PowerShell,
weil Git Bash die `/`-Optionen umschreibt):

```powershell
& "<Kopie>\makeappx.exe" pack /o /p release\<version>\Missing-Hours-Store-local-x64.appx /f release\<version>\__appx-x64\mapping.txt
```

**Installieren ohne Store** (nur zum Testen): Entwicklermodus einschalten (Windows-Einstellungen > System >
Für Entwickler), dann das ungepackte Layout registrieren. `win-unpacked` liegt dabei unter `app\`, die
Kacheln unter `assets\`, wie in `mapping.txt`:

```powershell
Add-AppxPackage -Register <Layout-Ordner>\AppxManifest.xml
explorer.exe "shell:AppsFolder\<PackageFamilyName>!MissingHours"   # starten
Remove-AppxPackage -Package <PackageFullName>                  # wieder entfernen
```

`PackageFamilyName` und `PackageFullName` zeigt `Get-AppxPackage -Name <identityName>`. Achtung: Die
Testversion trackt echt und schreibt in `%APPDATA%\missing-hours`, wenn der Ordner existiert (siehe oben).

Geprüft am 2026-11-11: Start aus dem Startmenü, Einstellungen zeigen den Knopf statt Schalter und keine
Beta-Option, der Knopf öffnet „Apps > Autostart“, dort steht Missing Hours auf „Ein“, kein Eintrag unter
`HKCU\…\Run`.

# Mehrsprachigkeit: Design-Spec

**Datum:** 2026-11-17 · **Branch:** `feat/mehrsprachigkeit` · **Status:** Entwurf zur Freigabe

## 1. Ziel und Warum

Missing Hours soll im Microsoft Store erscheinen und dort möglichst viele Menschen erreichen. Dafür
muss die App in den großen Store-Märkten in der Sprache der Nutzer erscheinen, korrekt übersetzt und
ohne Anzeigefehler im Layout. Chinesisch gehört ausdrücklich dazu.

Heute kann die App Deutsch und Englisch (i18next, alle Texte in `src/i18n.js`). Die Sprache folgt der
Systemsprache, Englisch ist der Fallback. Es gibt Lücken: Dauern (`1h 5m`, `15m`) sind fest
verdrahtet, 12h/24h hängt an `lng === 'en'` statt an der Region, `<html>` hat kein `lang`, und kein
Test prüft, ob alle Sprachen vollständig sind.

## 2. Ziele

- **12 Sprachen:** `en`, `de`, `fr`, `es`, `it`, `pt-BR`, `nl`, `pl`, `ja`, `ko`, `zh-Hans`
  (vereinfacht, China/Singapur), `zh-Hant` (traditionell, Taiwan/Hongkong/Macau).
- **Jeder sichtbare Text** ist übersetzt: Oberfläche, Tooltips, `aria-label`, Fehlermeldungen,
  Dauern, Datum und Uhrzeit.
- **Formate passen:** Datum und Wochentag in der UI-Sprache, 12h/24h nach der Region des Systems,
  Dauern in der üblichen Kurzform der Sprache.
- **Vollständigkeit wird getestet:** gleiche Schlüssel und gleiche Platzhalter in jeder Sprache.
- **Layout wird geprüft:** `npm run screenshots` erzeugt PNGs pro Sprache, hell und dunkel, für die
  Tagesansicht und die Einstellungen.
- **Store:** alle 12 Sprachen im Paket angemeldet, Store-Texte (Kurzbeschreibung, Beschreibung) in
  allen 12 Sprachen in `docs/MICROSOFT-STORE.md`.
- **Regel für die Zukunft:** CLAUDE.md und die Docs schreiben fest, dass jeder neue oder geänderte
  Text in allen Sprachen landet und die Tests das prüfen.

## 3. Nicht-Ziele und Anti-Ziele

- **Keine Rechts-nach-links-Sprachen** (Arabisch, Hebräisch). Ein halb gespiegeltes Layout wäre
  genau der Anzeigefehler, den wir vermeiden wollen.
- **Keine Sprachauswahl in den Einstellungen.** Die App folgt der Windows-Sprache, wie im Store üblich.
- **Kein Übersetzungsdienst** (Crowdin, Weblate). Lässt sich später auf die JSON-Dateien aufsetzen.
- **Die Datenschutzerklärung (`PRIVACY.md`) bleibt Deutsch und Englisch.** Ein Rechtstext mit
  Übersetzungsfehlern wäre schlimmer als keiner (meine Entscheidung).
- **Keine fertigen Store-Screenshots im Format 1366×768.** Die Screenshots sind für die
  Layout-Prüfung; Store-Bilder entstehen getrennt (meine Entscheidung).
- **Anti-Ziel:** Texte, die abgeschnitten, umgebrochen oder überlappend erscheinen. Ein falsch
  formatiertes Datum oder eine falsche Dauer in den Zahlen, die in Rechnungen fließen.

## 4. Ansätze

1. **Eine JSON-Datei pro Sprache in `src/locales/`, fest in den Renderer gebündelt (gewählt).**
   Übersichtlich, Übersetzer arbeiten pro Datei, Tests können jede Datei mit der Referenz vergleichen.
2. **Alles in `src/i18n.js`.** Rund 1500 Zeilen in einer Datei, gegen die Regel zur Dateigröße.
3. **Übersetzungsdienst.** Muttersprachler-Qualität, aber externe Konten und Aufwand für die
   Einrichtung. Später auf Ansatz 1 aufsetzbar.

Der Nutzer hat Ansatz 1 mit den 12 Sprachen gewählt.

## 5. Entwurf

### 5.1 Dateien

- `src/locales/<code>.json`, eine pro Sprache, mit denselben Schlüsseln wie heute. `en.json` ist die
  Referenz und der Fallback. Webpack bündelt alle (wenige KB, keine Ladelogik).
- `src/i18n.js` behält nur: Sprachen einsammeln, Sprache erkennen, i18next einrichten, Formate.
  Die Erkennung kommt in eine eigene, testbare Funktion (`resolveLanguage`), die nichts von Electron weiß.

### 5.2 Spracherkennung

- Quelle: `app.getPreferredSystemLanguages()` (Windows-Anzeigesprachen in Reihenfolge), sonst
  `app.getLocale()`, sonst `navigator.language`. Die erste unterstützte Sprache gewinnt, sonst `en`.
- Abgleich: exakt, dann über Sprache und Schrift. `zh-CN`, `zh-SG`, `zh-Hans-*` → `zh-Hans`;
  `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant-*` → `zh-Hant`; nacktes `zh` → `zh-Hans`. `pt-*` → `pt-BR`
  (einzige portugiesische Variante). Sonst Sprachteil vor dem Bindestrich.
- Für Screenshots und Tests muss sich die Sprache von außen setzen lassen (zum Beispiel über
  Chromiums `--lang=<code>`, das `app.getLocale()` beeinflusst). Eine solche Vorgabe hat Vorrang vor
  den Systemsprachen, weil `getPreferredSystemLanguages()` sie nicht sieht. Wie genau, entscheidet der Plan.

### 5.3 Formate

- **Locale für `Intl`:** UI-Sprache plus Region des Systems (`app.getSystemLocale()`), zum Beispiel
  englische UI auf deutschem System → `en-DE`: englische Monatsnamen, 24-Stunden-Uhr. Ohne Region
  die UI-Sprache allein. Das ersetzt `hour12: lng === 'en'`.
- **Dauern** kommen aus der Sprachdatei, nicht aus `Intl.DurationFormat` (dessen Kurzform ist z. B.
  im Deutschen `1 Std., 15 Min.` und damit zu lang). Schlüssel für „Stunden und Minuten“ und „nur
  Minuten“. Deutsch und Englisch: `1h 15m` und `15m` (Wunsch des Nutzers). Andere Sprachen nehmen die
  dort übliche Kurzform, so knapp wie möglich (z. B. `1 h 15 min`, `1時間15分`, `1小时15分`);
  die Screenshots zeigen, ob sie passt.
- **Zoom-Auswahl** (`15m`/`10m`/`5m`) nutzt dieselbe Minuten-Kurzform.
- Die Rechenlogik von `formatDuration` (Stunden, Rest-Minuten, `0` bei leer) bleibt unverändert;
  nur die Darstellung wird übersetzt. Tests decken beides ab.

### 5.4 Dokument und Schrift

- `<html lang>` wird auf die erkannte Sprache gesetzt (`zh-Hans`, `ja` …). Chromium wählt damit die
  richtige CJK-Schrift (Microsoft YaHei, JhengHei, Yu Gothic, Malgun Gothic), und Screenreader lesen
  richtig vor. Inter hat keine CJK-Zeichen; `system-ui` als Fallback bleibt.
- Der Fenstertitel in `main.ts` wird schlicht `Missing Hours` (Produktname, nicht übersetzt; die
  Seite setzt ihn ohnehin aus `<title>`).

### 5.5 Tests

- Jede Sprachdatei hat genau die Schlüssel von `en.json`, nichts fehlt, nichts ist zu viel, kein Wert leer.
- Platzhalter (`{{…}}`) stimmen pro Schlüssel überein.
- `trackingPhrases`: in jeder Sprache mindestens zwei, der erste ist der schlichte Satz.
- `resolveLanguage`: die Fälle aus 5.2.
- Dauern: Rechnung und Ausgabe für `de`, `en` und mindestens eine CJK-Sprache.
- Die Paketsprachen in `package.json` (`build.appx.languages`) decken alle Sprachdateien ab.

### 5.6 Screenshots

- `npm run screenshots` startet die App mit Beispieldaten (`--mock-data`) pro Sprache, nimmt die
  Tagesansicht und die Einstellungen in hell und dunkel auf und legt die PNGs in einem Ordner ab,
  der nicht eingecheckt wird. Werkzeug: Playwrights Electron-Unterstützung (nur Dev-Abhängigkeit,
  keine Browser-Downloads) oder ein gleichwertiger Weg; entscheidet der Plan.
- Darf nichts Echtes berühren: kein Tracking, keine echten Daten, keine geänderten Einstellungen.
- Ich prüfe die Bilder aller 12 Sprachen auf abgeschnittene, umgebrochene oder überlappende Texte und
  passe Übersetzungen an, bis alles passt.

### 5.7 Store

- `build.appx.languages`: `en-US`, `de-DE`, `fr-FR`, `es-ES`, `it-IT`, `pt-BR`, `nl-NL`, `pl-PL`,
  `ja-JP`, `ko-KR`, `zh-CN`, `zh-TW`.
- `docs/MICROSOFT-STORE.md`: Store-Texte in allen 12 Sprachen, mit dem Hinweis, dass im Partner Center
  pro Sprache ein Store-Eintrag angelegt wird.

### 5.8 Regel für Agenten und Menschen

- **CLAUDE.md:** neuer Abschnitt „Mehrsprachigkeit (Pflicht)“: kein sichtbarer Text ohne `t()`, jeder
  neue Schlüssel in allen 12 Sprachdateien, Datum/Uhrzeit/Dauer nur über die i18n-Helfer, neue
  Sprache = Datei + Paketsprache + Store-Text, bei UI-Änderungen `npm run screenshots` und Layout in
  langen Sprachen und CJK prüfen. Dazu Modultabelle und Befehlstabelle ergänzen.
- **`docs/Engineering Design Dokument.md`:** Abschnitt zur Internationalisierung (Dateien,
  Erkennung, Formate, Tests).
- **`docs/User Requirements.md`:** Anforderung „App erscheint in der Systemsprache, 12 Sprachen“.
- **`docs/design/figma-map.md`:** Hinweis, dass Texte im Code aus den Sprachdateien kommen und
  Layouts lange Übersetzungen aushalten müssen.

## 6. Was dem Umsetzenden überlassen bleibt

- Genaue Schlüsselnamen für die Dauer-Formate, Aufbau von `resolveLanguage`.
- Wie die Sprache für Screenshots erzwungen wird und mit welchem Werkzeug aufgenommen wird.
- Die Übersetzungen selbst; Ton wie im Deutschen und Englischen: kurz, freundlich, du-Form wo die
  Sprache eine vertraute Anrede kennt, sonst neutral-höflich (z. B. Japanisch).
- Ob `teamsMeeting` und `placeholderLink` übersetzt werden (Teams ist verworfen, kann aber in alten
  Daten stehen; also übersetzen).

## 7. Risiko

Die Übersetzungen schreibt Claude, kein Muttersprachler prüft sie. Für Japanisch, Koreanisch und
Chinesisch empfiehlt sich vor dem Store-Start eine kurze Prüfung durch Muttersprachler.

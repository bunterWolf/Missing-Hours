# Marketing-Strategie Missing Hours

Stand: November 2026 (Version 1.1.0). Grundlage für die Website, die Store-Einträge, README und Ankündigungen.
Die fertigen Store-Texte stehen in [MICROSOFT-STORE.md](MICROSOFT-STORE.md); sie werden aus diesem Dokument
abgeleitet und in allen 12 Sprachen gepflegt.

**Ziel:** Missing Hours ist kostenlos und verdient kein Geld. Erfolg heißt Verbreitung: viele Installationen,
gute Bewertungen, Empfehlungen. Dafür muss die App beim ersten Blick überzeugen und beim ersten Tag halten,
was sie verspricht.

---

## 1. Das Produkt in einem Satz

**Missing Hours schreibt automatisch mit, woran du am PC arbeitest, und zeigt dir deinen Tag als Zeitleiste.
Kostenlos, ohne Konto, und alles bleibt auf deinem Computer.**

### Was die App heute kann (darf beworben werden)

| Funktion | Nutzen für den Menschen |
| --- | --- |
| Erfasst alle 30 Sekunden das aktive Programm und den Fenstertitel | Du musst nichts starten, stoppen oder eintragen |
| Erkennt Inaktivität, Pausen und Ruhezustand | Kaffeepause und Mittag landen nicht als Arbeitszeit im Tag |
| Zeitleiste pro Tag in festen Blöcken (Zoom 15, 10 oder 5 Minuten), gleiche Blöcke zusammengefasst | Ein Blick zeigt, was du wann gemacht hast, ohne Rohdaten-Chaos |
| Programmsymbole und Farben aus dem jeweiligen Programm | Du erkennst Excel, Figma oder Outlook sofort wieder |
| Tagessumme: Aktiv · Inaktiv · Erfasst | Wie viel du wirklich gearbeitet hast, auf einen Blick |
| Vortage durchblättern (letzte 30 Tage) | Den Dienstag rekonstruieren, wenn am Freitag der Stundenzettel fällig ist |
| Pausieren per Klick | Private Zeit bleibt privat |
| Startet mit Windows, läuft im Hintergrund | Einmal installieren, dann vergessen |
| Hell, Dunkel, Automatisch | Passt zum System |
| 12 Sprachen, Datum und Uhrzeit nach Region | Fühlt sich in Tokio, Warschau und São Paulo gleich heimisch an |
| Microsoft Store (von Microsoft signiert, Updates über den Store) | Keine SmartScreen-Warnung, auch in Firmen eher erlaubt |
| Quellcode öffentlich auf GitHub | Jeder kann nachprüfen, dass nichts gesendet wird |

### Was die App nicht kann (darf nicht beworben werden)

Ehrlichkeit ist bei einer App, die Arbeitszeit für Rechnungen liefert, Teil der Marke. Diese Punkte nie
versprechen, auch nicht indirekt:

- **Kein Export** (CSV, PDF, Rechnung). Die App ist die *Grundlage* für Stundenzettel und Rechnungen, sie
  schreibt sie nicht. Formulierung: „damit du Stunden nachvollziehen und abrechnen kannst“, nicht „erstellt
  Rechnungen“.
- **Keine Projekte, Kunden oder Tags.** Die App zeigt Programme und Fenster, die Zuordnung macht der Mensch.
- **Keine Teams-Meetings** (wird nicht mehr verfolgt, auch wenn alte Dokumente es noch nennen).
- **Daten nur 30 Tage.** Danach werden Tage automatisch gelöscht. Kein „Archiv“, keine „Jahresübersicht“.
- **Kein Sync zwischen Geräten**, keine Team- oder Chef-Ansicht.
- **macOS und Linux:** Der Store ist Windows-only; Linux gibt es nicht. macOS erst bewerben, wenn der Build
  geprüft und signiert ist (siehe Abschnitt 10).
- **Keine Leistungszahlen** wie „unter 2 % CPU“, solange sie nicht gemessen und belegt sind. „Leicht“ und
  „läuft unauffällig im Hintergrund“ reichen.
- **Nie „Open Source“.** Die Lizenz ist PolyForm Shield 1.0.0 ([LICENSE.md](../LICENSE.md)): Der Code ist
  öffentlich und darf genutzt und angepasst werden, aber niemand darf daraus ein Konkurrenzprodukt machen. Das
  ist „source-available“, nicht Open Source im Sinne der OSI. Formulierung: „Quellcode offen einsehbar“ /
  “source code public” / “source-available”.

---

## 2. Positionierung

### Das Problem

Wer nach Stunden abrechnet oder einen Stundenzettel führt, kennt den Moment: Es ist Freitag, die Woche ist
voll, und der Kalender zeigt nur die Termine. Was war Dienstagnachmittag? Manuelle Timer vergisst man zu
starten, und noch öfter zu stoppen. Das Ergebnis sind geschätzte Stunden, und geschätzt wird fast immer zu
wenig.

Die bestehenden Lösungen haben jeweils einen Haken:

| Lösung | Haken aus Sicht der Zielgruppe |
| --- | --- |
| Manuelle Timer (Toggl Track, Clockify, Harvest) | Funktionieren nur, wenn man dran denkt; Konto und Cloud nötig |
| Automatische Cloud-Tracker (RescueTime, Rize, Timely) | Aktivitätsdaten liegen auf fremden Servern; Abo; oft Produktivitäts-Bewertung statt Rückblick |
| Automatische lokale Tracker mit Preis (Memtime, Timing für Mac) | Gut, aber kostenpflichtig |
| ManicTime | Mächtig, aber komplex; viele Funktionen nur in der Bezahlversion |
| ActivityWatch | Kostenlos und lokal, aber technisch; eher für Entwickler |

### Unser Platz

Missing Hours ist der **einfachste automatische Zeit-Rückblick, der kostenlos ist und deinen PC nie verlässt.**

```
                 automatisch
                      │
     RescueTime ●     │     ● Missing Hours
     Rize, Timely     │     ● Memtime (kostenpflichtig)
                      │     ● ActivityWatch (technisch)
  Cloud ──────────────┼────────────── lokal
                      │
     Toggl, Clockify ●│
                      │
                   manuell
```

Innerhalb von „automatisch + lokal“ unterscheiden uns drei Dinge: **kostenlos ohne Haken**, **ruhig und
schön statt komplex**, **im Microsoft Store in 12 Sprachen**.

### Positionierungs-Statement (intern)

> Für Menschen, die ihre Arbeitszeit am Windows-PC nachweisen oder abrechnen müssen und dabei keine Lust
> auf Timer und keine Lust auf Cloud haben, ist Missing Hours die Zeiterfassung, die einfach mitschreibt.
> Anders als RescueTime oder Toggl braucht sie kein Konto, kostet nichts und speichert alles nur lokal.

### Die Geschichte hinter dem Namen

„Missing Hours“ sind die Stunden, die du gearbeitet, aber nicht aufgeschrieben hast. Die Lücke zwischen
Stundenzettel und Wirklichkeit. Der Name ist das Versprechen: Die App findet diese Stunden wieder. Diese
Geschichte trägt die Website-Headline und jede Ankündigung.

---

## 3. Zielgruppen

### Primär: Selbstständige, die nach Stunden abrechnen

Freelancer und kleine Büros: Designerinnen, Entwickler, Übersetzerinnen, Beraterinnen, Texter, Architekten,
Steuer- und Rechtsberatung im kleinen Rahmen. Arbeiten am Windows-PC, wechseln zwischen Kunden, schreiben
monatlich Rechnungen.

- **Schmerz:** vergessene Timer, geschätzte Stunden, verschenktes Geld.
- **Auslöser:** Monatsende, Rechnung schreiben, Kunde fragt nach dem Aufwand.
- **Botschaft:** „Hol dir die Stunden zurück, die du nicht abgerechnet hast.“
- **Einwand:** „Noch ein Tool?“ → Es ist kein Tool, das man bedient. Installieren und vergessen.

### Sekundär: Angestellte mit Stundenzettel oder Projektbuchung

Agenturen, Beratungen, IT-Dienstleister, Ingenieurbüros, öffentliche Verwaltung mit Projektzeiten. Müssen
Zeiten in SAP, Jira, Personio oder einer Tabelle nachtragen.

- **Schmerz:** Freitagnachmittag die Woche rekonstruieren.
- **Botschaft:** „Dein Stundenzettel in fünf Minuten statt in einer Stunde Raten.“
- **Einwand:** „Darf ich das auf dem Firmen-PC?“ → Microsoft Store, von Microsoft signiert, keine Daten nach
  außen, kein Konto. Das ist das stärkste Argument gegenüber der IT.
- **Wichtig:** Die App ist für die Person selbst, nicht für den Arbeitgeber. Niemand sonst sieht die Daten.

### Tertiär: Menschen, die verstehen wollen, wohin ihr Tag geht

Studierende, Homeoffice-Arbeitende, Selbstoptimierer. Kein Abrechnungsdruck, aber Neugier: „Wie lange war
ich wirklich in E-Mails?“

- **Botschaft:** „Sieh, wohin dein Tag wirklich gegangen ist.“
- Diese Gruppe verbreitet die App gern (Reddit, YouTube, Blogs), braucht aber nicht die Hauptbotschaft.

### Bewusst nicht: Arbeitgeber, die Mitarbeitende überwachen wollen

Missing Hours ist kein Überwachungs-Tool und wird nie so vermarktet. Keine Begriffe wie „Mitarbeiter-
Monitoring“, „Produktivität messen“, „Kontrolle“. Das schützt das Vertrauen der eigentlichen Zielgruppe
und hält uns aus einer Kategorie heraus, die Store-Bewertungen und Presse belastet.

---

## 4. Markenkern

### Versprechen

**Du arbeitest. Missing Hours schreibt mit.**

### Die vier Säulen

Jeder Text auf Website und im Store stützt sich auf eine dieser Säulen. Reihenfolge = Gewichtung.

| # | Säule | Kernaussage | Beweis |
| --- | --- | --- | --- |
| 1 | **Automatisch** | Nichts starten, nichts stoppen, nichts vergessen. | Erfasst alle 30 Sekunden im Hintergrund, startet mit Windows, erkennt Pausen selbst |
| 2 | **Privat** | Deine Daten verlassen deinen PC nie. | Kein Konto, keine Cloud, keine Telemetrie, keine Werbung; Quellcode öffentlich; Tastatureingaben werden nicht erfasst |
| 3 | **Klar** | Ein Blick, und du weißt, was du getan hast. | Zeitleiste mit Programmsymbolen, zusammengefasste Blöcke, Tagessumme |
| 4 | **Kostenlos** | Kostenlos. Ohne Abo, ohne Werbung, ohne Pro-Version. | Store-Preis 0 €, keine In-App-Käufe |

> **Entscheidung offen:** „Für immer kostenlos“ nur schreiben, wenn das eine feste Zusage ist. Bis dahin
> „kostenlos, ohne Abo und ohne Werbung“.

### Vertrauens-Sätze (wörtlich wiederverwendbar)

- „Missing Hours sieht, welches Fenster offen ist. Nicht, was du tippst.“
- „Kein Konto. Keine Cloud. Keine Telemetrie.“
- „Deine Daten liegen auf deinem PC, nirgendwo sonst.“
- „Der Quellcode ist öffentlich. Prüf es nach.“
- „Pausieren mit einem Klick, wenn es privat wird.“

---

## 5. Tonalität

- **Du**, wie in der App und den Store-Texten (in jeder Sprache die übliche vertraute Form, siehe die
  Übersetzungen in MICROSOFT-STORE.md).
- **Ruhig und klar.** Kurze Sätze, konkrete Wörter. Die App ist leise, die Texte auch.
- **Ehrlich.** Lieber eine Funktion weniger nennen als eine zu viel. Keine Superlative („die beste“,
  „revolutionär“), kein „KI“.
- **Ein kleines Augenzwinkern** ist erlaubt, so wie die Sätze im laufenden Block („Minuten sammeln“,
  „Tick, tack“). Sparsam, nie auf Kosten der Klarheit.
- **Keine Angst-Werbung** („Du verlierst jeden Monat 1.000 €!“). Stattdessen die konkrete Situation zeigen:
  Freitag, Stundenzettel, leere Erinnerung.
- **Konkret statt abstrakt:** nicht „Produktivität steigern“, sondern „sehen, dass du Dienstag drei Stunden
  am Angebot für Kunde X gearbeitet hast“.

### Wörter

| Verwenden | Vermeiden |
| --- | --- |
| aufschreiben, mitschreiben, Zeitleiste, Rückblick, Arbeitszeit, Stunden, abrechnen | überwachen, kontrollieren, Monitoring, Spy, Produktivitäts-Score |
| automatisch, im Hintergrund, lokal, auf deinem PC | Cloud-Synchronisation, Dashboard, Analytics |
| Pause, Abwesenheit, inaktiv | „Leerlauf“ als Vorwurf, „verschwendete Zeit“ |
| kostenlos | „Free Trial“, „gratis testen“ |

---

## 6. Botschaften nach Ebene

### Headline-Kandidaten

Deutsch:

1. **Finde deine verlorenen Stunden.** *(Empfehlung: erzählt den Namen)*
2. Du arbeitest. Missing Hours schreibt mit.
3. Zeiterfassung, die du nicht starten musst.

English:

1. **Find your missing hours.** *(recommended)*
2. You work. Missing Hours keeps track.
3. Time tracking you never have to start.

### Unterzeile (Hero)

DE: „Missing Hours erfasst automatisch, woran du am PC arbeitest, und zeigt deinen Tag als Zeitleiste.
Kostenlos, ohne Konto, und alles bleibt auf deinem Computer.“

EN: “Missing Hours automatically records what you work on and shows your day as a timeline. Free, no account,
and everything stays on your computer.”

### Elevator Pitch (30 Sekunden)

> Kennst du das, wenn du am Freitag deinen Stundenzettel ausfüllen sollst und nicht mehr weißt, was du am
> Dienstag gemacht hast? Missing Hours läuft unauffällig im Hintergrund und schreibt mit, welches Programm
> und welches Dokument gerade offen ist. Am Ende siehst du deinen Tag als Zeitleiste, Pausen schon
> herausgerechnet. Es kostet nichts, braucht kein Konto, und die Daten verlassen nie deinen PC.

### Call to Action

- Primär: **„Kostenlos im Microsoft Store“** (offizielles Store-Badge)
- Sekundär: „Direkt herunterladen (GitHub)“
- Nie: „Jetzt registrieren“, „Testen“ (es gibt nichts zu registrieren und nichts, das abläuft)

---

## 7. Website

### Ziel und Messgröße

Eine Seite, ein Ziel: Klick auf das Store-Badge. Die Website erklärt in 10 Sekunden, was die App tut, und
nimmt in 60 Sekunden die Sorge „Wird da etwas über mich gesammelt?“.

### Aufbau (eine Landingpage pro Sprache)

1. **Hero:** Headline, Unterzeile, Store-Badge, Screenshot der Tagesansicht (hell, im Fensterrahmen).
   Darunter klein: „Windows 10 und 11 · 12 Sprachen · Kostenlos“.
2. **Das Problem:** ein kurzer Absatz zur Freitag-Szene, rechts ein halbleerer Stundenzettel.
3. **So funktioniert es (3 Schritte):**
   1. Installieren. Missing Hours startet ab jetzt mit Windows.
   2. Arbeiten wie immer. Alle 30 Sekunden notiert die App das aktive Programm.
   3. Zurückblicken. Deine Zeitleiste zeigt jeden Tag der letzten 30 Tage, Pausen erkannt.
4. **Funktionen** (sechs Kacheln mit Icon): Automatisch · Pausen erkannt · Zeitleiste mit Programmsymbolen ·
   Zoom auf 5, 10 oder 15 Minuten · Hell und Dunkel · 12 Sprachen.
5. **Privatsphäre** (eigener, ruhiger Abschnitt, Säule 2): die Vertrauens-Sätze, Link zur
   Datenschutzerklärung und zum Quellcode. Eine kurze Liste „Was erfasst wird / Was nicht erfasst wird“
   direkt aus [PRIVACY.md](../PRIVACY.md).
6. **Für wen** (drei kurze Karten): Freelancer · Stundenzettel im Job · Neugierige.
7. **FAQ** (siehe unten).
8. **Abschluss-CTA:** Headline wiederholen, Store-Badge.
9. **Footer:** Datenschutz, Impressum, GitHub, Kontakt (GitHub Issues), Sprachwahl.

### FAQ (Antworten als Vorlage)

- **Ist Missing Hours wirklich kostenlos?** Ja. Kein Abo, keine Werbung, keine In-App-Käufe.
- **Wer sieht meine Daten?** Nur du. Sie liegen auf deinem PC. Missing Hours sendet nichts an uns oder an
  andere.
- **Erfasst die App, was ich tippe?** Nein. Sie erfasst das aktive Programm, den Fenstertitel und ob du
  gerade aktiv bist. Nicht deine Tastatureingaben, keine Screenshots.
- **Kann mein Arbeitgeber damit sehen, was ich tue?** Nein. Es gibt kein Konto, keinen Server und keine
  Team-Ansicht. Die App ist für dich.
- **Darf ich das auf meinem Firmen-PC installieren?** Das entscheidet deine IT. Missing Hours kommt aus dem
  Microsoft Store, ist von Microsoft signiert und sendet keine Daten nach außen.
- **Wie lange werden Daten gespeichert?** 30 Tage, danach löscht die App alte Tage automatisch.
- **Kann ich die Zeiten exportieren?** Noch nicht. *(Antwort anpassen, sobald es einen Export gibt.)*
- **Was passiert in der Mittagspause?** Missing Hours erkennt, dass du weg bist, und zeigt die Zeit als
  inaktiv, nicht als Arbeit.
- **Was ist, wenn ich etwas Privates mache?** Ein Klick auf „Tracking pausieren“.
- **Gibt es Missing Hours für Mac?** *(erst beantworten, wenn Abschnitt 10 entschieden ist)*
- **Bremst die App meinen PC aus?** Sie ist klein und läuft unauffällig im Hintergrund.

### Technik und Haltung der Website

- **Keine Cookies, kein Tracking, kein Cookie-Banner.** Die Website lebt die Botschaft der App. Ein kleiner
  Satz im Footer: „Diese Seite setzt keine Cookies und zählt dich nicht.“ Wer Besucherzahlen braucht, nimmt
  Server-Logs oder ein cookieloses Zählverfahren ohne Personenbezug.
- **12 Sprachen** wie die App, eigene URL pro Sprache (`/de/`, `/ja/` …) mit `hreflang`. In vielen dieser
  Sprachen gibt es kaum lokale Konkurrenz zu „automatische Zeiterfassung lokal kostenlos“.
- Schnell, statisch, ohne Fremd-Schriften von CDNs (wie die App mit Inter lokal).
- **Domain:** `www.missing-hours.app` (seit 2026-11-19). Die Einstellungen der App verlinken darauf (öffnet
  den Browser), README auch. Sprachseiten später als `/de/`, `/ja/` usw.

### SEO-Themen (Ratgeber-Seiten, später)

Inhalte, nach denen die Zielgruppe in der Situation des Schmerzes sucht:

- „Arbeitszeit nachträglich rekonstruieren“ / “how to remember what you worked on”
- „Stundenzettel ausfüllen, ohne zu raten“
- „Zeiterfassung ohne Cloud“ / “offline time tracker”
- „Automatische Zeiterfassung kostenlos“
- Vergleichsseiten: „RescueTime-Alternative ohne Cloud“, „ManicTime vs. Missing Hours“,
  „Kostenlose Memtime-Alternative“. Fair und sachlich, mit den Haken aus Abschnitt 2.

---

## 8. Microsoft Store (App Store Optimization)

Die Texte für alle 12 Sprachen stehen in [MICROSOFT-STORE.md](MICROSOFT-STORE.md). Diese Regeln gelten für
ihre Überarbeitung.

### Felder und Inhalte

| Feld (Partner Center) | Inhalt |
| --- | --- |
| Name | „Missing Hours“ (reserviert, unveränderlich) |
| Kurzbeschreibung | Säulen 1–2 in zwei Sätzen, endet mit „kostenlos“ |
| Beschreibung | 1. Hook (Freitag-Szene, 1 Satz) · 2. Was die App tut · 3. Aufzählung der Funktionen · 4. Privatsphäre-Absatz · 5. „Kostenlos, ohne Abo, ohne Werbung“ |
| Produktfeatures | 6–10 kurze Zeilen, je eine Funktion mit Nutzen (Tabelle Abschnitt 1) |
| Suchbegriffe | 7 pro Sprache, siehe unten |
| Screenshots | 5 Motive, siehe unten |
| Neuigkeiten | Jede Version in Nutzersprache, nicht in Commit-Sprache |
| Kategorie | Produktivität |
| Website, Support | `https://www.missing-hours.app` und GitHub Issues |

**Erster Satz zählt:** Im Store sehen die meisten nur die ersten ein, zwei Zeilen. Dort muss stehen:
automatisch, Zeitleiste, lokal, kostenlos.

Vorschlag für den Beschreibungs-Einstieg (DE):

> Weißt du am Freitag noch, woran du am Dienstag gearbeitet hast? Missing Hours schon. Die App schreibt
> automatisch mit, welche Programme und Fenster du nutzt, erkennt Pausen und zeigt jeden Tag als
> übersichtliche Zeitleiste. Kostenlos, ohne Konto, und deine Daten bleiben auf deinem PC.

EN:

> Do you still remember on Friday what you worked on on Tuesday? Missing Hours does. It automatically records
> which programs and windows you use, detects breaks and shows every day as a clear timeline. Free, no account,
> and your data stays on your PC.

> Seit 2026-11-19 beginnen die Store-Texte aller 12 Sprachen mit dieser Frage und nennen „kostenlos“.

### Suchbegriffe (Vorschlag)

| Sprache | Begriffe |
| --- | --- |
| Deutsch | Zeiterfassung · Arbeitszeit · Stundenzettel · Zeittracker · automatische Zeiterfassung · Stunden abrechnen · Aktivitäten |
| English | time tracker · time tracking · timesheet · work hours · automatic time tracking · billable hours · activity tracker |

Für die anderen 10 Sprachen die üblichen Suchwörter des Landes nehmen, nicht wörtlich übersetzen
(z. B. Japanisch 勤怠 / 作業時間 / タイムトラッカー, Polnisch „ewidencja czasu pracy“). Muttersprachler prüfen
lassen.

### Screenshots (Reihenfolge = Wichtigkeit)

Aus `npm run screenshots` (Mock-Daten, je Sprache), im Store-Format mit kurzer Überschrift über dem Bild:

1. Tagesansicht hell, voller Arbeitstag — „Dein Tag, automatisch aufgeschrieben“
2. Pause/Mittag mit Schraffur sichtbar — „Pausen erkennt Missing Hours selbst“
3. Tagesansicht dunkel — „Hell oder dunkel, wie dein Windows“
4. Zoom-Auswahl offen (5 Minuten) — „Grob oder genau: 15, 10 oder 5 Minuten“
5. Einstellungen — „Kein Konto. Keine Cloud. Läuft einfach mit.“

Mock-Daten mit glaubwürdigen, harmlosen Fenstertiteln (Angebot, Präsentation, E-Mail an einen erfundenen
Kunden), keine echten Namen oder Firmen.

### Bewertungen

Bewertungen sind für eine kostenlose App der wichtigste Hebel im Store-Ranking.

- **Vorschlag für die App (Entscheidung offen):** nach etwa einer Woche mit erfassten Tagen einmalig um eine
  Bewertung bitten, über den Windows-Store-Dialog. Nie wiederholt, nie beim ersten Start, nur in der
  Store-Version. Braucht Texte in 12 Sprachen.
- Auf jede Bewertung antworten, besonders auf schlechte, in der Sprache der Bewertung.
- Feature-Wünsche aus Bewertungen sammeln (z. B. Export) und in „Neuigkeiten“ zurückmelden, wenn sie kommen.

---

## 9. Kanäle und Launch

Kein Budget, also: Orte, an denen die Zielgruppe nach Lösungen fragt, und die Geschichte eines Einzelentwicklers,
der eine kostenlose, private App baut.

### Phase 0: Vorbereitung (vor jeder Ankündigung)

- [ ] Store-Eintrag live, mit überarbeiteten Texten und Screenshots in 12 Sprachen
- [ ] Website live (mindestens DE und EN, dann die übrigen Sprachen)
- [x] Platzhalter-Link in den Einstellungen durch `www.missing-hours.app` ersetzt (2026-11-19)
- [x] README aktualisieren (2026-11-19); offen: Store-Badge einfügen, sobald der Eintrag live ist, und ein
      Screenshot der Tagesansicht
- [x] GitHub-Repository-Beschreibung und Topics aktualisiert (2026-11-19)
- [x] Lizenz entschieden: PolyForm Shield 1.0.0 (2026-11-19, Abschnitt 10)
- [x] Englischer Teil von PRIVACY.md an den deutschen angeglichen (2026-11-19)
- [x] Store-Texte in 12 Sprachen um „kostenlos“, Einstiegsfrage, Suchbegriffe und Screenshot-Überschriften
      ergänzt (2026-11-19, [MICROSOFT-STORE.md](MICROSOFT-STORE.md)); Muttersprachler-Prüfung offen
- [ ] Vorzeigbare Beispieldaten für Screenshots: Die heutigen Mock-Daten sind Testfälle („Aggregate to
      visible“, keine Programmsymbole, Hinweis „Sample Data“) und taugen weder für Store noch README

### Phase 1: Launch (2–4 Wochen)

| Kanal | Wie | Botschaft |
| --- | --- | --- |
| AlternativeTo | Eintrag als Alternative zu RescueTime, ManicTime, Memtime, ActivityWatch, Toggl | kostenlos, lokal, automatisch |
| Reddit | r/freelance, r/productivity, r/windows, r/selfhosted (Privatsphäre), r/de_EDV; jeweils Regeln lesen, als Entwickler offen auftreten, Feedback erbitten statt werben | „Ich habe eine kostenlose Zeiterfassung gebaut, die nichts in die Cloud schickt“ |
| Hacker News | „Show HN“ mit dem Local-first-Ansatz und dem öffentlichen Code | Privatsphäre, Technik, ehrliche Grenzen |
| Product Hunt | Launch an einem Dienstag/Mittwoch, mit GIF der Zeitleiste | „Find your missing hours“ |
| LinkedIn / Mastodon | Build-in-public-Beitrag des Entwicklers, mit Screenshot | Die Freitag-Geschichte, persönlich erzählt |
| Download-Portale | heise Download, CHIP, Softpedia, Neowin-Software-Hinweis | Store-Link, kostenlos, keine Werbung |
| Freelancer-Communities | freelancermap, Malt-Community, Selbstständigen-Foren und -Newsletter | Stunden zurückholen |

### Phase 2: Dauerhaft

- Ratgeber-Seiten auf der Website (Abschnitt 7), eine pro Monat, in DE und EN zuerst.
- Jede neue Version als kurze Nutzer-Nachricht: Store-„Neuigkeiten“, GitHub Release, ein Social-Beitrag.
- Lokale Märkte gezielt angehen, in denen 12 Sprachen ein Vorsprung sind (Japan, Korea, Polen, Brasilien):
  Store-Texte von Muttersprachlern prüfen lassen, lokale Download-Portale.
- Kleine YouTube- und Blog-Autoren zu Produktivität und Freelancing anschreiben (kein Geld, aber eine
  kostenlose App ohne Haken ist eine gute Geschichte).

---

## 10. Entscheidungen, die das Marketing braucht

| Thema | Warum es wichtig ist | Empfehlung |
| --- | --- | --- |
| **Lizenz** ✅ | Entschieden am 2026-11-19: **PolyForm Shield 1.0.0**. Ziele: weite Verbreitung, niemand anderes darf die App verkaufen, später sind Bezahl-Extras oder Spenden möglich. Jeder darf die App nutzen (auch beruflich) und den Code ansehen und anpassen; verboten ist ein Konkurrenzprodukt, auch ein kostenloses. Name und Icon sind nicht lizenziert | Im Marketing „Quellcode offen einsehbar“, nie „Open Source“. In Entwickler-Communities (HN, r/selfhosted) die Wahl offen erklären: kostenlos für alle, Code prüfbar, nur Kopien zum Verkauf sind ausgeschlossen. Beiträge Dritter brauchen vorher eine Zustimmung (CLA), damit die Rechte für spätere Bezahl-Extras bei dir bleiben |
| **„Für immer kostenlos“** | Stärkstes Vertrauensargument, aber nur als feste Zusage | Entweder zusagen oder bei „kostenlos, ohne Abo, ohne Werbung“ bleiben |
| **macOS** | README nennt macOS, Store ist Windows-only; ein unsignierter Mac-Build erzeugt Gatekeeper-Warnungen und schlechte erste Eindrücke | Bis zur Prüfung nur Windows bewerben |
| **Export (CSV)** | Die Hauptzielgruppe will abrechnen; „Kann ich exportieren?“ wird die häufigste Frage | Größter Hebel für Empfehlungen; im Marketing erst nennen, wenn es ihn gibt |
| **Aufbewahrung 30 Tage** | Monatsabrechnung braucht den ganzen Vormonat; 30 Tage reichen knapp | Kommunizieren wie es ist; Wunsch nach längerer Aufbewahrung beobachten |
| **Bewertungs-Bitte in der App** | Größter Hebel für das Store-Ranking | Einmal nach ca. 7 erfassten Tagen, nur Store-Version |
| **Domain** ✅ | Website, Store-Eintrag und Einstellungen brauchen eine Adresse | `www.missing-hours.app` (2026-11-19) |

---

## 11. Erfolg messen (ohne die App zu tracken)

Missing Hours selbst sendet keine Daten, und das bleibt so. Gemessen wird nur außerhalb der App:

| Messgröße | Quelle | Ziel nach 6 Monaten (Richtwert) |
| --- | --- | --- |
| Store-Installationen | Partner Center | stetig steigend, Kurve nach jedem Kanal-Schritt ansehen |
| Durchschnittliche Bewertung | Partner Center | ≥ 4,5 bei ≥ 50 Bewertungen |
| Downloads der GitHub-Releases | GitHub API (Download-Zähler der Assets) | wächst mit |
| GitHub-Sterne | GitHub | 100+ |
| Erwähnungen | AlternativeTo-Likes, Reddit-Threads, Artikel | Erste Erwähnungen ohne eigenes Zutun |
| Website-Besuche | Server-Logs, cookielos | Verhältnis Besuche → Store-Klicks |

Qualitatives Feedback (Bewertungen, GitHub Issues, Reddit-Kommentare) ist genauso wichtig wie die Zahlen:
Daraus kommt, was als Nächstes gebaut wird.

---

## 12. Kurzfassung für Texter

- **Wer:** Menschen, die am Windows-PC arbeiten und ihre Stunden nachweisen oder abrechnen müssen.
- **Was:** Automatische Zeiterfassung als Tageszeitleiste.
- **Warum wir:** automatisch, privat, klar, kostenlos.
- **Headline:** „Finde deine verlorenen Stunden.“ / “Find your missing hours.”
- **Ton:** du, ruhig, ehrlich, konkret, ein kleines Augenzwinkern.
- **Nie versprechen:** Export, Rechnungen erstellen, Projekte, Teams-Meetings, Mac/Linux, Zahlen ohne Beleg,
  „Open Source“ (die Lizenz ist source-available).
- **Immer erwähnen:** kostenlos, kein Konto, Daten bleiben auf dem PC.
- **Jede Sprache:** Neue Website- oder Store-Texte gibt es in allen 12 Sprachen, wie die App.

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

## Angaben für die erste Einreichung

- **Preis und Verfügbarkeit:** kostenlos, alle Märkte
- **Eigenschaften:** Kategorie „Produktivität“; „Diese App greift auf persönliche Informationen zu“: ja,
  Datenschutz-URL `https://github.com/bunterWolf/Missing-Hours/blob/main/PRIVACY.md`
- **Altersfreigabe:** Fragebogen ausfüllen; keine Kommunikation zwischen Nutzern, keine Käufe, keine
  Inhalte von Nutzern, keine Standortdaten
- **Eingeschränkte Funktion `runFullTrust`:** Partner Center fragt nach einer Begründung, zum Beispiel:
  > Missing Hours is a desktop time tracker built with Electron. It needs full trust to read the active window
  > (title and executable) through Win32 APIs, to read the system idle time and to start with Windows. All
  > data stays on the device.
- **Store-Einträge:** einen pro Sprache des Pakets (12, siehe `build.appx.languages` in `package.json`), Texte
  unten, mindestens ein Screenshot (PNG, mindestens 1366×768). Gute Motive: Tagesansicht mit Zeitleiste in hell
  und dunkel, Einstellungen. `npm run screenshots` liefert die App-Ansichten pro Sprache als Ausgangsmaterial
  (`screenshots/<sprache>/`). Die Datenschutz-URL ist für alle Sprachen dieselbe (Deutsch und Englisch).
  Eine neue Sprache in der App braucht hier auch ihren Store-Text.

### Store-Texte

**Deutsch**

> **Kurzbeschreibung:** Automatische Zeiterfassung für deinen PC. Missing Hours zeichnet auf, woran du arbeitest,
> und zeigt deinen Tag als Zeitleiste. Alles bleibt lokal auf deinem Computer.
>
> **Beschreibung:** Missing Hours erfasst automatisch, welche Programme und Fenster du nutzt und wann du nicht am
> Rechner bist. Daraus entsteht für jeden Tag eine übersichtliche Zeitleiste, mit der du Arbeitszeiten
> nachvollziehen und Rechnungen schreiben kannst, ohne eine Stoppuhr zu starten.
>
> - Läuft im Hintergrund und startet mit Windows
> - Erkennt Pausen und Abwesenheit automatisch
> - Zeitleiste pro Tag mit den Symbolen deiner Programme
> - Helles und dunkles Design
> - Datenschutz zuerst: keine Cloud, kein Konto, keine Telemetrie. Deine Daten verlassen deinen Computer nie.

**English**

> **Short description:** Automatic time tracking for your PC. Missing Hours records what you work on and shows
> your day as a timeline. Everything stays on your computer.
>
> **Description:** Missing Hours automatically records which programs and windows you use and when you are away
> from your computer. It turns this into a clear timeline for every day, so you can review your working hours
> and write invoices without starting a stopwatch.
>
> - Runs in the background and starts with Windows
> - Detects breaks and absence automatically
> - Daily timeline with your programs' icons
> - Light and dark theme
> - Privacy first: no cloud, no account, no telemetry. Your data never leaves your computer.

**Français**

> **Description courte :** Suivi automatique du temps sur ton PC. Missing Hours enregistre ce sur quoi tu
> travailles et affiche ta journée sous forme de frise chronologique. Tout reste sur ton ordinateur.
>
> **Description :** Missing Hours enregistre automatiquement les programmes et fenêtres que tu utilises et les
> moments où tu n’es pas devant ton ordinateur. Il en tire une frise claire pour chaque journée, pour retrouver
> tes heures de travail et rédiger tes factures sans lancer de chronomètre.
>
> - Fonctionne en arrière-plan et démarre avec Windows
> - Détecte automatiquement les pauses et les absences
> - Frise quotidienne avec les icônes de tes programmes
> - Thème clair et sombre
> - Confidentialité d’abord : pas de cloud, pas de compte, pas de télémétrie. Tes données ne quittent jamais ton ordinateur.

**Español**

> **Descripción breve:** Registro automático del tiempo en tu PC. Missing Hours registra en qué trabajas y
> muestra tu día como una línea de tiempo. Todo se queda en tu ordenador.
>
> **Descripción:** Missing Hours registra automáticamente qué programas y ventanas usas y cuándo no estás
> delante del ordenador. Con ello crea una línea de tiempo clara de cada día, para que puedas revisar tus
> horas de trabajo y emitir facturas sin poner en marcha un cronómetro.
>
> - Funciona en segundo plano y se inicia con Windows
> - Detecta pausas y ausencias automáticamente
> - Línea de tiempo diaria con los iconos de tus programas
> - Tema claro y oscuro
> - La privacidad primero: sin nube, sin cuenta, sin telemetría. Tus datos nunca salen de tu ordenador.

**Italiano**

> **Descrizione breve:** Registrazione automatica del tempo sul tuo PC. Missing Hours registra su cosa lavori e
> mostra la tua giornata come una timeline. Tutto resta sul tuo computer.
>
> **Descrizione:** Missing Hours registra automaticamente quali programmi e finestre usi e quando non sei al
> computer. Ne ricava una timeline chiara per ogni giornata, così puoi ricostruire le ore di lavoro e scrivere
> fatture senza avviare un cronometro.
>
> - Funziona in background e si avvia con Windows
> - Riconosce automaticamente pause e assenze
> - Timeline giornaliera con le icone dei tuoi programmi
> - Tema chiaro e scuro
> - Privacy prima di tutto: niente cloud, niente account, niente telemetria. I tuoi dati non lasciano mai il tuo computer.

**Português (Brasil)**

> **Descrição curta:** Registro automático de tempo para o seu PC. O Missing Hours registra no que você trabalha
> e mostra o seu dia como uma linha do tempo. Tudo fica no seu computador.
>
> **Descrição:** O Missing Hours registra automaticamente quais programas e janelas você usa e quando você não
> está no computador. Com isso, cria uma linha do tempo clara para cada dia, para você conferir suas horas de
> trabalho e emitir faturas sem precisar iniciar um cronômetro.
>
> - Funciona em segundo plano e inicia com o Windows
> - Detecta pausas e ausências automaticamente
> - Linha do tempo diária com os ícones dos seus programas
> - Tema claro e escuro
> - Privacidade em primeiro lugar: sem nuvem, sem conta, sem telemetria. Seus dados nunca saem do seu computador.

**Nederlands**

> **Korte beschrijving:** Automatische tijdregistratie voor je pc. Missing Hours legt vast waaraan je werkt en
> toont je dag als tijdlijn. Alles blijft op je computer.
>
> **Beschrijving:** Missing Hours registreert automatisch welke programma’s en vensters je gebruikt en wanneer
> je niet achter je computer zit. Daarvan maakt het voor elke dag een overzichtelijke tijdlijn, zodat je je
> werkuren kunt nagaan en facturen kunt maken zonder een stopwatch te starten.
>
> - Draait op de achtergrond en start met Windows
> - Herkent pauzes en afwezigheid automatisch
> - Dagelijkse tijdlijn met de pictogrammen van je programma’s
> - Licht en donker thema
> - Privacy voorop: geen cloud, geen account, geen telemetrie. Je gegevens verlaten je computer nooit.

**Polski**

> **Krótki opis:** Automatyczna rejestracja czasu na Twoim komputerze. Missing Hours zapisuje, nad czym
> pracujesz, i pokazuje Twój dzień jako oś czasu. Wszystko zostaje na Twoim komputerze.
>
> **Opis:** Missing Hours automatycznie rejestruje, z jakich programów i okien korzystasz oraz kiedy nie ma Cię
> przy komputerze. Na tej podstawie tworzy przejrzystą oś czasu dla każdego dnia, dzięki której odtworzysz
> godziny pracy i wystawisz faktury bez włączania stopera.
>
> - Działa w tle i uruchamia się razem z systemem Windows
> - Automatycznie wykrywa przerwy i nieobecność
> - Dzienna oś czasu z ikonami Twoich programów
> - Jasny i ciemny motyw
> - Prywatność przede wszystkim: bez chmury, bez konta, bez telemetrii. Twoje dane nigdy nie opuszczają komputera.

**日本語**

> **短い説明:** PC 向けの自動タイム トラッキング。Missing Hours は作業内容を記録し、1 日をタイムラインで
> 表示します。データはすべてお使いのコンピューターに保存されます。
>
> **説明:** Missing Hours は、使用しているプログラムやウィンドウ、そして PC から離れている時間を自動的に
> 記録します。それをもとに 1 日ごとのわかりやすいタイムラインを作成するので、ストップウォッチを使わずに
> 作業時間を振り返り、請求書を作成できます。
>
> - バックグラウンドで動作し、Windows と一緒に起動
> - 休憩や離席を自動的に検出
> - プログラムのアイコン付きの日別タイムライン
> - ライト テーマとダーク テーマ
> - プライバシー重視: クラウドもアカウントもテレメトリもなし。データがコンピューターの外に出ることはありません。

**한국어**

> **간단한 설명:** PC를 위한 자동 시간 기록. Missing Hours는 작업 내용을 기록하고 하루를 타임라인으로
> 보여 줍니다. 모든 데이터는 내 컴퓨터에만 저장됩니다.
>
> **설명:** Missing Hours는 사용하는 프로그램과 창, 그리고 컴퓨터를 떠나 있는 시간을 자동으로 기록합니다.
> 이를 바탕으로 날마다 한눈에 보이는 타임라인을 만들어 주므로, 스톱워치를 켜지 않고도 근무 시간을
> 확인하고 청구서를 작성할 수 있습니다.
>
> - 백그라운드에서 실행되며 Windows와 함께 시작
> - 휴식과 자리 비움을 자동으로 감지
> - 프로그램 아이콘이 표시되는 일별 타임라인
> - 밝은 테마와 어두운 테마
> - 개인정보 보호 우선: 클라우드, 계정, 원격 분석이 없습니다. 데이터가 컴퓨터 밖으로 나가지 않습니다.

**中文（简体）**

> **简短说明：** 为你的电脑提供自动时间记录。Missing Hours 记录你在做什么，并以时间轴展示你的一天。
> 所有数据都保存在你的电脑上。
>
> **说明：** Missing Hours 会自动记录你使用了哪些程序和窗口，以及你何时不在电脑前。它据此为每一天生成清晰的
> 时间轴，让你无需启动秒表就能回顾工作时间并开具发票。
>
> - 在后台运行，随 Windows 启动
> - 自动识别休息和离开
> - 带有程序图标的每日时间轴
> - 浅色和深色主题
> - 隐私优先：没有云端、没有账户、没有遥测。你的数据永远不会离开你的电脑。

**中文（繁體）**

> **簡短說明：** 為你的電腦提供自動時間記錄。Missing Hours 會記錄你在做什麼，並以時間軸呈現你的一天。
> 所有資料都保存在你的電腦上。
>
> **說明：** Missing Hours 會自動記錄你使用了哪些程式和視窗，以及你何時不在電腦前。它據此為每一天產生清楚的
> 時間軸，讓你不必啟動碼錶就能回顧工作時數並開立發票。
>
> - 在背景執行，隨 Windows 啟動
> - 自動偵測休息和離開
> - 附有程式圖示的每日時間軸
> - 淺色和深色主題
> - 隱私優先：沒有雲端、沒有帳戶、沒有遙測。你的資料永遠不會離開你的電腦。

## Lokal bauen und testen

```bash
npm run dist:store
```

Das Paket landet in `release/<version>/Missing-Hours-Store-<version>-x64.appx`.

Die Kacheln in `resources/appx/` (StoreLogo 50, Square44x44, Square150x150, Wide310x150) erzeugt
`npm run icons` aus `resources/icon-source/icon.svg`, nicht von Hand bearbeiten. Für die Store-Einträge im
Partner Center (Logos unter **Store-Einträge**) lässt sich `resources/icon.png` (1024 × 1024) hochladen.

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

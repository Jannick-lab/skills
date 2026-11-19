# JARVIS

Sci-Fi-HUD-Dashboard mit Sprachassistent. Du stellst Jarvis eine Frage (getippt oder gesprochen),
Claude (Anthropic) antwortet, und Jarvis spricht die Antwort mit ElevenLabs aus.

## Start

1. Node.js 18 oder neuer installieren (`node -v` prüfen). Weitere Pakete sind nicht nötig.
2. `einstellungen.txt` öffnen und beide Keys eintragen:
   - `ELEVENLABS_API_KEY` von https://elevenlabs.io (Profil, API Keys)
   - `ANTHROPIC_API_KEY` von https://console.anthropic.com (API Keys)
3. Server starten:
   - Mac: Doppelklick auf `start-mac.command`
   - Windows: Doppelklick auf `start-windows.bat`
   - oder im Terminal: `node server.js`
4. Im Browser `http://localhost:3000` öffnen.

Die Keys können statt in der Datei auch als Umgebungsvariablen `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`
und `ACCESS_CODE` gesetzt werden. Sie bleiben im Server und gelangen nie in den Browser.

**Wichtig:** `einstellungen.txt` mit echten Keys niemals in ein öffentliches Repository hochladen.

## Im Internet betreiben (zum Beispiel für das iPad)

Auf dem iPad läuft Node.js nicht. Darum läuft der Server bei einem Hosting-Dienst, und das iPad öffnet
dessen HTTPS-Adresse. Nur über HTTPS funktioniert die Mikrofon-Taste in Safari.

**Zugangscode:** Sobald der Server von außen erreichbar ist, ist `ACCESS_CODE` Pflicht. Ohne Code startet er
nicht. Wer die Adresse kennt, sieht nur eine Code-Abfrage. Danach merkt sich der Browser den Zugang 30 Tage.
Nach 5 falschen Versuchen ist die Adresse 15 Minuten gesperrt. Wähle mindestens 12 Zeichen.

**Beispiel Render (render.com):**
1. Neuen **Web Service** anlegen und das GitHub-Repository verbinden.
2. **Branch:** der Branch mit `jarvis-app`. **Root Directory:** `jarvis-app`. **Runtime:** Node.
3. **Build Command:** `npm install` (installiert nichts). **Start Command:** `node server.js`.
4. Unter **Environment** diese Variablen setzen (nicht ins Repository schreiben):
   `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`, `ACCESS_CODE`. Optional `MODEL`, `VOICE_ID`.
5. Deploy starten, dann die `https://…onrender.com`-Adresse auf dem iPad öffnen, Code eingeben.
   Tipp: In Safari über „Teilen → Zum Home-Bildschirm“ als Symbol ablegen.

Der Dienst liest `PORT` selbst und hört dann auf allen Adressen. Die Adresse `/healthz` antwortet mit `ok`
und kann als Health Check dienen. Kostenlose Tarife schlafen nach einiger Zeit ein, die erste Anfrage dauert dann länger.
Jede Frage verbraucht Kontingent bei Anthropic und ElevenLabs. Wer den Code kennt, kann also Kosten verursachen.

Lokal im Heimnetz geht es auch: `HOST=0.0.0.0` und `ACCESS_CODE` setzen. Dann klappt Tippen und Sprachausgabe,
aber die Mikrofon-Taste nicht, weil Safari dafür HTTPS verlangt.

## Einstellungen

| Zeile | Bedeutung | Standard |
|---|---|---|
| `ANTHROPIC_API_KEY` | Key für die Antworten | Platzhalter |
| `MODEL` | Claude-Modell | `claude-haiku-5-5` (schnell) |
| `ELEVENLABS_API_KEY` | Key für die Stimme | Platzhalter |
| `STIMME` | `auto` = ElevenLabs, bei Fehlern spricht der Browser; `elevenlabs` = nur ElevenLabs; `browser` = nur Browser | `auto` |
| `ICAL_URL` | geheime iCal-Adresse deines Kalenders (nur lesen) | Platzhalter (aus) |
| `ZEITZONE` | Zeitzone für Termine | `Europe/Berlin` |
| `NEWS_FEED_URL` | RSS-Feed für Schlagzeilen | Tagesschau |
| `MAIL_USER` / `MAIL_PASSWORT` | E-Mail-Adresse und App-Passwort für den Posteingang (nur lesen) | Platzhalter (aus) |
| `MAIL_HOST` | IMAP-Server, nur nötig außer bei web.de, gmx, gmail, icloud | automatisch |
| `WETTER_ORT` | Standardort für Wetterfragen, z. B. `Hamburg` | leer |
| `VOICE_ID` / `MODEL_ID` | Stimme und ElevenLabs-Modell | siehe Datei |
| `ACCESS_CODE` | Zugangscode, Pflicht bei Betrieb im Internet | Platzhalter (aus) |
| `HOST` | `127.0.0.1` = nur dieser Rechner, `0.0.0.0` = von außen | `127.0.0.1` |
| `PORT` | Port des Servers (Hosting-Dienste setzen ihn selbst) | `3000` |

Nach jeder Änderung den Server neu starten.

## Bedienung

- Frage ins Eingabefeld tippen und auf **Senden** tippen oder Enter drücken.
- **Mikrofon-Taste:** einmal tippen, Frage sprechen. Sie wird automatisch abgeschickt.
  Die Taste erscheint nur in Browsern mit Spracherkennung (Chrome, Edge, Safari). Chrome und Edge schicken
  das Audio dafür an den Dienst des Browser-Herstellers. Im Firefox fehlt die Taste, Tippen geht immer.
- Status: **DENKT …** während die Antwort geladen wird, **ERZEUGE STIMME …**, dann **SPRICHT**.
  Der Kern pulsiert nur, solange das Audio läuft.
- Jarvis bekommt bei jeder Frage Datum, Uhrzeit, deine Aufgaben aus dem Dashboard und die letzten
  etwa 10 Nachrichten des Gesprächs. Der Verlauf liegt nur im Browser und ist nach einem Neuladen weg.
- **Wetter:** Jarvis kann das aktuelle Wetter und die Vorhersage für drei Tage abrufen (Open-Meteo, kein Key).
  Trage deinen Ort bei `WETTER_ORT` ein (auf Render als Umgebungsvariable). Fragen wie „Brauche ich morgen einen Regenschirm?“
  oder „Wie ist das Wetter in München?“ klappen dann. Dabei geht nur der Ortsname an Open-Meteo.
- **Wetter-Kachel:** echte Daten für `WETTER_ORT` (Temperatur, Wetter, Feuchte, Wind, Regenrisiko heute), alle 10 Minuten neu.
- **Kalender:** Mit `ICAL_URL` zeigt die Kachel die heutigen Termine, sonst die nächsten. Jarvis kennt sie und beantwortet Fragen dazu.
  Nur lesen. Unterstützt werden Ganztags- und Zeittermine, Zeitzonen sowie einfache Wiederholungen (täglich, wöchentlich,
  monatlich am Datum, jährlich, mit Ausnahmen). Komplexe Regeln wie „jeden zweiten Freitag im Monat“ zeigt er nur einmal.
  Die Adresse bekommst du bei Google unter Kalender-Einstellungen, „Geheime Adresse im iCal-Format“. Sie gibt Zugriff auf deine
  Termine, setze sie nur als Umgebungsvariable und nie ins Repository.
- **Termine vorschlagen:** Sag „Trag morgen um 15 Uhr Zahnarzt ein“. Jarvis zeigt eine Karte mit dem Vorschlag. Mit **In Kalender übernehmen**
  öffnest du eine Kalenderdatei (.ics), und dein Gerät fragt, in welchen Kalender der Termin soll. Erst dein Tipp trägt ihn ein.
  Jarvis hat keinen Schreibzugriff auf deinen Kalender und braucht dafür keine Zugangsdaten. Gelöscht oder geändert wird nichts.
- **Nachrichten:** Schlagzeilen aus `NEWS_FEED_URL`, Jarvis kann sie vorlesen. Die Texte sind fremde Daten.
- **Aufgaben:** Du kannst sie in der Kachel anlegen, abhaken und löschen oder Jarvis bitten („Setz Milch kaufen auf die Liste“,
  „Hak Zahnarzt ab“). Die Liste wird **im Browser dieses Geräts** gespeichert (nicht auf dem Server) und bleibt nach dem Neuladen.
  Auf einem anderen Gerät ist sie leer. Löschst du die Website-Daten in Safari, ist sie weg.
- **E-Mail:** Mit `MAIL_USER` und `MAIL_PASSWORT` zeigt Jarvis die ungelesenen Mails (nur Absender, Betreff, Datum) und
  beantwortet Fragen dazu („Habe ich neue Mails?“). Er liest nie den Inhalt, markiert nichts als gelesen, sendet und löscht nichts.
  Der Abruf läuft per IMAP über Port 993. Absender und Betreff gehen an Anthropic, sobald du danach fragst. Nimm ein App-Passwort,
  nie dein Hauptpasswort, und setze beides nur als Umgebungsvariable.
- Die Schnellbefehle (Uhrzeit, Aufgaben …) werden weiter direkt gesprochen, ohne Anthropic.

## Stimme

Jarvis spricht mit ElevenLabs. Der kostenlose ElevenLabs-Tarif wird für Server im Internet (zum Beispiel Render)
oft gesperrt („detected_unusual_activity“, HTTP 401). Dann hilft ein bezahlter ElevenLabs-Tarif oder die
**Stimme des Browsers**: Mit `STIMME=auto` (Standard) fällt Jarvis nach einem Fehler automatisch darauf zurück
und versucht ElevenLabs in dieser Sitzung nicht erneut. Mit `STIMME=browser` wird ElevenLabs gar nicht benutzt
(kein ElevenLabs-Key nötig). Die Browser-Stimme klingt nüchterner und hängt vom Gerät ab.

## Mikrofon klappt nicht (iPad)

- Öffne Jarvis als normale Seite in **Safari**. Aus einem Symbol auf dem Home-Bildschirm startet die Spracherkennung auf dem iPad
  meist, liefert aber nichts.
- Schalte unter **Einstellungen > Allgemein > Tastatur** die **Diktierfunktion** ein (Sprache Deutsch).
- Erlaube das Mikrofon unter „aA“ > **Website-Einstellungen > Mikrofon**.
- Immer möglich: ins Eingabefeld tippen, das **Mikrofon der Tastatur** benutzen und dann **Senden** tippen.

## Fehlermeldungen

Das Dashboard zeigt verständliche Meldungen, zum Beispiel bei fehlendem oder ungültigem Key,
fehlendem Internet, erreichtem Limit, aufgebrauchtem Guthaben, unbekanntem Modell oder gesperrtem Mikrofon.
Konnte die Stimme nicht erzeugt werden, bleibt die Antwort als Text stehen.

## Schnelltest

1. Server starten. Im Terminal stehen beide Keys als „gefunden“, sonst „FEHLT“.
2. `http://localhost:3000/api/status` zeigt `{"keySet":true,"chatKeySet":true,"model":"claude-haiku-5-5"}`.
3. Ins Eingabefeld „Wie viele Aufgaben sind offen?“ tippen. Jarvis nennt die offenen Aufgaben.
4. Im Terminal, ohne Browser:

   ```
   curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d "{\"question\":\"Wie spät ist es?\"}"
   ```

   Antwort: `{"reply":"…"}`.

## Kosten

Jede Frage ist ein Aufruf bei Anthropic und ein Aufruf bei ElevenLabs. Die Länge ist begrenzt
(Antwort höchstens 300 Token, Sprachausgabe höchstens 600 Zeichen).

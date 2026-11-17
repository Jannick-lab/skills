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
- Kalender, Wetter und Nachrichten im Dashboard sind Platzhalter. Jarvis kennt sie nicht und sagt das auch.
- Die Schnellbefehle (Uhrzeit, Aufgaben …) werden weiter direkt gesprochen, ohne Anthropic.

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

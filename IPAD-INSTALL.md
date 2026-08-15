# He-Man Run & Fight — Detaillierter Installationsplan (iPad)

Dieses Spiel ist **keine App-Store-App**, sondern eine **Progressive Web App (PWA)**.  
Du installierst sie auf dem iPad über **Safari → Zum Home-Bildschirm**. Danach startet sie wie eine normale App (eigenes Icon, Vollbild).

Fertiges Paket: `dist/he-man-ipad.zip`

---

## 1. Was du brauchst

| Bedarf | Details |
|--------|---------|
| iPad | mit aktuellem iPadOS |
| Browser | **Safari** (Chrome/Firefox reichen für Home-Bildschirm nicht zuverlässig) |
| Mac (oder PC) | zum Ausliefern der Dateien im WLAN **oder** ein HTTPS-Hosting |
| WLAN | iPad und Mac im **selben WLAN** (bei lokaler Variante) |
| Paket | `he-man-ipad.zip` entpackt |

**Wichtig:** Die `index.html` einfach in der Dateien-App öffnen reicht **nicht**. Safari braucht eine echte Adresse (`http://…` oder `https://…`).

---

## 2. Überblick der Wege

```text
Variante A (empfohlen zum Testen):  Mac startet Mini-Server  →  iPad öffnet IP  →  Home-Bildschirm
Variante B (dauerhaft):             GitHub Pages / Hosting →  iPad öffnet URL →  Home-Bildschirm
Variante C (nur kurz teilen):       Tunnel-URL (z. B. ngrok) → wie B
```

Für den Alltag zu Hause reicht **Variante A**.  
Für „immer verfügbar, auch ohne Mac an“ → **Variante B**.

---

## 3. Variante A — Installation über den Mac (Schritt für Schritt)

### Schritt A1 — ZIP entpacken

1. Finde die Datei `he-man-ipad.zip` (im Projekt unter `dist/`).
2. Doppelklick zum Entpacken.
3. Du solltest einen Ordner `he-man-ipad` sehen mit u. a.:
   - `index.html`
   - `css/`, `js/`, `icons/`
   - `manifest.webmanifest`
   - `sw.js`
   - `IPAD-INSTALL.md`

### Schritt A2 — Mini-Webserver starten

1. **Terminal** öffnen (Programme → Dienstprogramme → Terminal).
2. In den entpackten Ordner wechseln. Beispiel:

```bash
cd ~/Downloads/he-man-ipad
```

Oder, wenn du im Projekt arbeitest:

```bash
cd "/Users/hans/Documents/GitHub/medismile-website/He-man run and fight/dist/he-man-ipad"
```

3. Server starten:

```bash
python3 -m http.server 8080
```

4. Es sollte ungefähr stehen:

```text
Serving HTTP on :: port 8080 ...
```

**Diesen Terminal-Tab offen lassen**, solange das iPad die App laden / aktualisieren soll.

### Schritt A3 — IP-Adresse des Macs finden

**Methode 1 (einfach):**
1. Systemeinstellungen → **Netzwerk**
2. Aktives WLAN auswählen
3. Details → IP-Adresse notieren, z. B. `192.168.0.42`

**Methode 2 (Terminal):**

```bash
ipconfig getifaddr en0
```

Falls leer:

```bash
ipconfig getifaddr en1
```

### Schritt A4 — Auf dem iPad in Safari öffnen

1. iPad entsperren, **Safari** öffnen (nicht Chrome).
2. In die Adresszeile tippen (Beispiel):

```text
http://192.168.0.42:8080
```

Ersetze `192.168.0.42` durch **deine** Mac-IP.

3. Laden. Du solltest den Startbildschirm sehen:  
   **„By the power of Grayskull!“**

**Wenn die Seite nicht lädt**, siehe Abschnitt 6 (Fehlerbehebung).

### Schritt A5 — Auf den Home-Bildschirm legen

1. In Safari unten (oder oben) auf **Teilen** tippen  
   (Quadrat mit Pfeil nach oben).
2. Nach unten scrollen.
3. **Zum Home-Bildschirm** / **Add to Home Screen** wählen.
4. Name prüfen: z. B. `He-Man` → **Hinzufügen**.
5. Zurück zum Home-Bildschirm: neues Icon **He-Man** erscheint.

### Schritt A6 — App starten und spielen

1. Icon **He-Man** antippen.
2. Die App öffnet sich **ohne Safari-Leiste** (Standalone/Vollbild).
3. Tippen zum Start.
4. He-Man läuft **passiv von allein**. Du steuerst STOP / REN / JUMP / Kampf.

### Schritt A7 — Optional: Mac-Server danach

- Zum **ersten Installieren** und für **Updates** muss der Mac-Server erreichbar sein.
- Nach erfolgreicher Installation kann die App oft **offline** aus dem Cache starten.
- Für ein frisches Update: Server wieder starten → App einmal online öffnen (oder Icon neu anlegen).

---

## 4. Variante B — Dauerhaft über GitHub Pages (HTTPS)

Ideal, wenn das iPad die App **ohne laufenden Mac** nutzen soll.  
Ausführliche Anleitung: **[docs/VARIANT-B.md](./docs/VARIANT-B.md)**

### Ziel-URL

```text
https://109fifty.github.io/he-man-run-and-fight/
```

### B1 — Einmalig am Mac deployen

Voraussetzung: [GitHub CLI](https://cli.github.com/) + `gh auth login`

```bash
cd "/Users/hans/Documents/GitHub/medismile-website/He-man run and fight"
chmod +x scripts/setup-github-pages.sh scripts/publish-root-redirect.sh
./scripts/setup-github-pages.sh
```

Das Skript pusht `main` und aktiviert GitHub Pages als **Deploy from branch** (`main` / `/`).  
Kurz-URL `https://109fifty.github.io/` leitet auf die Ziel-URL um.

Manuell: siehe `docs/VARIANT-B.md`.

### B2 — Auf dem iPad installieren

1. 1–2 Minuten auf den Pages-Build warten.
2. Safari → `https://109fifty.github.io/he-man-run-and-fight/`
3. **Teilen → Zum Home-Bildschirm → Hinzufügen**
4. Icon **He-Man** starten

**Vorteil:** HTTPS, Offline-Cache, Mac muss danach nicht laufen.

---

## 5. Variante C — Kurz teilen (ohne Port-Freigabe)

Wenn iPad und Mac nicht im selben Netz sind oder die Firewall blockiert:

1. Auf dem Mac im App-Ordner den Server starten (`python3 -m http.server 8080`).
2. Mit einem Tunnel (z. B. ngrok) eine öffentliche HTTPS-URL erzeugen.
3. Diese URL auf dem iPad in Safari öffnen.
4. Wie oben: **Zum Home-Bildschirm**.

---

## 6. Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| Safari zeigt „Safari kann die Seite nicht öffnen“ | Mac-IP prüfen; Server läuft? Gleicher WLAN-Name (kein Guest-WLAN / kein VPN)? |
| Seite lädt auf dem Mac (`localhost:8080`), aber nicht auf dem iPad | macOS-Firewall: eingehende Verbindungen für Python/Terminal erlauben |
| Kein Menüpunkt „Zum Home-Bildschirm“ | **Safari** nutzen, nicht Chrome; Seite vollständig geladen haben |
| Alte Version nach Update | Hard-Reload in Safari, oder Home-Screen-Icon löschen und neu hinzufügen (Cache `heman-v3`) |
| Schwarzer / leerer Bildschirm | Server-Logs prüfen; alle Dateien aus dem ZIP vorhanden? |
| Touch-Buttons fehlen | App im Querformat halten; über Home-Icon starten (Standalone) |
| Steuerung reagiert nicht | Zuerst Overlay weg tippen (START); STOP hält aktiv an |

**Firewall kurz testen (Mac):**

```bash
# Server läuft bereits auf 8080
# Auf dem iPad nochmal http://<MAC-IP>:8080
```

Systemeinstellungen → Netzwerk → Firewall → Optionen → Terminal/Python erlauben.

---

## 7. Nach der Installation: Steuerung

He-Man **läuft normal von allein**. Vorwärts = rennen. Auf Köpfe springen trifft Gegner.

| Button / Taste | Aktion |
|----------------|--------|
| *(nichts)* | Normal laufen |
| ▶ (vorwärts) | Rennen |
| ◀ | Umdrehen |
| STOP / ↓ | Stehen |
| JUMP / Space | Springen · auf Köpfe = Treffer |
| FAUST / J | Boxen / Schwert |
| TRITT / K | Treten |
| START | Spiel starten |
| R | Level neu |

---

## 8. Checkliste (kurz)

- [ ] `he-man-ipad.zip` entpackt  
- [ ] `python3 -m http.server 8080` im Ordner gestartet  
- [ ] Mac-IP notiert  
- [ ] iPad + Mac im selben WLAN  
- [ ] Safari: `http://<IP>:8080` lädt das Spiel  
- [ ] Teilen → Zum Home-Bildschirm → Hinzufügen  
- [ ] Icon startet im Vollbild  
- [ ] Tippen → He-Man läuft von allein  

---

## 9. Neu packen (für Entwickler)

Im Projektordner:

```bash
./scripts/pack-ipad.sh
```

Erzeugt erneut: `dist/he-man-ipad.zip`

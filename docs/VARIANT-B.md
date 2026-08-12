# Variante B — Dauerhafte iPad-Installation über GitHub Pages

Ziel-URL (nach Setup):

```text
https://109fifty.github.io/he-man-run-and-fight/
```

Danach auf dem iPad: **Safari → Teilen → Zum Home-Bildschirm**.

---

## Einmaliges Setup (am Mac)

### Option 1 — Automatisch (empfohlen)

1. GitHub CLI installieren: https://cli.github.com/
2. Einloggen:

```bash
gh auth login
```

3. Im Projektordner ausführen:

```bash
chmod +x scripts/setup-github-pages.sh
./scripts/setup-github-pages.sh
```

Das Skript:
- erstellt das Repo `109fifty/he-man-run-and-fight` (falls nötig)
- pusht den Code auf `main`
- aktiviert GitHub Pages über den Actions-Workflow

4. Auf GitHub unter **Actions** den Lauf **Deploy GitHub Pages** abwarten (grün).

5. iPad → Safari → `https://109fifty.github.io/he-man-run-and-fight/`  
   → **Teilen → Zum Home-Bildschirm → Hinzufügen**

### Option 2 — Manuell

1. Neues öffentliches Repo auf GitHub anlegen: `he-man-run-and-fight`
2. Lokal:

```bash
cd "/Users/hans/Documents/GitHub/medismile-website/He-man run and fight"
git remote add origin https://github.com/109fifty/he-man-run-and-fight.git
git add -A
git commit -m "Add He-Man Run & Fight PWA with GitHub Pages deploy."
git branch -M main
git push -u origin main
```

3. GitHub → Repo → **Settings → Pages**
4. **Build and deployment → Source**: **GitHub Actions**
5. Workflow `.github/workflows/deploy-pages.yml` läuft bei jedem Push auf `main`
6. Nach grünem Deploy: URL wie oben auf dem iPad öffnen und installieren

---

## Was der Workflow deployed

Nur die Spiel-Dateien (kein ZIP, keine Scripts):

- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `css/`, `js/`, `icons/`
- `.nojekyll`

---

## Updates später

```bash
# Änderungen machen, dann:
git add -A
git commit -m "Update game"
git push
```

1–2 Minuten warten → auf dem iPad die HTTPS-URL einmal in Safari öffnen (oder App neu vom Home-Bildschirm laden). Bei hartnäckigem Cache: Home-Icon löschen und neu hinzufügen.

---

## iPad-Install (kurz)

1. Safari (nicht Chrome)
2. `https://109fifty.github.io/he-man-run-and-fight/`
3. Teilen → **Zum Home-Bildschirm**
4. Icon **He-Man** starten

---

## Hinweise

- Repo sollte **public** sein (einfachste Pages-Nutzung).
- Owner/Repo überschreibbar:

```bash
GITHUB_OWNER=109fifty GITHUB_REPO=he-man-run-and-fight ./scripts/setup-github-pages.sh
```

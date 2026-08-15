# Variante B — GitHub Pages (Legacy / Branch Deploy)

## Offizielle Live-URL

```text
https://109fifty.github.io/he-man-run-and-fight/
```

Kurz-URL `https://109fifty.github.io/` leitet dorthin um.

iPad: **Safari → Teilen → Zum Home-Bildschirm**.

---

## Deploy-Modell (aktuell)

- **Source:** Branch `main`, Ordner `/` (GitHub Pages *legacy* / „Deploy from a branch“)
- **Kein** GitHub-Actions-Workflow nötig (und nicht getrackt)
- Push auf `main` → Pages baut automatisch neu

---

## Einmaliges Setup (Mac)

### Automatisch

```bash
gh auth login
chmod +x scripts/setup-github-pages.sh scripts/publish-root-redirect.sh
./scripts/setup-github-pages.sh
```

Das Skript:

- pusht `main`
- setzt Pages auf **legacy** (`main` / `/`)
- setzt die Repo-Homepage
- aktualisiert den Root-Redirect unter `109fifty.github.io`

### Manuell

1. Öffentliches Repo `he-man-run-and-fight`, Branch `main`
2. GitHub → **Settings → Pages**
3. **Build and deployment → Source:** *Deploy from a branch*
4. Branch: `main` · Folder: `/` · Save
5. URL wie oben im iPad öffnen

---

## Updates

```bash
git add -A
git commit -m "Update game"
git push
```

1–2 Minuten warten, dann Safari neu laden (bei Cache: Home-Icon löschen und neu hinzufügen).

---

## Optional: Vercel

Siehe [VERCEL.md](./VERCEL.md) — zweite HTTPS-URL, parallel zu Pages.

---

## Hinweise

- Repo **public** (einfachste Pages-Nutzung).
- Owner/Repo überschreibbar:

```bash
GITHUB_OWNER=109fifty GITHUB_REPO=he-man-run-and-fight ./scripts/setup-github-pages.sh
```

# Projektabschluss — He-Man Run & Fight

Stand: 2026-08-15 · Branch `main` · Live OK

## Offizielle URLs

| Zweck | URL |
|--------|-----|
| **Kanonisch (Spiel)** | https://109fifty.github.io/he-man-run-and-fight/ |
| Kurz-Redirect | https://109fifty.github.io/ → leitet auf kanonisch um |
| GitHub Repo | https://github.com/109fifty/he-man-run-and-fight |
| Root-Redirect-Repo | https://github.com/109fifty/109fifty.github.io |

PWA-Cache aktuell: `heman-v18` (`sw.js`)

## Was das Spiel umfasst

- **Stufe 1:** 12 Jump-&-Run-Level, Bosse 3/6/9/12, Jump-ins-Tor nach Boss
- **Stufe 2:** 12 Flug-Level, Ausstieg-Endkämpfe, Level 5 stark verlängert/härter
- **Schwierigkeit:** Anfänger 15♥ · Fortgeschritten 10♥ · Profi 5♥
- Touch: D-Pad-Kreuz (STOP Mitte), Faust = stehen, Flug: SCHUSS halten = Dauerschuss
- Fullscreen-Icon **FULL**, schließen: oben links halten → ✕

## Infrastruktur (final)

| System | Status |
|--------|--------|
| GitHub Pages | **legacy** Deploy from branch `main` `/` |
| Actions-Workflow | nicht genutzt (gitignore) |
| Vercel | optional vorbereitet (`vercel.json`, `docs/VERCEL.md`) — noch nicht zwingend deployed |
| Cursor | keine projekt-spezifischen `.cursor`-Rules |

## Wichtige Dateien

- Spiel: `index.html`, `css/`, `js/`, `sw.js`, `manifest.webmanifest`, `icons/`
- iPad-Paket: `dist/he-man-ipad.zip` via `./scripts/pack-ipad.sh`
- Hosting: `scripts/setup-github-pages.sh`, `scripts/publish-root-redirect.sh`
- Docs: `IPAD-INSTALL.md`, `docs/VARIANT-B.md`, `docs/VERCEL.md`

## Nach Cursor-Schließen — Checkliste

1. Working tree clean? `git status`
2. Live im Safari prüfen (Hard-Reload / Home-Icon neu)
3. Optional Zip neu packen: `./scripts/pack-ipad.sh`
4. Optional Vercel: siehe `docs/VERCEL.md`
5. Nächste Session: dieses File + README lesen

## Bekannte Hinweise

- iPad-PWA kann alten SW cachen → Icon löschen, URL neu öffnen, neu zum Home-Bildschirm
- Zwei Origins (Pages vs. optional Vercel) = getrennte PWA-Installationen
- `dist/he-man-ipad/` ist gitignored; ausliefern über `dist/he-man-ipad.zip`

# Vercel (optional)

GitHub Pages bleibt die **kanonische** Live-URL. Vercel ist ein optionaler Zweit-Host (schnelles Preview / Fallback).

## Voraussetzungen

- Node.js + npm
- Vercel-Account: https://vercel.com
- CLI: `npm i -g vercel` oder `npx vercel`

## Erstes Deploy

Im Projektordner:

```bash
npx vercel login
npx vercel --yes
npx vercel --prod --yes
```

`vercel.json` liefert Static-Hosting inkl. `no-cache` für `sw.js` / JS.

## Was deployed wird

Laut `.vercelignore` u. a. **nicht**: `dist/`, `docs/`, `scripts/`, `.git/`.

Deployt werden die PWA-Dateien im Repo-Root (`index.html`, `css/`, `js/`, `icons/`, `sw.js`, `manifest.webmanifest`).

## iPad

Nach dem Prod-Deploy die von Vercel ausgegebene `*.vercel.app`-URL in Safari öffnen → Zum Home-Bildschirm.

Hinweis: Service-Worker und PWA-Scope sind an die jeweilige Origin gebunden — Pages- und Vercel-Installationen sind getrennte Apps.

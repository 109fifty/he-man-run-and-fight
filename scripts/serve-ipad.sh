#!/usr/bin/env bash
# Lokaler Server für iPad (wenn GitHub Pages down ist).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-8080}"
cd "$ROOT"

IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
echo "He-Man lokal für iPad"
echo "Mac und iPad müssen im selben WLAN sein."
if [ -n "${IP:-}" ]; then
  echo "Auf dem iPad in Safari öffnen:"
  echo "  http://${IP}:${PORT}/"
else
  echo "IP nicht gefunden — Systemeinstellungen → Netzwerk prüfen."
  echo "Dann: http://<DEINE-MAC-IP>:${PORT}/"
fi
echo "(Strg+C zum Beenden)"
exec python3 -m http.server "$PORT"

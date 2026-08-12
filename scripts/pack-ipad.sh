#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
NAME="he-man-ipad"
OUT="$DIST/$NAME"
ZIP="$DIST/$NAME.zip"

rm -rf "$OUT" "$ZIP"
mkdir -p "$OUT"

# App-Dateien für Offline/PWA-Install
cp "$ROOT/index.html" "$OUT/"
cp "$ROOT/manifest.webmanifest" "$OUT/"
cp "$ROOT/sw.js" "$OUT/"
cp "$ROOT/IPAD-INSTALL.md" "$OUT/"
cp "$ROOT/README.md" "$OUT/"
cp -R "$ROOT/css" "$OUT/css"
cp -R "$ROOT/js" "$OUT/js"
cp -R "$ROOT/icons" "$OUT/icons"

cd "$DIST"
rm -f "$NAME.zip"
zip -r "$NAME.zip" "$NAME" >/dev/null
echo "OK: $ZIP"
ls -lh "$ZIP"

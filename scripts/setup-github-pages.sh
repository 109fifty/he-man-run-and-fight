#!/usr/bin/env bash
# Variante B vorbereiten: Repo pushen + GitHub Pages (Actions) aktivieren.
# Voraussetzung: gh CLI eingeloggt (`gh auth login`) und git verfügbar.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OWNER="${GITHUB_OWNER:-109fifty}"
REPO_NAME="${GITHUB_REPO:-he-man-run-and-fight}"
VISIBILITY="${GITHUB_VISIBILITY:-public}" # public nötig für kostenlose Project Pages ohne Pro

if ! command -v gh >/dev/null 2>&1; then
  echo "Fehler: GitHub CLI (gh) nicht gefunden. Installieren: https://cli.github.com/"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Bitte zuerst einloggen: gh auth login"
  exit 1
fi

echo "==> Repo: ${OWNER}/${REPO_NAME} (${VISIBILITY})"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init
fi

# Remote anlegen / setzen
if ! git remote get-url origin >/dev/null 2>&1; then
  if gh repo view "${OWNER}/${REPO_NAME}" >/dev/null 2>&1; then
    echo "==> Repo existiert bereits, Remote setzen"
    git remote add origin "https://github.com/${OWNER}/${REPO_NAME}.git"
  else
    echo "==> Repo erstellen"
    gh repo create "${OWNER}/${REPO_NAME}" --"${VISIBILITY}" --source=. --remote=origin --description "He-Man Run & Fight — PWA Jump and Run"
  fi
fi

git add -A
if git diff --cached --quiet; then
  echo "==> Keine neuen Änderungen zum Commit"
else
  git commit -m "$(cat <<'EOF'
Add He-Man Run & Fight PWA with GitHub Pages deploy.

EOF
)"
fi

# Branch main sicherstellen
current="$(git rev-parse --abbrev-ref HEAD)"
if [ "$current" != "main" ]; then
  git branch -M main
fi

echo "==> Push nach origin/main"
git push -u origin main

echo "==> GitHub Pages auf GitHub Actions umstellen"
gh api -X PUT "repos/${OWNER}/${REPO_NAME}/pages" \
  -f build_type=workflow \
  -f source[branch]=main \
  -f source[path]=/ \
  >/dev/null 2>&1 || true

# Actions-Workflow manuell anstoßen falls nötig
gh workflow run deploy-pages.yml -R "${OWNER}/${REPO_NAME}" >/dev/null 2>&1 || true

PAGES_URL="https://${OWNER}.github.io/${REPO_NAME}/"
echo ""
echo "Fertig."
echo "1) Warte 1–2 Minuten auf den Actions-Job „Deploy GitHub Pages“."
echo "2) Öffne auf dem iPad in Safari:"
echo "   ${PAGES_URL}"
echo "3) Teilen → Zum Home-Bildschirm → Hinzufügen"
echo ""
echo "Actions prüfen:"
echo "   https://github.com/${OWNER}/${REPO_NAME}/actions"

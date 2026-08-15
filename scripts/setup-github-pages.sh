#!/usr/bin/env bash
# Variante B: Repo pushen + GitHub Pages (Deploy from branch / legacy) aktivieren.
# Voraussetzung: gh CLI eingeloggt (`gh auth login`) und git verfügbar.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OWNER="${GITHUB_OWNER:-109fifty}"
REPO_NAME="${GITHUB_REPO:-he-man-run-and-fight}"
VISIBILITY="${GITHUB_VISIBILITY:-public}" # public nötig für kostenlose Project Pages ohne Pro
PAGES_URL="https://${OWNER}.github.io/${REPO_NAME}/"

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
Update He-Man Run & Fight PWA for GitHub Pages.

EOF
)"
fi

current="$(git rev-parse --abbrev-ref HEAD)"
if [ "$current" != "main" ]; then
  git branch -M main
fi

echo "==> Push nach origin/main"
git push -u origin main

echo "==> GitHub Pages: Deploy from branch main / (legacy)"
# JSON-Body, damit zsh source[branch] nicht expandiert
gh api -X PUT "repos/${OWNER}/${REPO_NAME}/pages" --input - <<EOF
{
  "build_type": "legacy",
  "source": { "branch": "main", "path": "/" }
}
EOF

gh api -X PATCH "repos/${OWNER}/${REPO_NAME}" -f homepage="${PAGES_URL}" >/dev/null || true
gh api -X POST "repos/${OWNER}/${REPO_NAME}/pages/builds" >/dev/null || true

# Root-Spiegel nur Redirect (eine kanonische URL)
if [ -x "$ROOT/scripts/publish-root-redirect.sh" ]; then
  echo "==> Root github.io → Redirect auf Projekt-URL"
  "$ROOT/scripts/publish-root-redirect.sh" || true
fi

echo ""
echo "Fertig."
echo "1) 1–2 Minuten auf Pages-Build warten."
echo "2) Offizielle URL (iPad Safari):"
echo "   ${PAGES_URL}"
echo "3) Teilen → Zum Home-Bildschirm → Hinzufügen"
echo ""
echo "Pages prüfen:"
echo "   https://github.com/${OWNER}/${REPO_NAME}/settings/pages"

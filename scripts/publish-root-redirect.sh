#!/usr/bin/env bash
# Publiziert https://OWNER.github.io/ als Redirect auf die kanonische Projekt-URL.
set -euo pipefail

OWNER="${GITHUB_OWNER:-109fifty}"
CANONICAL="${CANONICAL_URL:-https://${OWNER}.github.io/he-man-run-and-fight/}"
REPO="${OWNER}.github.io"
SITE="$(mktemp -d)/${REPO}"

mkdir -p "$SITE"
cat > "$SITE/index.html" <<EOF
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0;url=${CANONICAL}" />
    <link rel="canonical" href="${CANONICAL}" />
    <title>He-Man Run &amp; Fight</title>
    <script>location.replace("${CANONICAL}");</script>
    <style>
      body{font-family:system-ui,sans-serif;background:#0b1020;color:#f0c14b;display:grid;place-items:center;min-height:100vh;margin:0}
      a{color:#9cf}
    </style>
  </head>
  <body>
    <p>Weiter zum Spiel: <a href="${CANONICAL}">${CANONICAL}</a></p>
  </body>
</html>
EOF

touch "$SITE/.nojekyll"
cat > "$SITE/README.md" <<EOF
# ${REPO}

Redirect zur kanonischen Spiel-URL:

${CANONICAL}

Spiel-Repo: https://github.com/${OWNER}/he-man-run-and-fight
EOF

cd "$SITE"
git init -b main >/dev/null
git add -A
git -c user.email="${OWNER}@users.noreply.github.com" -c user.name="${OWNER}" \
  commit -m "Redirect root Pages to canonical He-Man game URL." >/dev/null

if gh repo view "${REPO}" >/dev/null 2>&1; then
  git remote add origin "https://github.com/${REPO}.git"
  git push -u origin main --force
else
  gh repo create "${REPO}" --public --source=. --remote=origin --push \
    --description "Redirect to He-Man Run & Fight"
fi

gh api -X PUT "repos/${REPO}/pages" --input - <<EOF >/dev/null 2>&1 || true
{
  "build_type": "legacy",
  "source": { "branch": "main", "path": "/" }
}
EOF

echo "Root Pages → ${CANONICAL}"

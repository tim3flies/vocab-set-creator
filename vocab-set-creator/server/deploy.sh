#!/bin/bash
# Update english.learn8.co from GitHub (tim3flies/vocab-set-creator, main). Run as root: bash /srv/english/deploy.sh
set -euo pipefail
R=/srv/english; T=$(mktemp -d)
curl -fsSL https://codeload.github.com/tim3flies/vocab-set-creator/tar.gz/main | tar xz -C "$T"
S="$T/vocab-set-creator-main/vocab-set-creator"
mkdir -p "$R/public/vocab" "$R/public/api"
for f in index.html store.js cutter.js emoji.js worksheets.html ws-sets.js; do install -m 644 "$S/$f" "$R/public/vocab/$f"; done
install -m 644 "$S/server/api.php" "$R/public/api/index.php"
install -m 644 "$S/server/root-index.html" "$R/public/index.html"
install -m 755 "$S/server/deploy.sh" "$R/deploy.sh"
chown -R serverpilot:serverpilot "$R/public"
rm -rf "$T"; echo "DEPLOYED $(date -u +%FT%TZ)"

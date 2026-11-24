#!/bin/bash
# Update english.learn8.co from GitHub (tim3flies/vocab-set-creator, main). Run as root: bash /srv/english/deploy.sh
set -euo pipefail
R=/srv/english; T=$(mktemp -d)
curl -fsSL https://codeload.github.com/tim3flies/vocab-set-creator/tar.gz/main | tar xz -C "$T"
S="$T/vocab-set-creator-main/vocab-set-creator"
mkdir -p "$R/public/vocab" "$R/public/api"
for f in index.html store.js cutter.js emoji.js scenes.js stories.js worksheets.html ws-sets.js; do install -m 644 "$S/$f" "$R/public/vocab/$f"; done
install -m 644 "$S/server/api.php" "$R/public/api/index.php"
install -m 644 "$S/server/root-index.html" "$R/public/index.html"
install -m 755 "$S/server/deploy.sh" "$R/deploy.sh"
# American IPA lists from the CMU Pronouncing Dictionary (BSD licence) → /cmu/a.json …; rebuilt only when cmu_build.py changes
CB="$S/server/cmu_build.py"; H=$(sha256sum "$CB" | cut -c1-16)
if [ "$(cat "$R/data/cmu.stamp" 2>/dev/null)" != "$H" ]; then
 if curl -fsSL https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict -o "$T/cmu.dict" && python3 "$CB" "$T/cmu.dict" "$R/public/cmu"; then
  curl -fsSL https://raw.githubusercontent.com/cmusphinx/cmudict/master/LICENSE -o "$R/public/cmu/LICENSE.txt" || true; echo "$H" > "$R/data/cmu.stamp"; echo "CMU IPA built"
 else echo "CMU IPA build FAILED (app falls back to dictionaryapi.dev)"; fi
fi
chown -R serverpilot:serverpilot "$R/public"
rm -rf "$T"; echo "DEPLOYED $(date -u +%FT%TZ)"

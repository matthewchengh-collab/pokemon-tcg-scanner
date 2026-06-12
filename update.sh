#!/usr/bin/env bash
# Deploy the scanner: commits index.html and pushes. Live in ~1 min.
# Usage: ./update.sh "what you changed"
set -e
cd "$(dirname "$0")"
MSG="${1:-Update scanner}"
git add -A
if git diff --cached --quiet; then
  echo "No changes to deploy."
  exit 0
fi
git commit -q -m "$MSG"
git push -q
echo "✓ Deployed: $MSG"
echo "  Live in ~1 min → https://matthewchengh-collab.github.io/pokemon-tcg-scanner/"

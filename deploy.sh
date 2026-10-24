#!/usr/bin/env bash
# Déploiement depuis Termux : dépôt GitHub + site (Pages) + APK.
set -e
REPO=champion-des-noms-bibliques
gh auth status
USER=$(gh api user -q .login)
[ -d .git ] || git init -b main
git rm -q --ignore-unmatch scripts/generate-level.js site/level.json seed.sql
git add .
git commit -m "Champion des noms bibliques" || true
if gh repo view "$USER/$REPO" >/dev/null 2>&1; then
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$USER/$REPO.git"
  git push -u origin main
else
  gh repo create "$REPO" --public --source=. --push
fi
gh api -X POST "repos/$USER/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 || true
sleep 3
gh workflow run deploy.yml
gh workflow run apk.yml
echo "Site : https://$USER.github.io/$REPO/"
echo "APK  : https://github.com/$USER/$REPO/releases/tag/latest (dans 6 à 8 min)"

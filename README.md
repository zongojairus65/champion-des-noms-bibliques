# Champion des noms bibliques

Jeu de mots à roue de lettres : trouver les noms bibliques cachés. 1000 niveaux, 1500 noms, fonctionne hors ligne.

- `site/` : le jeu (HTML/JS) et `levels.json` (niveaux pré-générés)
- `mots.json` : les noms (personnes et lieux), du plus connu au moins connu
- `scripts/generate-levels.js` : régénère `site/levels.json` à partir de `mots.json` (`npm run levels`)
- `scripts/build-mots.js` : reconstruit `mots.json` depuis une Bible française JSON (`fr.json`)
- `.github/workflows/deploy.yml` : publie le site (GitHub Pages) à chaque push
- `.github/workflows/apk.yml` : construit l'APK (lancement manuel), publié dans Releases > latest
- `deploy.sh` : déploiement complet depuis Termux

Ajouter des noms : éditer `mots.json`, lancer `node scripts/generate-levels.js`, puis `git add . && git commit -m "noms" && git push`.

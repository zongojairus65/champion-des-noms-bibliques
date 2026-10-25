# Champion des noms bibliques

Jeu de mots à roue de lettres : trouver les noms bibliques cachés. 1000 niveaux, 1500 noms, fonctionne hors ligne.
Mots bonus (kit de couture), défi du jour, bonus quotidien, indices, effets sonores.

- `site/` : le jeu (HTML/JS) et `levels.json` (niveaux pré-générés)
- `mots.json` : les noms (personnes et lieux), du plus connu au moins connu
- `scripts/generate-levels.js` : régénère `site/levels.json` à partir de `mots.json` (`npm run levels`). Règle : la roue contient exactement les lettres du nom le plus long du niveau ; les noms rares deviennent des mots bonus
- `scripts/build-infos.js` + `data/sens.json` : génèrent `site/noms.json` (sens du nom et premier verset, affichés par le bouton « i »)
- `scripts/build-mots.js` : reconstruit `mots.json` depuis une Bible française JSON (`fr.json`)
- `.github/workflows/deploy.yml` : publie le site (GitHub Pages) à chaque push
- `.github/workflows/apk.yml` : construit l'APK (lancement manuel), publié dans Releases > latest
- `deploy.sh` : déploiement complet depuis Termux

Ajouter des noms : éditer `mots.json`, lancer `node scripts/generate-levels.js`, puis `git add . && git commit -m "noms" && git push`.

## Sources des données
- Texte biblique français utilisé pour extraire les noms et les versets : jeu de données `thiagobodruk/bible` (fr_apee).
- Sens et nature (personne, lieu, divinité) des noms : STEPBible-Data, Tyndale House Cambridge (TIPNR et TBESH), licence CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), traduits en français ; les sens vérifiés à la main sont dans `data/sens.json` et passent en priorité.
- Le texte de la Bible n'est pas embarqué dans le jeu : seules les références de versets le sont.

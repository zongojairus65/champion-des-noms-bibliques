# Champion des noms bibliques

Jeu de mots à roue de lettres : trouver les noms bibliques cachés. 1000 niveaux, 1500 noms, fonctionne hors ligne.
Écran de chargement et menu principal (Jouer, Défi du jour, Boutique, Message, Paramètres), mots bonus (kit de couture : ils partent directement dans le panier), mot étoilé (une case par lettre, un niveau au hasard par dizaine, rapporte 50 pièces), défi du jour, bonus quotidien, indices, effets sonores.

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

## APK signée (pour la vente)
1. Une seule fois : `bash scripts/creer-cle.sh` (crée la clé `~/champion-cle.jks` et l'envoie dans les secrets GitHub). Sauvegarde la clé et son mot de passe dans un endroit privé : sans elle, plus de mise à jour possible.
2. À chaque version : `gh workflow run apk.yml`. L'APK signée est publiée dans Releases > latest. Le numéro de version augmente automatiquement, donc une nouvelle version s'installe par-dessus l'ancienne sans effacer la progression.

## Icône et écran de démarrage
`resources/icon.png` (1024 x 1024) est la source unique. `scripts/make-android-assets.py` en tire, à chaque construction de l'APK, les icônes classique, ronde et adaptative d'Android et l'écran de démarrage. Pour changer l'icône, remplace ce fichier puis relance `gh workflow run apk.yml`.

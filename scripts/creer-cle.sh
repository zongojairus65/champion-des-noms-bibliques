#!/usr/bin/env bash
# Crée UNE SEULE FOIS la clé de signature de l'application et l'envoie dans les secrets GitHub.
# Usage (depuis Termux, dans le dossier du projet) : bash scripts/creer-cle.sh
set -e
KS="$HOME/champion-cle.jks"
ALIAS="champion"
if [ -f "$KS" ]; then
  echo "La clé existe déjà : $KS (je ne l'écrase jamais, ce serait perdre les mises à jour)."
  echo "Pour renvoyer ses secrets à GitHub, relance avec : bash scripts/creer-cle.sh --renvoyer"
  [ "$1" = "--renvoyer" ] || exit 1
  echo "Mot de passe de la clé ?"; read -rs PASS; echo
else
  command -v keytool >/dev/null || pkg install -y openjdk-17
  PASS=$(head -c 64 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 24)
  keytool -genkeypair -keystore "$KS" -alias "$ALIAS" -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$PASS" -keypass "$PASS" -dname "CN=Champion des noms bibliques"
fi
# vérification : la clé s'ouvre bien avec ce mot de passe
keytool -list -keystore "$KS" -storepass "$PASS" >/dev/null
gh auth status >/dev/null
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
gh secret set KEYSTORE_B64 --repo "$REPO" --body "$(base64 -w0 "$KS")"
gh secret set KEYSTORE_PASSWORD --repo "$REPO" --body "$PASS"
gh secret set KEY_ALIAS --repo "$REPO" --body "$ALIAS"
gh secret set KEY_PASSWORD --repo "$REPO" --body "$PASS"
if [ -d "$HOME/storage/downloads" ]; then
  cp -n "$KS" "$HOME/storage/downloads/champion-cle.jks"
  printf 'Clé de signature de Champion des noms bibliques\nFichier : champion-cle.jks\nAlias : %s\nMot de passe : %s\n' "$ALIAS" "$PASS" > "$HOME/storage/downloads/champion-cle-MOT-DE-PASSE.txt"
fi
echo
echo "Clé créée et envoyée dans les secrets de $REPO."
echo "SAUVEGARDE OBLIGATOIRE : copie champion-cle.jks et champion-cle-MOT-DE-PASSE.txt"
echo "(dossier Téléchargements) dans un endroit privé (Drive, e-mail à toi-même), puis"
echo "supprime-les du téléphone. Sans cette clé, tu ne pourras plus mettre à jour l'application."

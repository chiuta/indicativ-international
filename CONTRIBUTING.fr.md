# Contribuer — INDICATIV International

[English](CONTRIBUTING.md) · [Română](CONTRIBUTING.ro.md) · **Français** · [Italiano](CONTRIBUTING.it.md) · [Español](CONTRIBUTING.es.md) · [Português](CONTRIBUTING.pt.md) · [Deutsch](CONTRIBUTING.de.md) · [Magyar](CONTRIBUTING.hu.md)

Version : 0.2.1 · Dernière mise à jour : 2026-11-20

1. Faites un fork de ce dépôt.
2. Copiez `data/packs/example.json` vers `data/packs/<id-de-votre-paquet>.json` (le nom du fichier est l’identifiant du paquet) et remplissez-le, ou transformez un tableau en paquet avec `node scripts/import_csv.mjs` (voir `docs/contributor-guide.md`).
3. Lancez `python3 scripts/validate.py` et `npm test`, puis `node scripts/build.mjs` pour que le paquet soit dans `index.html`.
4. Ouvrez une pull request — les contributions de données ne demandent pas de programmation.
5. Sans programmer : essayez d’abord le paquet dans la page (onglet « Paquets », bouton « Importer »), puis envoyez le fichier dans une issue ou une pull request ; un mainteneur l’ajoute à `data/packs/`.

## Règles

- Un paquet = un fichier, nommé d’après l’identifiant du paquet.
- Citez toujours une source.
- Ne contribuez qu'avec du matériel que vous pouvez légalement partager (pas de texte protégé copié).
- Soyez bienveillant : voir le Code de conduite.

## Ajouter un paquet de questions

1. Choisissez d’abord la source. Un paquet de pays doit provenir de la banque de questions publique de ce pays (ou d’une autre source que vous avez le droit de partager) : notez l’édition, la date et l’adresse web. Ne copiez pas d’un livre, d’un cours ou d’un site sauf si sa licence le permet ; si vous ne pouvez pas copier, écrivez des questions originales et dites-le dans `source`.
2. Copiez `data/packs/example.json` vers `data/packs/<id-de-votre-paquet>.json`. Le nom du fichier est l’identifiant du paquet : lettres minuscules, chiffres et tirets, par exemple `hu-ham-a`. Remplissez l’en-tête : `country`, `licence_class`, `lang`, `source`, `source_url`, `license`, et les règles `exam` seulement si les règles officielles sont publiées (avec leur source).
3. Ajoutez les questions : à la main dans le fichier, ou depuis un tableau enregistré en CSV avec `node scripts/import_csv.mjs questions.csv --id <id-paquet> --title … --country … --class … --lang … --source … --license …` (colonnes et options : `docs/contributor-guide.md`). Gardez la numérotation officielle dans `id` et `source`.
4. Vérifiez le paquet par rapport à la banque officielle (`docs/verify-against-official-bank.md`) : le texte de chaque question, chaque réponse et chaque bonne réponse ; faites vérifier un échantillon par une seconde personne et écrivez dans la pull request qui a vérifié quoi et comment.
5. Lancez `python3 scripts/validate.py`, puis `node scripts/build.mjs` (il met le paquet dans `index.html`) et `npm test`. Vous pouvez aussi essayer le paquet avant de l’envoyer : ouvrez `index.html`, onglet « Paquets », bouton « Importer ».
6. Ouvrez une pull request ou une issue et indiquez quelle édition vous avez utilisée et à quelles conditions vous pouvez la partager. Un paquet sans source déclarée n’est pas fusionné.

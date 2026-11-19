# INDICATIV International

[English](README.md) · [Română](README.ro.md) · **Français** · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Version : 0.2.1 · Dernière mise à jour : 2026-11-20

🌐 https://indicativ-international.chiuta.ro

> Banques de questions de l'examen de radioamateur de chaque pays, dans un format commun.

Trade-free : sans suivi, sans publicité, sans compte, fonctionne hors ligne.

## État

Alpha, utilisable : l’unique `index.html` est un entraîneur et un simulateur d’examen pour les questions de radioamateur. Il s’exerce avec un calendrier de répétition en cinq boîtes, lance des examens blancs chronométrés avec un seuil de réussite et importe des paquets de questions dans un format JSON commun. Le paquet intégré contient 50 questions d’entraînement originales écrites pour ce projet ; ce n’est pas une banque de questions officielle, et aucun paquet de pays n’est encore inclus. Tout reste dans votre navigateur, sans compte, sans suivi ni requête réseau.

## Ce que fait l’application

- « S’entraîner » : choisissez un paquet, un sujet et les questions à travailler (à revoir et nouvelles, n’importe quelle question ou vos points faibles) ; chaque réponse est vérifiée aussitôt et expliquée, avec sa source. Les bonnes réponses reviennent après 1, 3, 7, 14 et 30 jours ; les mauvaises reviennent aujourd’hui et encore une fois à la fin de la séance. Les touches 1–6 ou A–F choisissent une réponse, Entrée continue.
- « Examen » : un test chronométré tiré au hasard dans le paquet, avec compte à rebours, carte des questions, « Marquer pour révision » et seuil de réussite ; rien n’est noté avant que vous terminiez (ou que le temps s’écoule). Le résultat montre le score par sujet et les questions ratées ; la même graine répète un examen ; un examen commencé continue après un rechargement. Les règles (questions, minutes, seuil, pénalité des mauvaises réponses) viennent du paquet avec leur source ; sans elles la page utilise des valeurs d’entraînement (20 questions, 30 minutes, 75 %).
- « Paquets » : le paquet d’entraînement intégré et les paquets que vous importez en collant du JSON ou en choisissant un fichier (8 au plus à la fois), chacun avec sa source, sa licence et ses règles d’examen ; progression par sujet ; télécharger un paquet, réinitialiser sa progression ou le supprimer ; sauvegarder la progression dans un fichier et la charger sur un autre appareil. Un paquet avec des problèmes est listé ligne par ligne, et vous pouvez n’importer que ses questions valides.
- Format : formules dans les questions écrites `f_{o}` ou `10^{-6}` ; petits dessins en SVG restreint avec une alternative textuelle ; un programme facultatif avec `syllabus_ref` sur chaque question ; un fichier JSON par paquet dans `data/packs/`, décrit par `schema.json` et `docs/pack-format.md`.
- Outils pour les contributeurs : `scripts/validate.py` vérifie les paquets avec les mêmes règles que la page ; `scripts/import_csv.mjs` transforme un tableau enregistré en CSV en paquet et nomme la ligne de chaque problème ; `scripts/pack_report.mjs` résume un paquet pour le vérifier par rapport à la banque officielle. L’interface est en huit langues et s’utilise au clavier et avec un lecteur d’écran.
- Installable comme une application et disponible hors ligne après la première visite lorsqu’elle est servie en HTTPS (un service worker conserve la page ; rien d’autre n’est stocké ni envoyé). Ouverte depuis un fichier téléchargé, elle fonctionne de la même manière, sans installation.

## Comment ça marche

- `schema.json` décrit un paquet ; `scripts/validate.py` vérifie chaque fichier de `data/packs/` d’après lui et d’après les règles qu’un schéma ne sait pas dire : le fichier porte le nom de l’identifiant du paquet, les identifiants et les questions sont uniques dans un paquet, `syllabus_ref` existe dans le programme, les figures n’utilisent que les éléments autorisés et les règles d’examen conviennent au paquet.
- `src/engine.mjs` est le moteur (sans écran, sans réseau) : validation, calendrier en cinq boîtes, files de questions, examens tirés d’une graine, notation et fichiers de progression. `scripts/validate.py` et `scripts/import_csv.mjs` appliquent les mêmes règles ; les tests comparent les implémentations sur les mêmes cas.
- `src/ui.js`, `src/i18n.mjs` et `src/app.css` forment l’interface ; `scripts/build.mjs` construit l’unique `index.html` à partir de `src/` et y intègre les paquets de `data/packs/` (tous sauf `example.json`) ; `node scripts/build.mjs --check` échoue quand la page n’est pas à jour.
- Le navigateur garde trois entrées (paquets importés, progression, examen en cours) ; chacune est revérifiée au chargement de la page, de sorte qu’un état enregistré abîmé ou hostile est ignoré, pas cru. Rien n’est envoyé nulle part.
- Tests : `npm test` (moteur, parité du validateur, import CSV, textes de l’interface, données, documentation, construction) et tests de navigateur dans le hub (huit langues, accessibilité, état enregistré hostile, import, chronométrage de l’examen) Le développement demande Node.js 24 ou plus récent et Python 3 avec `jsonschema` ; la page elle-même n’a besoin que d’un navigateur qui connaît ES2017.
- `manifest.webmanifest`, `sw.js` et les icônes sont produits par `node scripts/build.mjs` via le kit commun (section `pwa` de `src/app.json`) ; `--check` les vérifie aussi, et `npm test` contrôle que le manifeste, la version du service worker et la CSP correspondent à la page.

## Limites honnêtes

- Le paquet intégré est un petit ensemble de questions d’entraînement écrites avec un assistant IA et vérifiées par le calcul ou par des faits de manuel. Ce n’est pas une banque officielle de questions et aucun examinateur ne l’a relu.
- Aucun paquet de pays n’est inclus : les banques publiques de questions de la Hongrie, de l’Italie, de l’Allemagne et d’autres n’ont pas pu être téléchargées et vérifiées ici ; ce sont des tâches pour les contributeurs. Comparez chaque paquet à la banque officielle avant de lui faire confiance.
- Les règles des vrais examens (nombre de questions, durée, seuil de réussite) ne sont pas intégrées. Un paquet peut les déclarer avec leur source ; sinon le simulateur utilise des valeurs d’entraînement, et réussir ici ne prouve rien sur un vrai examen.
- Le schéma de répétition est un simple schéma à cinq boîtes aux intervalles fixes, pas un algorithme réglé. La progression reste dans ce navigateur ; effacer les données du site l’efface, sauf si vous avez téléchargé une sauvegarde.
- L’association au programme vaut ce que vaut le paquet : la page vérifie que « syllabus_ref » existe dans le paquet mais ne peut pas dire si l’association est juste. Le programme CEPT HAREC n’est pas inclus.
- Les traductions de l’interface ont été écrites par machine et n’ont pas été relues par des locuteurs natifs ; les questions s’affichent dans la langue du paquet.

## Contribuer en 5 minutes

1. Faites un fork de ce dépôt.
2. Copiez `data/packs/example.json` vers `data/packs/<id-de-votre-paquet>.json` (le nom du fichier est l’identifiant du paquet) et remplissez-le, ou transformez un tableau en paquet avec `node scripts/import_csv.mjs` (voir `docs/contributor-guide.md`).
3. Lancez `python3 scripts/validate.py` et `npm test`, puis `node scripts/build.mjs` pour que le paquet soit dans `index.html`.
4. Ouvrez une pull request — les contributions de données ne demandent pas de programmation.
5. Sans programmer : essayez d’abord le paquet dans la page (onglet « Paquets », bouton « Importer »), puis envoyez le fichier dans une issue ou une pull request ; un mainteneur l’ajoute à `data/packs/`.

## Bonnes premières tâches

Voir `ISSUES_GOOD_FIRST.md` pour des tâches toutes prêtes.

## Licence

Code : MIT. Données contribuées : indiquez la source ; elles sont publiées sous la même licence sauf mention contraire.

## Soutien

Si ce projet vous est utile, vous pouvez [m'offrir un café](https://buymeacoffee.com/echo.of.the.strings).

# Journal des modifications

[English](CHANGELOG.md) · [Română](CHANGELOG.ro.md) · **Français** · [Italiano](CHANGELOG.it.md) · [Español](CHANGELOG.es.md) · [Português](CHANGELOG.pt.md) · [Deutsch](CHANGELOG.de.md) · [Magyar](CHANGELOG.hu.md)

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · [SemVer](https://semver.org/).

## [Non publié]

## [0.2.0] - 2026-11-17

### Ajouté
- Le moteur de `src/engine.mjs` : validation des paquets et des figures, calendrier de répétition en cinq boîtes, files de questions, examens tirés d’une graine, notation et fichiers de progression.
- La page : onglets « S’entraîner », « Examen », « Paquets » et « Guide » en huit langues ; raccourcis clavier, annonces pour les lecteurs d’écran, un chronomètre d’examen qui survit à un rechargement ; import, téléchargement, réinitialisation et suppression des paquets ; une sauvegarde de la progression.
- Un paquet d’entraînement intégré de 50 questions originales (avec explications, formules et deux figures), écrit pour ce projet avec un assistant IA et vérifié par le calcul ; ce n’est pas une banque de questions officielle.
- Le format de paquet commun : `schema.json`, le modèle `data/packs/example.json` et `docs/pack-format.md` (en anglais et en roumain).
- `scripts/validate.py` applique les mêmes règles que la page ; les tests le comparent au moteur sur les mêmes cas.
- `scripts/import_csv.mjs` : un tableau enregistré en CSV devient un paquet, et chaque problème nomme sa ligne dans le fichier.
- `scripts/pack_report.mjs` : un résumé d’un paquet (comptes, numéros officiels manquants, positions des bonnes réponses, une liste de texte, un échantillon aléatoire) pour le vérifier par rapport à la banque officielle.
- `docs/contributor-guide.md` et `docs/verify-against-official-bank.md` (en anglais et en roumain).
- Tests : `npm test` et tests de navigateur dans le hub.
- `src/` et `scripts/build.mjs` : l’unique `index.html` est désormais construit à partir des sources, avec les paquets intégrés, et `--check` le vérifie.
- ISSUES_GOOD_FIRST et CODE_OF_CONDUCT traduits dans les huit langues.
- README en anglais, roumain, français, italien, espagnol, portugais, allemand et hongrois : sections d’état et de périmètre prévu (dérivées de `ISSUES_GOOD_FIRST.md`).
- Installable (PWA) : `manifest.webmanifest`, `sw.js` et les icônes sont générés par le kit commun (`fff-kit/pwa`) ; la page fonctionne hors ligne après la première visite en HTTPS.

### Modifié
- Le workflow s’exécute sur Ubuntu 26.04 avec Node.js 26 et lance aussi les tests, la vérification de la construction et la validation.
- Les données sont désormais des paquets : `data/packs/example.json` remplace `data/questions/example.json`, et un paquet est un fichier nommé d’après son identifiant ; `scripts/validate.py`, les étapes du README et les modèles ont changé en conséquence.
- La liste des tâches pour débutants contient maintenant ce qui reste à faire (paquets de pays, programme, relectures) ; l’entraîneur, le simulateur d’examen, les figures et la vérification de `correct` qu’elle énumérait existent maintenant.

## [0.1.0] - 2026-11-13

### Ajouté
- Squelette initial : structure, schéma de données ou premiers exemples, guides de contribution en huit langues.

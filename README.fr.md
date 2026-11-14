# INDICATIV International

[English](README.md) · [Română](README.ro.md) · **Français** · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Version : 0.1.0 · Dernière mise à jour : 2026-11-14

🌐 https://indicativ-international.chiuta.ro

> Banques de questions de l'examen de radioamateur de chaque pays, dans un format commun.

Trade-free : sans suivi, sans publicité, sans compte, fonctionne hors ligne.

## État

Alpha : le dépôt contient la structure, le schéma de données ou les premiers exemples et les guides de contribution. Le périmètre ci-dessous est le plan, pas ce qui fonctionne aujourd’hui.

## Périmètre prévu

- Un format JSON commun pour les banques de questions d’examen de radioamateur, validé par un script (par exemple que `correct` reste dans la plage de `answers`).
- Le programme CEPT HAREC en `syllabus.json`, avec un champ `syllabus_ref` reliant chaque question à un point du programme.
- Des paquets par pays issus de banques de questions publiques, en commençant par la Hongrie, l’Italie et l’Allemagne (Klasse E), chacun avec un lien vers la source.
- Un entraîneur à répétition espacée et un simulateur d’examen avec minuteur et note de passage par pays.
- Prise en charge des formules et des schémas (SVG) dans les questions, et un guide pour vérifier une question par rapport à la banque officielle.

Rien de tout cela n’est encore implémenté : chaque point est une tâche prête dans `ISSUES_GOOD_FIRST.md`.

## Contribuer en 5 minutes

1. Forkez ce dépôt.
2. Copiez `data/questions/example.json` dans `data/questions/` et modifiez-le.
3. Lancez `python scripts/validate.py`.
4. Ouvrez une pull request — aucune programmation n'est nécessaire pour les données.

## Bonnes premières tâches

Voir `ISSUES_GOOD_FIRST.md` pour des tâches toutes prêtes.

## Licence

Code : MIT. Données contribuées : indiquez la source ; elles sont publiées sous la même licence sauf mention contraire.

## Soutien

Si ce projet vous est utile, vous pouvez [m'offrir un café](https://buymeacoffee.com/echo.of.the.strings).

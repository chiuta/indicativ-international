# Bonnes premières tâches

[English](ISSUES_GOOD_FIRST.md) · [Română](ISSUES_GOOD_FIRST.ro.md) · **Français** · [Italiano](ISSUES_GOOD_FIRST.it.md) · [Español](ISSUES_GOOD_FIRST.es.md) · [Português](ISSUES_GOOD_FIRST.pt.md) · [Deutsch](ISSUES_GOOD_FIRST.de.md) · [Magyar](ISSUES_GOOD_FIRST.hu.md)

- [ ] Ajouter un paquet pour la Hongrie à partir de la banque de questions publique (`scripts/import_csv.mjs`, numérotation officielle dans `id` et `source`, `source_url`, règles d’examen avec leur source)
- [ ] Ajouter un paquet pour l’Italie à partir de la banque de questions publique, avec le même soin (édition, adresse de la source, numérotation, règles d’examen)
- [ ] Ajouter un paquet pour l’Allemagne (classe E ou A) à partir de la banque de questions publique, avec le même soin
- [ ] Ajouter un paquet pour votre propre pays à partir de sa banque de questions officielle, dans n’importe quelle langue, et dire ce que vous avez vérifié
- [ ] Écrire un convertisseur du format de fichier officiel d’un pays (PDF, tableau ou XML) vers les colonnes CSV de `scripts/import_csv.mjs`
- [ ] Ajouter le programme CEPT HAREC (Recommandation T/R 61-02) comme `syllabus` d’un paquet et relier chaque question avec `syllabus_ref`
- [ ] Faire relire par un radioamateur les 50 questions d’entraînement intégrées et signaler toute réponse fausse ou formulation peu claire
- [ ] Redessiner les figures de circuits et d’antennes d’un paquet en SVG restreint, chacune avec une alternative textuelle dans `figure_alt`
- [ ] Tester le simulateur d’examen avec un lecteur d’écran (NVDA, VoiceOver ou Orca) et signaler ce qui est difficile à utiliser
- [ ] Faire relire par un locuteur natif les textes de l’interface de sa langue dans `src/i18n.mjs`

Créez-les toutes sur GitHub avec `scripts/create_issues.sh` (nécessite la CLI `gh`).

# Gute erste Aufgaben

[English](ISSUES_GOOD_FIRST.md) · [Română](ISSUES_GOOD_FIRST.ro.md) · [Français](ISSUES_GOOD_FIRST.fr.md) · [Italiano](ISSUES_GOOD_FIRST.it.md) · [Español](ISSUES_GOOD_FIRST.es.md) · [Português](ISSUES_GOOD_FIRST.pt.md) · **Deutsch** · [Magyar](ISSUES_GOOD_FIRST.hu.md)

- [ ] Ein Paket für Ungarn aus dem öffentlichen Fragenkatalog hinzufügen (`scripts/import_csv.mjs`, offizielle Nummerierung in `id` und `source`, `source_url`, Prüfungsregeln mit ihrer Quelle)
- [ ] Ein Paket für Italien aus dem öffentlichen Fragenkatalog hinzufügen, mit derselben Sorgfalt (Ausgabe, Quellenadresse, Nummerierung, Prüfungsregeln)
- [ ] Ein Paket für Deutschland (Klasse E oder A) aus dem öffentlichen Fragenkatalog hinzufügen, mit derselben Sorgfalt
- [ ] Ein Paket für das eigene Land aus dessen offiziellem Fragenkatalog hinzufügen, in beliebiger Sprache, und mitteilen, was geprüft wurde
- [ ] Einen Konverter vom offiziellen Dateiformat eines Landes (PDF, Tabelle oder XML) zu den CSV-Spalten von `scripts/import_csv.mjs` schreiben
- [ ] Den CEPT-HAREC-Lehrplan (Empfehlung T/R 61-02) als `syllabus` eines Pakets hinzufügen und jede Frage mit `syllabus_ref` verknüpfen
- [ ] Die 50 eingebauten Übungsfragen von einem Funkamateur prüfen lassen und jede falsche Antwort oder unklare Formulierung melden
- [ ] Die Schaltungs- und Antennenabbildungen eines Pakets als eingeschränktes SVG neu zeichnen, jede mit einer Textalternative in `figure_alt`
- [ ] Den Prüfungssimulator mit einem Screenreader (NVDA, VoiceOver oder Orca) testen und melden, was schwer zu bedienen ist
- [ ] Die Oberflächentexte der eigenen Sprache in `src/i18n.mjs` von einer Muttersprachlerin oder einem Muttersprachler prüfen lassen

Lege sie alle auf GitHub mit `scripts/create_issues.sh` an (benötigt die `gh`-CLI).

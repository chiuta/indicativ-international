# Änderungsprotokoll

[English](CHANGELOG.md) · [Română](CHANGELOG.ro.md) · [Français](CHANGELOG.fr.md) · [Italiano](CHANGELOG.it.md) · [Español](CHANGELOG.es.md) · [Português](CHANGELOG.pt.md) · **Deutsch** · [Magyar](CHANGELOG.hu.md)

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · [SemVer](https://semver.org/).

## [Unveröffentlicht]

## [0.2.1] - 2026-11-20

### Geändert
- fff-kit 1.8.1: Blockiert der Browser den Speicher oder fehlt er (`localStorage`/`sessionStorage` lösen einen Fehler aus oder fehlen), startet die Seite mit einem temporären Arbeitsspeicher, statt anzuhalten; die Daten bleiben nach dem Schließen der Seite nicht erhalten.
- fff-kit 1.8.1: Die Hilfe, die kleine Bedienelemente auf 44 px vergrößert, misst jetzt auch die Breite des Seitenkörpers und des übergeordneten Elements; eine Schaltflächenreihe kann den Bildschirm also nicht mehr verlassen (die Gruppe bleibt unverändert, wenn die Vergrößerung sie zu breit machen würde).

## [0.2.0] - 2026-11-17

### Hinzugefügt
- Die Engine in `src/engine.mjs`: Validierung von Paketen und Abbildungen, der Wiederholungsplan in fünf Fächern, Fragenwarteschlangen, aus einem Startwert gezogene Prüfungen, Bewertung und Fortschrittsdateien.
- Die Seite: die Reiter „Üben“, „Prüfung“, „Pakete“ und „Anleitung“ in acht Sprachen; Tastenkürzel, Ansagen für Screenreader, ein Prüfungstimer, der ein Neuladen übersteht; Import, Download, Zurücksetzen und Entfernen von Paketen; eine Sicherung des Fortschritts.
- Ein eingebautes Übungspaket mit 50 eigenen Fragen (mit Erklärungen, Formeln und zwei Abbildungen), für dieses Projekt mit einem KI-Assistenten geschrieben und durch Rechnung geprüft; es ist kein offizieller Fragenkatalog.
- Das gemeinsame Paketformat: `schema.json`, die Vorlage `data/packs/example.json` und `docs/pack-format.md` (auf Englisch und Rumänisch).
- `scripts/validate.py` wendet dieselben Regeln an wie die Seite; die Tests vergleichen es an denselben Fällen mit der Engine.
- `scripts/import_csv.mjs`: Eine als CSV gespeicherte Tabelle wird zum Paket, und jedes Problem nennt seine Zeile in der Datei.
- `scripts/pack_report.mjs`: eine Zusammenfassung eines Pakets (Zählungen, fehlende offizielle Nummern, Positionen der richtigen Antworten, eine Textliste, eine Zufallsstichprobe), um es gegen den offiziellen Katalog zu prüfen.
- `docs/contributor-guide.md` und `docs/verify-against-official-bank.md` (auf Englisch und Rumänisch).
- Tests: `npm test` und Browser-Tests im Hub.
- `src/` und `scripts/build.mjs`: Die eine `index.html` wird jetzt aus den Quellen gebaut, mit eingebetteten Paketen, und `--check` prüft sie.
- ISSUES_GOOD_FIRST und CODE_OF_CONDUCT in alle acht Sprachen übersetzt.
- README auf Englisch, Rumänisch, Französisch, Italienisch, Spanisch, Portugiesisch, Deutsch und Ungarisch: Abschnitte zu Status und geplantem Umfang (abgeleitet aus `ISSUES_GOOD_FIRST.md`).
- Installierbar (PWA): `manifest.webmanifest`, `sw.js` und die Symbole werden vom gemeinsamen Kit (`fff-kit/pwa`) erzeugt; die Seite funktioniert nach dem ersten Besuch über HTTPS offline.

### Geändert
- Der Workflow läuft auf Ubuntu 26.04 mit Node.js 26 und führt auch die Tests, die Build-Prüfung und die Validierung aus.
- Die Daten sind jetzt Pakete: `data/packs/example.json` ersetzt `data/questions/example.json`, und ein Paket ist eine nach seiner ID benannte Datei; `scripts/validate.py`, die README-Schritte und die Vorlagen wurden entsprechend geändert.
- Die Liste der Good First Issues enthält jetzt, was noch zu tun ist (Länderpakete, Lehrplan, Prüfungen durch Fachleute); der Trainer, der Prüfungssimulator, die Abbildungen und die Prüfung von `correct`, die sie früher aufzählte, gibt es jetzt.

## [0.1.0] - 2026-11-13

### Hinzugefügt
- Erstes Gerüst: Struktur, Datenschema oder erste Beispiele, Beitragsanleitungen in acht Sprachen.

# INDICATIV International

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · **Deutsch** · [Magyar](README.hu.md)

Version: 0.2.0 · Letzte Aktualisierung: 2026-11-17

🌐 https://indicativ-international.chiuta.ro

> Fragenkataloge für die Amateurfunkprüfung aller Länder in einem gemeinsamen Format.

Trade-free: kein Tracking, keine Werbung, keine Konten, funktioniert offline.

## Status

Alpha, nutzbar: Die eine `index.html` ist ein Trainer und Prüfungssimulator für Fragen der Amateurfunkprüfung. Er übt mit einem Wiederholungsplan in fünf Fächern, führt zeitbegrenzte Probeprüfungen mit Bestehensgrenze durch und importiert Fragenpakete in einem gemeinsamen JSON-Format. Das eingebaute Paket enthält 50 eigens für dieses Projekt geschriebene Übungsfragen; es ist kein offizieller Fragenkatalog, und ein Länderpaket ist noch nicht enthalten. Alles bleibt in Ihrem Browser, ohne Konten, Tracking oder Netzwerkanfragen.

## Was es kann

- „Üben“: Wählen Sie ein Paket, ein Fachgebiet und die zu übenden Fragen (fällige und neue, beliebige Fragen oder Ihre Schwächen); jede Antwort wird sofort geprüft und erklärt, mit ihrer Quelle. Richtige Antworten kommen nach 1, 3, 7, 14 und 30 Tagen wieder; falsche kommen heute und am Ende der Sitzung noch einmal wieder. Die Tasten 1–6 oder A–F wählen eine Antwort, die Eingabetaste geht weiter.
- „Prüfung“: ein zeitbegrenzter Test, zufällig aus dem Paket gezogen, mit Countdown, Fragenübersicht, „Zur Prüfung vormerken“ und Bestehensgrenze; nichts wird bewertet, bis Sie fertig sind (oder die Zeit abläuft). Das Ergebnis zeigt die Punktzahl nach Fachgebiet und die falsch beantworteten Fragen; derselbe Startwert wiederholt eine Prüfung; eine begonnene Prüfung läuft nach einem Neuladen weiter. Die Regeln (Fragen, Minuten, Bestehensgrenze, Abzug für falsche Antworten) kommen mit ihrer Quelle aus dem Paket; ohne sie nutzt die Seite Übungswerte (20 Fragen, 30 Minuten, 75 %).
- „Pakete“: das eingebaute Übungspaket und die Pakete, die Sie durch Einfügen von JSON oder Auswahl einer Datei importieren (höchstens 8 gleichzeitig), jedes mit Quelle, Lizenz und Prüfungsregeln; Fortschritt nach Fachgebiet; ein Paket herunterladen, seinen Fortschritt zurücksetzen oder es entfernen; den Fortschritt in einer Datei sichern und auf einem anderen Gerät laden. Ein Paket mit Problemen wird Zeile für Zeile aufgelistet, und Sie können nur seine gültigen Fragen importieren.
- Format: Formeln in den Fragen als `f_{o}` oder `10^{-6}`; kleine Zeichnungen als eingeschränktes SVG mit Textalternative; ein optionaler Lehrplan mit `syllabus_ref` an jeder Frage; eine JSON-Datei pro Paket in `data/packs/`, beschrieben durch `schema.json` und `docs/pack-format.md`.
- Werkzeuge für Mitwirkende: `scripts/validate.py` prüft die Pakete mit denselben Regeln wie die Seite; `scripts/import_csv.mjs` macht aus einer als CSV gespeicherten Tabelle ein Paket und nennt bei jedem Problem die Zeile; `scripts/pack_report.mjs` fasst ein Paket zusammen, damit Sie es gegen den offiziellen Katalog prüfen können. Die Oberfläche ist in acht Sprachen und lässt sich mit der Tastatur und mit einem Screenreader bedienen.
- Als App installierbar und nach dem ersten Besuch offline verfügbar, wenn sie über HTTPS ausgeliefert wird (ein Service Worker behält die Seite; sonst wird nichts gespeichert oder gesendet). Aus einer heruntergeladenen Datei geöffnet, funktioniert sie genauso, ohne Installation.

## Wie es funktioniert

- `schema.json` beschreibt ein Paket; `scripts/validate.py` prüft jede Datei in `data/packs/` dagegen und gegen die Regeln, die ein Schema nicht ausdrücken kann: Die Datei heißt wie die Paket-ID, IDs und Fragen sind innerhalb eines Pakets eindeutig, `syllabus_ref` existiert im Lehrplan, Abbildungen verwenden nur die erlaubten Elemente und die Prüfungsregeln passen zum Paket.
- `src/engine.mjs` ist die Engine (ohne Bildschirm, ohne Netzwerk): Validierung, der Plan in fünf Fächern, die Fragenwarteschlangen, aus einem Startwert gezogene Prüfungen, Bewertung und die Fortschrittsdateien. `scripts/validate.py` und `scripts/import_csv.mjs` wenden dieselben Regeln an; die Tests vergleichen die Implementierungen an denselben Fällen.
- `src/ui.js`, `src/i18n.mjs` und `src/app.css` sind die Oberfläche; `scripts/build.mjs` baut die eine `index.html` aus `src/` und bettet die Pakete aus `data/packs/` ein (alle außer `example.json`); `node scripts/build.mjs --check` schlägt fehl, wenn die Seite nicht aktuell ist.
- Der Browser speichert drei Einträge (importierte Pakete, Fortschritt, eine laufende Prüfung); jeder wird beim Laden der Seite erneut geprüft, sodass ein beschädigter oder feindlicher gespeicherter Zustand ignoriert statt geglaubt wird. Nichts wird irgendwohin gesendet.
- Tests: `npm test` (Engine, Parität des Validators, CSV-Import, Oberflächentexte, Daten, Dokumentation, Build) und Browser-Tests im Hub (acht Sprachen, Barrierefreiheit, feindlicher gespeicherter Zustand, Import, Zeitmessung der Prüfung) Die Entwicklung braucht Node.js 24 oder neuer und Python 3 mit `jsonschema`; die Seite selbst braucht nur einen Browser, der ES2017 kennt.
- `manifest.webmanifest`, `sw.js` und die Symbole erzeugt `node scripts/build.mjs` über das gemeinsame Kit (Abschnitt `pwa` in `src/app.json`); `--check` prüft sie ebenfalls, und `npm test` stellt sicher, dass Manifest, Service-Worker-Version und CSP zur Seite passen.

## Ehrliche Grenzen

- Das eingebaute Paket ist eine kleine Sammlung von Übungsfragen, mit einem KI-Assistenten geschrieben und durch Rechnung oder Lehrbuchwissen geprüft. Es ist kein offizieller Fragenkatalog, und kein Prüfer hat es durchgesehen.
- Es ist kein Länderpaket enthalten: Die öffentlichen Fragenkataloge von Ungarn, Italien, Deutschland und anderen ließen sich hier nicht herunterladen und prüfen, daher sind sie Aufgaben für Mitwirkende. Vergleichen Sie jedes Paket mit dem offiziellen Katalog, bevor Sie ihm vertrauen.
- Die Regeln echter Prüfungen (Fragenzahl, Zeit, Bestehensgrenze) sind nicht eingebaut. Ein Paket kann sie mit ihrer Quelle angeben; ohne Angabe verwendet der Simulator Übungswerte, und Bestehen hier beweist nichts über eine echte Prüfung.
- Das Wiederholschema ist ein einfaches Fünf-Fächer-Schema mit festen Abständen, kein abgestimmter Algorithmus. Der Fortschritt bleibt in diesem Browser; das Löschen der Website-Daten löscht ihn, falls Sie keine Sicherung heruntergeladen haben.
- Die Zuordnung zum Lehrplan ist nur so gut wie das Paket: Die Seite prüft, dass «syllabus_ref» im Paket vorkommt, kann aber nicht sagen, ob die Zuordnung stimmt. Der CEPT-HAREC-Lehrplan ist nicht enthalten.
- Die Übersetzungen der Oberfläche wurden maschinell geschrieben und von keinem Muttersprachler geprüft; Fragen erscheinen in der Sprache des Pakets.

## In 5 Minuten mitmachen

1. Forken Sie dieses Repository.
2. Kopieren Sie `data/packs/example.json` nach `data/packs/<id-ihres-pakets>.json` (der Dateiname ist die Paket-ID) und füllen Sie sie aus, oder machen Sie aus einer Tabelle ein Paket mit `node scripts/import_csv.mjs` (siehe `docs/contributor-guide.md`).
3. Führen Sie `python3 scripts/validate.py` und `npm test` aus, danach `node scripts/build.mjs`, damit das Paket in `index.html` steht.
4. Öffnen Sie einen Pull Request — Datenbeiträge brauchen keine Programmierung.
5. Ohne Programmieren: Probieren Sie das Paket zuerst auf der Seite aus (Reiter „Pakete“, Schaltfläche „Importieren“) und schicken Sie die Datei dann in einem Issue oder Pull Request; ein Maintainer fügt sie zu `data/packs/` hinzu.

## Gute erste Aufgaben

Siehe `ISSUES_GOOD_FIRST.md` für fertige Aufgaben.

## Lizenz

Code: MIT. Beigesteuerte Daten: Quelle angeben; sie stehen unter derselben Lizenz, sofern die Datei nichts anderes sagt.

## Unterstützung

Wenn dir das Projekt nützt, kannst du [mir einen Kaffee spendieren](https://buymeacoffee.com/echo.of.the.strings).

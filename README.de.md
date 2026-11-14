# INDICATIV International

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · **Deutsch** · [Magyar](README.hu.md)

Version: 0.1.0 · Letzte Aktualisierung: 2026-11-14

🌐 https://indicativ-international.chiuta.ro

> Fragenkataloge für die Amateurfunkprüfung aller Länder in einem gemeinsamen Format.

Trade-free: kein Tracking, keine Werbung, keine Konten, funktioniert offline.

## Status

Alpha: Das Repository enthält die Struktur, das Datenschema oder die ersten Beispiele und die Beitragsleitfäden. Der Umfang unten ist der Plan, nicht das, was heute funktioniert.

## Geplanter Umfang

- Ein gemeinsames JSON-Format für Fragenkataloge der Amateurfunkprüfung, per Skript geprüft (zum Beispiel, dass `correct` im Bereich von `answers` liegt).
- Der CEPT-HAREC-Lehrplan als `syllabus.json`, mit einem Feld `syllabus_ref`, das jede Frage mit einem Lehrplanpunkt verknüpft.
- Länderpakete aus öffentlichen Fragenkatalogen, zunächst Ungarn, Italien und Deutschland (Klasse E), jeweils mit Quellenlink.
- Ein Spaced-Repetition-Trainer und ein Prüfungssimulator mit Timer und Bestehensgrenze je Land.
- Unterstützung für Formeln und Diagramme (SVG) in Fragen und eine Anleitung, eine Frage gegen den offiziellen Katalog zu prüfen.

Nichts davon ist bisher umgesetzt: Jeder Punkt ist eine fertig vorbereitete Aufgabe in `ISSUES_GOOD_FIRST.md`.

## In 5 Minuten mitmachen

1. Forke dieses Repository.
2. Kopiere `data/questions/example.json` nach `data/questions/` und bearbeite die Datei.
3. Führe `python scripts/validate.py` aus.
4. Öffne einen Pull Request – für Daten ist keine Programmierung nötig.

## Gute erste Aufgaben

Siehe `ISSUES_GOOD_FIRST.md` für fertige Aufgaben.

## Lizenz

Code: MIT. Beigesteuerte Daten: Quelle angeben; sie stehen unter derselben Lizenz, sofern die Datei nichts anderes sagt.

## Unterstützung

Wenn dir das Projekt nützt, kannst du [mir einen Kaffee spendieren](https://buymeacoffee.com/echo.of.the.strings).

# Mitmachen — INDICATIV International

[English](CONTRIBUTING.md) · [Română](CONTRIBUTING.ro.md) · [Français](CONTRIBUTING.fr.md) · [Italiano](CONTRIBUTING.it.md) · [Español](CONTRIBUTING.es.md) · [Português](CONTRIBUTING.pt.md) · **Deutsch** · [Magyar](CONTRIBUTING.hu.md)

Version: 0.2.0 · Letzte Aktualisierung: 2026-11-17

1. Forken Sie dieses Repository.
2. Kopieren Sie `data/packs/example.json` nach `data/packs/<id-ihres-pakets>.json` (der Dateiname ist die Paket-ID) und füllen Sie sie aus, oder machen Sie aus einer Tabelle ein Paket mit `node scripts/import_csv.mjs` (siehe `docs/contributor-guide.md`).
3. Führen Sie `python3 scripts/validate.py` und `npm test` aus, danach `node scripts/build.mjs`, damit das Paket in `index.html` steht.
4. Öffnen Sie einen Pull Request — Datenbeiträge brauchen keine Programmierung.
5. Ohne Programmieren: Probieren Sie das Paket zuerst auf der Seite aus (Reiter „Pakete“, Schaltfläche „Importieren“) und schicken Sie die Datei dann in einem Issue oder Pull Request; ein Maintainer fügt sie zu `data/packs/` hinzu.

## Regeln

- Ein Paket = eine Datei, benannt nach der Paket-ID.
- Gib immer eine Quelle an.
- Steuere nur Material bei, das du rechtmäßig teilen darfst (keine kopierten geschützten Texte).
- Sei freundlich: siehe Verhaltenskodex.

## Ein Fragenpaket hinzufügen

1. Wählen Sie zuerst die Quelle. Ein Länderpaket muss aus dem öffentlichen Fragenkatalog dieses Landes stammen (oder aus einer anderen Quelle, die Sie rechtmäßig weitergeben dürfen): Notieren Sie Ausgabe, Datum und Webadresse. Kopieren Sie nicht aus einem Buch, einem Kurs oder von einer Website, wenn deren Lizenz es nicht erlaubt; wenn Sie nicht kopieren können, schreiben Sie eigene Fragen und sagen Sie das in `source`.
2. Kopieren Sie `data/packs/example.json` nach `data/packs/<id-ihres-pakets>.json`. Der Dateiname ist die Paket-ID: Kleinbuchstaben, Ziffern und Bindestriche, zum Beispiel `hu-ham-a`. Füllen Sie den Kopf aus: `country`, `licence_class`, `lang`, `source`, `source_url`, `license`, und die `exam`-Regeln nur, wenn die offiziellen Regeln veröffentlicht sind (mit ihrer Quelle).
3. Fügen Sie die Fragen hinzu: von Hand in der Datei oder aus einer als CSV gespeicherten Tabelle mit `node scripts/import_csv.mjs questions.csv --id <paket-id> --title … --country … --class … --lang … --source … --license …` (Spalten und Optionen: `docs/contributor-guide.md`). Behalten Sie die offizielle Nummerierung in `id` und `source`.
4. Prüfen Sie das Paket gegen den offiziellen Katalog (`docs/verify-against-official-bank.md`): den Text jeder Frage, jede Antwort und jede richtige Antwort; lassen Sie eine zweite Person eine Stichprobe prüfen und schreiben Sie im Pull Request, wer was wie geprüft hat.
5. Führen Sie `python3 scripts/validate.py` aus, dann `node scripts/build.mjs` (es legt das Paket in `index.html`) und `npm test`. Sie können das Paket auch vor dem Senden ausprobieren: `index.html` öffnen, Reiter „Pakete“, Schaltfläche „Importieren“.
6. Öffnen Sie einen Pull Request oder ein Issue und sagen Sie, welche Ausgabe Sie benutzt haben und unter welchen Bedingungen Sie sie weitergeben dürfen. Ein Paket ohne angegebene Quelle wird nicht übernommen.

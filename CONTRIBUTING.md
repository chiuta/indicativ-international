# Contributing — INDICATIV International

**English** · [Română](CONTRIBUTING.ro.md) · [Français](CONTRIBUTING.fr.md) · [Italiano](CONTRIBUTING.it.md) · [Español](CONTRIBUTING.es.md) · [Português](CONTRIBUTING.pt.md) · [Deutsch](CONTRIBUTING.de.md) · [Magyar](CONTRIBUTING.hu.md)

Version: 0.2.1 · Last updated: 2026-11-20

1. Fork this repository.
2. Copy `data/packs/example.json` to `data/packs/<your-pack-id>.json` (the file name is the pack id) and fill it in, or turn a spreadsheet into a pack with `node scripts/import_csv.mjs` (see `docs/contributor-guide.md`).
3. Run `python3 scripts/validate.py` and `npm test`, then `node scripts/build.mjs` so that the pack is in `index.html`.
4. Open a pull request — data contributions need no coding.
5. No coding needed: try the pack on the page first (tab “Packs”, button “Import”), then send the file in an issue or a pull request; a maintainer adds it to `data/packs/`.

## Rules

- One pack = one file, named after the pack id.
- Always cite a source.
- Contribute only material you may legally share (no copied copyrighted text).
- Be kind: see the Code of Conduct.

## Adding a question pack

1. Choose the source first. A country pack must come from that country’s public question bank (or from another source you may legally share): write down the edition, the date and the web address. Do not copy from a book, a course or a website unless its licence allows it; if you cannot copy, write original questions and say so in `source`.
2. Copy `data/packs/example.json` to `data/packs/<your-pack-id>.json`. The file name is the pack id: lower-case letters, digits and hyphens, for example `hu-ham-a`. Fill in the header: `country`, `licence_class`, `lang`, `source`, `source_url`, `license`, and the `exam` rules only when the official rules are published (with their source).
3. Add the questions: by hand in the file, or from a spreadsheet saved as CSV with `node scripts/import_csv.mjs questions.csv --id <pack-id> --title … --country … --class … --lang … --source … --license …` (columns and options: `docs/contributor-guide.md`). Keep the official numbering in `id` and `source`.
4. Check the pack against the official bank (`docs/verify-against-official-bank.md`): every question text, every answer and every correct answer; have a second person check a sample, and write in the pull request who checked what and how.
5. Run `python3 scripts/validate.py`, then `node scripts/build.mjs` (it puts the pack into `index.html`) and `npm test`. You can also try the pack before you send it: open `index.html`, tab “Packs”, button “Import”.
6. Open a pull request or an issue and say which edition you used and on what terms you may share it. A pack without a stated source is not merged.

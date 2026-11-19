# INDICATIV International

**English** · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Version: 0.2.1 · Last updated: 2026-11-20

🌐 https://indicativ-international.chiuta.ro

> Amateur-radio exam question banks for every country, in one shared format.

Trade-free: no tracking, no ads, no accounts, works offline.

## Status

Alpha, usable: the single `index.html` is a trainer and exam simulator for amateur-radio licence questions. It practises with a five-box repetition schedule, runs timed practice exams with a pass mark and imports question packs in one shared JSON format. The built-in pack holds 50 original practice questions written for this project; it is not an official question bank, and no country pack is included yet. Everything stays in your browser, without accounts, tracking or network requests.

## What it does

- “Train”: choose a pack, a subject and which questions to practise (due and new, any question, or your weak spots); every answer is checked at once and explained, with its source. Right answers come back after 1, 3, 7, 14 and 30 days; wrong ones come back today and once more at the end of the session. Keys 1–6 or A–F choose an answer, Enter goes on.
- “Exam”: a timed test drawn at random from the pack, with a countdown, a question map, “Mark for review” and a pass mark; nothing is marked until you finish (or time runs out). The result shows the score by subject and the questions you got wrong; the same seed repeats an exam; an exam you started continues after a reload. The rules (questions, minutes, pass mark, penalty for wrong answers) come from the pack together with their source; without them the page uses practice defaults (20 questions, 30 minutes, 75 %).
- “Packs”: the built-in practice pack and the packs you import by pasting JSON or choosing a file (at most 8 at a time), each with its source, licence and exam rules; progress by subject; download a pack, reset its progress or remove it; back up your progress to a file and load it on another device. A pack with problems is listed line by line, and you can import only its valid questions.
- Format: formulas in questions written as `f_{o}` or `10^{-6}`; small drawings as restricted SVG with a text alternative; an optional syllabus with `syllabus_ref` on each question; one JSON file per pack in `data/packs/`, described by `schema.json` and `docs/pack-format.md`.
- Tools for contributors: `scripts/validate.py` checks the packs with the same rules as the page; `scripts/import_csv.mjs` turns a spreadsheet saved as CSV into a pack and names the line of every problem; `scripts/pack_report.mjs` summarises a pack to check it against the official bank. The interface is in eight languages and can be used with the keyboard and with a screen reader.
- Installable as an app and available offline after the first visit when served over HTTPS (a service worker keeps the page; nothing else is stored or sent). Opened from a downloaded file it works the same, without installation.

## How it works

- `schema.json` describes a pack; `scripts/validate.py` checks every file in `data/packs/` against it and against the rules a schema cannot express: the file is named after the pack id, ids and questions are unique within a pack, `syllabus_ref` exists in the syllabus, figures use only the allowed elements and the exam rules fit the pack.
- `src/engine.mjs` is the engine (no screen, no network): validation, the five-box schedule, the queues of questions, exams drawn from a seed, marking and the progress files. `scripts/validate.py` and `scripts/import_csv.mjs` apply the same rules; the tests compare the implementations on the same cases.
- `src/ui.js`, `src/i18n.mjs` and `src/app.css` are the interface; `scripts/build.mjs` builds the single `index.html` from `src/` and embeds the packs of `data/packs/` (all but `example.json`); `node scripts/build.mjs --check` fails when the page is out of date.
- The browser keeps three entries (imported packs, progress, an exam in progress); each is checked again when the page loads, so a damaged or hostile saved state is ignored, not trusted. Nothing is sent anywhere.
- Tests: `npm test` (engine, validator parity, CSV import, interface texts, data, documentation, build) and browser tests in the hub (eight languages, accessibility, hostile saved state, import, exam timing) Development needs Node.js 24 or newer and Python 3 with `jsonschema`; the page itself only needs a browser that knows ES2017.
- `manifest.webmanifest`, `sw.js` and the icons are produced by `node scripts/build.mjs` through the shared kit (`pwa` in `src/app.json`); `--check` also verifies them, and `npm test` checks that the manifest, the service worker version and the CSP match the page.

## Honest limits

- The built-in pack is a small set of practice questions written with an AI assistant and checked by calculation or by textbook facts. It is not an official question bank and no examiner has reviewed it.
- No country pack is included: the public question banks of Hungary, Italy, Germany and others could not be downloaded and checked here, so they are tasks for contributors. Compare every pack with the official bank before you trust it.
- The exam rules (number of questions, time, pass mark) of real countries are not built in. A pack can declare them together with their source; without that the simulator uses practice defaults, and passing here proves nothing about a real exam.
- The repetition scheme is a simple five-box scheme with fixed intervals, not a tuned algorithm. Progress stays in this browser; clearing the site data erases it unless you downloaded a backup.
- The syllabus mapping is only as good as the pack: the page checks that «syllabus_ref» exists in the pack but cannot tell whether the mapping is right. The CEPT HAREC syllabus is not included.
- The interface translations were written by machine and have not been reviewed by native speakers; questions are shown in the language of the pack.

## Contribute in 5 minutes

1. Fork this repository.
2. Copy `data/packs/example.json` to `data/packs/<your-pack-id>.json` (the file name is the pack id) and fill it in, or turn a spreadsheet into a pack with `node scripts/import_csv.mjs` (see `docs/contributor-guide.md`).
3. Run `python3 scripts/validate.py` and `npm test`, then `node scripts/build.mjs` so that the pack is in `index.html`.
4. Open a pull request — data contributions need no coding.
5. No coding needed: try the pack on the page first (tab “Packs”, button “Import”), then send the file in an issue or a pull request; a maintainer adds it to `data/packs/`.

## Good first issues

See `ISSUES_GOOD_FIRST.md` for ready-made tasks.

## License

Code: MIT. Contributed data: state its source; it is released under the same licence unless the file says otherwise.

## Support

If this project is useful, you can [buy me a coffee](https://buymeacoffee.com/echo.of.the.strings).

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

Add yourself with `@all-contributors please add @you for data` in your pull request.

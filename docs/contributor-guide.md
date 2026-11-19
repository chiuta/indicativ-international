# Contributor guide · INDICATIV International

Version: 0.2.1 · Last updated: 2026-11-20 · [Română](contributor-guide.ro.md)

The most useful contribution is a **pack**: the questions of a country’s public question bank for amateur-radio licences, in the shared format (`docs/pack-format.md`), with the source, the edition and the exam rules written down and checked against the official bank. You do not need to program to add one.

## 1. Where the questions come from

- **Use the published bank.** Most regulators publish the question bank of each licence class. Take the file from the regulator’s site and note the edition, the date and the address (`source`, `source_url`).
- **Check that you may share it.** Say in `license` under what terms the questions can be shared (a licence, a decision that makes the bank public, a written permission). If you are not sure, ask in an issue before you spend time.
- **Never rebuild official questions from memory,** from a forum or from the output of an AI assistant: a wrong answer in an exam trainer does harm. If no bank can be shared, write **original** questions and say so in `source` (the built-in pack is an example).
- **Keep the official numbering** in `id` (for example `HU-hamA-0123` for question 123 of the class A bank) and in `source` (“Official bank, class A, 2026 edition, question 123”). It is what lets someone else check your work.
- Write the **exam rules** (`exam`: questions, minutes, pass mark) only if you can cite where they are published; otherwise leave them out.

## 2. Make the pack

**By hand:** copy `data/packs/example.json` to `data/packs/<pack-id>.json` (the file name is the pack id: lower-case letters, digits and hyphens, for example `hu-ham-a`), fill in the header and the questions. The fields and their limits are in `docs/pack-format.md`.

**From a spreadsheet:** put one question per row, save the sheet as **CSV in UTF-8**, then run

```
node scripts/import_csv.mjs questions.csv --id hu-ham-a --title "Hungary · class A" --country HU --class A --lang hu \
  --source "Official question bank, class A, 2026 edition" --source-url https://example.org/bank --license "see the source"
```

(Needs Node.js 24 or newer.) The file is written to `data/packs/hu-ham-a.json`. If a row has a problem, nothing is written, and each problem names its line in the CSV file; `--partial` writes the valid rows instead and lists the others, and `--check` only checks.

| Column | Meaning |
|---|---|
| `question` | the text of the question (required) |
| `a`, `b`, `c`, `d`, `e`, `f` | the answers; `a` and `b` are required, the others optional, with no empty cell between two answers |
| `correct` | the right answer: a letter `A`–`F` or a number `1`–`6` **counting from 1** (the JSON file counts from 0; the script converts) |
| `topic` | the subject (required, or give `--topic` for the whole file) |
| `explanation`, `source_url`, `syllabus_ref`, `figure`, `figure_alt` | optional, as in the pack format |
| `source` | optional: the source of the question; empty means the pack’s `--source` |
| `fixed_order` | optional: `true`/`false` (also `yes`/`no`, `1`/`0`) |
| `id` | optional: empty means `<COUNTRY>-<middle part>-<row number>`, where the middle part is the pack id without its first group and without hyphens (`hu-ham-a` gives `HU-hama-0001`); `--prefix ham` sets the middle part (`HU-ham-0001`) |

The names of the columns may be written in any case and in any order. The separator (`,`, `;` or a tab) is taken from the first line, or set with `--delimiter` (`tab` for a tab). A cell that holds the separator, a quotation mark or a line break is written between quotation marks, with a quotation mark inside doubled (`"say ""hi"""`); spreadsheet programs do this when they save CSV. Further options: `--topic`, `--prefix`, `--syllabus file.json` (the syllabus list of the pack format), `--exam-questions`, `--exam-minutes`, `--exam-pass`, `--exam-penalty`, `--exam-source`, `--out file` (`-` writes to the screen). Exit code 0 means a pack was written (or checked), 1 means problems in the questions, 2 means a mistake in the command or an unreadable file.

**Official files that are not spreadsheets** (PDF, XML, a database export) need a small converter into these columns; that is a good first issue (see `ISSUES_GOOD_FIRST.md`). Do not retype a bank by hand if a file exists.

## 3. Try it

Open `index.html`, tab “Packs”, paste the JSON or choose the file, press “Import”. The page lists every problem with the question and the field and can import just the valid questions. Practise a few questions and run a short exam: wrong keys and unclear wording show up quickly.

## 4. Check it

1. `python3 scripts/validate.py` (needs `pip install jsonschema`): the same rules as the page, for every file of `data/`.
2. `node scripts/pack_report.mjs data/packs/<pack-id>.json`: the number of questions per subject, the official numbers that are missing, where the right answers sit.
3. `node scripts/build.mjs`: puts the pack into `index.html` (every pack of `data/packs/` except `example.json` is built in, about half a kilobyte per question). `npm test` runs all the tests, including the check that `index.html` is up to date.
4. **Compare with the official bank** following `docs/verify-against-official-bank.md`: the text of each question, each answer and each correct answer, and a sample checked by a second person.

## 5. Open the pull request

Say in the description: the country and class; the edition and where it comes from; under what terms it may be shared; who checked what and how (see the verification guide); whether the exam rules are official, and where they are published. Tick the boxes of the template. A pack without a stated source or without permission to share it is not merged.

## 6. Afterwards

- **Never change the `id` of a question that is published:** the progress of every learner is kept under it. Fix the text, or the answer, and keep the id.
- When a bank is **updated**, publish the new edition as a new pack (`hu-ham-a-2027`) or, when most questions are the same, change the pack and keep the ids of the questions that stayed; say which in the pull request.
- Found a mistake in a pack? Open an issue with the question id, the official number and the page of the bank.

## Other ways to help

Review the 50 built-in practice questions, redraw a figure as restricted SVG, test the exam simulator with a screen reader, review the interface texts of your language (`src/i18n.mjs`), or write a converter for an official file format: see `ISSUES_GOOD_FIRST.md`. For the code: `npm test` must pass, the page must stay one `index.html` that works offline, and nothing may call the network.

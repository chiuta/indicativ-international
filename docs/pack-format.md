# Pack format · INDICATIV International

Version: 0.2.0 · Last updated: 2026-11-17 · [Română](pack-format.ro.md)

A **pack** is one UTF-8 JSON file with the exam questions of one country and licence class (or a practice set). The page (tab “Packs” → “Import”), `scripts/validate.py` and `scripts/import_csv.mjs` apply the same rules; `schema.json` describes the shape. A file is accepted only if every rule below holds; the page and the validator name each problem and the place where it is.

## A minimal pack

```json
{
  "format": "indicativ-pack",
  "version": 1,
  "id": "zz-example",
  "title": "Example pack",
  "country": "ZZ",
  "licence_class": "practice",
  "lang": "en",
  "source": "Where the questions come from",
  "license": "MIT",
  "questions": [
    {
      "id": "ZZ-example-0001",
      "topic": "Electricity",
      "question": "What is the SI unit of frequency?",
      "answers": ["Hertz", "Watt", "Volt", "Ohm"],
      "correct": 0,
      "source": "Where this question comes from"
    }
  ]
}
```

`data/packs/example.json` is a ready template. Unknown fields are refused, not ignored, so a misspelt name is found at once.

## Header

| Field | Required | Rule |
|---|---|---|
| `format` | yes | exactly `indicativ-pack` |
| `version` | yes | the number `1` |
| `id` | yes | lower-case letters and digits in groups separated by single hyphens (`hu-ham-a`), at most 40 characters; the file is named `<id>.json` |
| `title` | yes | one line, at most 120 characters |
| `country` | yes | two capital letters (ISO 3166-1 alpha-2, for example `HU`); `ZZ` when the pack belongs to no country |
| `licence_class` | yes | one line, at most 40 characters: the class or level the questions are for (`A`, `HAREC`, `Klasse E` …) |
| `lang` | yes | the language of the questions: two or three lower-case letters (`en`, `hu`, `de`, `rom`) |
| `source` | yes | one line, at most 300 characters: where the questions come from (the bank, its edition and date) |
| `source_url` | no | an `https://` address without spaces, at most 500 characters |
| `license` | yes | one line, at most 80 characters: the licence or the permission under which the questions may be shared |
| `exam` | no | the exam rules, see below |
| `syllabus` | no | a list of up to 500 items `{ "id", "title" }`, see below |
| `questions` | yes | 1 to 3000 questions |

`country`, `licence_class` and `lang` of the header are valid for every question that does not set its own.

## Questions

| Field | Required | Rule |
|---|---|---|
| `id` | yes | two capital letters (normally the country), letters or digits, a number, joined by hyphens, at most 40 characters: `HU-hamA-0001`; unique in the pack. Progress is stored by this id: **changing an id loses the progress on that question** |
| `topic` | yes | the subject, one line, at most 60 characters; the page groups questions and results by it |
| `question` | yes | the text, at most 1000 characters, line breaks allowed |
| `answers` | yes | 2 to 6 answers, each one line of at most 300 characters; two answers that differ only in case, accents or spacing count as the same and are refused |
| `correct` | yes | the position of the right answer in `answers`, counting from 0 |
| `explanation` | no | why the answer is right, at most 1000 characters |
| `source` | yes | one line, at most 300 characters: for a question of an official bank, its number and edition |
| `source_url` | no | an `https://` address |
| `syllabus_ref` | no | the `id` of an item of the pack’s `syllabus`; refused when the item does not exist |
| `figure`, `figure_alt` | no | a drawing and its text alternative, see below; each needs the other |
| `fixed_order` | no | `true` keeps the answers in the order of the file (use it for “all of the above” or for answers that run in increasing order); otherwise the page shuffles them |
| `country`, `licence_class`, `lang` | no | override the value of the header for this question |

Control characters are refused in one-line fields; line breaks are allowed in `question` and `explanation`. Lengths are counted in characters (code points), not bytes.

## Formulas

In `question`, `answers` and `explanation`, `_{…}` makes a subscript and `^{…}` a superscript: `f_{o}` is f with a small o, `10^{-6}` is ten to the minus six, `R_{1} = 3 kΩ`. The braces must hold something and no other braces. Write the units, Greek letters and operators directly in UTF-8 (`kΩ`, `µF`, `×`, `π`).

## Figures

A figure is a small drawing in a **restricted SVG**; the page draws it on a white box with the lines in dark ink, and `figure_alt` is read to people who cannot see it (a sentence saying what the drawing shows, for example “Two resistors in series across a 12 V supply”).

- There is one root, `<svg viewBox="0 0 200 90">` (the `viewBox` is required: four numbers, width and height above 0 and at most 2000); `width`, `height` (1 to 2000) and `xmlns="http://www.w3.org/2000/svg"` are optional. Attributes are written in double quotes; no comments, no XML declaration, no entities.
- Elements: `svg`, `g`, `line`, `rect`, `circle`, `ellipse`, `polyline`, `polygon`, `path` and `text`. Nothing else (no `script`, `style`, `use`, `image`, `foreignObject`), at most 200 elements and 6 levels deep, at most 6000 characters in all.
- Attributes: the geometry of each element (`x`, `y`, `x1`, `y1`, `x2`, `y2`, `cx`, `cy`, `r`, `rx`, `ry`, `width`, `height`, `points`, `d`), `fill` and `stroke` (`none`, `currentColor`, `#rgb` or `#rrggbb`), `stroke-width` (0 to 20), `stroke-linecap`, `stroke-linejoin`, `stroke-dasharray`, `transform` (`translate`, `scale`, `rotate` only), and on `text` also `text-anchor` and `font-size` (4 to 48). Values are numbers up to 10000 in absolute value; a `path` uses only the commands `M L H V C S Q T A Z`, up to 2000 characters. No `style`, `class`, `id`, links or event attributes.
- Text appears only inside `<text>`, up to 200 characters, without `<`, `>` or `&` (write `Ω` and `×` as themselves, not as entities).
- Draw with `stroke="currentColor"` and `fill="none"` so that the drawing is readable on every background.

## Exam rules

```json
"exam": { "questions": 50, "minutes": 60, "pass_percent": 75, "wrong_penalty": 0, "source": "Exam regulation, article 12" }
```

| Field | Rule |
|---|---|
| `questions` | 1 to 200, and not more than the pack has |
| `minutes` | 1 to 600 |
| `pass_percent` | 1 to 100 |
| `wrong_penalty` | optional, 0 to 1: the share of a point that a wrong answer takes away (an unanswered question takes nothing) |
| `source` | required: where these rules are published |

The result is `right − wrong × wrong_penalty` points (never below 0) out of `questions`; the exam is passed when the share of points reaches `pass_percent`. Declare `exam` only when the official rules are published and you can cite them; without it the page uses practice defaults (20 questions, 30 minutes, 75 %, no penalty) and says that they are not the rules of a real exam.

## Syllabus

```json
"syllabus": [ { "id": "1.1", "title": "Circuits and Ohm’s law" }, { "id": "1.2", "title": "Reactance and resonance" } ]
```

`id`: letters, digits, dots, hyphens and underscores (at most 40, starting with a letter or digit), unique in the list; `title`: one line, at most 160 characters. A question links to an item with `syllabus_ref`. The page checks that the link exists, not that it is right: that is for the person who writes the pack and the person who reviews it.

## Limits of the page

At most 3000 questions per pack, 8 imported packs at once, 3,000,000 characters per imported text and about 4,000,000 characters stored in the browser. A pack inside `data/packs/` is built into `index.html` (about half a kilobyte per question), so very large packs are better imported than built in.

## Checking a pack

```
python3 scripts/validate.py                  # every file in data/
python3 scripts/validate.py data/packs       # one directory
node scripts/import_csv.mjs questions.csv --check …   # a spreadsheet, without writing anything
```

When the page imports a pack with problems it lists them (the question, the field) and offers to import only the valid questions. Replacing a pack with the same `id` keeps the progress on questions whose `id` is unchanged.

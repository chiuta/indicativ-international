---
name: New pack or questions
about: Propose or add a question pack to INDICATIV International
labels: data
---

**Country, licence class and language** of the exam, for example `HU`, `HAREC`, `hu`:

**Source (required):** the official question bank with its edition, its date and the address where it is published, or the person who wrote the questions. See `docs/contributor-guide.md`.

**May it be shared?** The terms under which you may publish these questions (public domain, an open licence, written permission, your own questions). Never paste a bank whose terms forbid copying it.

**How many questions, in how many subjects?**

**Exam rules, if the official exam has them:** the number of questions, the minutes, the pass mark and the penalty for a wrong answer, and the address where they are published. Leave this empty if you do not know them: a pack without rules uses the generic simulator.

**The pack itself:** attach `data/packs/<pack-id>.json`, or a spreadsheet saved as CSV that `node scripts/import_csv.mjs` can convert (see `docs/pack-format.md`).

**How will it be checked against the official bank?** Who compares it, and how (see `docs/verify-against-official-bank.md`). A pack nobody has checked is published labelled as unchecked.

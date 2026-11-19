# Verifying a pack against the official bank · INDICATIV International

Version: 0.2.1 · Last updated: 2026-11-20 · [Română](verify-against-official-bank.ro.md)

A trainer is only as good as its answer key. This guide says how to check a pack against the official question bank and how to write down what was checked, so that a reader can decide how far to trust it. “Verified” here means that a named person compared the pack with a named edition of the bank in the way described; no tool decides that for you, and the page cannot tell whether a pack is faithful.

## 1. Fix what you compare with

- Use **one edition** of the official bank: the file, its edition or version, its date and the address where it is published. Keep your copy and note its checksum (`sha256sum file`). Do not add the official file to the repository unless its terms allow it.
- Put these facts into the pack (`source`, `source_url`, `license`) and into the pull request.
- If the regulator publishes several formats (a PDF and a spreadsheet), compare with the one the exam really uses, and say which.

## 2. Count first

```
node scripts/pack_report.mjs data/packs/<pack-id>.json
```

The summary shows the number of questions and per subject, the first and the last official number, the **numbers that are missing** and those used twice, and how many right answers sit at A, B, C and D. Compare each figure with the official file:

- the same number of questions, and the same number per chapter or subject (use the official chapter names as `topic`);
- no missing number, unless the bank itself has gaps (say so);
- right answers spread over the positions: if nine keys in ten sit at one position, look again, because the key may have been read wrongly (a bank is rarely so uneven; the page shuffles the answers when it shows them, so the position in the file does not help a learner to guess).

Every difference has to be explained before you go on (questions withdrawn from the bank, questions that need a figure you did not draw, duplicates).

## 3. Compare every question

Do these three checks for **all** the questions, not for a sample:

1. **The text.** The question and every answer say what the official text says: numbers, units, signs, diacritics, exponents and subscripts (`10^{-6}`, `R_{1}`). A listing for comparison, one line per question:

   ```
   node scripts/pack_report.mjs data/packs/<pack-id>.json --text > pack.txt
   ```

   Turn the official file into plain text in the same shape (or the other way round) and compare the two with a diff tool; ignore differences of spacing and quotation marks, not of numbers or words.
2. **The key.** The answer marked right in the pack is the answer that the official key marks as right. Compare the **text** of the answer, not its letter: the official bank may use other positions, and the page shuffles them anyway. This is the check that matters most.
3. **The figures.** A drawing shows the same circuit, the same values and the same labels as the official figure; `figure_alt` says in words what it shows. If you could not draw a figure, leave the question out and say so in the pull request, rather than keep a question that cannot be answered.

## 4. A second person checks a sample

Another person, who did not write the pack, compares a **random sample**: 30 questions or 10 % of the pack, whichever is larger (all of them when the pack has fewer than 30). Draw it with a seed and write the seed in the pull request, so that anyone can draw the same one:

```
node scripts/pack_report.mjs data/packs/<pack-id>.json --sample 30 --seed 7
```

The second person does the three checks of section 3 on those questions only. One mistake in the sample is a reason to check **all** the questions again.

## 5. Write down what was checked

Copy this into the pull request and fill it in; leave out nothing that was not done, and say so instead:

```
Official file: <name>, edition <…>, <date>, <address>, SHA-256 <…>
Questions: in the official file <N>, in the pack <N> (difference: <none | explained>)
Compared in full by <name>: texts <yes/no>, keys <yes/no>, figures <yes/no/none>
Method: <diff of text listings | by eye against the PDF | …>
Second check by <name>: sample of <N> questions, seed <S>, mistakes found <N>
Differences found and fixed: <…>
Not checked: <…>
Exam rules: <not included | questions/minutes/pass mark, published at <address>>
```

## 6. When the official bank looks wrong

The pack mirrors the bank, because the exam uses the bank. Keep the official answer in the pack, **do not correct it silently**, and open an issue with the question number, the page of the bank and your reason. If the regulator publishes a correction, update the pack to the corrected edition and say so. If you add a remark for learners, put it in `explanation`, and say plainly that it is a remark and not the official answer.

## 7. What this does and does not prove

A verified pack matches an edition of the bank in the points that were checked. It does not prove that the bank is the one used in today’s exam, that the exam rules have not changed, or that passing the simulator means passing the exam: banks and rules are revised, so read the date of the edition, and the date of the check, before you trust a pack.

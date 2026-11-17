## What does this change?

- [ ] `python3 scripts/validate.py` passes (needs `pip install jsonschema`)
- [ ] `npm test` passes
- [ ] `node scripts/build.mjs` was run and `index.html` is committed (`node scripts/build.mjs --check` passes)
- [ ] The source is cited for the pack and for every question, with the edition, the date and the address
- [ ] I may legally share this material (public domain, my own questions, an open licence, or with written permission; never a bank whose terms forbid copying it)
- [ ] If the pack has exam rules (`exam`), their source is cited; if I do not know them, I left them out
- [ ] An existing pack keeps its `id` and the ids of its questions; a new edition is a new pack
- [ ] A pack made from an official bank carries the record described in section 5 of `docs/verify-against-official-bank.md` (below), or says plainly that it has not been checked

### Record of the check

```
Official file: <name>, edition <…>, <date>, <address>, SHA-256 <…>
Questions: in the official file <N>, in the pack <N> (difference: <none | explained>)
Compared in full by <name>: texts <yes/no>, keys <yes/no>, figures <yes/no/none>
Method: <…>
Second check by <name>: sample of <N> questions, seed <S>, mistakes found <N>
Not checked: <…>
```

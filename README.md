# INDICATIV International

**English** · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Version: 0.1.0 · Last updated: 2026-11-14

🌐 https://indicativ-international.chiuta.ro

> Amateur-radio exam question banks for every country, in one shared format.

Trade-free: no tracking, no ads, no accounts, works offline.

## Status

Alpha: the repository holds the structure, the data schema or the first examples and the contribution guides. The scope below is the plan, not what works today.

## Planned scope

- One shared JSON format for amateur-radio exam question banks, validated by a script (for example that `correct` is within the `answers` range).
- The CEPT HAREC syllabus as `syllabus.json`, with a `syllabus_ref` field linking each question to a syllabus item.
- Country packs from public question banks, starting with Hungary, Italy and Germany (Klasse E), each with a source link.
- A spaced-repetition trainer and an exam simulator with a timer and a pass mark per country.
- Formula and diagram support (SVG) in questions, and a guide on verifying a question against the official bank.

None of this is implemented yet: each item is a ready-made task in `ISSUES_GOOD_FIRST.md`.

## Contribute in 5 minutes

1. Fork this repository.
2. Copy `data/questions/example.json` into `data/questions/` and edit it.
3. Run `python scripts/validate.py`.
4. Open a pull request — data contributions need no coding.

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

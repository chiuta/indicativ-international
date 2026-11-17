# Sarcini bune pentru început

[English](ISSUES_GOOD_FIRST.md) · **Română** · [Français](ISSUES_GOOD_FIRST.fr.md) · [Italiano](ISSUES_GOOD_FIRST.it.md) · [Español](ISSUES_GOOD_FIRST.es.md) · [Português](ISSUES_GOOD_FIRST.pt.md) · [Deutsch](ISSUES_GOOD_FIRST.de.md) · [Magyar](ISSUES_GOOD_FIRST.hu.md)

- [ ] Adaugă un pachet pentru Ungaria din banca publică de întrebări (`scripts/import_csv.mjs`, numerotarea oficială în `id` și `source`, `source_url`, regulile de examen cu sursa lor)
- [ ] Adaugă un pachet pentru Italia din banca publică de întrebări, cu aceeași grijă (ediție, adresa sursei, numerotare, reguli de examen)
- [ ] Adaugă un pachet pentru Germania (clasa E sau A) din banca publică de întrebări, cu aceeași grijă
- [ ] Adaugă un pachet pentru propria țară din banca ei oficială de întrebări, în orice limbă, și spune-ne ce ai verificat
- [ ] Scrie un convertor din formatul oficial de fișier al unei țări (PDF, tabel sau XML) în coloanele CSV ale `scripts/import_csv.mjs`
- [ ] Adaugă programa CEPT HAREC (Recomandarea T/R 61-02) ca `syllabus` al unui pachet și leagă fiecare întrebare cu `syllabus_ref`
- [ ] Cere unui radioamator să revizuiască cele 50 de întrebări de exersare încorporate și să raporteze orice răspuns greșit sau formulare neclară
- [ ] Redesenează figurile cu circuite și antene ale unui pachet ca SVG restrâns, fiecare cu un text alternativ în `figure_alt`
- [ ] Testează simulatorul de examen cu un cititor de ecran (NVDA, VoiceOver sau Orca) și raportează ce este greu de folosit
- [ ] Cere unui vorbitor nativ să revizuiască textele interfeței în limba lui din `src/i18n.mjs`

Creează-le pe toate pe GitHub cu `scripts/create_issues.sh` (cere CLI-ul `gh`).

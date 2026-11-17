# Jó első feladatok

[English](ISSUES_GOOD_FIRST.md) · [Română](ISSUES_GOOD_FIRST.ro.md) · [Français](ISSUES_GOOD_FIRST.fr.md) · [Italiano](ISSUES_GOOD_FIRST.it.md) · [Español](ISSUES_GOOD_FIRST.es.md) · [Português](ISSUES_GOOD_FIRST.pt.md) · [Deutsch](ISSUES_GOOD_FIRST.de.md) · **Magyar**

- [ ] Csomag hozzáadása Magyarországhoz a nyilvános kérdésbankból (`scripts/import_csv.mjs`, hivatalos számozás az `id` és a `source` mezőben, `source_url`, a vizsgaszabályok a forrásukkal)
- [ ] Csomag hozzáadása Olaszországhoz a nyilvános kérdésbankból, ugyanilyen gondossággal (kiadás, a forrás címe, számozás, vizsgaszabályok)
- [ ] Csomag hozzáadása Németországhoz (E vagy A osztály) a nyilvános kérdésbankból, ugyanilyen gondossággal
- [ ] Csomag hozzáadása a saját országodhoz annak hivatalos kérdésbankjából, bármilyen nyelven, és írd meg, mit ellenőriztél
- [ ] Átalakító írása egy ország hivatalos fájlformátumából (PDF, táblázat vagy XML) a `scripts/import_csv.mjs` CSV-oszlopaira
- [ ] A CEPT HAREC tananyagterv (T/R 61-02 ajánlás) hozzáadása egy csomag `syllabus` mezőjeként, és minden kérdés összekötése a `syllabus_ref` mezővel
- [ ] Egy rádióamatőrrel átnézetni az 50 beépített gyakorlókérdést, és jelenteni minden hibás választ vagy érthetetlen megfogalmazást
- [ ] Egy csomag áramköri és antennaábráinak újrarajzolása korlátozott SVG-ként, mindegyik szöveges alternatívával a `figure_alt` mezőben
- [ ] A vizsgaszimulátor kipróbálása képernyőolvasóval (NVDA, VoiceOver vagy Orca), és jelenteni, mi nehezen használható
- [ ] A saját nyelv felületi szövegeinek átnézetése egy anyanyelvi beszélővel a `src/i18n.mjs` fájlban

Hozd létre mindet GitHubon a `scripts/create_issues.sh` szkripttel (a `gh` CLI szükséges).

# Változásnapló

[English](CHANGELOG.md) · [Română](CHANGELOG.ro.md) · [Français](CHANGELOG.fr.md) · [Italiano](CHANGELOG.it.md) · [Español](CHANGELOG.es.md) · [Português](CHANGELOG.pt.md) · [Deutsch](CHANGELOG.de.md) · **Magyar**

Formátum: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · [SemVer](https://semver.org/).

## [Kiadatlan]

## [0.2.1] - 2026-11-20

### Módosítva
- fff-kit 1.8.1: ha a böngésző blokkolja a tárolást vagy nincs tárolója (a `localStorage`/`sessionStorage` hibát dob vagy hiányzik), az oldal ideiglenes, memóriabeli tárolóval indul ahelyett, hogy leállna; az adatok az oldal bezárása után nem maradnak meg.
- fff-kit 1.8.1: a kis vezérlőket 44 px-re növelő segéd mostantól az oldal törzsének és a szülőelemnek a szélességét is méri, így a gombsor már nem lóghat ki a képernyőről (a csoport érintetlen marad, ha a növelés túl szélessé tenné).

## [0.2.0] - 2026-11-17

### Hozzáadva
- A motor a `src/engine.mjs` fájlban: csomagok és ábrák érvényesítése, az ötdobozos ismétlési ütemezés, kérdéssorok, magértékből húzott vizsgák, értékelés és haladásfájlok.
- Az oldal: a „Gyakorlás”, „Vizsga”, „Csomagok” és „Útmutató” lap nyolc nyelven; billentyűparancsok, bejelentések képernyőolvasóknak, újratöltést túlélő vizsgaidőzítő; csomagok importálása, letöltése, nullázása és eltávolítása; a haladás mentése.
- Egy beépített gyakorlócsomag 50 eredeti kérdéssel (magyarázatokkal, képletekkel és két ábrával), amelyet ehhez a projekthez írtak egy MI-asszisztenssel, és számolással ellenőriztek; nem hivatalos kérdésbank.
- A közös csomagformátum: a `schema.json`, a `data/packs/example.json` sablon és a `docs/pack-format.md` (angolul és románul).
- A `scripts/validate.py` ugyanazokat a szabályokat alkalmazza, mint az oldal; a tesztek ugyanazokon az eseteken hasonlítják össze a motorral.
- `scripts/import_csv.mjs`: a CSV-ként mentett táblázatból csomag lesz, és minden hiba megnevezi a fájlbeli sorát.
- `scripts/pack_report.mjs`: egy csomag összefoglalója (számlálások, hiányzó hivatalos számok, a helyes válaszok helye, szöveges lista, véletlen minta), hogy a hivatalos kérdésbankkal szemben ellenőrizhető legyen.
- A `docs/contributor-guide.md` és a `docs/verify-against-official-bank.md` (angolul és románul).
- Tesztek: `npm test` és böngészőtesztek a hubban.
- `src/` és `scripts/build.mjs`: az egyetlen `index.html` mostantól forrásokból épül, beágyazott csomagokkal, és a `--check` ellenőrzi.
- Az ISSUES_GOOD_FIRST és a CODE_OF_CONDUCT lefordítva mind a nyolc nyelvre.
- README angolul, románul, franciául, olaszul, spanyolul, portugálul, németül és magyarul: állapot- és tervezett terjedelem-szakaszok (az `ISSUES_GOOD_FIRST.md` alapján).
- Telepíthető (PWA): a `manifest.webmanifest`, az `sw.js` és az ikonok a közös kitből (`fff-kit/pwa`) készülnek; az oldal az első HTTPS-látogatás után offline is működik.

### Módosítva
- A munkafolyamat Ubuntu 26.04 és Node.js 26 alatt fut, és a teszteket, a build-ellenőrzést meg az érvényesítést is futtatja.
- Az adatok mostantól csomagok: a `data/packs/example.json` váltja a `data/questions/example.json` fájlt, és egy csomag egy, az azonosítójáról elnevezett fájl; a `scripts/validate.py`, a README lépései és a sablonok ennek megfelelően módosultak.
- A „good first issues” lista most azt tartalmazza, ami még hátravan (országcsomagok, tananyagterv, átnézések); a gyakorló felület, a vizsgaszimulátor, az ábrák és a `correct` ellenőrzése, amelyeket korábban felsorolt, már léteznek.

## [0.1.0] - 2026-11-13

### Hozzáadva
- Kezdeti váz: szerkezet, adatséma vagy első példák, hozzájárulási útmutatók nyolc nyelven.

# INDICATIV International

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · **Magyar**

Verzió: 0.2.1 · Utolsó frissítés: 2026-11-22

🌐 https://indicativ-international.chiuta.ro

> Rádióamatőr-vizsgakérdések minden országból, közös formátumban.

Trade-free: nincs követés, nincs reklám, nincs fiók, offline is működik.

## Állapot

Alfa, használható: az egyetlen `index.html` egy gyakorló és vizsgaszimulátor rádióamatőr-vizsgakérdésekhez. Öt dobozos ismétlési ütemezéssel gyakorol, időkorlátos próbavizsgát futtat ponthatárral, és közös JSON formátumú kérdéscsomagokat importál. A beépített csomag 50, kifejezetten ehhez a projekthez írt eredeti gyakorlókérdést tartalmaz; nem hivatalos kérdésbank, és országcsomag még nincs benne. Minden a böngésződben marad, fiókok, követés és hálózati kérések nélkül.

## Mit tud

- „Gyakorlás”: válassz csomagot, témát és azt, hogy mely kérdéseket gyakorlod (esedékes és új, bármelyik kérdés, vagy a gyenge pontjaid); minden választ azonnal ellenőriz és megmagyaráz, a forrásával együtt. A helyes válaszok 1, 3, 7, 14 és 30 nap múlva jönnek vissza; a hibásak ma, és a gyakorlás végén még egyszer. Az 1–6 vagy A–F billentyűk választ választanak, az Enter továbblép.
- „Vizsga”: a csomagból véletlenszerűen húzott, időkorlátos teszt visszaszámlálóval, kérdéstérképpel, „Megjelölés átnézésre” funkcióval és ponthatárral; semmi sincs értékelve, amíg be nem fejezed (vagy le nem jár az idő). Az eredmény témánként mutatja a pontszámot és a hibásan megválaszolt kérdéseket; ugyanaz a magérték megismétel egy vizsgát; egy megkezdett vizsga újratöltés után is folytatódik. A szabályok (kérdések, percek, ponthatár, a hibás válaszok levonása) a csomagból jönnek a forrásukkal; nélkülük az oldal gyakorló értékeket használ (20 kérdés, 30 perc, 75 %).
- „Csomagok”: a beépített gyakorlócsomag és a JSON beillesztésével vagy fájl választásával importált csomagok (egyszerre legfeljebb 8), mindegyik a forrásával, licencével és vizsgaszabályaival; haladás témánként; letölthetsz egy csomagot, nullázhatod a haladását vagy eltávolíthatod; a haladásról fájlba mentett másolat, amelyet egy másik eszközön betölthetsz. A problémás csomagot sorról sorra felsorolja, és csak az érvényes kérdéseit is importálhatod.
- Formátum: a kérdésekben képletek `f_{o}` vagy `10^{-6}` alakban; kis rajzok korlátozott SVG-ként szöveges alternatívával; elhagyható tananyagterv, minden kérdésen `syllabus_ref`-fel; csomagonként egy JSON-fájl a `data/packs/` mappában, amelyet a `schema.json` és a `docs/pack-format.md` ír le.
- Eszközök a közreműködőknek: a `scripts/validate.py` ugyanazokkal a szabályokkal ellenőrzi a csomagokat, mint az oldal; a `scripts/import_csv.mjs` a CSV-ként mentett táblázatból csomagot készít, és minden hibánál megnevezi a sorát; a `scripts/pack_report.mjs` összefoglal egy csomagot, hogy a hivatalos kérdésbankkal szemben ellenőrizhesd. A felület nyolc nyelvű, és billentyűzettel meg képernyőolvasóval is használható.
- Alkalmazásként telepíthető, és az első látogatás után offline is elérhető, ha HTTPS-en keresztül szolgálják ki (egy service worker megőrzi az oldalt; semmi mást nem tárol és nem küld). Letöltött fájlból megnyitva ugyanígy működik, telepítés nélkül.

## Hogyan működik

- A `schema.json` leír egy csomagot; a `scripts/validate.py` a `data/packs/` minden fájlját ellenőrzi ellene és azokkal a szabályokkal, amelyeket egy séma nem tud kifejezni: a fájl a csomag azonosítójáról kapja a nevét, az azonosítók és a kérdések egy csomagon belül egyediek, a `syllabus_ref` létezik a tananyagtervben, az ábrák csak az engedélyezett elemeket használják, a vizsgaszabályok pedig illenek a csomaghoz.
- A `src/engine.mjs` a motor (képernyő és hálózat nélkül): érvényesítés, az ötdobozos ütemezés, a kérdéssorok, magértékből húzott vizsgák, értékelés és a haladásfájlok. A `scripts/validate.py` és a `scripts/import_csv.mjs` ugyanazokat a szabályokat alkalmazza; a tesztek ugyanazokon az eseteken hasonlítják össze a megvalósításokat.
- A `src/ui.js`, a `src/i18n.mjs` és a `src/app.css` a felület; a `scripts/build.mjs` a `src/` mappából építi fel az egyetlen `index.html` fájlt, és beágyazza a `data/packs/` csomagjait (az `example.json` kivételével mindet); a `node scripts/build.mjs --check` hibával leáll, ha az oldal nem naprakész.
- A böngésző három bejegyzést őriz (importált csomagok, haladás, egy folyamatban lévő vizsga); mindegyiket újra ellenőrzi az oldal betöltésekor, így a sérült vagy ellenséges mentett állapotot figyelmen kívül hagyja, nem hiszi el. Semmi sem megy sehová.
- Tesztek: `npm test` (motor, az érvényesítő egyezése, CSV-import, a felület szövegei, adatok, dokumentáció, építés) és böngészőtesztek a hubban (nyolc nyelv, akadálymentesség, ellenséges mentett állapot, import, a vizsga időmérése) A fejlesztéshez Node.js 24 vagy újabb, valamint Python 3 és `jsonschema` kell; maga az oldal csak egy ES2017-et ismerő böngészőt igényel.
- A `manifest.webmanifest`, az `sw.js` és az ikonok a `node scripts/build.mjs` futtatásakor készülnek a közös kit révén (az `src/app.json` `pwa` szakasza); a `--check` is ellenőrzi őket, az `npm test` pedig azt, hogy a manifeszt, a service worker verziója és a CSP megegyezik az oldalval.

## Őszinte korlátok

- A beépített csomag néhány gyakorlókérdés, MI-asszisztenssel írva, számítással vagy tankönyvi tényekkel ellenőrizve. Nem hivatalos kérdésbank, és vizsgáztató nem nézte át.
- Országcsomag nincs benne: Magyarország, Olaszország, Németország és mások nyilvános kérdésbankját itt nem lehetett letölteni és ellenőrizni, ezért ezek a közreműködők feladatai. Minden csomagot vess össze a hivatalos bankkal, mielőtt megbízol benne.
- A valódi vizsgák szabályai (kérdésszám, idő, sikeres határ) nincsenek beépítve. A csomag megadhatja őket a forrásukkal együtt; enélkül a szimulátor gyakorló alapértékeket használ, és az itteni siker semmit sem bizonyít egy valódi vizsgáról.
- Az ismétlési séma egyszerű, öt dobozos, rögzített időközökkel, nem finomhangolt algoritmus. A haladás ebben a böngészőben marad; a webhelyadatok törlése eltörli, hacsak nem töltöttél le másolatot.
- A tananyaghoz rendelés annyit ér, mint a csomag: az oldal azt ellenőrzi, hogy a «syllabus_ref» szerepel a csomagban, de azt nem tudja, helyes-e a hozzárendelés. A CEPT HAREC tananyag nincs benne.
- A felület fordításait gép írta, anyanyelvi beszélők nem nézték át; a kérdések a csomag nyelvén jelennek meg.

## Járulj hozzá 5 perc alatt

1. Forkold ezt a tárolót.
2. Másold a `data/packs/example.json` fájlt a `data/packs/<a-csomagod-azonosítója>.json` helyre (a fájlnév a csomag azonosítója), és töltsd ki, vagy készíts egy táblázatból csomagot a `node scripts/import_csv.mjs` paranccsal (lásd `docs/contributor-guide.md`).
3. Futtasd a `python3 scripts/validate.py` és az `npm test` parancsot, majd a `node scripts/build.mjs` parancsot, hogy a csomag bekerüljön az `index.html` fájlba.
4. Nyiss egy pull requestet — az adatok hozzáadásához nem kell programozni.
5. Programozás nélkül: próbáld ki előbb a csomagot az oldalon („Csomagok” lap, „Importálás” gomb), majd küldd el a fájlt egy issue-ban vagy pull requestben; egy karbantartó felveszi a `data/packs/` mappába.

## Jó első feladatok

Kész feladatok: `ISSUES_GOOD_FIRST.md`.

## Licenc

Kód: MIT. A beküldött adatoknál add meg a forrást; azonos licenc alatt jelennek meg, ha a fájl mást nem mond.

## Támogatás

Ha hasznos a projekt, [meghívhatsz egy kávéra](https://buymeacoffee.com/echo.of.the.strings).

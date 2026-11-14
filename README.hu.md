# INDICATIV International

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · **Magyar**

Verzió: 0.1.0 · Utolsó frissítés: 2026-11-14

🌐 https://indicativ-international.chiuta.ro

> Rádióamatőr-vizsgakérdések minden országból, közös formátumban.

Trade-free: nincs követés, nincs reklám, nincs fiók, offline is működik.

## Állapot

Alfa: a tároló a szerkezetet, az adatsémát vagy az első példákat és a közreműködési útmutatókat tartalmazza. Az alábbi terjedelem a terv, nem a ma működő állapot.

## Tervezett terjedelem

- Közös JSON-formátum a rádióamatőr-vizsga kérdésbankjaihoz, szkripttel ellenőrizve (például hogy a `correct` az `answers` tartományába esik).
- A CEPT HAREC tananyag `syllabus.json`-ként, `syllabus_ref` mezővel, amely minden kérdést egy tananyagponthoz köt.
- Országcsomagok nyilvános kérdésbankokból, Magyarországgal, Olaszországgal és Németországgal (Klasse E) kezdve, mindegyik forráshivatkozással.
- Időzített ismétlést használó gyakorló és vizsgaszimulátor időmérővel és országonkénti megfelelési ponthatárral.
- Képletek és ábrák (SVG) támogatása a kérdésekben, és útmutató egy kérdés hivatalos bankkal való ellenőrzéséhez.

Ezek közül még semmi sincs megvalósítva: minden pont kész feladat az `ISSUES_GOOD_FIRST.md` fájlban.

## Járulj hozzá 5 perc alatt

1. Forkold ezt a tárolót.
2. Másold a `data/questions/example.json` fájlt a `data/questions/` mappába, és szerkeszd.
3. Futtasd: `python scripts/validate.py`.
4. Nyiss egy pull requestet – adatokhoz nem kell programozni.

## Jó első feladatok

Kész feladatok: `ISSUES_GOOD_FIRST.md`.

## Licenc

Kód: MIT. A beküldött adatoknál add meg a forrást; azonos licenc alatt jelennek meg, ha a fájl mást nem mond.

## Támogatás

Ha hasznos a projekt, [meghívhatsz egy kávéra](https://buymeacoffee.com/echo.of.the.strings).

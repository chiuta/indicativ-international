# Közreműködés — INDICATIV International

[English](CONTRIBUTING.md) · [Română](CONTRIBUTING.ro.md) · [Français](CONTRIBUTING.fr.md) · [Italiano](CONTRIBUTING.it.md) · [Español](CONTRIBUTING.es.md) · [Português](CONTRIBUTING.pt.md) · [Deutsch](CONTRIBUTING.de.md) · **Magyar**

Verzió: 0.2.0 · Utolsó frissítés: 2026-11-17

1. Forkold ezt a tárolót.
2. Másold a `data/packs/example.json` fájlt a `data/packs/<a-csomagod-azonosítója>.json` helyre (a fájlnév a csomag azonosítója), és töltsd ki, vagy készíts egy táblázatból csomagot a `node scripts/import_csv.mjs` paranccsal (lásd `docs/contributor-guide.md`).
3. Futtasd a `python3 scripts/validate.py` és az `npm test` parancsot, majd a `node scripts/build.mjs` parancsot, hogy a csomag bekerüljön az `index.html` fájlba.
4. Nyiss egy pull requestet — az adatok hozzáadásához nem kell programozni.
5. Programozás nélkül: próbáld ki előbb a csomagot az oldalon („Csomagok” lap, „Importálás” gomb), majd küldd el a fájlt egy issue-ban vagy pull requestben; egy karbantartó felveszi a `data/packs/` mappába.

## Szabályok

- Egy csomag = egy fájl, a csomag azonosítójáról elnevezve.
- Mindig add meg a forrást.
- Csak olyan anyagot küldj, amelyet jogszerűen megoszthatsz (nincs másolt, védett szöveg).
- Légy kedves: lásd az Etikai kódexet.

## Kérdéscsomag hozzáadása

1. Először a forrást válaszd ki. Egy országcsomagnak az adott ország nyilvános kérdésbankjából kell származnia (vagy más olyan forrásból, amelyet jogszerűen megoszthatsz): jegyezd fel a kiadást, a dátumot és a webcímet. Ne másolj könyvből, tanfolyamról vagy weboldalról, ha a licence nem engedi; ha nem másolhatsz, írj eredeti kérdéseket, és mondd ezt a `source` mezőben.
2. Másold a `data/packs/example.json` fájlt a `data/packs/<a-csomagod-azonosítója>.json` helyre. A fájlnév a csomag azonosítója: kisbetűk, számjegyek és kötőjelek, például `hu-ham-a`. Töltsd ki a fejlécet: `country`, `licence_class`, `lang`, `source`, `source_url`, `license`, és az `exam` szabályokat csak akkor, ha a hivatalos szabályok közzé vannak téve (a forrásukkal).
3. Add hozzá a kérdéseket: kézzel a fájlban, vagy CSV-ként mentett táblázatból a `node scripts/import_csv.mjs questions.csv --id <csomag-azonosító> --title … --country … --class … --lang … --source … --license …` paranccsal (oszlopok és kapcsolók: `docs/contributor-guide.md`). A hivatalos számozást tartsd meg az `id` és a `source` mezőben.
4. Ellenőrizd a csomagot a hivatalos kérdésbankkal szemben (`docs/verify-against-official-bank.md`): minden kérdés szövegét, minden választ és minden helyes választ; kérd meg egy második embert, hogy ellenőrizzen egy mintát, és írd meg a pull requestben, ki mit és hogyan ellenőrzött.
5. Futtasd a `python3 scripts/validate.py` parancsot, majd a `node scripts/build.mjs` parancsot (ez beteszi a csomagot az `index.html` fájlba) és az `npm test` parancsot. A csomagot elküldés előtt ki is próbálhatod: nyisd meg az `index.html` fájlt, „Csomagok” lap, „Importálás” gomb.
6. Nyiss egy pull requestet vagy issue-t, és írd meg, melyik kiadást használtad, és milyen feltételekkel oszthatod meg. A forrás nélküli csomagot nem vesszük át.

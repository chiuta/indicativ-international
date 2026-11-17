# Formatul pachetelor · INDICATIV International

Versiune: 0.2.0 · Ultima actualizare: 2026-11-17 · [English](pack-format.md)

Un **pachet** este un fișier JSON UTF-8 cu întrebările de examen ale unei țări și ale unei clase de autorizare (sau un set de exersare). Pagina (fila «Pachete» → «Importă»), `scripts/validate.py` și `scripts/import_csv.mjs` aplică aceleași reguli; `schema.json` descrie forma. Un fișier este primit doar dacă toate regulile de mai jos sunt respectate; pagina și validatorul numesc fiecare problemă și locul ei.

## Un pachet minimal

```json
{
  "format": "indicativ-pack",
  "version": 1,
  "id": "zz-example",
  "title": "Pachet de exemplu",
  "country": "ZZ",
  "licence_class": "practice",
  "lang": "ro",
  "source": "De unde vin întrebările",
  "license": "MIT",
  "questions": [
    {
      "id": "ZZ-example-0001",
      "topic": "Electricitate",
      "question": "Care este unitatea SI de măsură a frecvenței?",
      "answers": ["Hertz", "Watt", "Volt", "Ohm"],
      "correct": 0,
      "source": "De unde vine această întrebare"
    }
  ]
}
```

`data/packs/example.json` este un șablon gata făcut. Câmpurile necunoscute sunt refuzate, nu ignorate, așa că un nume scris greșit se găsește imediat.

## Antetul

| Câmp | Obligatoriu | Regulă |
|---|---|---|
| `format` | da | exact `indicativ-pack` |
| `version` | da | numărul `1` |
| `id` | da | litere mici și cifre în grupuri despărțite prin cratime simple (`hu-ham-a`), cel mult 40 de caractere; fișierul se numește `<id>.json` |
| `title` | da | un rând, cel mult 120 de caractere |
| `country` | da | două litere mari (ISO 3166-1 alpha-2, de exemplu `HU`); `ZZ` când pachetul nu aparține unei țări |
| `licence_class` | da | un rând, cel mult 40 de caractere: clasa sau nivelul pentru care sunt întrebările (`A`, `HAREC`, `Klasse E` …) |
| `lang` | da | limba întrebărilor: două sau trei litere mici (`en`, `hu`, `de`, `rom`) |
| `source` | da | un rând, cel mult 300 de caractere: de unde vin întrebările (banca, ediția și data) |
| `source_url` | nu | o adresă `https://` fără spații, cel mult 500 de caractere |
| `license` | da | un rând, cel mult 80 de caractere: licența sau permisiunea în baza căreia pot fi distribuite întrebările |
| `exam` | nu | regulile examenului, vezi mai jos |
| `syllabus` | nu | o listă de cel mult 500 de elemente `{ "id", "title" }`, vezi mai jos |
| `questions` | da | de la 1 la 3000 de întrebări |

`country`, `licence_class` și `lang` din antet sunt valabile pentru fiecare întrebare care nu le dă pe ale ei.

## Întrebările

| Câmp | Obligatoriu | Regulă |
|---|---|---|
| `id` | da | două litere mari (de obicei țara), litere sau cifre, un număr, legate prin cratime, cel mult 40 de caractere: `HU-hamA-0001`; unic în pachet. Progresul se păstrează după acest id: **dacă îl schimbi, pierzi progresul la acea întrebare** |
| `topic` | da | materia, un rând, cel mult 60 de caractere; pagina grupează întrebările și rezultatele după ea |
| `question` | da | textul, cel mult 1000 de caractere, cu rânduri noi permise |
| `answers` | da | de la 2 la 6 răspunsuri, fiecare pe un rând de cel mult 300 de caractere; două răspunsuri care diferă doar prin litere mari/mici, diacritice sau spații sunt socotite la fel și sunt refuzate |
| `correct` | da | poziția răspunsului corect în `answers`, numărând de la 0 |
| `explanation` | nu | de ce este corect răspunsul, cel mult 1000 de caractere |
| `source` | da | un rând, cel mult 300 de caractere: pentru o întrebare dintr-o bancă oficială, numărul ei și ediția |
| `source_url` | nu | o adresă `https://` |
| `syllabus_ref` | nu | `id`-ul unui element din `syllabus`-ul pachetului; refuzat dacă elementul nu există |
| `figure`, `figure_alt` | nu | un desen și alternativa lui text, vezi mai jos; fiecare cere pe celălalt |
| `fixed_order` | nu | `true` păstrează răspunsurile în ordinea din fișier (pentru «toate cele de mai sus» sau pentru răspunsuri în ordine crescătoare); altfel pagina le amestecă |
| `country`, `licence_class`, `lang` | nu | înlocuiesc valoarea din antet pentru această întrebare |

Caracterele de control sunt refuzate în câmpurile pe un rând; rândurile noi sunt permise în `question` și `explanation`. Lungimile se numără în caractere (puncte de cod), nu în octeți.

## Formule

În `question`, `answers` și `explanation`, `_{…}` face un indice și `^{…}` un exponent: `f_{o}` este f cu un o mic dedesubt, `10^{-6}` este zece la minus șase, `R_{1} = 3 kΩ`. Acoladele trebuie să cuprindă ceva și nicio altă acoladă. Unitățile, literele grecești și operatorii se scriu direct în UTF-8 (`kΩ`, `µF`, `×`, `π`).

## Figuri

O figură este un desen mic într-un **SVG restrâns**; pagina îl pune pe un fundal alb, cu liniile în cerneală închisă, iar `figure_alt` este citit de cei care nu îl pot vedea (o propoziție care spune ce arată desenul, de exemplu «Două rezistoare în serie la o sursă de 12 V»).

- Există o singură rădăcină, `<svg viewBox="0 0 200 90">` (`viewBox` este obligatoriu: patru numere, lățimea și înălțimea mai mari ca 0 și cel mult 2000); `width`, `height` (de la 1 la 2000) și `xmlns="http://www.w3.org/2000/svg"` sunt opționale. Atributele se scriu între ghilimele duble; fără comentarii, fără declarație XML, fără entități.
- Elemente: `svg`, `g`, `line`, `rect`, `circle`, `ellipse`, `polyline`, `polygon`, `path` și `text`. Nimic altceva (nici `script`, `style`, `use`, `image`, `foreignObject`), cel mult 200 de elemente și 6 niveluri de adâncime, cel mult 6000 de caractere în total.
- Atribute: geometria fiecărui element (`x`, `y`, `x1`, `y1`, `x2`, `y2`, `cx`, `cy`, `r`, `rx`, `ry`, `width`, `height`, `points`, `d`), `fill` și `stroke` (`none`, `currentColor`, `#rgb` sau `#rrggbb`), `stroke-width` (de la 0 la 20), `stroke-linecap`, `stroke-linejoin`, `stroke-dasharray`, `transform` (doar `translate`, `scale`, `rotate`), iar la `text` și `text-anchor` și `font-size` (de la 4 la 48). Valorile sunt numere de cel mult 10000 în valoare absolută; un `path` folosește doar comenzile `M L H V C S Q T A Z`, cel mult 2000 de caractere. Fără `style`, `class`, `id`, legături sau atribute de eveniment.
- Textul apare doar în `<text>`, cel mult 200 de caractere, fără `<`, `>` sau `&` (scrie `Ω` și `×` ca atare, nu ca entități).
- Desenează cu `stroke="currentColor"` și `fill="none"`, ca desenul să se citească pe orice fundal.

## Regulile examenului

```json
"exam": { "questions": 50, "minutes": 60, "pass_percent": 75, "wrong_penalty": 0, "source": "Regulamentul examenului, articolul 12" }
```

| Câmp | Regulă |
|---|---|
| `questions` | de la 1 la 200 și nu mai multe decât are pachetul |
| `minutes` | de la 1 la 600 |
| `pass_percent` | de la 1 la 100 |
| `wrong_penalty` | opțional, de la 0 la 1: partea dintr-un punct pe care o ia un răspuns greșit (o întrebare fără răspuns nu ia nimic) |
| `source` | obligatoriu: unde sunt publicate aceste reguli |

Rezultatul este `corecte − greșite × wrong_penalty` puncte (niciodată sub 0) din `questions`; examenul este promovat când partea de puncte atinge `pass_percent`. Declară `exam` doar când regulile oficiale sunt publicate și le poți cita; fără el pagina folosește valori de exersare (20 de întrebări, 30 de minute, 75 %, fără penalizare) și spune că nu sunt regulile unui examen real.

## Programa

```json
"syllabus": [ { "id": "1.1", "title": "Circuite și legea lui Ohm" }, { "id": "1.2", "title": "Reactanță și rezonanță" } ]
```

`id`: litere, cifre, puncte, cratime și liniuțe de subliniere (cel mult 40, începând cu o literă sau o cifră), unic în listă; `title`: un rând, cel mult 160 de caractere. O întrebare se leagă de un element cu `syllabus_ref`. Pagina verifică că legătura există, nu că este corectă: asta ține de cine scrie pachetul și de cine îl verifică.

## Limitele paginii

Cel mult 3000 de întrebări pe pachet, 8 pachete importate odată, 3.000.000 de caractere pe text importat și circa 4.000.000 de caractere păstrate în browser. Un pachet din `data/packs/` este încorporat în `index.html` (circa o jumătate de kilooctet pe întrebare), așa că pachetele foarte mari se importă mai bine decât se încorporează.

## Verificarea unui pachet

```
python3 scripts/validate.py                  # toate fișierele din data/
python3 scripts/validate.py data/packs       # un singur director
node scripts/import_csv.mjs questions.csv --check …   # un tabel, fără să scrie nimic
```

Când pagina importă un pachet cu probleme, le listează (întrebarea, câmpul) și oferă să importe doar întrebările valide. Înlocuirea unui pachet cu același `id` păstrează progresul la întrebările al căror `id` nu s-a schimbat.

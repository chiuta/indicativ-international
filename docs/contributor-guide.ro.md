# Ghid pentru contribuitori · INDICATIV International

Versiune: 0.2.1 · Ultima actualizare: 2026-11-20 · [English](contributor-guide.md)

Cea mai utilă contribuție este un **pachet**: întrebările din banca publică de întrebări a unei țări pentru autorizațiile de radioamator, în formatul comun (`docs/pack-format.ro.md`), cu sursa, ediția și regulile de examen notate și verificate față de banca oficială. Nu trebuie să programezi ca să adaugi unul.

## 1. De unde vin întrebările

- **Folosește banca publicată.** Cele mai multe autorități publică banca de întrebări a fiecărei clase de autorizare. Ia fișierul de pe site-ul autorității și notează ediția, data și adresa (`source`, `source_url`).
- **Verifică dacă ai voie să o distribui.** Spune în `license` în ce condiții pot fi distribuite întrebările (o licență, o decizie care face banca publică, o permisiune scrisă). Dacă nu ești sigur, întreabă într-un issue înainte să-ți pierzi timpul.
- **Nu reface niciodată întrebări oficiale din memorie,** de pe un forum sau din ce spune un asistent AI: un răspuns greșit într-un antrenor de examen face rău. Dacă nicio bancă nu poate fi distribuită, scrie întrebări **originale** și spune asta în `source` (pachetul încorporat este un exemplu).
- **Păstrează numerotarea oficială** în `id` (de exemplu `HU-hamA-0123` pentru întrebarea 123 din banca clasei A) și în `source` («Banca oficială, clasa A, ediția 2026, întrebarea 123»). Ea îl lasă pe altcineva să-ți verifice munca.
- Scrie **regulile examenului** (`exam`: întrebări, minute, prag de promovare) doar dacă poți cita unde sunt publicate; altfel lasă-le deoparte.

## 2. Fă pachetul

**De mână:** copiază `data/packs/example.json` în `data/packs/<id-pachet>.json` (numele fișierului este id-ul pachetului: litere mici, cifre și cratime, de exemplu `hu-ham-a`), completează antetul și întrebările. Câmpurile și limitele lor sunt în `docs/pack-format.ro.md`.

**Dintr-un tabel:** pune o întrebare pe rând, salvează foaia ca **CSV în UTF-8**, apoi rulează

```
node scripts/import_csv.mjs questions.csv --id hu-ham-a --title "Ungaria · clasa A" --country HU --class A --lang hu \
  --source "Banca oficială de întrebări, clasa A, ediția 2026" --source-url https://example.org/bank --license "vezi sursa"
```

(Cere Node.js 24 sau mai nou.) Fișierul este scris în `data/packs/hu-ham-a.json`. Dacă un rând are o problemă, nu se scrie nimic, iar fiecare problemă își numește linia din fișierul CSV; `--partial` scrie în schimb rândurile valide și le listează pe celelalte, iar `--check` doar verifică.

| Coloană | Înțeles |
|---|---|
| `question` | textul întrebării (obligatoriu) |
| `a`, `b`, `c`, `d`, `e`, `f` | răspunsurile; `a` și `b` sunt obligatorii, celelalte opționale, fără celulă goală între două răspunsuri |
| `correct` | răspunsul corect: o literă `A`–`F` sau un număr `1`–`6`, **numărând de la 1** (fișierul JSON numără de la 0; scriptul convertește) |
| `topic` | materia (obligatorie, sau dă `--topic` pentru tot fișierul) |
| `explanation`, `source_url`, `syllabus_ref`, `figure`, `figure_alt` | opționale, ca în formatul de pachet |
| `source` | opțională: sursa întrebării; goală înseamnă `--source` al pachetului |
| `fixed_order` | opțională: `true`/`false` (și `yes`/`no`, `1`/`0`) |
| `id` | opțional: gol înseamnă `<ȚARA>-<partea de mijloc>-<numărul rândului>`, unde partea de mijloc este id-ul pachetului fără primul grup și fără cratime (`hu-ham-a` dă `HU-hama-0001`); `--prefix ham` fixează partea de mijloc (`HU-ham-0001`) |

Numele coloanelor se pot scrie cu orice litere și în orice ordine. Separatorul (`,`, `;` sau tab) se ia de pe prima linie sau se fixează cu `--delimiter` (`tab` pentru tabulator). O celulă care conține separatorul, ghilimele sau un rând nou se scrie între ghilimele, cu ghilimelele dinăuntru dublate (`"spune ""salut"""`); programele de calcul tabelar fac asta când salvează CSV. Alte opțiuni: `--topic`, `--prefix`, `--syllabus fișier.json` (lista de programă din formatul de pachet), `--exam-questions`, `--exam-minutes`, `--exam-pass`, `--exam-penalty`, `--exam-source`, `--out fișier` (`-` scrie pe ecran). Codul de ieșire 0 înseamnă că un pachet a fost scris (sau verificat), 1 înseamnă probleme în întrebări, 2 înseamnă o greșeală în comandă sau un fișier ilizibil.

**Fișierele oficiale care nu sunt tabele** (PDF, XML, o exportare de bază de date) cer un mic convertor către aceste coloane; este o sarcină bună pentru început (vezi `ISSUES_GOOD_FIRST.ro.md`). Nu retipări o bancă de mână dacă există un fișier.

## 3. Încearc-o

Deschide `index.html`, fila «Pachete», lipește JSON-ul sau alege fișierul, apasă «Importă». Pagina listează fiecare problemă cu întrebarea și câmpul și poate importa doar întrebările valide. Exersează câteva întrebări și rulează un examen scurt: cheile greșite și formulările neclare se văd repede.

## 4. Verific-o

1. `python3 scripts/validate.py` (cere `pip install jsonschema`): aceleași reguli ca pagina, pentru fiecare fișier din `data/`.
2. `node scripts/pack_report.mjs data/packs/<id-pachet>.json`: numărul de întrebări pe materii, numerele oficiale care lipsesc, unde stau răspunsurile corecte.
3. `node scripts/build.mjs`: pune pachetul în `index.html` (fiecare pachet din `data/packs/` în afară de `example.json` este încorporat, circa o jumătate de kilooctet pe întrebare). `npm test` rulează toate testele, inclusiv verificarea că `index.html` este la zi.
4. **Compară cu banca oficială** după `docs/verify-against-official-bank.ro.md`: textul fiecărei întrebări, fiecare răspuns și fiecare răspuns corect, și un eșantion verificat de o a doua persoană.

## 5. Deschide pull request-ul

Spune în descriere: țara și clasa; ediția și de unde vine; în ce condiții poate fi distribuită; cine a verificat ce și cum (vezi ghidul de verificare); dacă regulile de examen sunt oficiale și unde sunt publicate. Bifează căsuțele din șablon. Un pachet fără sursă declarată sau fără permisiunea de a fi distribuit nu este preluat.

## 6. După aceea

- **Nu schimba niciodată `id`-ul unei întrebări publicate:** progresul fiecărui cursant se păstrează sub el. Corectează textul sau răspunsul și păstrează id-ul.
- Când o bancă este **actualizată**, publică ediția nouă ca pachet nou (`hu-ham-a-2027`) sau, când cele mai multe întrebări sunt aceleași, modifică pachetul și păstrează id-urile întrebărilor rămase; spune în pull request care variantă ai ales.
- Ai găsit o greșeală într-un pachet? Deschide un issue cu id-ul întrebării, numărul oficial și pagina din bancă.

## Alte feluri de a ajuta

Revizuiește cele 50 de întrebări de exersare încorporate, redesenează o figură ca SVG restrâns, testează simulatorul de examen cu un cititor de ecran, revizuiește textele interfeței în limba ta (`src/i18n.mjs`) sau scrie un convertor pentru un format oficial de fișier: vezi `ISSUES_GOOD_FIRST.ro.md`. Pentru cod: `npm test` trebuie să treacă, pagina trebuie să rămână un singur `index.html` care merge offline, iar nimic nu are voie să apeleze rețeaua.

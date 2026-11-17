# Jurnal de modificări

[English](CHANGELOG.md) · **Română** · [Français](CHANGELOG.fr.md) · [Italiano](CHANGELOG.it.md) · [Español](CHANGELOG.es.md) · [Português](CHANGELOG.pt.md) · [Deutsch](CHANGELOG.de.md) · [Magyar](CHANGELOG.hu.md)

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · [SemVer](https://semver.org/).

## [Nelansat]

## [0.2.0] - 2026-11-17

### Adăugat
- Motorul din `src/engine.mjs`: validarea pachetelor și a figurilor, programarea repetărilor în cinci cutii, cozile de întrebări, examenele trase dintr-o sămânță, notarea și fișierele de progres.
- Pagina: filele «Exersează», «Examen», «Pachete» și «Ghid» în opt limbi; scurtături de tastatură, anunțuri pentru cititoarele de ecran, un cronometru de examen care supraviețuiește unei reîncărcări; importul, descărcarea, resetarea și ștergerea pachetelor; o copie de siguranță a progresului.
- Un pachet încorporat de exersare cu 50 de întrebări originale (cu explicații, formule și două figuri), scris pentru acest proiect cu un asistent AI și verificat prin calcul; nu este o bancă oficială de întrebări.
- Formatul comun de pachet: `schema.json`, șablonul `data/packs/example.json` și `docs/pack-format.md` (în engleză și în română).
- `scripts/validate.py` aplică aceleași reguli ca pagina; testele îl compară cu motorul pe aceleași cazuri.
- `scripts/import_csv.mjs`: un tabel salvat ca CSV devine un pachet, iar fiecare problemă își numește linia din fișier.
- `scripts/pack_report.mjs`: un rezumat al unui pachet (numărători, numere oficiale lipsă, poziții ale răspunsurilor corecte, o listă de text, un eșantion aleatoriu) pentru verificarea lui față de banca oficială.
- `docs/contributor-guide.md` și `docs/verify-against-official-bank.md` (în engleză și în română).
- Teste: `npm test` și teste în browser în hub.
- `src/` și `scripts/build.mjs`: singurul `index.html` este acum construit din surse, cu pachetele încorporate, iar `--check` îl verifică.
- ISSUES_GOOD_FIRST și CODE_OF_CONDUCT traduse în toate cele opt limbi.
- README în engleză, română, franceză, italiană, spaniolă, portugheză, germană și maghiară: secțiuni de stare și de domeniu planificat (derivate din `ISSUES_GOOD_FIRST.md`).
- Instalabilă (PWA): `manifest.webmanifest`, `sw.js` și pictogramele sunt generate de kitul comun (`fff-kit/pwa`); pagina funcționează offline după prima vizită prin HTTPS.

### Modificat
- Fluxul de lucru rulează pe Ubuntu 26.04 cu Node.js 26 și rulează și testele, verificarea construcției și validarea.
- Datele sunt acum pachete: `data/packs/example.json` înlocuiește `data/questions/example.json`, iar un pachet este un fișier numit după id-ul lui; `scripts/validate.py`, pașii din README și șabloanele s-au schimbat în consecință.
- Lista sarcinilor pentru începători conține acum ce a rămas de făcut (pachete de țară, programă, revizuiri); antrenorul, simulatorul de examen, figurile și verificarea lui `correct`, pe care le enumera, există acum.

## [0.1.0] - 2026-11-13

### Adăugat
- Schelet inițial: structură, schema de date sau primele exemple, ghiduri de contribuție în opt limbi.

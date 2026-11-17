# INDICATIV International

[English](README.md) · **Română** · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versiune: 0.2.0 · Ultima actualizare: 2026-11-17

🌐 https://indicativ-international.chiuta.ro

> Bănci de întrebări pentru examenul de radioamator din fiecare țară, într-un format comun.

Fără comerț (trade-free): fără urmărire, fără reclame, fără conturi, funcționează offline.

## Stare

Alfa, utilizabil: singurul `index.html` este un antrenor și un simulator de examen pentru întrebările de radioamator. Exersează cu o programare a repetărilor în cinci cutii, rulează examene de probă cu timp limită și prag de promovare și importă pachete de întrebări într-un format JSON comun. Pachetul încorporat are 50 de întrebări de exersare originale, scrise pentru acest proiect; nu este o bancă oficială de întrebări și nu este inclus încă niciun pachet de țară. Totul rămâne în browserul tău, fără conturi, urmărire sau cereri de rețea.

## Ce face

- «Exersează»: alegi un pachet, o materie și ce întrebări vrei (scadente și noi, orice întrebare sau punctele tale slabe); fiecare răspuns este verificat pe loc și explicat, cu sursa lui. Răspunsurile corecte revin după 1, 3, 7, 14 și 30 de zile; cele greșite revin azi și încă o dată la sfârșitul sesiunii. Tastele 1–6 sau A–F aleg un răspuns, Enter merge mai departe.
- «Examen»: un test cu timp limită, tras la întâmplare din pachet, cu numărătoare inversă, hartă a întrebărilor, «Marchează pentru revizuire» și prag de promovare; nimic nu este notat până nu termini (sau până nu se scurge timpul). Rezultatul arată scorul pe materii și întrebările la care ai greșit; aceeași sămânță repetă un examen; un examen început continuă după o reîncărcare. Regulile (întrebări, minute, prag, penalizarea răspunsurilor greșite) vin din pachet împreună cu sursa lor; fără ele pagina folosește valori de exersare (20 de întrebări, 30 de minute, 75 %).
- «Pachete»: pachetul încorporat și pachetele pe care le imporți lipind JSON sau alegând un fișier (cel mult 8 odată), fiecare cu sursa, licența și regulile de examen; progres pe materii; poți descărca un pachet, îi poți reseta progresul sau îl poți șterge; copie de siguranță a progresului într-un fișier, pe care o încarci pe alt dispozitiv. Un pachet cu probleme este listat rând cu rând și poți importa doar întrebările valide.
- Format: formule în întrebări scrise `f_{o}` sau `10^{-6}`; desene mici ca SVG restrâns, cu text alternativ; o programă opțională, cu `syllabus_ref` la fiecare întrebare; un fișier JSON pe pachet în `data/packs/`, descris de `schema.json` și de `docs/pack-format.ro.md`.
- Unelte pentru contribuitori: `scripts/validate.py` verifică pachetele cu aceleași reguli ca pagina; `scripts/import_csv.mjs` transformă un tabel salvat ca CSV într-un pachet și numește linia fiecărei probleme; `scripts/pack_report.mjs` rezumă un pachet ca să-l verifici față de banca oficială. Interfața este în opt limbi și poate fi folosită de la tastatură și cu un cititor de ecran.
- Se poate instala ca aplicație și funcționează offline după prima vizită, când e servită prin HTTPS (un service worker păstrează pagina; nu se stochează și nu se trimite nimic altceva). Deschisă dintr-un fișier descărcat, merge la fel, fără instalare.

## Cum funcționează

- `schema.json` descrie un pachet; `scripts/validate.py` verifică fiecare fișier din `data/packs/` după el și după regulile pe care o schemă nu le poate spune: fișierul poartă numele pachetului (`id`), identificatorii și întrebările sunt unice într-un pachet, `syllabus_ref` există în programă, desenele folosesc doar elementele permise, iar regulile de examen încap în pachet.
- `src/engine.mjs` este motorul (fără ecran, fără rețea): validarea, programarea în cinci cutii, cozile de întrebări, examenele trase dintr-o sămânță, notarea și fișierele de progres. `scripts/validate.py` și `scripts/import_csv.mjs` aplică aceleași reguli; testele compară implementările pe aceleași cazuri.
- `src/ui.js`, `src/i18n.mjs` și `src/app.css` sunt interfața; `scripts/build.mjs` construiește singurul `index.html` din `src/` și încorporează pachetele din `data/packs/` (toate în afară de `example.json`); `node scripts/build.mjs --check` eșuează dacă pagina nu este la zi.
- Browserul păstrează trei intrări (pachetele importate, progresul, un examen început); fiecare este verificată din nou la încărcarea paginii, așa că o stare salvată stricată sau ostilă este ignorată, nu crezută. Nimic nu este trimis nicăieri.
- Teste: `npm test` (motorul, paritatea validatorului, importul CSV, textele interfeței, datele, documentația, construcția) și teste în browser în hub (opt limbi, accesibilitate, stare salvată ostilă, import, cronometrarea examenului) Dezvoltarea cere Node.js 24 sau mai nou și Python 3 cu `jsonschema`; pagina în sine cere doar un browser care știe ES2017.
- `manifest.webmanifest`, `sw.js` și pictogramele sunt produse de `node scripts/build.mjs` prin kitul comun (secțiunea `pwa` din `src/app.json`); `--check` le verifică și el, iar `npm test` verifică dacă manifestul, versiunea service worker-ului și CSP-ul corespund paginii.

## Limite sincere

- Pachetul încorporat este un set mic de întrebări de exersare, scrise cu un asistent AI și verificate prin calcul sau prin fapte din manuale. Nu este o bancă oficială de întrebări și niciun examinator nu l-a revizuit.
- Nu este inclus niciun pachet de țară: băncile publice de întrebări ale Ungariei, Italiei, Germaniei și ale altora nu au putut fi descărcate și verificate aici, deci sunt sarcini pentru contribuitori. Compară fiecare pachet cu banca oficială înainte să te încrezi în el.
- Regulile examenelor reale (număr de întrebări, timp, prag de promovare) nu sunt încorporate. Un pachet le poate declara împreună cu sursa lor; fără asta simulatorul folosește valori de exersare, iar promovarea aici nu dovedește nimic despre un examen real.
- Schema de repetare este una simplă, cu cinci cutii și intervale fixe, nu un algoritm reglat. Progresul rămâne în acest browser; ștergerea datelor site-ului îl șterge, dacă n-ai descărcat o copie.
- Asocierea cu programa este la fel de bună ca pachetul: pagina verifică doar că «syllabus_ref» există în pachet, dar nu poate spune dacă asocierea este corectă. Programa CEPT HAREC nu este inclusă.
- Traducerile interfeței au fost scrise automat și nu au fost revizuite de vorbitori nativi; întrebările apar în limba pachetului.

## Contribuie în 5 minute

1. Fă un fork al acestui depozit.
2. Copiază `data/packs/example.json` în `data/packs/<id-ul-pachetului>.json` (numele fișierului este id-ul pachetului) și completează-l, sau transformă un tabel într-un pachet cu `node scripts/import_csv.mjs` (vezi `docs/contributor-guide.ro.md`).
3. Rulează `python3 scripts/validate.py` și `npm test`, apoi `node scripts/build.mjs`, ca pachetul să intre în `index.html`.
4. Deschide un pull request — contribuțiile cu date nu cer programare.
5. Fără programare: încearcă întâi pachetul în pagină (fila «Pachete», butonul «Importă»), apoi trimite fișierul într-un issue sau un pull request; un responsabil îl adaugă în `data/packs/`.

## Sarcini bune pentru început

Vezi `ISSUES_GOOD_FIRST.md` pentru sarcini gata pregătite.

## Licență

Cod: MIT. Datele contribuite: indică sursa; sunt publicate sub aceeași licență, dacă fișierul nu spune altfel.

## Sprijin

Dacă proiectul îți este util, poți [să-mi oferi o cafea](https://buymeacoffee.com/echo.of.the.strings).

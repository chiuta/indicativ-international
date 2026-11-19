# Cum contribui — INDICATIV International

[English](CONTRIBUTING.md) · **Română** · [Français](CONTRIBUTING.fr.md) · [Italiano](CONTRIBUTING.it.md) · [Español](CONTRIBUTING.es.md) · [Português](CONTRIBUTING.pt.md) · [Deutsch](CONTRIBUTING.de.md) · [Magyar](CONTRIBUTING.hu.md)

Versiune: 0.2.1 · Ultima actualizare: 2026-11-20

1. Fă un fork al acestui depozit.
2. Copiază `data/packs/example.json` în `data/packs/<id-ul-pachetului>.json` (numele fișierului este id-ul pachetului) și completează-l, sau transformă un tabel într-un pachet cu `node scripts/import_csv.mjs` (vezi `docs/contributor-guide.ro.md`).
3. Rulează `python3 scripts/validate.py` și `npm test`, apoi `node scripts/build.mjs`, ca pachetul să intre în `index.html`.
4. Deschide un pull request — contribuțiile cu date nu cer programare.
5. Fără programare: încearcă întâi pachetul în pagină (fila «Pachete», butonul «Importă»), apoi trimite fișierul într-un issue sau un pull request; un responsabil îl adaugă în `data/packs/`.

## Reguli

- Un pachet = un fișier, numit după id-ul pachetului.
- Citează întotdeauna o sursă.
- Contribuie doar cu material pe care ai voie să-l partajezi (fără texte copiate protejate de drepturi de autor).
- Fii amabil: vezi Codul de conduită.

## Adăugarea unui pachet de întrebări

1. Alege mai întâi sursa. Un pachet de țară trebuie să vină din banca publică de întrebări a acelei țări (sau dintr-o altă sursă pe care ai voie să o distribui): notează ediția, data și adresa web. Nu copia dintr-o carte, dintr-un curs sau de pe un site decât dacă licența o permite; dacă nu poți copia, scrie întrebări originale și spune asta în `source`.
2. Copiază `data/packs/example.json` în `data/packs/<id-ul-pachetului>.json`. Numele fișierului este id-ul pachetului: litere mici, cifre și cratime, de exemplu `hu-ham-a`. Completează antetul: `country`, `licence_class`, `lang`, `source`, `source_url`, `license` și regulile `exam` doar dacă regulile oficiale sunt publicate (cu sursa lor).
3. Adaugă întrebările: de mână în fișier sau dintr-un tabel salvat ca CSV, cu `node scripts/import_csv.mjs questions.csv --id <id-pachet> --title … --country … --class … --lang … --source … --license …` (coloane și opțiuni: `docs/contributor-guide.ro.md`). Păstrează numerotarea oficială în `id` și în `source`.
4. Verifică pachetul față de banca oficială (`docs/verify-against-official-bank.ro.md`): textul fiecărei întrebări, fiecare răspuns și fiecare răspuns corect; cere unei a doua persoane să verifice un eșantion și scrie în pull request cine a verificat ce și cum.
5. Rulează `python3 scripts/validate.py`, apoi `node scripts/build.mjs` (pune pachetul în `index.html`) și `npm test`. Poți încerca pachetul și înainte să-l trimiți: deschide `index.html`, fila «Pachete», butonul «Importă».
6. Deschide un pull request sau un issue și spune ce ediție ai folosit și în ce condiții ai voie să o distribui. Un pachet fără sursă declarată nu este preluat.

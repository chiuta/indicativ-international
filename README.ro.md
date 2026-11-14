# INDICATIV International

[English](README.md) · **Română** · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versiune: 0.1.0 · Ultima actualizare: 2026-11-14

🌐 https://indicativ-international.chiuta.ro

> Bănci de întrebări pentru examenul de radioamator din fiecare țară, într-un format comun.

Fără comerț (trade-free): fără urmărire, fără reclame, fără conturi, funcționează offline.

## Stare

Alfa: depozitul conține structura, schema de date sau primele exemple și ghidurile de contribuție. Domeniul de mai jos este planul, nu ceea ce funcționează azi.

## Domeniu planificat

- Un format JSON comun pentru băncile de întrebări de examen radioamator, validat de un script (de exemplu, că `correct` se încadrează în intervalul `answers`).
- Programa CEPT HAREC ca `syllabus.json`, cu un câmp `syllabus_ref` care leagă fiecare întrebare de un punct din programă.
- Pachete pe țări din bănci publice de întrebări, începând cu Ungaria, Italia și Germania (Klasse E), fiecare cu link la sursă.
- Un antrenor cu repetiție spațiată și un simulator de examen cu cronometru și prag de promovare pentru fiecare țară.
- Suport pentru formule și diagrame (SVG) în întrebări și un ghid despre verificarea unei întrebări față de banca oficială.

Nimic din asta nu este implementat încă: fiecare punct este o sarcină gata pregătită în `ISSUES_GOOD_FIRST.md`.

## Contribuie în 5 minute

1. Fă fork acestui depozit.
2. Copiază `data/questions/example.json` în `data/questions/` și editează-l.
3. Rulează `python scripts/validate.py`.
4. Deschide un pull request — pentru date nu e nevoie de programare.

## Sarcini bune pentru început

Vezi `ISSUES_GOOD_FIRST.md` pentru sarcini gata pregătite.

## Licență

Cod: MIT. Datele contribuite: indică sursa; sunt publicate sub aceeași licență, dacă fișierul nu spune altfel.

## Sprijin

Dacă proiectul îți este util, poți [să-mi oferi o cafea](https://buymeacoffee.com/echo.of.the.strings).

# Verificarea unui pachet față de banca oficială · INDICATIV International

Versiune: 0.2.0 · Ultima actualizare: 2026-11-17 · [English](verify-against-official-bank.md)

Un antrenor este la fel de bun ca cheia lui de răspunsuri. Ghidul spune cum verifici un pachet față de banca oficială de întrebări și cum notezi ce ai verificat, ca un cititor să poată hotărî cât de mult are încredere în el. «Verificat» înseamnă aici că o persoană numită a comparat pachetul cu o ediție numită a băncii în modul descris; niciun instrument nu hotărăște asta în locul tău, iar pagina nu poate spune dacă un pachet este fidel.

## 1. Fixează cu ce compari

- Folosește **o singură ediție** a băncii oficiale: fișierul, ediția sau versiunea, data și adresa la care este publicată. Păstrează-ți copia și notează suma ei de control (`sha256sum fișier`). Nu pune fișierul oficial în depozit decât dacă termenii lui permit.
- Pune aceste date în pachet (`source`, `source_url`, `license`) și în pull request.
- Dacă autoritatea publică mai multe formate (un PDF și un tabel), compară cu cel pe care îl folosește examenul și spune care este.

## 2. Numără mai întâi

```
node scripts/pack_report.mjs data/packs/<id-pachet>.json
```

Rezumatul arată numărul de întrebări, în total și pe materii, primul și ultimul număr oficial, **numerele care lipsesc** și cele folosite de două ori, și câte răspunsuri corecte sunt la A, B, C și D. Compară fiecare cifră cu fișierul oficial:

- același număr de întrebări și același număr pe capitol sau materie (folosește numele oficiale ale capitolelor ca `topic`);
- niciun număr lipsă, afară de cazul în care banca însăși are goluri (spune asta);
- răspunsurile corecte răspândite pe poziții: dacă nouă chei din zece stau pe aceeași poziție, mai uită-te o dată, pentru că cheia poate fi citită greșit (o bancă este rareori atât de inegală; pagina amestecă răspunsurile când le arată, așa că poziția din fișier nu-l ajută pe cursant să ghicească).

Fiecare diferență trebuie explicată înainte să mergi mai departe (întrebări retrase din bancă, întrebări care cer o figură pe care n-ai desenat-o, dubluri).

## 3. Compară fiecare întrebare

Fă aceste trei verificări pentru **toate** întrebările, nu pentru un eșantion:

1. **Textul.** Întrebarea și fiecare răspuns spun ce spune textul oficial: numere, unități, semne, diacritice, exponenți și indici (`10^{-6}`, `R_{1}`). O listă pentru comparat, o linie pe întrebare:

   ```
   node scripts/pack_report.mjs data/packs/<id-pachet>.json --text > pack.txt
   ```

   Transformă fișierul oficial în text simplu de aceeași formă (sau invers) și compară-le cu un instrument de diferențe; ignoră diferențele de spații și de ghilimele, nu pe cele de numere sau de cuvinte.
2. **Cheia.** Răspunsul marcat corect în pachet este răspunsul pe care cheia oficială îl marchează corect. Compară **textul** răspunsului, nu litera lui: banca oficială poate avea alte poziții, iar pagina le amestecă oricum. Aceasta este verificarea care contează cel mai mult.
3. **Figurile.** Un desen arată același circuit, aceleași valori și aceleași etichete ca figura oficială; `figure_alt` spune în cuvinte ce arată. Dacă n-ai putut desena o figură, lasă întrebarea deoparte și spune asta în pull request, în loc să păstrezi o întrebare la care nu se poate răspunde.

## 4. O a doua persoană verifică un eșantion

O altă persoană, care n-a scris pachetul, compară un **eșantion aleatoriu**: 30 de întrebări sau 10 % din pachet, oricare este mai mare (toate, când pachetul are mai puțin de 30). Trage-l cu o sămânță și scrie sămânța în pull request, ca oricine să poată trage același eșantion:

```
node scripts/pack_report.mjs data/packs/<id-pachet>.json --sample 30 --seed 7
```

A doua persoană face cele trei verificări din secțiunea 3 doar pe acele întrebări. O singură greșeală în eșantion este un motiv să verifici din nou **toate** întrebările.

## 5. Notează ce s-a verificat

Copiază asta în pull request și completeaz-o; nu omite nimic din ce nu s-a făcut, spune asta în schimb:

```
Fișierul oficial: <nume>, ediția <…>, <data>, <adresa>, SHA-256 <…>
Întrebări: în fișierul oficial <N>, în pachet <N> (diferență: <niciuna | explicată>)
Comparat integral de <nume>: texte <da/nu>, chei <da/nu>, figuri <da/nu/niciuna>
Metodă: <diferențe între liste de text | cu ochiul, față de PDF | …>
A doua verificare de <nume>: eșantion de <N> întrebări, sămânța <S>, greșeli găsite <N>
Diferențe găsite și corectate: <…>
Neverificat: <…>
Regulile examenului: <nu sunt incluse | întrebări/minute/prag, publicate la <adresa>>
```

## 6. Când banca oficială pare greșită

Pachetul oglindește banca, pentru că examenul folosește banca. Păstrează răspunsul oficial în pachet, **nu-l corecta pe tăcute** și deschide un issue cu numărul întrebării, pagina din bancă și motivul tău. Dacă autoritatea publică o corectură, actualizează pachetul la ediția corectată și spune asta. Dacă adaugi o observație pentru cursanți, pune-o în `explanation` și spune limpede că este o observație, nu răspunsul oficial.

## 7. Ce dovedește și ce nu dovedește asta

Un pachet verificat se potrivește cu o ediție a băncii în punctele care au fost verificate. Nu dovedește că banca este cea folosită la examenul de azi, că regulile examenului nu s-au schimbat sau că trecerea simulatorului înseamnă trecerea examenului: băncile și regulile se revizuiesc, așa că citește data ediției și data verificării înainte să ai încredere într-un pachet.

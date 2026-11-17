# Registro delle modifiche

[English](CHANGELOG.md) · [Română](CHANGELOG.ro.md) · [Français](CHANGELOG.fr.md) · **Italiano** · [Español](CHANGELOG.es.md) · [Português](CHANGELOG.pt.md) · [Deutsch](CHANGELOG.de.md) · [Magyar](CHANGELOG.hu.md)

Formato: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · [SemVer](https://semver.org/).

## [Non rilasciato]

## [0.2.0] - 2026-11-17

### Aggiunto
- Il motore in `src/engine.mjs`: validazione di pacchetti e figure, pianificazione delle ripetizioni in cinque scatole, code di domande, esami estratti da un seme, valutazione e file dei progressi.
- La pagina: schede «Esercitati», «Esame», «Pacchetti» e «Guida» in otto lingue; scorciatoie da tastiera, annunci per gli screen reader, un cronometro d’esame che sopravvive a un ricaricamento; importazione, download, azzeramento e rimozione dei pacchetti; una copia di sicurezza dei progressi.
- Un pacchetto di esercizio integrato di 50 domande originali (con spiegazioni, formule e due figure), scritto per questo progetto con un assistente AI e controllato con il calcolo; non è una banca dati ufficiale di domande.
- Il formato comune dei pacchetti: `schema.json`, il modello `data/packs/example.json` e `docs/pack-format.md` (in inglese e in rumeno).
- `scripts/validate.py` applica le stesse regole della pagina; i test lo confrontano con il motore sugli stessi casi.
- `scripts/import_csv.mjs`: una tabella salvata come CSV diventa un pacchetto, e ogni problema indica la sua riga nel file.
- `scripts/pack_report.mjs`: un riepilogo di un pacchetto (conteggi, numeri ufficiali mancanti, posizioni delle risposte giuste, un elenco di testo, un campione casuale) per controllarlo rispetto alla banca dati ufficiale.
- `docs/contributor-guide.md` e `docs/verify-against-official-bank.md` (in inglese e in rumeno).
- Test: `npm test` e test nel browser nell’hub.
- `src/` e `scripts/build.mjs`: l’unico `index.html` è ora costruito dai sorgenti, con i pacchetti incorporati, e `--check` lo verifica.
- ISSUES_GOOD_FIRST e CODE_OF_CONDUCT tradotti in tutte e otto le lingue.
- README in inglese, rumeno, francese, italiano, spagnolo, portoghese, tedesco e ungherese: sezioni di stato e di ambito previsto (derivate da `ISSUES_GOOD_FIRST.md`).
- Installabile (PWA): `manifest.webmanifest`, `sw.js` e le icone sono generati dal kit comune (`fff-kit/pwa`); la pagina funziona offline dopo la prima visita via HTTPS.

### Modificato
- Il workflow gira su Ubuntu 26.04 con Node.js 26 ed esegue anche i test, il controllo della build e la convalida.
- I dati sono ora pacchetti: `data/packs/example.json` sostituisce `data/questions/example.json`, e un pacchetto è un file che porta il nome del suo id; `scripts/validate.py`, i passi del README e i modelli sono cambiati di conseguenza.
- L’elenco dei good first issue contiene ora ciò che resta da fare (pacchetti nazionali, programma, revisioni); l’allenatore, il simulatore d’esame, le figure e il controllo di `correct` che elencava ora esistono.

## [0.1.0] - 2026-11-13

### Aggiunto
- Scheletro iniziale: struttura, schema dei dati o primi esempi, guide al contributo in otto lingue.

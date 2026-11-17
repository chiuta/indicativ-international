# Come contribuire — INDICATIV International

[English](CONTRIBUTING.md) · [Română](CONTRIBUTING.ro.md) · [Français](CONTRIBUTING.fr.md) · **Italiano** · [Español](CONTRIBUTING.es.md) · [Português](CONTRIBUTING.pt.md) · [Deutsch](CONTRIBUTING.de.md) · [Magyar](CONTRIBUTING.hu.md)

Versione: 0.2.0 · Ultimo aggiornamento: 2026-11-17

1. Fai un fork di questo repository.
2. Copia `data/packs/example.json` in `data/packs/<id-del-tuo-pacchetto>.json` (il nome del file è l’id del pacchetto) e compilalo, oppure trasforma una tabella in un pacchetto con `node scripts/import_csv.mjs` (vedi `docs/contributor-guide.md`).
3. Esegui `python3 scripts/validate.py` e `npm test`, poi `node scripts/build.mjs` perché il pacchetto entri in `index.html`.
4. Apri una pull request — i contributi di dati non richiedono programmazione.
5. Senza programmare: prova prima il pacchetto nella pagina (scheda «Pacchetti», pulsante «Importa»), poi invia il file in una issue o in una pull request; un maintainer lo aggiunge a `data/packs/`.

## Regole

- Un pacchetto = un file, con il nome dell’id del pacchetto.
- Cita sempre una fonte.
- Contribuisci solo con materiale che puoi condividere legalmente (niente testi protetti copiati).
- Sii gentile: vedi il Codice di condotta.

## Aggiungere un pacchetto di domande

1. Scegli prima la fonte. Un pacchetto nazionale deve venire dalla banca dati pubblica di domande di quel paese (o da un’altra fonte che puoi legalmente condividere): annota l’edizione, la data e l’indirizzo web. Non copiare da un libro, da un corso o da un sito se la sua licenza non lo permette; se non puoi copiare, scrivi domande originali e dillo in `source`.
2. Copia `data/packs/example.json` in `data/packs/<id-del-tuo-pacchetto>.json`. Il nome del file è l’id del pacchetto: lettere minuscole, cifre e trattini, per esempio `hu-ham-a`. Compila l’intestazione: `country`, `licence_class`, `lang`, `source`, `source_url`, `license`, e le regole `exam` solo se le regole ufficiali sono pubblicate (con la loro fonte).
3. Aggiungi le domande: a mano nel file, oppure da una tabella salvata come CSV con `node scripts/import_csv.mjs questions.csv --id <id-pacchetto> --title … --country … --class … --lang … --source … --license …` (colonne e opzioni: `docs/contributor-guide.md`). Mantieni la numerazione ufficiale in `id` e `source`.
4. Controlla il pacchetto rispetto alla banca dati ufficiale (`docs/verify-against-official-bank.md`): il testo di ogni domanda, ogni risposta e ogni risposta giusta; fai controllare un campione a una seconda persona e scrivi nella pull request chi ha controllato cosa e come.
5. Esegui `python3 scripts/validate.py`, poi `node scripts/build.mjs` (mette il pacchetto in `index.html`) e `npm test`. Puoi anche provare il pacchetto prima di inviarlo: apri `index.html`, scheda «Pacchetti», pulsante «Importa».
6. Apri una pull request o una issue e indica quale edizione hai usato e a quali condizioni puoi condividerla. Un pacchetto senza fonte dichiarata non viene integrato.

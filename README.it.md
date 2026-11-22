# INDICATIV International

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · **Italiano** · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versione: 0.2.1 · Ultimo aggiornamento: 2026-11-22

🌐 https://indicativ-international.chiuta.ro

> Banche dati di domande per l'esame da radioamatore di ogni paese, in un formato comune.

Trade-free: nessun tracciamento, nessuna pubblicità, nessun account, funziona offline.

## Stato

Alfa, utilizzabile: l’unico `index.html` è un allenatore e un simulatore d’esame per le domande di radioamatore. Si esercita con una pianificazione delle ripetizioni in cinque scatole, esegue esami di prova a tempo con una soglia di superamento e importa pacchetti di domande in un unico formato JSON. Il pacchetto integrato contiene 50 domande di esercizio originali scritte per questo progetto; non è una banca dati ufficiale di domande e non è ancora incluso nessun pacchetto nazionale. Tutto resta nel tuo browser, senza account, tracciamento o richieste di rete.

## Cosa fa

- «Esercitati»: scegli un pacchetto, un argomento e quali domande esercitare (da ripassare e nuove, qualsiasi domanda o i tuoi punti deboli); ogni risposta è controllata subito e spiegata, con la sua fonte. Le risposte giuste tornano dopo 1, 3, 7, 14 e 30 giorni; quelle sbagliate tornano oggi e ancora una volta alla fine della sessione. I tasti 1–6 o A–F scelgono una risposta, Invio prosegue.
- «Esame»: una prova a tempo estratta a caso dal pacchetto, con conto alla rovescia, mappa delle domande, «Segna per la revisione» e soglia di superamento; nulla viene valutato finché non termini (o il tempo scade). Il risultato mostra il punteggio per argomento e le domande sbagliate; lo stesso seme ripete un esame; un esame iniziato continua dopo un ricaricamento. Le regole (domande, minuti, soglia, penalità per le risposte sbagliate) vengono dal pacchetto insieme alla loro fonte; senza di esse la pagina usa valori di esercizio (20 domande, 30 minuti, 75 %).
- «Pacchetti»: il pacchetto di esercizio integrato e i pacchetti che importi incollando JSON o scegliendo un file (al massimo 8 alla volta), ciascuno con fonte, licenza e regole d’esame; progressi per argomento; puoi scaricare un pacchetto, azzerarne i progressi o rimuoverlo; copia di sicurezza dei progressi in un file, da caricare su un altro dispositivo. Un pacchetto con problemi è elencato riga per riga e puoi importare solo le domande valide.
- Formato: formule nelle domande scritte `f_{o}` o `10^{-6}`; piccoli disegni come SVG ristretto con un’alternativa testuale; un programma facoltativo con `syllabus_ref` su ogni domanda; un file JSON per pacchetto in `data/packs/`, descritto da `schema.json` e da `docs/pack-format.md`.
- Strumenti per chi contribuisce: `scripts/validate.py` controlla i pacchetti con le stesse regole della pagina; `scripts/import_csv.mjs` trasforma una tabella salvata come CSV in un pacchetto e indica la riga di ogni problema; `scripts/pack_report.mjs` riassume un pacchetto per controllarlo rispetto alla banca dati ufficiale. L’interfaccia è in otto lingue e si usa con la tastiera e con uno screen reader.
- Installabile come app e disponibile offline dopo la prima visita quando è servita via HTTPS (un service worker conserva la pagina; nient’altro viene memorizzato o inviato). Aperta da un file scaricato funziona allo stesso modo, senza installazione.

## Come funziona

- `schema.json` descrive un pacchetto; `scripts/validate.py` controlla ogni file di `data/packs/` secondo lo schema e secondo le regole che uno schema non sa esprimere: il file porta il nome dell’id del pacchetto, gli id e le domande sono unici in un pacchetto, `syllabus_ref` esiste nel programma, le figure usano solo gli elementi consentiti e le regole d’esame si adattano al pacchetto.
- `src/engine.mjs` è il motore (senza schermo, senza rete): validazione, pianificazione in cinque scatole, code di domande, esami estratti da un seme, valutazione e file dei progressi. `scripts/validate.py` e `scripts/import_csv.mjs` applicano le stesse regole; i test confrontano le implementazioni sugli stessi casi.
- `src/ui.js`, `src/i18n.mjs` e `src/app.css` sono l’interfaccia; `scripts/build.mjs` costruisce l’unico `index.html` da `src/` e vi incorpora i pacchetti di `data/packs/` (tutti tranne `example.json`); `node scripts/build.mjs --check` fallisce se la pagina non è aggiornata.
- Il browser conserva tre voci (pacchetti importati, progressi, un esame in corso); ciascuna viene ricontrollata al caricamento della pagina, così uno stato salvato danneggiato o ostile viene ignorato, non creduto. Nulla viene inviato da nessuna parte.
- Test: `npm test` (motore, parità del validatore, importazione CSV, testi dell’interfaccia, dati, documentazione, build) e test nel browser nell’hub (otto lingue, accessibilità, stato salvato ostile, importazione, tempi dell’esame) Lo sviluppo richiede Node.js 24 o più recente e Python 3 con `jsonschema`; la pagina in sé richiede solo un browser che conosca ES2017.
- `manifest.webmanifest`, `sw.js` e le icone sono prodotti da `node scripts/build.mjs` tramite il kit comune (sezione `pwa` di `src/app.json`); anche `--check` li verifica, e `npm test` controlla che il manifest, la versione del service worker e la CSP corrispondano alla pagina.

## Limiti onesti

- Il pacchetto incorporato è un piccolo insieme di domande di esercitazione scritte con un assistente IA e verificate con il calcolo o con fatti da manuale. Non è una banca ufficiale di domande e nessun esaminatore l’ha rivisto.
- Non è incluso alcun pacchetto di paese: le banche pubbliche di domande di Ungheria, Italia, Germania e altri non si sono potute scaricare e verificare qui, quindi sono compiti per i contributori. Confronta ogni pacchetto con la banca ufficiale prima di fidarti.
- Le regole degli esami veri (numero di domande, tempo, soglia di superamento) non sono incorporate. Un pacchetto può dichiararle con la loro fonte; senza di essa il simulatore usa valori di esercitazione, e superare l’esame qui non dimostra nulla su un esame vero.
- Lo schema di ripetizione è semplice, a cinque scatole con intervalli fissi, non un algoritmo calibrato. I progressi restano in questo browser; cancellare i dati del sito li elimina, a meno che tu non abbia scaricato una copia.
- L’associazione al programma vale quanto il pacchetto: la pagina controlla che «syllabus_ref» esista nel pacchetto ma non può dire se l’associazione sia giusta. Il programma CEPT HAREC non è incluso.
- Le traduzioni dell’interfaccia sono state scritte da una macchina e non sono state riviste da madrelingua; le domande sono mostrate nella lingua del pacchetto.

## Contribuisci in 5 minuti

1. Fai un fork di questo repository.
2. Copia `data/packs/example.json` in `data/packs/<id-del-tuo-pacchetto>.json` (il nome del file è l’id del pacchetto) e compilalo, oppure trasforma una tabella in un pacchetto con `node scripts/import_csv.mjs` (vedi `docs/contributor-guide.md`).
3. Esegui `python3 scripts/validate.py` e `npm test`, poi `node scripts/build.mjs` perché il pacchetto entri in `index.html`.
4. Apri una pull request — i contributi di dati non richiedono programmazione.
5. Senza programmare: prova prima il pacchetto nella pagina (scheda «Pacchetti», pulsante «Importa»), poi invia il file in una issue o in una pull request; un maintainer lo aggiunge a `data/packs/`.

## Buone prime attività

Vedi `ISSUES_GOOD_FIRST.md` per attività già pronte.

## Licenza

Codice: MIT. Dati contribuiti: indica la fonte; sono pubblicati con la stessa licenza salvo diversa indicazione.

## Supporto

Se il progetto ti è utile, puoi [offrirmi un caffè](https://buymeacoffee.com/echo.of.the.strings).

# INDICATIV International

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · **Italiano** · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versione: 0.1.0 · Ultimo aggiornamento: 2026-11-14

🌐 https://indicativ-international.chiuta.ro

> Banche dati di domande per l'esame da radioamatore di ogni paese, in un formato comune.

Trade-free: nessun tracciamento, nessuna pubblicità, nessun account, funziona offline.

## Stato

Alpha: il repository contiene la struttura, lo schema dati o i primi esempi e le guide al contributo. L’ambito qui sotto è il piano, non ciò che funziona oggi.

## Ambito previsto

- Un formato JSON comune per le banche di quesiti dell’esame da radioamatore, validato da uno script (ad esempio che `correct` rientri nell’intervallo di `answers`).
- Il programma CEPT HAREC come `syllabus.json`, con un campo `syllabus_ref` che collega ogni quesito a una voce del programma.
- Pacchetti per paese da banche di quesiti pubbliche, a partire da Ungheria, Italia e Germania (Klasse E), ciascuno con un link alla fonte.
- Un trainer a ripetizione dilazionata e un simulatore d’esame con timer e soglia di superamento per paese.
- Supporto per formule e diagrammi (SVG) nei quesiti e una guida alla verifica di un quesito rispetto alla banca ufficiale.

Nulla di tutto ciò è ancora implementato: ogni voce è un compito pronto in `ISSUES_GOOD_FIRST.md`.

## Contribuisci in 5 minuti

1. Fai il fork di questo repository.
2. Copia `data/questions/example.json` in `data/questions/` e modificalo.
3. Esegui `python scripts/validate.py`.
4. Apri una pull request: per i dati non serve programmare.

## Buone prime attività

Vedi `ISSUES_GOOD_FIRST.md` per attività già pronte.

## Licenza

Codice: MIT. Dati contribuiti: indica la fonte; sono pubblicati con la stessa licenza salvo diversa indicazione.

## Supporto

Se il progetto ti è utile, puoi [offrirmi un caffè](https://buymeacoffee.com/echo.of.the.strings).

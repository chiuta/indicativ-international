# Buoni primi compiti

[English](ISSUES_GOOD_FIRST.md) · [Română](ISSUES_GOOD_FIRST.ro.md) · [Français](ISSUES_GOOD_FIRST.fr.md) · **Italiano** · [Español](ISSUES_GOOD_FIRST.es.md) · [Português](ISSUES_GOOD_FIRST.pt.md) · [Deutsch](ISSUES_GOOD_FIRST.de.md) · [Magyar](ISSUES_GOOD_FIRST.hu.md)

- [ ] Aggiungi un pacchetto per l’Ungheria dalla banca dati pubblica di domande (`scripts/import_csv.mjs`, numerazione ufficiale in `id` e `source`, `source_url`, regole d’esame con la loro fonte)
- [ ] Aggiungi un pacchetto per l’Italia dalla banca dati pubblica di domande, con la stessa cura (edizione, indirizzo della fonte, numerazione, regole d’esame)
- [ ] Aggiungi un pacchetto per la Germania (classe E o A) dalla banca dati pubblica di domande, con la stessa cura
- [ ] Aggiungi un pacchetto per il tuo paese dalla sua banca dati ufficiale di domande, in qualsiasi lingua, e dicci che cosa hai controllato
- [ ] Scrivi un convertitore dal formato di file ufficiale di un paese (PDF, tabella o XML) alle colonne CSV di `scripts/import_csv.mjs`
- [ ] Aggiungi il programma CEPT HAREC (Raccomandazione T/R 61-02) come `syllabus` di un pacchetto e collega ogni domanda con `syllabus_ref`
- [ ] Fai rivedere da un radioamatore le 50 domande di esercizio integrate e segnala ogni risposta sbagliata o formulazione poco chiara
- [ ] Ridisegna le figure di circuiti e antenne di un pacchetto come SVG ristretto, ciascuna con un’alternativa testuale in `figure_alt`
- [ ] Prova il simulatore d’esame con uno screen reader (NVDA, VoiceOver o Orca) e segnala che cosa è difficile da usare
- [ ] Fai rivedere da una persona madrelingua i testi dell’interfaccia della tua lingua in `src/i18n.mjs`

Crea tutte le issue su GitHub con `scripts/create_issues.sh` (richiede la CLI `gh`).

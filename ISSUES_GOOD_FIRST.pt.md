# Boas primeiras tarefas

[English](ISSUES_GOOD_FIRST.md) · [Română](ISSUES_GOOD_FIRST.ro.md) · [Français](ISSUES_GOOD_FIRST.fr.md) · [Italiano](ISSUES_GOOD_FIRST.it.md) · [Español](ISSUES_GOOD_FIRST.es.md) · **Português** · [Deutsch](ISSUES_GOOD_FIRST.de.md) · [Magyar](ISSUES_GOOD_FIRST.hu.md)

- [ ] Acrescentar um pacote para a Hungria a partir do banco público de perguntas (`scripts/import_csv.mjs`, numeração oficial em `id` e `source`, `source_url`, regras de exame com a sua fonte)
- [ ] Acrescentar um pacote para a Itália a partir do banco público de perguntas, com o mesmo cuidado (edição, endereço da fonte, numeração, regras de exame)
- [ ] Acrescentar um pacote para a Alemanha (classe E ou A) a partir do banco público de perguntas, com o mesmo cuidado
- [ ] Acrescentar um pacote para o seu próprio país a partir do banco oficial de perguntas, em qualquer língua, e dizer o que verificou
- [ ] Escrever um conversor do formato de ficheiro oficial de um país (PDF, tabela ou XML) para as colunas CSV de `scripts/import_csv.mjs`
- [ ] Acrescentar o programa CEPT HAREC (Recomendação T/R 61-02) como `syllabus` de um pacote e ligar cada pergunta com `syllabus_ref`
- [ ] Pedir a um radioamador que reveja as 50 perguntas de treino incluídas e assinale qualquer resposta errada ou formulação pouco clara
- [ ] Redesenhar as figuras de circuitos e antenas de um pacote em SVG restrito, cada uma com uma alternativa em texto em `figure_alt`
- [ ] Testar o simulador de exame com um leitor de ecrã (NVDA, VoiceOver ou Orca) e assinalar o que é difícil de usar
- [ ] Pedir a um falante nativo que reveja os textos da interface da sua língua em `src/i18n.mjs`

Cria-as todas no GitHub com `scripts/create_issues.sh` (requer a CLI `gh`).

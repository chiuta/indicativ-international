# INDICATIV International

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · **Português** · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versão: 0.1.0 · Última atualização: 2026-11-14

🌐 https://indicativ-international.chiuta.ro

> Bancos de perguntas do exame de radioamador de cada país, num formato comum.

Trade-free: sem rastreamento, sem anúncios, sem contas, funciona offline.

## Estado

Alfa: o repositório contém a estrutura, o esquema de dados ou os primeiros exemplos e os guias de contribuição. O âmbito abaixo é o plano, não o que funciona hoje.

## Âmbito previsto

- Um formato JSON comum para os bancos de perguntas do exame de radioamador, validado por um script (por exemplo, que `correct` esteja dentro do intervalo de `answers`).
- O programa CEPT HAREC como `syllabus.json`, com um campo `syllabus_ref` que liga cada pergunta a um ponto do programa.
- Pacotes por país a partir de bancos de perguntas públicos, começando por Hungria, Itália e Alemanha (Klasse E), cada um com ligação à fonte.
- Um treinador de repetição espaçada e um simulador de exame com cronómetro e nota de aprovação por país.
- Suporte de fórmulas e diagramas (SVG) nas perguntas e um guia para verificar uma pergunta com o banco oficial.

Nada disto está ainda implementado: cada ponto é uma tarefa preparada em `ISSUES_GOOD_FIRST.md`.

## Contribua em 5 minutos

1. Faça um fork deste repositório.
2. Copie `data/questions/example.json` para `data/questions/` e edite-o.
3. Execute `python scripts/validate.py`.
4. Abra um pull request — para dados não é preciso programar.

## Boas primeiras tarefas

Veja `ISSUES_GOOD_FIRST.md` para tarefas prontas.

## Licença

Código: MIT. Dados contribuídos: indique a fonte; são publicados sob a mesma licença, salvo indicação em contrário.

## Apoio

Se o projeto lhe for útil, pode [oferecer-me um café](https://buymeacoffee.com/echo.of.the.strings).

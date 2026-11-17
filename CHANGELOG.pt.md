# Registo de alterações

[English](CHANGELOG.md) · [Română](CHANGELOG.ro.md) · [Français](CHANGELOG.fr.md) · [Italiano](CHANGELOG.it.md) · [Español](CHANGELOG.es.md) · **Português** · [Deutsch](CHANGELOG.de.md) · [Magyar](CHANGELOG.hu.md)

Formato: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · [SemVer](https://semver.org/).

## [Não lançado]

## [0.2.0] - 2026-11-17

### Adicionado
- O motor em `src/engine.mjs`: validação de pacotes e figuras, calendário de revisão em cinco caixas, filas de perguntas, exames sorteados a partir de uma semente, classificação e ficheiros de progresso.
- A página: separadores «Treinar», «Exame», «Pacotes» e «Guia» em oito línguas; atalhos de teclado, avisos para leitores de ecrã, um cronómetro de exame que sobrevive a um recarregamento; importação, descarga, reposição e remoção de pacotes; uma cópia de segurança do progresso.
- Um pacote de treino incluído com 50 perguntas originais (com explicações, fórmulas e duas figuras), escrito para este projeto com um assistente de IA e verificado por cálculo; não é um banco de perguntas oficial.
- O formato comum de pacote: `schema.json`, o modelo `data/packs/example.json` e `docs/pack-format.md` (em inglês e em romeno).
- `scripts/validate.py` aplica as mesmas regras da página; os testes comparam-no com o motor nos mesmos casos.
- `scripts/import_csv.mjs`: uma tabela guardada como CSV torna-se um pacote, e cada problema indica a sua linha no ficheiro.
- `scripts/pack_report.mjs`: um resumo de um pacote (contagens, números oficiais em falta, posições das respostas certas, uma listagem de texto, uma amostra aleatória) para o verificar face ao banco oficial.
- `docs/contributor-guide.md` e `docs/verify-against-official-bank.md` (em inglês e em romeno).
- Testes: `npm test` e testes de navegador no hub.
- `src/` e `scripts/build.mjs`: o único `index.html` é agora construído a partir dos fontes, com os pacotes incorporados, e `--check` verifica-o.
- ISSUES_GOOD_FIRST e CODE_OF_CONDUCT traduzidos para as oito línguas.
- README em inglês, romeno, francês, italiano, espanhol, português, alemão e húngaro: secções de estado e de âmbito previsto (derivadas de `ISSUES_GOOD_FIRST.md`).
- Instalável (PWA): `manifest.webmanifest`, `sw.js` e os ícones são gerados pelo kit comum (`fff-kit/pwa`); a página funciona offline após a primeira visita por HTTPS.

### Alterado
- O workflow corre em Ubuntu 26.04 com Node.js 26 e executa também os testes, a verificação da compilação e a validação.
- Os dados são agora pacotes: `data/packs/example.json` substitui `data/questions/example.json`, e um pacote é um ficheiro com o nome do seu id; `scripts/validate.py`, os passos do README e os modelos mudaram em conformidade.
- A lista de good first issues contém agora o que falta fazer (pacotes de país, programa, revisões); o treinador, o simulador de exame, as figuras e a verificação de `correct` que enumerava já existem.

## [0.1.0] - 2026-11-13

### Adicionado
- Esqueleto inicial: estrutura, esquema de dados ou primeiros exemplos, guias de contribuição em oito línguas.

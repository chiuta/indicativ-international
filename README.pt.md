# INDICATIV International

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · **Português** · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Versão: 0.2.1 · Última atualização: 2026-11-22

🌐 https://indicativ-international.chiuta.ro

> Bancos de perguntas do exame de radioamador de cada país, num formato comum.

Trade-free: sem rastreamento, sem anúncios, sem contas, funciona offline.

## Estado

Alfa, utilizável: o único `index.html` é um treinador e simulador de exame para as perguntas de radioamador. Pratica com um calendário de revisão em cinco caixas, faz exames de treino cronometrados com uma nota mínima e importa pacotes de perguntas num formato JSON comum. O pacote incluído tem 50 perguntas de treino originais, escritas para este projeto; não é um banco de perguntas oficial e ainda não está incluído nenhum pacote de país. Tudo fica no seu navegador, sem contas, rastreio ou pedidos de rede.

## O que faz

- «Treinar»: escolha um pacote, um assunto e as perguntas a treinar (por rever e novas, qualquer pergunta ou os seus pontos fracos); cada resposta é verificada de imediato e explicada, com a sua fonte. As respostas certas voltam passados 1, 3, 7, 14 e 30 dias; as erradas voltam hoje e mais uma vez no fim da sessão. As teclas 1–6 ou A–F escolhem uma resposta, Enter avança.
- «Exame»: um teste cronometrado, sorteado do pacote, com contagem decrescente, mapa de perguntas, «Marcar para rever» e nota mínima; nada é classificado até terminar (ou o tempo acabar). O resultado mostra a pontuação por assunto e as perguntas erradas; a mesma semente repete um exame; um exame começado continua depois de recarregar. As regras (perguntas, minutos, nota mínima, penalização das respostas erradas) vêm do pacote com a sua fonte; sem elas a página usa valores de treino (20 perguntas, 30 minutos, 75 %).
- «Pacotes»: o pacote de treino incluído e os pacotes que importa colando JSON ou escolhendo um ficheiro (no máximo 8 de cada vez), cada um com a sua fonte, licença e regras de exame; progresso por assunto; pode descarregar um pacote, repor o seu progresso ou removê-lo; cópia de segurança do progresso num ficheiro, que carrega noutro dispositivo. Um pacote com problemas é listado linha a linha e pode importar apenas as perguntas válidas.
- Formato: fórmulas nas perguntas escritas `f_{o}` ou `10^{-6}`; pequenos desenhos em SVG restrito com alternativa em texto; um programa opcional com `syllabus_ref` em cada pergunta; um ficheiro JSON por pacote em `data/packs/`, descrito por `schema.json` e `docs/pack-format.md`.
- Ferramentas para quem contribui: `scripts/validate.py` verifica os pacotes com as mesmas regras da página; `scripts/import_csv.mjs` transforma uma tabela guardada como CSV num pacote e indica a linha de cada problema; `scripts/pack_report.mjs` resume um pacote para o verificar face ao banco oficial. A interface está em oito línguas e usa-se com o teclado e com um leitor de ecrã.
- Instalável como aplicação e disponível offline após a primeira visita quando servida por HTTPS (um service worker guarda a página; nada mais é guardado ou enviado). Aberta a partir de um ficheiro descarregado funciona da mesma forma, sem instalação.

## Como funciona

- `schema.json` descreve um pacote; `scripts/validate.py` verifica cada ficheiro de `data/packs/` por ele e pelas regras que um esquema não sabe exprimir: o ficheiro tem o nome do id do pacote, os id e as perguntas são únicos num pacote, `syllabus_ref` existe no programa, as figuras usam apenas os elementos permitidos e as regras de exame cabem no pacote.
- `src/engine.mjs` é o motor (sem ecrã, sem rede): validação, calendário em cinco caixas, filas de perguntas, exames sorteados a partir de uma semente, classificação e ficheiros de progresso. `scripts/validate.py` e `scripts/import_csv.mjs` aplicam as mesmas regras; os testes comparam as implementações nos mesmos casos.
- `src/ui.js`, `src/i18n.mjs` e `src/app.css` são a interface; `scripts/build.mjs` constrói o único `index.html` a partir de `src/` e incorpora os pacotes de `data/packs/` (todos menos `example.json`); `node scripts/build.mjs --check` falha quando a página não está atualizada.
- O navegador guarda três entradas (pacotes importados, progresso, um exame em curso); cada uma é verificada de novo quando a página carrega, pelo que um estado guardado danificado ou hostil é ignorado, não acreditado. Nada é enviado para lado nenhum.
- Testes: `npm test` (motor, paridade do validador, importação CSV, textos da interface, dados, documentação, compilação) e testes de navegador no hub (oito línguas, acessibilidade, estado guardado hostil, importação, cronometragem do exame) O desenvolvimento precisa de Node.js 24 ou mais recente e de Python 3 com `jsonschema`; a própria página só precisa de um navegador que conheça ES2017.
- `manifest.webmanifest`, `sw.js` e os ícones são produzidos por `node scripts/build.mjs` através do kit comum (secção `pwa` de `src/app.json`); `--check` também os verifica, e `npm test` confirma que o manifesto, a versão do service worker e a CSP correspondem à página.

## Limites honestos

- O pacote incorporado é um pequeno conjunto de perguntas de treino escritas com um assistente de IA e verificadas por cálculo ou por factos de manual. Não é um banco oficial de perguntas e nenhum examinador o reviu.
- Não está incluído nenhum pacote de país: os bancos públicos de perguntas da Hungria, da Itália, da Alemanha e de outros não puderam ser descarregados nem verificados aqui, pelo que são tarefas para contribuidores. Compare cada pacote com o banco oficial antes de confiar nele.
- As regras dos exames reais (número de perguntas, tempo, nota de aprovação) não estão incorporadas. Um pacote pode declará-las com a respetiva fonte; sem isso o simulador usa valores de treino, e passar aqui não prova nada sobre um exame real.
- O esquema de repetição é simples, de cinco caixas com intervalos fixos, não um algoritmo afinado. O progresso fica neste navegador; limpar os dados do sítio apaga-o, a menos que tenha descarregado uma cópia.
- A associação ao programa vale o que vale o pacote: a página verifica que «syllabus_ref» existe no pacote, mas não sabe dizer se a associação está certa. O programa CEPT HAREC não está incluído.
- As traduções da interface foram escritas por máquina e não foram revistas por falantes nativos; as perguntas aparecem na língua do pacote.

## Contribua em 5 minutos

1. Faça um fork deste repositório.
2. Copie `data/packs/example.json` para `data/packs/<id-do-seu-pacote>.json` (o nome do ficheiro é o id do pacote) e preencha-o, ou transforme uma tabela num pacote com `node scripts/import_csv.mjs` (veja `docs/contributor-guide.md`).
3. Execute `python3 scripts/validate.py` e `npm test`, e depois `node scripts/build.mjs` para que o pacote fique em `index.html`.
4. Abra um pull request — as contribuições de dados não exigem programação.
5. Sem programar: experimente primeiro o pacote na página (separador «Pacotes», botão «Importar») e envie depois o ficheiro numa issue ou num pull request; um responsável acrescenta-o a `data/packs/`.

## Boas primeiras tarefas

Veja `ISSUES_GOOD_FIRST.md` para tarefas prontas.

## Licença

Código: MIT. Dados contribuídos: indique a fonte; são publicados sob a mesma licença, salvo indicação em contrário.

## Apoio

Se o projeto lhe for útil, pode [oferecer-me um café](https://buymeacoffee.com/echo.of.the.strings).

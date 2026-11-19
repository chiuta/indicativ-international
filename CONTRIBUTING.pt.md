# Como contribuir — INDICATIV International

[English](CONTRIBUTING.md) · [Română](CONTRIBUTING.ro.md) · [Français](CONTRIBUTING.fr.md) · [Italiano](CONTRIBUTING.it.md) · [Español](CONTRIBUTING.es.md) · **Português** · [Deutsch](CONTRIBUTING.de.md) · [Magyar](CONTRIBUTING.hu.md)

Versão: 0.2.1 · Última atualização: 2026-11-20

1. Faça um fork deste repositório.
2. Copie `data/packs/example.json` para `data/packs/<id-do-seu-pacote>.json` (o nome do ficheiro é o id do pacote) e preencha-o, ou transforme uma tabela num pacote com `node scripts/import_csv.mjs` (veja `docs/contributor-guide.md`).
3. Execute `python3 scripts/validate.py` e `npm test`, e depois `node scripts/build.mjs` para que o pacote fique em `index.html`.
4. Abra um pull request — as contribuições de dados não exigem programação.
5. Sem programar: experimente primeiro o pacote na página (separador «Pacotes», botão «Importar») e envie depois o ficheiro numa issue ou num pull request; um responsável acrescenta-o a `data/packs/`.

## Regras

- Um pacote = um ficheiro, com o nome do id do pacote.
- Cite sempre uma fonte.
- Contribua apenas com material que possa partilhar legalmente (sem texto protegido copiado).
- Seja gentil: veja o Código de Conduta.

## Acrescentar um pacote de perguntas

1. Escolha primeiro a fonte. Um pacote de país tem de vir do banco público de perguntas desse país (ou de outra fonte que possa partilhar legalmente): anote a edição, a data e o endereço web. Não copie de um livro, de um curso ou de um sítio se a licença não o permitir; se não puder copiar, escreva perguntas originais e diga-o em `source`.
2. Copie `data/packs/example.json` para `data/packs/<id-do-seu-pacote>.json`. O nome do ficheiro é o id do pacote: letras minúsculas, algarismos e hífenes, por exemplo `hu-ham-a`. Preencha o cabeçalho: `country`, `licence_class`, `lang`, `source`, `source_url`, `license`, e as regras `exam` só se as regras oficiais estiverem publicadas (com a sua fonte).
3. Acrescente as perguntas: à mão no ficheiro, ou a partir de uma tabela guardada como CSV com `node scripts/import_csv.mjs questions.csv --id <id-pacote> --title … --country … --class … --lang … --source … --license …` (colunas e opções: `docs/contributor-guide.md`). Mantenha a numeração oficial em `id` e `source`.
4. Verifique o pacote face ao banco oficial (`docs/verify-against-official-bank.md`): o texto de cada pergunta, cada resposta e cada resposta certa; peça a uma segunda pessoa que verifique uma amostra e escreva no pull request quem verificou o quê e como.
5. Execute `python3 scripts/validate.py`, depois `node scripts/build.mjs` (põe o pacote em `index.html`) e `npm test`. Também pode experimentar o pacote antes de o enviar: abra `index.html`, separador «Pacotes», botão «Importar».
6. Abra um pull request ou uma issue e diga que edição usou e em que condições a pode partilhar. Um pacote sem fonte declarada não é integrado.

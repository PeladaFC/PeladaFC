# Pelada FC

App para organizar pelada: elenco com notas, presença (mensalistas e diaristas), sorteio de times equilibrados, pós-jogo com prêmios e artes, ranking, caixa, locais avaliados e avisos.

- Funciona no navegador e pode ser adicionado à tela de início do celular.
- Login e dados ficam no Firebase (projeto `pelada-fc-990d6`).
- Publicado pelo GitHub Pages.

## Arquivos

| Arquivo | O que é |
| --- | --- |
| `index.html` | Página do app |
| `core.js` | Telas e regras da pelada |
| `app.js` | Login, Minhas peladas, convites e ligação com o Firebase |
| `br.js` | Estados e municípios (IBGE) |
| `firestore.rules` | Regras de segurança do banco |
| `manifest.webmanifest`, ícones | Instalação na tela de início |

## Regras de segurança

Copie o conteúdo de `firestore.rules` e cole em **Firebase → Firestore Database → Regras → Publicar**.

## Teste local

Abra `index.html?mock=1` num servidor local para usar um banco de teste na memória, sem tocar no Firebase.

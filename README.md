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
| `sw.js` | Recebe e mostra as notificações no celular |
| `functions/` | Servidor de notificações (Firebase Cloud Functions, Web Push) |
| `instalar.sh` | Publica o servidor e as regras pelo Cloud Shell do Google |
| `manifest.webmanifest`, ícones | Instalação na tela de início |

## Publicar servidor e regras

No Cloud Shell do Google (shell.cloud.google.com), com a conta dona do projeto:

```
curl -sL https://raw.githubusercontent.com/PeladaFC/PeladaFC/main/instalar.sh | bash
```

Isso publica o servidor de notificações e as regras de `firestore.rules`. Exige o plano Blaze.

## Teste local

Abra `index.html?mock=1` num servidor local para usar um banco de teste na memória, sem tocar no Firebase.

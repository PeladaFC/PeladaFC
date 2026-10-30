# Pelota FC · preparação para as lojas

Endereço do app: https://pelotafc.com.br/app/ (o mesmo dentro do app das lojas).
Identificador do app (Android e iPhone): **br.com.pelotafc.app**

## Links que abrem direto o app instalado
Os links de convite (`?c=`), de presença (`?c=…&p=…&r=sim|nao`), das notificações (`?g=…&p=…&r=ver`)
e de parceiro (`?rep=`) ficam em `/app/`. Para o celular abrir o app da loja em vez do site:

- **Android (App Links):** `/.well-known/assetlinks.json`
  Trocar `PREENCHER_COM_A_IMPRESSAO_DIGITAL_SHA256_DA_PLAY_CONSOLE` pela impressão digital SHA-256
  da chave de assinatura (Play Console → Integridade do app → Assinatura do app).
- **iPhone (Universal Links):** `/.well-known/apple-app-site-association`
  Trocar `PREENCHER_TEAM_ID` pelo Team ID da conta Apple Developer
  e ligar "Associated Domains" no app com `applinks:pelotafc.com.br`.

Enquanto os valores não forem preenchidos, nada muda: os links continuam abrindo o site.

## Notificações no app da loja
O app da loja usa as notificações do próprio celular (Firebase Cloud Messaging / APNs).
Os botões "Vou" e "Não vou" passam a aparecer também no iPhone.
O servidor (`respostaPush`) já confere a chave de cada pessoa; só muda o canal de entrega.

## Pendências do lado da empresa
- Conta Google Play (organização, com D-U-N-S) e Apple Developer (organização, com D-U-N-S)
- Política de privacidade: https://pelotafc.com.br/privacidade.html
- Termos de uso: https://pelotafc.com.br/termos.html
- Exclusão de conta dentro do app: já existe (Perfil → Excluir minha conta)

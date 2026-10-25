#!/usr/bin/env bash
# Pelota FC · grava as credenciais da aplicação do Mercado Pago da plataforma (para o split/comissão).
# Rodar no Cloud Shell, logado com a conta dona do projeto:
#   curl -sL https://raw.githubusercontent.com/PeladaFC/PeladaFC/main/configurar-mp.sh | bash
# Os dados vão direto para o banco (servidor/mp), que o app não consegue ler.
set -euo pipefail
PROJ=pelada-fc-990d6
echo "==> Credenciais da aplicação do Mercado Pago (Suas integrações → Pelota FC → Credenciais de produção)"
read -r -p "Client ID (só números): " CID </dev/tty
read -r -s -p "Client Secret (não aparece enquanto digita/cola): " CSEC </dev/tty; echo
read -r -p "Comissão do app em % [1]: " COM </dev/tty; COM=${COM:-1}
CID=$(echo "$CID" | tr -d '[:space:]'); CSEC=$(echo "$CSEC" | tr -d '[:space:]')
[[ "$CID" =~ ^[0-9]+$ ]] || { echo "Client ID inválido (deve ter só números)."; exit 1; }
[ -n "$CSEC" ] || { echo "Client Secret vazio."; exit 1; }
CORPO=$(CID="$CID" CSEC="$CSEC" COM="$COM" python3 -c 'import json,os;c=float(os.environ["COM"].replace(",","."))/100;assert 0<=c<=0.1,"comissão fora do limite";print(json.dumps({"fields":{"clientId":{"stringValue":os.environ["CID"]},"clientSecret":{"stringValue":os.environ["CSEC"]},"comissao":{"doubleValue":c}}}))')
URL="https://firestore.googleapis.com/v1/projects/$PROJ/databases/(default)/documents/servidor/mp?updateMask.fieldPaths=clientId&updateMask.fieldPaths=clientSecret&updateMask.fieldPaths=comissao"
COD=$(curl -s -o /tmp/mp_resp.json -w '%{http_code}' -X PATCH "$URL" -H "Authorization: Bearer $(gcloud auth print-access-token)" -H "x-goog-user-project: $PROJ" -H 'Content-Type: application/json' -d "$CORPO")
rm -f /tmp/mp_resp.json
if [ "$COD" = "200" ]; then echo; echo "✅ Pronto! Mercado Pago da plataforma configurado (comissão de ${COM}%)."; else echo "Não deu certo (código $COD). Mande uma foto desta tela."; exit 1; fi

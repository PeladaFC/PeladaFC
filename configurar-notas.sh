#!/usr/bin/env bash
# Pelada FC · libera o relatório de notas fiscais da comissão para os e-mails da empresa e publica o servidor.
# Rodar no Cloud Shell (https://shell.cloud.google.com/?project=pelada-fc-990d6), logado com a conta dona do projeto:
#   curl -sL https://raw.githubusercontent.com/PeladaFC/PeladaFC/main/configurar-notas.sh | bash
# Os e-mails vão para servidor/plataforma, que o app não consegue ler.
set -euo pipefail
PROJ=pelada-fc-990d6
echo "==> Quem pode ver o relatório de notas fiscais"
echo "    Digite os e-mails usados para ENTRAR no Pelada FC (separados por vírgula)."
read -r -p "E-mails: " EMAILS </dev/tty
CORPO=$(EMAILS="$EMAILS" python3 -c 'import json,os,re
l=[e.strip().lower() for e in os.environ["EMAILS"].split(",") if e.strip()]
assert l and all(re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+",e) for e in l),"e-mail inválido"
print(json.dumps({"fields":{"emails":{"arrayValue":{"values":[{"stringValue":e} for e in l]}}}}))') || { echo "Algum e-mail está errado. Rode de novo."; exit 1; }
URL="https://firestore.googleapis.com/v1/projects/$PROJ/databases/(default)/documents/servidor/plataforma?updateMask.fieldPaths=emails"
COD=$(curl -s -o /tmp/pfc_resp.json -w '%{http_code}' -X PATCH "$URL" -H "Authorization: Bearer $(gcloud auth print-access-token)" -H "x-goog-user-project: $PROJ" -H 'Content-Type: application/json' -d "$CORPO")
rm -f /tmp/pfc_resp.json
if [ "$COD" != "200" ]; then echo "Não deu certo (código $COD). Mande uma foto desta tela."; exit 1; fi
echo "    ✅ e-mails liberados"
echo
curl -sL https://raw.githubusercontent.com/PeladaFC/PeladaFC/main/instalar.sh | bash

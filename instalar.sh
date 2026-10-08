#!/usr/bin/env bash
# Pelada FC · instala/atualiza o servidor de notificações e as regras de segurança.
# Rodar no Cloud Shell do Google (shell.cloud.google.com), logado com a conta dona do projeto:
#   curl -sL https://raw.githubusercontent.com/PeladaFC/PeladaFC/main/instalar.sh | bash
set -euo pipefail
PROJ=pelada-fc-990d6
DIR="$HOME/PeladaFC"
echo "==> Baixando a versão mais nova do Pelada FC"
if [ -d "$DIR/.git" ]; then git -C "$DIR" fetch -q origin main && git -C "$DIR" reset -q --hard origin/main; else git clone -q https://github.com/PeladaFC/PeladaFC.git "$DIR"; fi
cd "$DIR"
echo "==> Testando as regras das notificações"
node functions/teste.js >/dev/null && echo "    ok"
echo "==> Instalando dependências do servidor"
(cd functions && npm install --omit=dev --no-audit --no-fund --loglevel=error)
gcloud config set project "$PROJ" >/dev/null 2>&1 || true
FB="npx --yes firebase-tools@latest"
publicar() { $FB deploy --only functions,firestore:rules --project "$PROJ" --force --non-interactive; }
echo "==> Publicando (a primeira vez demora uns 5 minutos)"
if ! publicar; then
  echo "==> O Google ainda está liberando permissões do projeto novo. Tentando de novo em 90 segundos..."
  sleep 90
  if ! publicar; then
    echo "==> Precisa entrar com sua conta Google no Firebase uma vez."
    $FB login --no-localhost
    publicar
  fi
fi
echo "==> Limpando cópias antigas do servidor (evita custo de armazenamento)"
$FB functions:artifacts:setpolicy --project "$PROJ" --location southamerica-east1 --days 1 --force >/dev/null 2>&1 || true
echo
echo "✅ Pronto! Servidor de notificações publicado e regras atualizadas."
echo "   Agora abra o Pelada FC pelo ícone e toque em 'Ativar notificações'."

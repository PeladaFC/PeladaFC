# Pelota FC — guia para o Claude

App (PWA) para organizar peladas: lista de presença, sorteio de times, notas da galera, destaques/artes, caixa com Pix, avisos.
No ar em https://pelotafc.com.br/app.

## Como trabalhar com o Felipe (dono do projeto) — sempre

- Falar em português do Brasil, simples, em passos numerados. Ele não é programador.
- **Sempre mostrar uma prévia** (print ou vídeo, testado no modo `?mock=1`) antes. **Só publicar quando ele disser "Publique"** (erros de digitação como "Publiqueb" contam). Nunca publicar sem autorização.
- Fluxo: trabalhar na branch `previa-grupos` → mostrar → "Publique" → juntar na `main` (é a `main` que vai para o ar) → manter `previa-grupos` igual à `main`.
- Quando ele precisar rodar algo no Cloud Shell, mandar **sempre as 3 coisas juntas**, cada comando em bloco com botão de copiar:
  1. o endereço do Cloud Shell do projeto (o link exato e a conta Google de administração estão na mensagem que ele cola no início da conversa; não é a conta de login do app);
  2. trocar para o projeto: `gcloud config set project pelada-fc-990d6`;
  3. rodar: `curl -sL https://raw.githubusercontent.com/PeladaFC/PeladaFC/main/instalar.sh | bash`.
  O instalador pode ser repetido; termina com "✅ Pronto!". Só é preciso quando muda `functions/`, `firestore.rules` ou `sw.js`; mudanças só visuais não precisam.
- Sempre mandar os links.
- Nunca pedir nem mostrar senhas ou chaves; ele digita só nos sites oficiais ou no Cloud Shell.
- Ele não quer gastos: preferir caminhos gratuitos. **Avisar ANTES** de qualquer passo com custo ou que não dá para desfazer.
- Toda ação importante precisa de confirmação com 2 toques; botões de confirmar não mudam de lugar nem de tamanho.
- Copiar designs fielmente quando ele pedir. Interface compacta. Não mexer nas artes sem ele pedir.
- Publicar posts ou conteúdo público só com aprovação dele.
- Ao mudar algo que envolve dados pessoais, atualizar `privacidade.html` (e a data no topo).
- Este repositório é público: não colocar aqui e-mails, dados da empresa, senhas ou chaves.

## Técnica

- Front: PWA em `app/` — `app/app.js` (módulo: login, perfil, Minhas peladas, carta do atleta, gestos de abertura), `app/core.js` (script clássico: telas do grupo), `app/index.html` (CSS e versão `?v=AAAAMMDDx`; trocar a versão a cada publicação). `sw.js` na raiz (escopo `/`). Páginas: `index.html`, `privacidade.html`, `termos.html`.
- Firebase: projeto `pelada-fc-990d6`. Cloud Functions em `southamerica-east1`: `functions/index.js` (gatilhos e rotinas), `functions/regras.js` (textos e destinatários das notificações; teste: `node teste.js`), `functions/notageral.js` (nota geral; teste: `node teste-nota.js`). Regras em `firestore.rules`. Instalação: `instalar.sh`.
- Teste local: `python3 -m http.server` na raiz e abrir `/app/index.html?mock=1` (Playwright). Ganchos de teste no mock: `window.__gid`, `__uid`, `__mockGet`, `__mockSet`, `__ir`.
- Hospedagem atual: GitHub Pages com domínio próprio (`CNAME`). Planejado: migrar para Firebase Hosting e tornar o repositório privado.

## Estado do produto (resumo)

- Carta do atleta (Minhas peladas): nasce do cartão verde de abertura com animação; nota geral (cruza todas as peladas e corrige a "generosidade" de cada grupo; recalcula 04:30 ou "Recalcular agora"); valências; "Meus números" por temporada; só o próprio jogador vê.
- Administrador entra sozinho no elenco; membros com nome igual a um jogador livre são ligados automaticamente.
- Perfil com data de nascimento obrigatória (o grupo vê só dia e mês).
- Aba Jogo (pelada marcada): placar enxuto (data e hora numa linha, 4 números lado a lado, diária + Valor/Quem paga/🎨 Arte dentro do placar); barra Presença · Times · Jogo e pós-jogo gruda no topo ao rolar, com pontinho amarelo na fase atual (`faseDe`); Presença com botão único "📲 Mandar no WhatsApp ▾" (Convocação, Cobrar respostas, Lista); Jogo e pós-jogo com "⚽ Lançar gol" (quem fez + passe; correção na mesma janela). Painel "⭐ Avaliação geral" (do elenco) fica logo depois do placar, antes do sorteio, para as notas entrarem na divisão dos times; craque e Últimas peladas continuam no fim da aba Jogo (o Felipe quer assim, pelo engajamento). Botão Sortear ocupa a linha toda ao lado do número de times (2 a 16; 16 cores em `CORES`, só para diferenciar na tela). Nome padrão dos times: Time 1, Time 2, Time 3… (o Felipe não quer nomes de cores nem letras: ninguém liga para as cores e não há coletes de todas); cada grupo pode dar nome próprio em Ajustes → Nomes dos times ou no ✎ do time (`nomesTimes`). A cor fica só como marquinha na tela; mensagens e notificações usam ⚽. Nomes alinhados com os avisos: "Avaliação geral do elenco" (a de tempos em tempos) e "Dar notas da pelada" (a de cada pelada).
- Caixa: "Data e valores do mês" fechado num resumo; mensalidades com quem deve primeiro e "✅ N pagos" recolhido; extrato fechado. Elenco: filtros numa linha (Todos · Mensalistas · Diaristas · Posição, com Inativos dentro).
- Cobranças extras com campo de escolha para cada um preencher (`campos`: só 👕 Tamanho, opções editáveis, padrão PP–GGG; o Felipe pediu para tirar texto, foto e arquivo porque não entram no PDF). Obrigatório por padrão (caixinha "Obrigatório"); com campo obrigatório vazio o jogador vê "Escolher" no lugar do Pix. Respostas em `respExtras/{uid}`; só a pessoa e os administradores leem. Admin vê resumo no Caixa e "📋 Respostas" (copiar, WhatsApp e 📄 PDF com total por tamanho e tabela de quem pediu o quê).
- Checkpoint: branch `checkpoint` no GitHub guarda a versão de 16/11/2026 08:00; se ele pedir "voltar para o checkpoint", restaurar; só apagar quando ele mandar.
- Aba Jogo: "Sem pelada marcada" é botão laranja para marcar; formulário Quando → Onde (opcional) → Como → Cobrança ("Com cobrança" padrão, à esquerda); quadro com valor + taxa do Pix (1,99%).
- Últimas peladas: Notas (com resultado completo e envio) · Times · ⭐ Destaques (artes Feed/Story, "Postar no Instagram", prêmios só pela votação, chave para esconder; premiado também vê e posta as artes dele). Marca "PELOTA FC" discreta no rodapé das artes.
- Aba Avisos: "Automáticos" agrupados por assunto (Lista e presença · Jogo · Notas e prêmios · Dinheiro · Grupo; push do servidor, cada um com chave para desligar em `config/geral.pushOff`); "Agenda" só para o que depende de horário (Convocação, Cobrar respostas, Lista, Cobrança, Outra mensagem com título e texto livres); "Mandar agora" (✏️ Outra mensagem → mural do app e/ou WhatsApp, pode virar lembrete semanal; Convite). Times e resultado saíram da Agenda: quando os times são publicados e quando a votação fecha, o administrador vê o alerta "Repassar no WhatsApp" na aba Jogo (marca `peladas/{id}.rep`). As outras mensagens prontas ficam nas telas onde são usadas.
- Notificação de cobrança abre direto o pagamento com Pix.
- Suporte com autorização do dono (2 h) e chamados.

## Pendente

- Fase 2 — assinatura pelas lojas: 30 dias grátis por grupo (da criação; não zera ao trocar de dono); sem carência, sem pagamento o grupo pausa em modo limitado; push só quando a cobrança falhar; 1 assinatura por grupo, só o dono assina; ao passar o dono, Android cancela renovação via API e iPhone bloqueia a troca até cancelar; avisar o novo dono 2 dias antes, 1 dia antes e no dia.
- Antes de enviar às lojas: lembrar do robô de IA no WhatsApp para atendimento (`LOJA.md`).
- Migrar hospedagem para Firebase Hosting e fechar o repositório (avisar sobre custos antes).

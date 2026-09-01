# Arquitetura Web — Feira Frei 2026

> Hotsite institucional + sistema de credenciamento da **6ª Feira das Profissões 2026**,
> do Instituto Social Nossa Senhora de Fátima. Evento presencial em 19/09/2026, 10h–16h.

## 1. Visão geral

O projeto é uma aplicação full-stack única que cobre três públicos diferentes:

1. **Público geral** — visita o hotsite (`/`), conhece a feira e se inscreve.
2. **Administração** (papel `admin`) — loga em `/admin` e acessa o hub com os três
   cartões: `/admin/dashboard`, `/admin/credenciamento` e `/admin/leitor`.
3. **Equipe de credenciamento** (papel `credenciamento`) — loga em `/admin`, mas só vê o
   cartão de `/admin/credenciamento` (lista de visitantes, cadastro e check-in).
4. **Equipe do leitor** (papel `leitor`) — loga em `/admin`, mas só vê o cartão de
   `/admin/leitor` (leitura de QR Code para registrar presença).

Toda a interface (site + telas restritas) é renderizada pelo mesmo app React com
**SSR** via TanStack Start. Este projeto **não acessa banco de dados nem implementa
autenticação**: toda a persistência e a autenticação (JWT) são feitas pela API separada
em `../api` (Node.js + Express + MySQL — ver `web/specs/api.architecture.md`). `web` é
puramente um cliente HTTP dessa API.

## 2. Stack tecnológica

| Camada | Tecnologia |
| --- | --- |
| Framework | React 19 + TanStack Start (SSR) + TanStack Router (roteamento por arquivo) |
| Build/dev server | Vite 8, com `@lovable.dev/vite-tanstack-config` |
| Estilo | Tailwind CSS 4 + CSS modules por componente (`*.css`) + Radix UI / shadcn (`src/components/ui`) |
| Estado de dados no cliente | TanStack Query (QueryClient no root) + Context API própria (`VisitantesContext`) |
| Formulários | React Hook Form + Zod (disponíveis via shadcn `form.tsx`) |
| Autenticação | JWT emitido pela API (`../api`), guardado no `localStorage` do navegador e renovado automaticamente por `services/apiFeira.js` |
| Runtime de produção | Node (`node .output/server/index.mjs`) — projeto preparado para publicação como Cloudflare Worker (`wrangler.toml.example`); não requer nenhum binding de banco, só a variável de build `VITE_API_URL` |
| Leitura de QR Code | Implementação própria em `src/lib/qrcode/*` (sem dependência externa), usada pela câmera/leitor |
| Geração de QR Code | `qrcode` (SVG salvo no banco) e `qrcode.react` (renderização na tela) |
| Lint/format | ESLint 9 + Prettier |
| Testes | Vitest (`src/lib/qrcode/__tests__`) |
| Gerenciador de pacotes | npm (há também `bun.lock`/`bunfig.toml`, mas os scripts documentados usam npm) |

## 3. Estrutura de pastas

```text
src/
├── assets/         Imagens estáticas (fotos, logos, favicon, ilustrações de cursos)
├── components/     Componentes visuais do site e da área restrita
│   └── ui/         Biblioteca shadcn/Radix (accordion, dialog, table, sidebar, etc.)
├── css/            Estilos globais das áreas restritas (admin.css, credenciamento.css) e global.css
├── data/           Conteúdo estático (cursos, atrações, depoimentos, gêneros/vínculos, parceiros)
├── hooks/          Hooks utilitários (use-mobile)
├── lib/            Utilitários de baixo nível: captura de erro, página de erro, decodificador de QR Code, utils gerais
├── pages/          Componentes de página (Home, e pages/admin/: Hub, Dashboard, Credenciamento, Leitor)
├── routes/         Definições de rota do TanStack Router (file-based; routes/admin/ tem as 4 sub-rotas)
├── services/       Camada de comunicação com a API externa: login/JWT, visitantes, presenças, setores, dashboard (`apiFeira.js`)
├── utils/          Contexto de visitantes (VisitantesContext), geração de código local, impressão/compartilhamento
├── router.tsx      Fábrica do router (React Router + QueryClient)
├── server.ts       Entrada do worker: apenas SSR + tratamento de erro (sem autenticação nem banco)
└── start.ts        Middlewares globais do TanStack Start (tratamento de erro + CSRF)
```

## 4. Rotas

| Rota | Página | Proteção | Descrição |
| --- | --- | --- | --- |
| `/` | `Home.jsx` | Pública | Hotsite: hero, sobre, livro dourado, atrações, cursos, depoimentos, formulário de inscrição, localização, footer |
| `/admin` | `admin/Hub.jsx` | JWT, papéis `admin`, `credenciamento` ou `leitor` | Hub pós-login: cartões para as páginas abaixo, filtrados pelo papel do usuário |
| `/admin/dashboard` | `admin/Dashboard.jsx` | JWT, papel `admin` | Dashboard analítico de inscritos/presenças |
| `/admin/credenciamento` | `admin/Credenciamento.jsx` | JWT, papéis `admin` ou `credenciamento` | Lista todos os visitantes; botão "+ Novo" abre modal de cadastro; editar/excluir/QR Code/check-in por linha |
| `/admin/leitor` | `admin/Leitor.jsx` | JWT, papéis `admin` ou `leitor` | Leitor de QR Code por turma/setor, para registrar presença |

Cada uma dessas quatro rotas é independente (não há layout/Outlet compartilhado) e usa
o mesmo componente `AreaRestrita`/`Acesso.jsx`, mudando apenas título, descrição e os
papéis aceitos (`papeisPermitidos`). A validação de e-mail/senha acontece na API (ver
seção 6); se o administrador logado não tiver o papel exigido pela rota, a tela mostra
uma mensagem de acesso negado em vez do conteúdo — e o hub em `/admin` já filtra os
cartões conforme o papel, então a equipe de credenciamento nunca vê o cartão Dashboard.

## 5. Fluxo de dados no cliente

```text
Componentes de UI
   │  useVisitantes()
   ▼
VisitantesContext (src/utils/VisitantesContext.jsx)
   │  chama funções de
   ▼
src/services/apiFeira.js  ──fetch──▶  {VITE_API_URL}/api/*  (projeto ../api)
```

- `VisitantesContext` é o único ponto de estado compartilhado de visitantes/presenças/
  setores. Ele hidrata visitantes/presenças a partir do `localStorage` (contingência) e,
  em paralelo, tenta carregar os dados reais da API sempre que a sessão muda (evento
  `feira2026-sessao`, disparado ao logar, deslogar ou perder a sessão).
- Toda mutação (criar visitante, editar, excluir, registrar presença) primeiro tenta a
  API; se a criação falhar, o cadastro de visitante cai para o dispositivo local e a UI
  avisa que a inscrição "ficou salva somente neste dispositivo".
- `src/services/apiFeira.js` é a única camada que conhece a URL da API e o token de
  acesso; nenhum componente monta requisições HTTP diretamente. Essa mesma camada
  renova o access token automaticamente (usando o refresh token) quando uma chamada
  autenticada recebe `401`, repetindo a requisição original uma única vez antes de
  desistir e encerrar a sessão.

## 6. Autenticação e autorização

Toda autenticação vive na API (`../api`), não em `web`. Ver `web/specs/api.architecture.md`
para o desenho completo (JWT, rotação de refresh token, rate limit); aqui documentamos
só o lado do cliente.

- **Login**: `Acesso.jsx` (componente `AreaRestrita`) envia e-mail + senha para
  `POST {VITE_API_URL}/api/auth/login`. A API devolve um `accessToken` (curta duração),
  um `refreshToken` e os dados do administrador (`{ id, nome, email, papel }`).
- **Guarda da sessão**: `services/apiFeira.js` grava `{ accessToken, refreshToken,
  administrador }` em uma única chave do **localStorage** (`feira2026-sessao`) e dispara
  o evento `feira2026-sessao` sempre que a sessão muda (login, logout, renovação,
  expiração). `VisitantesContext` e `Acesso.jsx` escutam esse evento para reagir —
  por isso o login **persiste entre recarregamentos da página** (diferente do antigo
  Basic Auth por `sessionStorage`, que exigia login a cada visita).
- **Renovação automática**: toda chamada autenticada que recebe `401` tenta
  `POST /api/auth/refresh` uma única vez com o refresh token guardado; se funcionar, a
  chamada original é repetida com o novo access token. Se a renovação também falhar
  (refresh expirado/revogado), a sessão local é apagada e a UI volta para a tela de
  login.
- **Logout**: `sair()` chama `POST /api/auth/logout` (melhor esforço — revoga o refresh
  token no servidor) e sempre limpa a sessão local, mesmo se a chamada falhar.
  `VisitantesContext` também limpa o cache local de visitantes/presenças
  (`localStorage`) nesse momento, para não manter dados de visitantes acessíveis no
  dispositivo além do necessário.
- **Papéis**: `admin` (acesso total: dashboard, credenciamento e leitor), `credenciamento`
  (só cadastro/listagem/edição/check-in de visitantes — sem dashboard, sem leitor de QR,
  sem exclusão) e `leitor` (só o leitor de QR/registro de presença — sem lista de
  visitantes, sem dashboard). `AreaRestrita` recebe `papeisPermitidos` por página e nega
  acesso (mostrando o motivo) se o administrador logado não tiver o papel exigido; em
  `admin/Credenciamento.jsx`, o botão "Excluir" também só aparece para `administrador.papel
  === "admin"` — reforço de UX, já que a API rejeita a chamada de qualquer forma.
- Tokens nunca são logados. Guardá-los em `localStorage` (em vez de um cookie
  `httpOnly`) é uma escolha deliberada deste projeto para simplificar o cliente SPA;
  o preço é exposição a roubo de token via XSS, por isso nenhuma entrada de usuário é
  renderizada como HTML/SVG bruto em nenhum componente (ver seção 9.4).

## 7. Banco de dados

`web` não acessa banco de dados. Toda a estrutura (`visitantes`, `presencas`, `setores`,
`administradores`, `refresh_tokens`) vive na API (`../api/db/migrations`), documentada em
`web/specs/api.architecture.md`. O único dado replicado localmente é a lista de setores
(`GET /api/setores`, pública) e a lista completa de visitantes/presenças, carregadas via
`services/apiFeira.js` apenas quando há sessão autenticada.

## 8. Funcionalidades do projeto

### 8.1 Hotsite público (`/`)
- **Header** com navegação por âncoras (Início, Sobre, Programação, Local, Cursos,
  Inscrição, Contato), efeito de encolhimento ao rolar e menu mobile.
- **Hero** com data/horário do evento e chamadas para ação ("Quero participar", "Saiba mais").
- **Sobre** a feira e o Instituto, com link externo para o site institucional.
- **Livro Dourado**: seção convidando ex-alunos a contar sua história no evento.
- **Atrações**: grade de atividades por andar/setor, paginada, a partir de `data/atracoes.js`.
- **Cursos**: catálogo de cursos técnicos, livres e de qualificação, filtráveis por
  categoria (`data/cursos.js`).
- **Depoimentos**: carrossel de depoimentos de ex-alunos (`data/depoimentos.js`).
- **Formulário de inscrição** (`Formulario.jsx`): captura nome, e-mail, CPF (com máscara
  automática), telefone (com máscara), gênero, vínculo com o Instituto, participação como
  colaborador (quando aluno atual), curso de interesse e canal de divulgação. Ao confirmar,
  gera e mostra o QR Code do visitante (baixável como PNG) que deverá ser apresentado na
  entrada do evento.
- **Contador regressivo** até a data da feira (19/09/2026 10h).
- **Localização**: mapa incorporado do Google Maps e endereço/ponto de referência.
- **Footer**: contatos, endereço, data/horário e links rápidos.

### 8.2 Hub administrativo (`/admin`)
- Login por e-mail/senha com JWT (`AreaRestrita`, `papeisPermitidos={["admin",
  "credenciamento", "leitor"]}`) — qualquer administrador autenticado chega até aqui.
- Cartões de resumo (presenças registradas, usuário logado; visitantes inscritos só
  aparece para `admin`/`credenciamento` — `leitor` não tem permissão para listar
  visitantes, então o card nem tenta buscar esse número) e uma grade de cartões-link
  (`admin/Hub.jsx`) para `/admin/dashboard`, `/admin/credenciamento` e `/admin/leitor`,
  filtrada pelo papel: cada papel não-admin vê só o cartão da própria função (a API
  também barra no servidor, isso é só a UI já refletindo).

### 8.3 Dashboard (`/admin/dashboard`)
Restrito ao papel `admin` (`papeisPermitidos={["admin"]}`). Renderiza
`components/Dashboard/Dashboard.jsx`:
- Filtros por vínculo com o Instituto, gênero e participação como colaborador.
- KPIs: inscritos, presenças, taxa de comparecimento, setores por visitante, colaboradores.
- Gráfico de barras de presença por setor/atração, com opção de segmentar por gênero.
- Tabela detalhada por setor (total, homens, mulheres, outros, alunos atuais, ex-alunos, % do público).
- Gráficos de rosca (SVG puro) do perfil dos inscritos por gênero e vínculo.
- Ranking dos cursos mais procurados e dos canais de divulgação mais eficazes.

### 8.4 Credenciamento (`/admin/credenciamento`)
Papéis `admin` ou `credenciamento`. Lista **todos** os visitantes com busca (nome,
e-mail, CPF, telefone, curso, código QR) na tela principal — sem abas, tudo em uma
página (`admin/Credenciamento.jsx`). O código do QR Code **não é gerado por este
sistema**: o cadastro sempre entra com `codigoQr`/`dataChegada` nulos — eles só são
preenchidos no check-in (ver `PATCH /visitantes/:id/checkin` em
`web/specs/api.architecture.md`).
- Botão **"+ Novo"** abre um modal largo com o mesmo `Formulario.jsx` do hotsite
  (`mostrarQrCode={false}`), para cadastrar visitantes que chegam sem inscrição prévia;
  a lista atualiza sozinha ao fechar (o cadastro já entrou no estado compartilhado do
  `VisitantesContext`).
- Por linha: **Checkin** (modal que pede o código do QR Code — originado fora do
  sistema — e vincula ao visitante, sem validar contra nada além do próprio banco),
  **QR Code** (só aparece se o visitante já tiver um código vinculado; modal com
  reimpressão/compartilhamento), **Editar** (modal largo com os campos editáveis) e
  **Excluir** (modal de confirmação, botão só visível para o papel `admin` — a API
  também rejeita para `credenciamento`).

### 8.5 Leitor de Presença (`/admin/leitor`)
Papéis `admin` ou `leitor` (mudou de `credenciamento` para `leitor` — cada papel
não-admin agora acessa só a própria função). Renderiza `components/LeitorQr/LeitorQr.jsx`:
scanner de câmera (ou upload de imagem) que decodifica o QR Code **sem depender de
serviço externo** (implementação própria em `src/lib/qrcode`), associa a leitura a um
setor/turma selecionado, registra a presença via API e mostra o histórico das últimas
leituras com status (registrada / repetida / não encontrada). Permite imprimir ou
compartilhar a credencial da última leitura.

### 8.6 Recursos transversais
- **QR Code**: geração (`qrcode`/`qrcode.react`) e leitura própria (binarização, detecção de
  padrões de posicionamento, correção de erro Reed-Solomon, decodificação de dados —
  `src/lib/qrcode/*`), com testes unitários em `__tests__/decodificador.test.js`.
- **Impressão e compartilhamento** (`utils/impressao.js`): abre janela de impressão com CSS
  próprio para crachás em A4, e usa a Web Share API (com fallback para copiar para a área de
  transferência) para compartilhar credenciais.
- **Resiliência offline**: inscrições feitas com o banco indisponível continuam sendo salvas
  no `localStorage` do dispositivo, com aviso explícito à equipe para sincronizar depois.
- **Tratamento de erros de SSR**: `error-capture.ts`, `error-page.ts` e o middleware de erro
  em `start.ts`/`server.ts` garantem uma página de erro amigável mesmo quando o SSR falha,
  incluindo o caso em que o h3 (motor HTTP do Nitro) "engole" exceções e as transforma em
  JSON genérico — o servidor detecta esse padrão e força uma página de erro real.

## 9. Deploy e ambiente

- Local: `npm run dev` (Vite dev server, porta padrão 8080), lendo `.env` só para
  `VITE_API_URL` — a API (`../api`) precisa estar rodando à parte.
- Produção: `npm run build` gera `.output/`; `npm run start` roda `node .output/server/index.mjs`.
  `VITE_API_URL` precisa estar definida **em tempo de build** (é embutida no bundle do
  cliente pelo Vite), apontando para a URL pública da API já publicada.
- O projeto está preparado (`wrangler.toml.example`) para publicação como Cloudflare
  Worker — sem nenhum binding de banco: `web` não guarda nenhum segredo (credencial de
  administrador, segredo JWT, credencial de banco), tudo isso vive só em `../api`.
- Este projeto está conectado ao Lovable (ver `AGENTS.md`): commits na branch conectada
  sincronizam com o editor Lovable — evitar reescrever histórico já publicado (force-push,
  rebase/amend/squash de commits enviados).

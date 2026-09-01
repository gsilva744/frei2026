# Arquitetura Web — Feira Frei 2026

> Hotsite institucional + sistema de credenciamento da **6ª Feira das Profissões 2026**,
> do Instituto Social Nossa Senhora de Fátima. Evento presencial em 19/09/2026, 10h–16h.

## 1. Visão geral

O projeto é uma aplicação full-stack única que cobre três públicos diferentes:

1. **Público geral** — visita o hotsite (`/`), conhece a feira e se inscreve.
2. **Administração** — acessa `/admin` (autenticado) para ver o dashboard analítico
   de inscritos e presenças.
3. **Equipe de credenciamento** — acessa `/credenciamento` (autenticado) para cadastrar
   visitantes no local, ler QR Codes de presença e imprimir crachás no dia do evento.

Toda a interface (site + telas restritas) é renderizada pelo mesmo app React com
**SSR** via TanStack Start, e toda a persistência passa por uma **única API HTTP interna**
(`/api/feira/*`) implementada no próprio worker do servidor.

## 2. Stack tecnológica

| Camada | Tecnologia |
| --- | --- |
| Framework | React 19 + TanStack Start (SSR) + TanStack Router (roteamento por arquivo) |
| Build/dev server | Vite 8, com `@lovable.dev/vite-tanstack-config` |
| Estilo | Tailwind CSS 4 + CSS modules por componente (`*.css`) + Radix UI / shadcn (`src/components/ui`) |
| Estado de dados no cliente | TanStack Query (QueryClient no root) + Context API própria (`VisitantesContext`) |
| Formulários | React Hook Form + Zod (disponíveis via shadcn `form.tsx`) |
| Banco de dados | MySQL (via `mysql2/promise`), acessado com um adaptador que imita a API do Cloudflare D1 |
| Runtime de produção | Node (`node .output/server/index.mjs`) — projeto preparado para publicação como Cloudflare Worker (`wrangler.toml.example`), embora o banco atual seja MySQL, não D1 |
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
├── data/           Conteúdo estático (cursos, atrações, depoimentos, setores, parceiros)
├── hooks/          Hooks utilitários (use-mobile)
├── lib/            Utilitários de baixo nível: captura de erro, página de erro, decodificador de QR Code, utils gerais
├── pages/          Componentes de página (Home, Admin, Credenciamento)
├── routes/         Definições de rota do TanStack Router (file-based)
├── server/         Código exclusivo de servidor: API da feira e adaptador MySQL
├── services/       Camada de comunicação do cliente com a API (`apiFeira.js`)
├── utils/          Contexto de visitantes, geração de código, impressão/compartilhamento
├── router.tsx      Fábrica do router (React Router + QueryClient)
├── server.ts       Entrada do worker: autenticação Basic das rotas restritas + roteamento da API + SSR
└── start.ts        Middlewares globais do TanStack Start (tratamento de erro + CSRF)
```

## 4. Rotas

| Rota | Página | Proteção | Descrição |
| --- | --- | --- | --- |
| `/` | `Home.jsx` | Pública | Hotsite: hero, sobre, livro dourado, atrações, cursos, depoimentos, formulário de inscrição, localização, footer |
| `/admin` | `Admin.jsx` | Basic Auth | Dashboard analítico de inscritos/presenças |
| `/credenciamento` | `Credenciamento.jsx` | Basic Auth | Painel operacional do dia do evento (cadastro local, leitor de QR, impressão) |

A tela de login (`AreaRestrita`/`Acesso.jsx`) é a mesma para `/admin` e `/credenciamento`, mudando
apenas título/descrição. A validação da senha acontece contra o servidor (ver seção 6).

## 5. Fluxo de dados no cliente

```text
Componentes de UI
   │  useVisitantes()
   ▼
VisitantesContext (src/utils/VisitantesContext.jsx)
   │  chama funções de
   ▼
src/services/apiFeira.js  ──fetch──▶  /api/feira/*  (src/server/apiFeira.ts)
                                            │
                                            ▼
                                   src/server/mysql.ts ──▶ MySQL
```

- `VisitantesContext` é o único ponto de estado compartilhado de visitantes/presenças.
  Ele hidrata a lista a partir do `localStorage` (contingência) e, em paralelo, tenta
  carregar os dados reais do banco (`GET /api/feira/dados`) sempre que a autorização
  restrita muda (evento `feira2026-autorizacao`).
- Toda mutação (criar visitante, editar, excluir, registrar presença) primeiro tenta a
  API; se falhar, o cadastro de visitante cai para o dispositivo local e a UI avisa que
  a inscrição "ficou salva somente neste dispositivo".
- `src/services/apiFeira.js` é a única camada que conhece a URL da API e o cabeçalho de
  autorização; nenhum componente monta requisições HTTP diretamente.

## 6. Autenticação e autorização

- **Nível de rota (`/admin`, `/credenciamento`)**: `src/server.ts` intercepta a requisição
  antes do SSR. Quando o cliente envia o cabeçalho `X-Restricted-Area-Check: 1` (disparado
  pelo formulário de login em `Acesso.jsx`), o servidor valida `Authorization: Basic` contra
  `RESTRICTED_AREA_USERNAME`/`RESTRICTED_AREA_PASSWORD` usando comparação de tempo constante
  (`constantTimeEqual`). A página em si (SSR) é sempre servida sem bloqueio — só a checagem
  de login é protegida — para não travar a exibição do próprio formulário.
- Credenciais válidas ficam guardadas em `sessionStorage` no navegador (`feira2026-autorizacao`,
  codificadas em Base64) e reenviadas em toda chamada à API que exige autorização.
- **Nível de API (`/api/feira/*`)**: cada rota decide individualmente se exige autorização
  (`autorizado`, calculado a partir do mesmo cabeçalho Basic). `POST /visitantes` (inscrição
  pública) é a única rota que não exige login; leitura completa, edição, exclusão de
  visitantes e registro de presença exigem a credencial da equipe.
- Não existe múltiplos usuários/perfis — é uma única credencial compartilhada pela equipe
  organizadora, configurada via variáveis de ambiente/segredos, nunca no código-fonte.

## 7. API interna (`/api/feira`)

Implementada em `src/server/apiFeira.ts`, chamada antes do roteamento SSR (`server.ts`).

| Método | Rota | Auth | Função |
| --- | --- | --- | --- |
| GET | `/api/feira/dados` | Sim | Lista todos os visitantes e presenças (usada pelo dashboard e pelas telas restritas) |
| POST | `/api/feira/visitantes` | Não | Cria um novo visitante (inscrição pública ou credenciamento no local) |
| PATCH | `/api/feira/visitantes/:id` | Sim | Atualiza campos editáveis de um visitante |
| DELETE | `/api/feira/visitantes/:id` | Sim | Remove um visitante (cascata remove presenças relacionadas) |
| POST | `/api/feira/presencas` | Sim | Registra a presença de um visitante em um setor a partir do código QR lido |

Validações no servidor: nome (3–100 caracteres), e-mail (regex), CPF (dígito verificador
completo), telefone (10–11 dígitos), código QR (5–120 caracteres). O servidor sempre gera
`id` e, quando necessário, `codigoQr` — nunca confia nesses valores vindos do cliente.
Erros de banco (`ER_DUP_ENTRY`, `ER_NO_SUCH_TABLE`, etc.) são traduzidos para mensagens
amigáveis em português.

## 8. Banco de dados

Duas tabelas (`database/001_feira2026.sql`, escrito originalmente para Cloudflare D1/SQLite,
mas hoje a implementação ativa (`src/server/mysql.ts`) conecta em **MySQL** via `mysql2`):

- **`visitantes`** — uma linha por inscrição: dados de contato (nome, email, cpf, telefone),
  respostas do formulário (vínculo com o Instituto, como soube da feira, gênero, curso de
  interesse), `codigo_qr` único, o SVG do QR Code (para reimpressão sem regerar) e timestamps.
  CPF e código QR são únicos.
- **`presencas`** — uma linha por leitura de QR Code em um setor/atração, com chave
  estrangeira para `visitantes` (`ON DELETE CASCADE`) e restrição única
  `(visitante_id, setor)` para impedir presença duplicada na mesma atração.

Configuração via `DATABASE_URL` ou variáveis `MYSQL_HOST`/`MYSQL_PORT`/`MYSQL_DATABASE`/
`MYSQL_USER`/`MYSQL_PASSWORD`/`MYSQL_SSL` (nunca com prefixo `VITE_`, pois são lidas somente
no servidor). O adaptador (`getMySqlDatabase`) expõe uma API `prepare().bind().run()/all()/first()`
equivalente à do Cloudflare D1, permitindo trocar o backend de banco sem reescrever
`apiFeira.ts`.

## 9. Funcionalidades do projeto

### 9.1 Hotsite público (`/`)
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

### 9.2 Painel Administrativo (`/admin`)
- Login por Basic Auth (mesmo componente `AreaRestrita` usado no credenciamento).
- Cartões de resumo: total de inscritos, presenças registradas e cursos procurados.
- **Dashboard analítico** (`Dashboard.jsx`) com:
  - Filtros por vínculo com o Instituto, gênero e participação como colaborador.
  - KPIs: inscritos, presenças, taxa de comparecimento, setores por visitante, colaboradores.
  - Gráfico de barras de presença por setor/atração, com opção de segmentar por gênero.
  - Tabela detalhada por setor (total, homens, mulheres, outros, alunos atuais, ex-alunos, % do público).
  - Gráficos de rosca (SVG puro) do perfil dos inscritos por gênero e vínculo.
  - Ranking dos cursos mais procurados e dos canais de divulgação mais eficazes.

### 9.3 Painel de Credenciamento (`/credenciamento`)
Área operacional usada pela equipe no dia do evento, organizada em abas:
- **Visitantes**: lista completa com busca (nome, e-mail, CPF, telefone, curso, código QR),
  exibição/reimpressão do QR Code, edição de cadastro e exclusão (com confirmação em modal).
- **Credenciamento**: mesmo formulário de inscrição do hotsite, usado para cadastrar
  visitantes que chegam sem inscrição prévia.
- **Leitor QR** (`LeitorQr.jsx`): scanner de câmera (ou upload de imagem) que decodifica o
  QR Code **sem depender de serviço externo** (implementação própria em `src/lib/qrcode`),
  associa a leitura a um setor/turma selecionado, registra a presença via API e mostra o
  histórico das últimas leituras com status (registrada / repetida / não encontrada).
  Permite imprimir ou compartilhar a credencial da última leitura.
- **Impressão** (`Crachas.jsx`): seleção de até 10 visitantes por vez para impressão de
  crachás em folha A4 (grade 2 colunas), via janela de impressão do navegador.

### 9.4 Recursos transversais
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

## 10. Deploy e ambiente

- Local: `npm run dev` (Vite dev server, porta padrão 8080), lendo `.env` para credenciais
  de área restrita e conexão MySQL.
- Produção: `npm run build` gera `.output/`; `npm run start` roda `node .output/server/index.mjs`.
- O projeto está preparado (`wrangler.toml.example`) para publicação como Cloudflare Worker,
  cenário em que os segredos (`RESTRICTED_AREA_USERNAME/PASSWORD`) seriam cadastrados nas
  variáveis do Cloudflare — mas o binding de banco `DB` (D1) descrito no README/SQL não é
  mais o caminho ativo: a API atual (`apiFeira.ts`/`mysql.ts`) conecta em MySQL, então um
  deploy real precisa expor as variáveis `DATABASE_URL`/`MYSQL_*` ao runtime escolhido.
- Este projeto está conectado ao Lovable (ver `AGENTS.md`): commits na branch conectada
  sincronizam com o editor Lovable — evitar reescrever histórico já publicado (force-push,
  rebase/amend/squash de commits enviados).

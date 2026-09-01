# API — Feira Frei 2026

API HTTP em **Node.js + Express (ESM)**, camadas **controller → service → repository**,
sobre **MySQL**. Implementa `web/specs/api.architecture.md`. Consumida pelo hotsite
(inscrição pública) e pelas áreas restritas `/admin` e `/credenciamento` do projeto `web`
(rotas autenticadas via JWT).

## Requisitos

- Node.js 20+
- MySQL 8

## Configuração

```bash
cd api
npm install
cp .env.example .env
# edite .env: DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ALLOWED_ORIGINS
```

Aplique as migrations (cria `administradores`, `refresh_tokens`, `setores` — já com o
seed dos 5 setores — `visitantes` e `presencas`):

```bash
npm run migrate
```

Crie o primeiro administrador (papel `admin`), usando `ADMIN_SEED_*` do `.env`:

```bash
npm run seed
```

Suba a API:

```bash
npm run dev     # desenvolvimento, com reload automático
npm start       # produção
```

A API sobe em `http://localhost:5050` (ou na porta definida em `PORT`).
`GET /health` responde `{"status":"ok"}` para checagem de disponibilidade.

## Estrutura

```text
src/
├── app.js            Monta o Express app (middlewares + rotas), sem dar listen
├── server.js         Ponto de entrada: valida conexão com o MySQL e sobe o servidor
├── config/           Variáveis de ambiente (validadas com zod) e pool MySQL
├── routes/           Definição das rotas Express, encadeando os middlewares
├── controllers/      Traduzem HTTP <-> service; nenhuma regra de negócio
├── services/         Regras de negócio; únicos que chamam repositories
├── repositories/      Única camada que escreve SQL (mysql2, sempre com bind params)
├── middlewares/       authenticate (JWT), authorize (papel), rate limiters, validate (zod),
│                      errorHandler, requestLogger
├── schemas/           Schemas zod reaproveitados por validate() e pelos services
├── errors/            AppError e fábricas de erro (401/403/404/409/400)
└── utils/             asyncHandler, validação de CPF, geração de QR Code, mappers

db/
├── migrations/        SQL numerado, aplicado por db/migrate.js (idempotente)
└── seeds/seed.js       Cria o primeiro administrador a partir do .env
```

Ver `web/specs/api.architecture.md` para o detalhamento completo (modelagem do banco,
tabela de endpoints, estratégia de rate limit e de rotação de refresh token).

## Autenticação

1. `POST /api/auth/login` com `{ email, senha }` devolve `{ dados: { accessToken,
   refreshToken, administrador } }`.
2. Envie `Authorization: Bearer <accessToken>` nas rotas protegidas.
3. Quando o access token expirar (15 min por padrão), chame
   `POST /api/auth/refresh` com `{ refreshToken }` para obter um novo par — o
   refresh token antigo é revogado automaticamente (rotação).
4. `POST /api/auth/logout` (autenticado) revoga o refresh token atual.

Papéis: `admin` (acesso total, incluindo `/dashboard/*`) e `credenciamento` (cadastro,
listagem/edição de visitantes, registro de presença — sem dashboard nem exclusão).

## Testes

```bash
npm test
```

Roda com `node --test` (sem dependência extra). Cobre a validação de CPF; expanda em
`test/` conforme novas regras de negócio forem adicionadas.

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | `node --watch src/server.js` |
| `npm start` | `node src/server.js` |
| `npm run migrate` | Aplica migrations pendentes de `db/migrations` |
| `npm run seed` | Cria o primeiro administrador a partir do `.env` |
| `npm test` | Testes (`node --test`) |
| `npm run lint` / `npm run format` | ESLint / Prettier |

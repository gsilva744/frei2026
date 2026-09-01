# Deploy — Docker Compose

Sobe os três serviços da Feira Frei 2026: `mysql`, `api` (Node.js + Express) e `web`
(TanStack Start, buildado como servidor Node autônomo — preset `node-server`, diferente
do build para Cloudflare Worker usado em `web/wrangler.toml.example`).

## Configuração

Copie os arquivos de exemplo e preencha os segredos:

```bash
cp .env.example .env
cp environment/mysql/.env.example environment/mysql/.env
cp environment/api/.env.example environment/api/.env
cp environment/web/.env.example environment/web/.env
```

Ajuste principalmente:

- `environment/mysql/.env`: `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD`.
- `environment/api/.env`: `DATABASE_URL` (senha deve bater com a do MySQL acima),
  `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` (gere com `openssl rand -hex 32`),
  `ALLOWED_ORIGINS` (URL pública do `web`), `ADMIN_SEED_*`.
- `.env` (raiz de `deploy/`): `VITE_API_URL` — a URL pela qual o **navegador** vai
  acessar a API (não o nome do serviço Docker `api`). Precisa estar correta *antes* do
  build, pois é embutida no bundle do cliente.

## Subir os serviços

```bash
docker compose up -d --build
```

A `api` só sobe depois que o `mysql` responde ao healthcheck, aplica as migrations
automaticamente ao iniciar (`db/migrate.js`, idempotente) e fica em `localhost:5050`.
O `web` fica em `localhost:3000`.

> A porta da API foi escolhida como `5050` (em vez do `5000` mais comum) porque no
> macOS a `5000` costuma estar ocupada pelo AirPlay Receiver do Control Center.

Crie o primeiro administrador (necessário para logar em `/admin` e `/credenciamento`):

```bash
docker compose exec api npm run seed
```

## Comandos úteis

| Comando | Descrição |
| --- | --- |
| `docker compose logs -f api` | Acompanha os logs da API |
| `docker compose exec api npm run seed` | Cria/verifica o administrador inicial |
| `docker compose down` | Para os serviços (mantém o volume `mysql-data`) |
| `docker compose down -v` | Para os serviços e **apaga os dados do MySQL** |

## Segurança

- `environment/*/.env` e `.env` (raiz) são ignorados pelo git (`deploy/.gitignore`) —
  nunca commitar segredo real, só os `.env.example`.
- `ALLOWED_ORIGINS` na API deve listar exatamente as origens que servem o `web`; um
  valor amplo demais (ou `*`) reabre a superfície que o CORS existe para fechar.
- Troque `MYSQL_ROOT_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` e
  `ADMIN_SEED_SENHA` antes de qualquer deploy real — os valores de exemplo são só para
  desenvolvimento local.

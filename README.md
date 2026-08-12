# Feira Frei 2026

Hotsite da Feira Frei 2026, desenvolvido com React, TanStack Start e Vite.

## Requisitos

- Node.js 20 ou superior
- npm

## Executar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo de variáveis locais:

   ```bash
   cp .env.example .env
   ```

3. Preencha o `.env`:

   ```env
   RESTRICTED_AREA_USERNAME=seu-usuario
   RESTRICTED_AREA_PASSWORD=sua-senha
   ```

4. Inicie o projeto:

   ```bash
   npm run dev
   ```

O site estará disponível no endereço informado pelo Vite, normalmente
`http://localhost:8080`.

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o ambiente de desenvolvimento. |
| `npm run build` | Gera a versão de produção. |
| `npm run preview` | Visualiza o build de produção. |
| `npm run lint` | Verifica problemas de lint. |

## Área restrita

As rotas `/admin` e `/credenciamento` são protegidas por autenticação básica no
servidor. As credenciais nunca devem ser colocadas no código ou enviadas ao Git.

O arquivo `.env` serve apenas para desenvolvimento local e já está ignorado pelo
Git. Use `.env.example` como modelo.

### Deploy no Cloudflare

Cadastre os valores abaixo nas variáveis/secrets do projeto no Cloudflare:

```text
RESTRICTED_AREA_USERNAME
RESTRICTED_AREA_PASSWORD
```

No deploy, o Cloudflare entrega esses valores diretamente ao worker. O arquivo
`.env` local não é publicado e não configura credenciais em produção.

## Estrutura principal

```text
src/
├── components/   Componentes visuais do site
├── pages/        Páginas principais
├── routes/       Rotas da aplicação
├── data/         Conteúdo estático
├── utils/        Funções auxiliares
└── server.ts     Entrada do servidor e proteção das rotas restritas
```
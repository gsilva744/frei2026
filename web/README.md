# Feira Frei 2026

Hotsite da Feira Frei 2026, desenvolvido com React, TanStack Start e Vite.

Este projeto **não acessa banco de dados diretamente**: toda a inscrição, credenciamento,
leitura de presença e dashboard falam com a API separada em [`../api`](../api) (Node.js +
Express + MySQL, autenticação por JWT). Veja `web/specs/api.architecture.md` para o
detalhamento da API.

## Requisitos

- Node.js 20 ou superior
- npm
- A API (`../api`) rodando e acessível — veja `../api/README.md`

## Executar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo de variáveis locais:

   ```bash
   cp .env.example .env
   ```

3. Preencha o `.env` com a URL da API:

   ```env
   VITE_API_URL=http://localhost:5050
   ```

4. Suba a API (em outro terminal, veja `../api/README.md`) e depois inicie o site:

   ```bash
   npm run dev
   ```

O site estará disponível no endereço informado pelo Vite, normalmente
`http://localhost:8080`.

## Comandos

| Comando           | Descrição                             |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Inicia o ambiente de desenvolvimento. |
| `npm run build`   | Gera a versão de produção.            |
| `npm run preview` | Visualiza o build de produção.        |
| `npm run lint`    | Verifica problemas de lint.           |

## Área restrita

As rotas `/admin` e `/credenciamento` exigem login (e-mail + senha) contra a API,
autenticado por JWT. A sessão (access token + refresh token, renovados automaticamente
pelo front-end) fica no **localStorage** do navegador, o que permite continuar logado
entre recarregamentos da página — ao contrário do antigo Basic Auth por
`sessionStorage`, que exigia login a cada visita.

Existem dois papéis de administrador, cadastrados na API (`npm run seed` em `../api`):

- **`admin`**: acessa o painel `/admin` (dashboard analítico) e tudo que
  `credenciamento` acessa, incluindo excluir visitantes.
- **`credenciamento`**: acessa `/credenciamento` (cadastro no local, leitor de QR,
  impressão de crachás, edição de visitantes) — sem acesso ao dashboard nem à exclusão
  de visitantes.

Nenhuma credencial (senha de administrador, segredo JWT, credencial de banco) vive
neste projeto — tudo fica na API, configurada por `../api/.env`.

## Inscrição pública e resiliência offline

A inscrição (`POST /visitantes` na API) é a única rota pública de escrita. O servidor
sempre gera o `id` e o código QR — o navegador nunca envia esses valores.

Enquanto a API estiver indisponível, uma inscrição feita no site é mantida no navegador
(`localStorage`) como contingência e a tela avisa isso. Para uso real durante o evento,
só considere a inscrição concluída após a API confirmar o cadastro. Esse cache local de
visitantes/presenças é apagado automaticamente ao fazer logout da área restrita, para
não manter dados de visitantes acessíveis no dispositivo além do necessário.

## Estrutura principal

```text
src/
├── components/   Componentes visuais do site
├── pages/        Páginas principais
├── routes/       Rotas da aplicação
├── data/         Conteúdo estático (cursos, atrações, depoimentos, gêneros/vínculos)
├── utils/        Funções auxiliares e o VisitantesContext (estado compartilhado)
├── services/     Comunicação da interface com a API (login, visitantes, presenças, dashboard)
└── server.ts     Entrada do servidor SSR (sem lógica de autenticação/banco)
```

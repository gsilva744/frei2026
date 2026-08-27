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

| Comando           | Descrição                             |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Inicia o ambiente de desenvolvimento. |
| `npm run build`   | Gera a versão de produção.            |
| `npm run preview` | Visualiza o build de produção.        |
| `npm run lint`    | Verifica problemas de lint.           |

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

## Banco de dados: inscrições e presenças

O projeto está preparado para o **Cloudflare D1** (SQLite). A estrutura foi
escolhida porque o app já é publicado como um Worker Cloudflare e, assim, a
API e o banco ficam no mesmo ambiente.

1. Crie um banco D1 chamado, por exemplo, `feira-frei-2026`.
2. Execute o arquivo [database/001_feira2026.sql](database/001_feira2026.sql)
   no console SQL desse banco. Ele cria as tabelas e índices.
3. Copie `wrangler.toml.example` para `wrangler.toml`, preencha o `database_id`
   com o ID exibido pelo Cloudflare e publique a aplicação. O nome do binding
   deve continuar sendo exatamente `DB`.
4. Cadastre também `RESTRICTED_AREA_USERNAME` e
   `RESTRICTED_AREA_PASSWORD` nos secrets do Cloudflare.

Enquanto o binding `DB` ainda não existir, uma inscrição feita no site é
mantida no navegador como contingência e a tela avisa isso. Para uso real em
vários computadores, só considere a inscrição concluída após configurar o D1.

### Tabelas e campos

| Tabela       | Campo                                                | Conteúdo                                                           |
| ------------ | ---------------------------------------------------- | ------------------------------------------------------------------ |
| `visitantes` | `id`                                                 | Identificador técnico do visitante.                                |
|              | `nome`, `email`, `cpf`, `telefone`                   | Dados de contato enviados pelo formulário.                         |
|              | `vinculo`, `como_soube`, `genero`, `curso_interesse` | Respostas do formulário.                                           |
|              | `codigo_qr`                                          | Texto único gravado no QR Code.                                    |
|              | `qr_code_svg`                                        | Imagem SVG do QR Code, enviada junto do cadastro para reimpressão. |
|              | `criado_em`, `atualizado_em`                         | Datas em ISO 8601.                                                 |
| `presencas`  | `id`, `visitante_id`, `codigo_qr`                    | Identificação/auditoria da leitura.                                |
|              | `setor`                                              | Setor da atração onde houve leitura.                               |
|              | `registrado_em`                                      | Data e hora da entrada, gerada pelo servidor.                      |

`presencas` não permite duas entradas do mesmo visitante no mesmo setor. Ao
remover um visitante manualmente, suas presenças também são removidas pela
relação de banco.

### Onde a conexão é mantida

- `src/services/apiFeira.js`: única camada usada pela interface; os comentários
  mostram o que cada requisição envia.
- `src/server/apiFeira.ts`: validação, autorização e SQL da API.
- `database/001_feira2026.sql`: estrutura que pode ser revisada e executada
  manualmente.

A inscrição pública só pode criar um visitante. Leitura de todos os cadastros,
edição, exclusão e presença exigem a credencial da área restrita.

## Estrutura principal

```text
src/
├── components/   Componentes visuais do site
├── pages/        Páginas principais
├── routes/       Rotas da aplicação
├── data/         Conteúdo estático
├── utils/        Funções auxiliares
├── services/     Comunicação da interface com a API do banco
└── server.ts     Entrada do servidor e proteção das rotas restritas
```

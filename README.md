# Lovable Event Hub

Prompt para o Lovable

Desenvolva um hotsite completo seguindo EXATAMENTE o layout do protótipo do Figma em anexo. O design deve ser o mais fiel possível ao protótipo, mantendo as mesmas cores, tipografia, espaçamentos, tamanhos, alinhamentos e identidade visual.

Regras Obrigatórias

Utilizar apenas:

 React

 JavaScript (ES6+)

 HTML

 CSS puro

NÃO utilizar:

 TypeScript

 Tailwind CSS

 Next.js

 Bootstrap

 Material UI

 Chakra UI

 Styled Components

 Sass/SCSS

 Banco de Dados

 Firebase

 Supabase

 APIs externas

 Backend

 Node para persistência de dados

Quero um projeto simples, organizado e fácil de entender, pois será utilizado para estudos.

O código deve possuir:

 Componentes bem separados.

 Pastas organizadas.

 Variáveis com nomes claros.

 Funções simples.

 Comentários apenas quando realmente necessários.

 CSS separado dos componentes.

 Fácil manutenção.

 Fácil leitura.

 Evitar códigos complexos.

Layout

O site deve ser praticamente idêntico ao protótipo do Figma.

A responsividade deve funcionar em:

 Desktop

 Tablet

 Celular

Sem alterar a identidade visual.

Header

Criar um header flutuante (sticky) igual ao protótipo.

Menu:

 Início

 Programação

 Local

 Cursos

 Contato

Botão:

Área Restrita

Ao rolar a página o header pode diminuir levemente.

Hero

Reproduzir exatamente como está no protótipo.

Botões:

 Quero Participar

 Saiba Mais

Sobre a Feira

Manter o mesmo posicionamento de textos e imagens.

Local de Atrações

Existirão dois cards.

Card Andares

Botões:

 Pátio

 1º Andar

 2º Andar

 3º Andar

Ao clicar em um botão, atualizar o segundo card.

Card Atrações

Mostrar:

 horário

 nome da atração

Cada andar terá sua própria programação.

A troca das informações deve ocorrer sem recarregar a página.

Localização

Manter igual ao protótipo.

Descubra nossos Cursos

Existirão três categorias:

 Técnicos

 Livres

 Qualificações

Ao clicar em uma categoria, exibir apenas os cursos daquela categoria.

Cada curso terá:

 imagem

 nome

 pequena descrição

A troca deve acontecer dinamicamente usando apenas React.

Formulário de Inscrição

Criar exatamente igual ao layout.

Campos:

 Nome

 Telefone

 Email

 Escola

 Série

 Curso de Interesse

Botão:

Confirmar Inscrição

Como não haverá banco de dados, apenas simular o cadastro utilizando um array em memória (React State).

Após cadastrar:

 gerar automaticamente um QR Code único para aquele visitante;

 armazenar os dados apenas durante a execução da aplicação (sem persistência).

Contador

Criar um contador regressivo até a data da feira.

Atualizar automaticamente.

Depoimentos

Criar um carrossel.

Cada item terá:

 foto

 nome

 texto

Adicionar botões:

Anterior

Próximo

A troca deve acontecer com React.

Parceiros

Criar outro carrossel para as logos.

Mesmo funcionamento dos depoimentos.

Footer

Reproduzir igual ao protótipo.

Área Restrita

Ao clicar em Área Restrita abrir um modal.

Campos:

 Usuário

 Senha

Botão:

Entrar

Após entrar abrir uma página administrativa.

### Configuração do acesso restrito

As páginas `/admin` e `/credenciamento` exigem autenticação no servidor e voltam
a solicitar o login a cada novo acesso. Antes de publicar, configure estas duas
variáveis de ambiente no provedor de hospedagem (não as coloque no código):

```bash
RESTRICTED_AREA_USERNAME=um-usuario-forte
RESTRICTED_AREA_PASSWORD=uma-senha-longa-e-unica
```

Para desenvolvimento local, copie `.env.example` para `.env` e preencha os
valores. O `.env` é ignorado pelo Git. No deploy em Cloudflare, cadastre as
mesmas chaves como secrets/variáveis de ambiente no projeto; o arquivo `.env`
local não é enviado para o worker.

Sem as duas variáveis, as páginas permanecem bloqueadas por segurança.

Página Administrativa

Criar duas abas.

Visitantes

Mostrar todos os visitantes cadastrados em uma tabela.

Colunas:

 Nome

 Email

 Telefone

Ações:

 Visualizar

 Editar

 Excluir

 QR Code

Ao clicar em QR Code abrir um modal mostrando o QR Code daquele visitante.

Como não existe banco, tudo deve funcionar utilizando apenas o State do React.

Credenciamento

O formulário deve ser exatamente igual ao formulário da inscrição.

Ao cadastrar um novo visitante:

 adicionar ao array de visitantes;

 gerar QR Code automaticamente.

QR Code

Cada visitante deve possuir um QR Code diferente.

Utilizar apenas uma biblioteca JavaScript para gerar o QR Code.

Não utilizar serviços externos.

Estrutura do Projeto

Organizar o projeto da seguinte forma:

src/

components/
Header
Hero
Sobre
Atracoes
Cursos
Formulario
Depoimentos
Parceiros
Footer
Modal
QRCode

pages/
Home
Admin

assets/

css/

data/

utils/

App.js
index.js

As informações dos cursos, programação, parceiros e depoimentos devem ficar em arquivos JavaScript dentro da pasta data, simulando um banco de dados local.

Exemplo:

export const cursos = [
  {
    id: 1,
    categoria: "Tecnicos",
    nome: "Desenvolvimento de Sistemas"
  }
];

Animações

Utilizar apenas CSS.

Não utilizar bibliotecas de animação.

Aplicar apenas:

 hover

 transition

 transform

 opacity

Objetivo Final

Quero um projeto 100% em React com JavaScript, utilizando apenas HTML, CSS e JavaScript puro. O código deve ser simples, limpo, organizado e didático, facilitando a leitura e a manutenção. Todas as funcionalidades devem funcionar apenas no front-end, utilizando useState, props e componentes React, sem banco de dados, sem backend e sem qualquer framework ou biblioteca além do React e de uma biblioteca para geração de QR Code. O resultado deve ser o mais fiel possível ao protótipo do Figma, tanto visualmente quanto funcionalmente.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9ce59196-a918-4841-bf37-53e4437db20a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

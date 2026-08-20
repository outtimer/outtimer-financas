# OutTimer Finanças — Documentação do Projeto

> Documento vivo. Atualizado a cada decisão técnica tomada ao longo do desenvolvimento.
> Última atualização: 2026-08-13 — versões de todas as tecnologias revisadas para as mais atuais disponíveis nesta data.

---

## Sobre o projeto

O **OutTimer Finanças** é uma aplicação web de controle financeiro pessoal desenvolvida do zero, com o objetivo duplo de organizar a vida financeira pessoal e servir como ambiente de aprendizado de tecnologias modernas de desenvolvimento.

O sistema permite registrar manualmente despesas, receitas, gastos fixos, assinaturas, compras parceladas e compromissos financeiros recorrentes. O usuário tem controle total sobre cada lançamento — o que vence, o que foi pago e o que está pendente. A visão de relatórios e gráficos de evolução patrimonial complementa o controle.

O projeto é desenvolvido em fases:

- **Fase 1 (atual):** controle manual completo — lançamentos, parcelamentos, recorrências, orçamentos e metas
- **Fase 2:** automações, importação de extratos e integrações com serviços externos
- **Fase 3+:** conexão com Open Finance Brasil e gerenciamento bancário

---

## Índice

1. [Stack de tecnologias](#1-stack-de-tecnologias)
2. [Modelo de dados](#2-modelo-de-dados)
3. [Estrutura do projeto](#3-estrutura-do-projeto)
4. [Fluxos da aplicação](#4-fluxos-da-aplicação)
5. [DevOps e infraestrutura](#5-devops-e-infraestrutura)
6. [Decisões técnicas registradas](#6-decisões-técnicas-registradas)

---

## 1. Stack de tecnologias

### Visão geral

| Camada              | Tecnologia           | Versão em uso         | Fase  |
| ------------------- | -------------------- | --------------------- | ----- |
| Frontend            | React + TypeScript   | React 19.x / TS 5     | 1     |
| Build tool          | Vite                 | 8.x                   | 1     |
| Estilização         | TailwindCSS          | 4.x                   | 1     |
| Data fetching       | TanStack Query       | 5.x                   | 1     |
| Backend             | Node.js + TypeScript | Node 24 LTS           | 1     |
| Framework API       | Fastify              | 5.x                   | 1     |
| ORM                 | Prisma               | 7.x                   | 1     |
| Validação           | Zod                  | 4.x                   | 1     |
| Banco de dados      | PostgreSQL           | 16.x                  | 1     |
| Containerização     | Docker               | 29.x                  | 1     |
| CI/CD               | GitHub Actions       | —                     | 1     |
| Qualidade de código | ESLint + Prettier    | ESLint 9 / Prettier 3 | 1     |
| Testes              | Vitest               | 3.x                   | 1     |
| Git hooks           | Husky                | 9.x                   | 1     |
| Commits             | Conventional Commits | —                     | 1     |
| Cache               | Redis                | 7.x                   | **2** |

### Diagrama de arquitetura e integração entre ferramentas

O diagrama abaixo mostra como todas as ferramentas da stack se conectam — desde o que o usuário vê no navegador até onde os dados são persistidos, passando pelo pipeline de DevOps.

```mermaid
flowchart TB
    subgraph browser["Navegador (cliente)"]
        direction LR
        react["React 19\ncomponentes de UI"]
        vite["Vite 8\nbuild e dev server"]
        tailwind["TailwindCSS 4\nestilização"]
        tanstack["TanStack Query 5\ncache e fetching"]
    end

    subgraph backend["Backend (Node.js 24 LTS)"]
        direction LR
        fastify["Fastify 5\nrotas e API REST"]
        zod["Zod 4\nvalidação de dados"]
        prisma["Prisma ORM 7\nacesso ao banco"]
    end

    subgraph dados["Dados"]
        postgres[("PostgreSQL 16\ndados relacionais")]
    end

    subgraph devops["DevOps"]
        direction LR
        git["Git\nversionamento"]
        github["GitHub\nrepositório remoto"]
        actions["GitHub Actions\nCI/CD automático"]
        docker["Docker 25\ncontainerização"]
    end

    browser -->|"HTTP REST (JSON)"| backend
    fastify --> zod
    fastify --> prisma
    prisma -->|"queries tipadas"| postgres

    git -->|"push"| github
    github -->|"trigger"| actions
    actions -->|"build e deploy"| docker
    docker -->|"roda"| backend
    docker -->|"provisiona"| dados
```

> **Leitura do diagrama:** O usuário interage com o React no navegador. O React usa o TanStack Query para chamar a API. A API (Fastify) valida os dados com Zod antes de qualquer operação, depois usa o Prisma para ler/escrever no PostgreSQL. O fluxo de DevOps é paralelo: a cada push no GitHub, o Actions dispara o pipeline que constrói e sobe os contêineres Docker.
>
> **Redis** será adicionado à camada de dados na Fase 2, quando houver necessidade de cache e gerenciamento de sessões mais complexo.

---

### 1.1 Linguagens

---

#### TypeScript

TypeScript é um superset do JavaScript — ou seja, é JavaScript com tipagem estática opcional. Todo código JavaScript válido é também TypeScript válido. O compilador TypeScript transforma o código `.ts` em JavaScript puro antes de executar.

A principal vantagem para este projeto é a segurança: ao definir que um campo `amount` é do tipo `number`, o TypeScript impede que você acidentalmente passe uma `string` para ele, capturando erros antes mesmo de rodar o código.

**Usaremos TypeScript tanto no frontend quanto no backend**, o que significa aprender uma única linguagem e aplicá-la nos dois lados.

- Site oficial: https://www.typescriptlang.org
- Documentação: https://www.typescriptlang.org/docs
- Playground online: https://www.typescriptlang.org/play

> TypeScript não é instalado separadamente — ele vem como dependência dos projetos via npm. A instalação do Node.js (seção abaixo) já prepara o ambiente para usá-lo.

---

### 1.2 Runtime e gerenciador de pacotes

---

#### Node.js

Node.js é o ambiente que permite executar JavaScript (e TypeScript) fora do navegador — no servidor, na linha de comando, em scripts de automação. É a base do backend deste projeto.

Diferente do PHP, onde cada requisição abre e fecha um processo, o Node.js roda em um único processo contínuo e lida com múltiplas requisições ao mesmo tempo de forma assíncrona. Isso o torna muito eficiente para APIs.

**Versão recomendada:** 24 LTS (Long Term Support) — versões LTS recebem suporte e atualizações de segurança por anos, sem risco de ficar preso em versão antiga.

- Site oficial: https://nodejs.org
- Documentação: https://nodejs.org/docs/latest-v24.x/api

**Instalação no Windows:**

```
1. Acesse https://nodejs.org e baixe o instalador ".msi" da versão 24 LTS
2. Execute o instalador e siga os passos (Next > Next > Install)
3. Marque a opção "Automatically install the necessary tools" se aparecer
4. Após instalar, abra o Prompt de Comando ou PowerShell e verifique:
   node --version    → deve exibir v24.x.x
   npm --version     → deve exibir 11.x.x
```

**Instalação no Linux (Ubuntu/Debian):**

```bash
# Adiciona o repositório oficial do Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -

# Instala o Node.js
sudo apt-get install -y nodejs

# Verifica a instalação
node --version    # deve exibir v24.x.x
npm --version     # deve exibir 11.x.x
```

> **Dica:** Em ambos os sistemas, considere instalar o **nvm** (Node Version Manager) — ele permite ter múltiplas versões do Node.js e trocar entre elas com um comando. Útil quando diferentes projetos exigem versões diferentes.
>
> - nvm para Windows: https://github.com/coreybutler/nvm-windows
> - nvm para Linux/Mac: https://github.com/nvm-sh/nvm

---

#### npm

npm (Node Package Manager) é instalado automaticamente junto com o Node.js. É o gerenciador de pacotes — usado para instalar bibliotecas, frameworks e ferramentas como React, Fastify, Prisma, etc.

Todo projeto Node.js tem um arquivo `package.json` que lista suas dependências. O comando `npm install` lê esse arquivo e baixa tudo automaticamente.

- Documentação: https://docs.npmjs.com
- Registro de pacotes: https://www.npmjs.com

---

### 1.3 Frontend

---

#### React

React é a biblioteca JavaScript mais usada no mundo para construir interfaces de usuário. A ideia central é dividir a interface em componentes reutilizáveis — um botão, um formulário, um gráfico — cada um com sua própria lógica e aparência.

Diferente de manipular o HTML diretamente com `document.getElementById`, no React você descreve _como a interface deve parecer_ dado um certo estado, e ele cuida de atualizar o DOM automaticamente.

- Site oficial: https://react.dev
- Documentação: https://react.dev/learn

> React não é instalado separadamente. Um novo projeto React é criado via Vite (seção abaixo), que já configura tudo.

---

#### Vite

Vite é a ferramenta de build que cria e serve o projeto React durante o desenvolvimento. Ele é extremamente rápido — inicia o servidor de desenvolvimento em menos de 1 segundo e atualiza o navegador instantaneamente ao salvar um arquivo.

É o substituto moderno do antigo Create React App, que foi descontinuado pela comunidade.

- Site oficial: https://vitejs.dev
- Documentação: https://vitejs.dev/guide

> Vite é instalado automaticamente ao criar um novo projeto com o comando `npm create vite@latest`. Não requer instalação manual.

---

#### TailwindCSS

TailwindCSS é um framework de CSS utilitário. Em vez de escrever classes CSS personalizadas, você aplica classes pré-definidas diretamente no HTML/JSX, como `text-lg`, `font-bold`, `bg-blue-500`, `mt-4`. Isso acelera muito o desenvolvimento de interfaces e mantém o CSS consistente.

- Site oficial: https://tailwindcss.com
- Documentação: https://tailwindcss.com/docs

> TailwindCSS é instalado como dependência npm dentro do projeto. Não requer instalação global.

---

#### TanStack Query

Também conhecido como React Query, é a biblioteca responsável por buscar dados da API, armazená-los em cache, sincronizá-los automaticamente e gerenciar estados de carregamento e erro — tudo isso com poucas linhas de código.

Substitui o padrão manual de `useEffect + fetch + useState` que se tornaria complexo rapidamente num sistema financeiro com muitos dados.

- Site oficial: https://tanstack.com/query
- Documentação: https://tanstack.com/query/latest/docs/framework/react/overview

---

### 1.4 Backend

---

#### Fastify

Fastify é o framework Node.js usado para construir a API REST do projeto. Ele define as rotas (`GET /transactions`, `POST /transactions`, etc.), valida os dados recebidos e retorna as respostas.

É mais rápido e moderno que o Express (o framework mais antigo e popular do Node.js), com suporte nativo a TypeScript e validação de schema integrada.

- Site oficial: https://fastify.dev
- Documentação: https://fastify.dev/docs/latest

---

#### Prisma ORM

Prisma é a camada de acesso ao banco de dados. Em vez de escrever SQL manualmente, você define os modelos de dados em um arquivo `schema.prisma` (veja seção 2) e o Prisma gera um cliente TypeScript totalmente tipado.

A grande vantagem é o sistema de **migrations**: toda alteração no modelo de dados vira um arquivo de migração versionado, que o Prisma aplica automaticamente no banco. Isso garante que banco e código estejam sempre sincronizados.

> **Nota de versão — por que 7.x e não 5.x:** o plano original previa Prisma 5.x. Na prática, o Prisma 5.x (e parte da linha 6.x) tem um bug de compatibilidade real com Node.js 23+ (`isError is not a function` no CLI, sem correção disponível naquelas versões). O Prisma 7.x reescreveu o motor interno — antes em Rust, agora em TypeScript — o que eliminou essa incompatibilidade. Isso trouxe mudanças estruturais relevantes:
>
> - Existe um arquivo `prisma.config.ts`, separado do `schema.prisma`, responsável pela conexão com o banco (em vez de depender só de uma `DATABASE_URL` lida automaticamente)
> - O gerador do client mudou de `prisma-client-js` para `prisma-client`, e o client gerado passou a ficar dentro do próprio código-fonte do backend (`apps/api/src/generated/prisma`), tratado como parte do projeto — não mais escondido em `node_modules`. Esse diretório gerado **não é versionado** no Git.
> - Como o client agora vive dentro de `apps/api`, o schema e as migrations também ficam colocalizados ali (`apps/api/prisma/`), e não mais soltos na raiz do monorepo — ver seção [3. Estrutura do projeto](#3-estrutura-do-projeto) para a estrutura de pastas atualizada.

- Site oficial: https://www.prisma.io
- Documentação: https://www.prisma.io/docs

---

#### Zod

Zod é uma biblioteca de validação de schemas. Usamos para garantir que os dados que chegam na API (via corpo de requisição, parâmetros de URL, etc.) estejam no formato correto antes de processá-los.

Exemplo prático: se a API recebe um valor de transação, o Zod garante que é um número positivo, não uma string ou um número negativo.

- Site oficial: https://zod.dev
- Documentação: https://zod.dev

---

### 1.5 Banco de dados

---

#### PostgreSQL

PostgreSQL é o banco de dados relacional do projeto. É o sistema mais robusto e completo da categoria open source, amplamente usado em sistemas financeiros por sua confiabilidade, suporte a transações ACID e tipo `DECIMAL` com precisão exata (essencial para valores monetários — `FLOAT` causa erros de arredondamento).

**Versão recomendada:** 16.x

- Site oficial: https://www.postgresql.org
- Documentação: https://www.postgresql.org/docs/16

**Instalação no Windows:**

```
1. Acesse https://www.postgresql.org/download/windows
2. Clique em "Download the installer" (EnterpriseDB)
3. Baixe a versão 16.x para Windows x86-64
4. Execute o instalador:
   - Defina uma senha para o usuário "postgres" (guarde bem)
   - Porta padrão: 5432 (mantenha)
   - Locale: Portuguese, Brazil (ou deixe o padrão)
5. Após instalar, o serviço inicia automaticamente
6. Opcional: instale o pgAdmin (incluído no instalador) para visualizar o banco via interface gráfica
```

**Instalação no Linux (Ubuntu/Debian):**

```bash
# Adiciona o repositório oficial do PostgreSQL
sudo apt install -y postgresql-common
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh

# Instala o PostgreSQL 16
sudo apt-get install -y postgresql-16

# Inicia o serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql  # inicia automaticamente com o sistema

# Verifica a instalação
psql --version    # deve exibir psql (PostgreSQL) 16.x
```

> **Dica:** Em ambiente de desenvolvimento local, o PostgreSQL pode ser executado via Docker (seção 1.7), o que evita a instalação direta e facilita resetar o banco quando necessário.

---

#### Redis

Redis é um banco de dados em memória, usado como cache e para armazenar sessões de usuário. Por estar em memória, as leituras são praticamente instantâneas. No projeto, será introduzido na Fase 2 do desenvolvimento.

**Versão recomendada:** 7.x

- Site oficial: https://redis.io
- Documentação: https://redis.io/docs

**Instalação no Windows:**

```
O Redis não tem suporte oficial nativo no Windows. As opções recomendadas são:
  a) Usar via Docker (recomendado — seção 1.7)
  b) Instalar via WSL2 (Windows Subsystem for Linux) e seguir os passos do Linux abaixo
  c) Usar o Memurai (fork do Redis para Windows): https://www.memurai.com
```

**Instalação no Linux (Ubuntu/Debian):**

```bash
# Adiciona o repositório oficial do Redis
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update

# Instala o Redis
sudo apt-get install -y redis

# Inicia o serviço
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verifica a instalação
redis-cli ping    # deve retornar PONG
```

---

### 1.6 Qualidade de código

---

#### ESLint

ESLint analisa o código em busca de problemas: variáveis não utilizadas, padrões inseguros, inconsistências de estilo. Funciona como um "revisor automático" que aponta erros antes de você sequer rodar o código.

- Site oficial: https://eslint.org
- Documentação: https://eslint.org/docs/latest

> Instalado como dependência npm no projeto. Não requer instalação global.

---

#### Prettier

Prettier formata o código automaticamente: indentação, aspas simples ou duplas, ponto e vírgula, quebras de linha. Elimina qualquer discussão sobre estilo — o Prettier decide e aplica sozinho ao salvar o arquivo.

- Site oficial: https://prettier.io
- Documentação: https://prettier.io/docs/en

> Instalado como dependência npm no projeto. A integração com o editor (VS Code) é feita via extensão.

---

#### Husky + Conventional Commits

Husky é uma ferramenta que executa scripts automaticamente em eventos do Git — por exemplo, antes de cada commit, rodar o ESLint e o Prettier. Isso garante que nenhum código com erro entre no repositório.

Conventional Commits é uma convenção de nomenclatura para mensagens de commit:

- `feat: adiciona tela de lançamentos`
- `fix: corrige cálculo de parcelas pelo dia de fechamento`
- `docs: atualiza documentação do modelo de dados`

Essa padronização permite gerar changelogs automáticos e manter o histórico do projeto legível.

- Husky: https://typicode.github.io/husky
- Conventional Commits: https://www.conventionalcommits.org

---

#### Vitest

Vitest é o framework de testes do projeto, integrado ao Vite. Permite escrever testes unitários e de integração para garantir que as funções e rotas se comportem como esperado.

- Site oficial: https://vitest.dev
- Documentação: https://vitest.dev/guide

---

### 1.7 Infraestrutura

---

#### Docker

Docker permite empacotar uma aplicação e todas as suas dependências em um contêiner isolado, garantindo que o ambiente de desenvolvimento seja idêntico em qualquer máquina. Na Fase 1 do projeto, será usado principalmente para rodar o PostgreSQL localmente sem instalação direta. O Redis será adicionado ao Docker Compose na Fase 2.

**Versão recomendada:** Docker Desktop 25.x (inclui Docker Compose)

- Site oficial: https://www.docker.com
- Documentação: https://docs.docker.com

**Instalação no Windows:**

```
1. Acesse https://www.docker.com/products/docker-desktop
2. Baixe o "Docker Desktop for Windows"
3. Execute o instalador (requer WSL2 — o instalador orienta a instalação se necessário)
4. Após instalar, inicie o Docker Desktop pelo menu Iniciar
5. Verifique no terminal:
   docker --version           → deve exibir Docker version 25.x.x
   docker compose version     → deve exibir Docker Compose version v2.x.x
```

**Instalação no Linux (Ubuntu/Debian):**

```bash
# Remove versões antigas se existirem
sudo apt-get remove docker docker-engine docker.io containerd runc

# Adiciona o repositório oficial do Docker
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instala o Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Permite usar o Docker sem sudo (requer logout/login após)
sudo usermod -aG docker $USER

# Verifica a instalação
docker --version           # deve exibir Docker version 25.x.x
docker compose version     # deve exibir Docker Compose version v2.x.x
```

---

#### Git

Git é o sistema de controle de versão. Registra todo o histórico de alterações do projeto, permite voltar a qualquer versão anterior e é a base para trabalhar com GitHub.

**Versão recomendada:** 2.x (qualquer versão recente)

- Site oficial: https://git-scm.com
- Documentação: https://git-scm.com/doc

**Instalação no Windows:**

```
1. Acesse https://git-scm.com/download/win
2. Baixe e execute o instalador
3. Durante a instalação:
   - Editor padrão: escolha "Visual Studio Code" se já instalado
   - "Adjusting your PATH": selecione "Git from the command line and also from 3rd-party software"
   - Demais opções: mantenha os padrões sugeridos
4. Verifique no terminal:
   git --version    → deve exibir git version 2.x.x
```

**Instalação no Linux (Ubuntu/Debian):**

```bash
sudo apt-get update
sudo apt-get install -y git

# Verifica a instalação
git --version    # deve exibir git version 2.x.x

# Configuração inicial obrigatória (substitua pelos seus dados)
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

---

#### GitHub Actions

GitHub Actions é o serviço de CI/CD integrado ao GitHub. Permite automatizar tarefas como rodar testes, verificar qualidade de código e fazer deploy sempre que um commit é enviado ao repositório. A configuração é feita via arquivos `.yml` dentro do próprio repositório.

Não requer instalação — é acessado diretamente em https://github.com ao configurar o repositório do projeto.

- Documentação: https://docs.github.com/en/actions

---

### 1.8 Editor de código

#### Visual Studio Code

Editor de código recomendado para o projeto. Gratuito, com suporte excelente a TypeScript, extensões para todas as ferramentas da stack e integração nativa com Git.

- Download: https://code.visualstudio.com

**Extensões recomendadas para instalar no VS Code:**

| Extensão                  | Finalidade                                       |
| ------------------------- | ------------------------------------------------ |
| ESLint                    | Exibe erros do ESLint inline no editor           |
| Prettier - Code formatter | Formata ao salvar                                |
| Prisma                    | Syntax highlight e autocomplete no schema.prisma |
| Tailwind CSS IntelliSense | Autocomplete das classes do Tailwind             |
| GitLens                   | Histórico e blame do Git no editor               |
| Thunder Client            | Testar rotas da API direto no VS Code            |
| Error Lens                | Exibe erros e warnings inline na linha do código |

---

## 2. Modelo de dados

### Conceito central

O OutTimer Finanças é um sistema de **controle de compromissos financeiros**, não de movimentação bancária. Todo registro é feito manualmente pelo usuário. A pergunta central do sistema é: _"o que tenho para pagar, o que já paguei e o que está pendente?"_

O campo `paidAt` responde isso em cada lançamento: `null` significa pendente, uma data significa que foi pago naquele dia.

### Entidades e responsabilidades

| Entidade           | Responsabilidade                                                                |
| ------------------ | ------------------------------------------------------------------------------- |
| `User`             | Raiz do sistema. Todo dado pertence a um usuário                                |
| `Account`          | Conta financeira do usuário (corrente, poupança, dinheiro físico)               |
| `CreditCard`       | Cartão de crédito com dia de fechamento e vencimento da fatura                  |
| `Category`         | Classificação dos lançamentos. Suporta subcategorias                            |
| `Entry`            | Núcleo do sistema. Todo lançamento financeiro manual                            |
| `Installment`      | Compra parcelada — sempre vinculada a um cartão. Gera N Entries automaticamente |
| `RecurringExpense` | Despesa recorrente mensal (fixos e assinaturas). Gera uma Entry por mês         |
| `Budget`           | Orçamento mensal definido por categoria                                         |
| `Goal`             | Meta financeira com valor alvo e prazo                                          |

### Enums definidos

| Enum          | Valores                       | Observação                          |
| ------------- | ----------------------------- | ----------------------------------- |
| `EntryType`   | `INCOME`, `EXPENSE`           | Sem TRANSFER na Fase 1              |
| `AccountType` | `CHECKING`, `SAVINGS`, `CASH` | Corrente, poupança, dinheiro físico |

### Decisões de modelagem

- **`amount` é sempre positivo.** O campo `type` (INCOME/EXPENSE) define a direção. Evita erros ao somar saldos.
- **`Decimal(15,2)` para todos os valores monetários.** Nunca `Float` — ponto flutuante causa erros de arredondamento em dinheiro.
- **`Entry.paidAt`** — null = pendente / data preenchida = pago naquela data. Sem campo `status` separado.
- **`Entry.creditCardId`** — quando preenchido, o `dueDate` é calculado automaticamente pela lógica de fechamento do cartão. Quando null, o `dueDate` é informado manualmente pelo usuário.
- **`Installment.creditCardId`** — obrigatório. Parcelamentos são sempre vinculados a um cartão. Ao criar um Installment, o sistema gera N Entries com datas calculadas pelo `closingDay` e `dueDay` do cartão.
- **Lógica de fechamento do cartão** — se `purchaseDate.day <= closingDay`, a 1ª parcela vence no `dueDay` do mês corrente. Se `purchaseDate.day > closingDay`, a 1ª parcela vence no `dueDay` do mês seguinte. As demais parcelas seguem +1 mês cada.
- **`RecurringExpense.dayOfMonth`** — dia do mês em que o lançamento vence. Gastos fixos (aluguel) e assinaturas (Netflix) são a mesma entidade, diferenciados apenas pela categoria escolhida pelo usuário.
- **`RecurringExpense.lastGeneratedAt`** — campo usado pelo job mensal para saber quais recorrências precisam gerar nova Entry.
- **Fatura do cartão sem entidade própria** — a fatura é derivada em tempo de consulta: todas as Entries com o mesmo `creditCardId` e `dueDate` no mesmo mês formam uma fatura. Marcar a fatura como paga preenche `paidAt` em todas as Entries do grupo. Entidade `CreditCardInvoice` pode ser adicionada na Fase 2 se necessário.
- **`Category.parentId`** — FK para a própria tabela, permitindo subcategorias (ex: Alimentação → Restaurante).

### Diagrama de entidades e relacionamentos (ERD)

```mermaid
erDiagram
    User ||--o{ Account : "possui"
    User ||--o{ CreditCard : "tem"
    User ||--o{ Category : "define"
    User ||--o{ Entry : "registra"
    User ||--o{ Installment : "cria"
    User ||--o{ RecurringExpense : "agenda"
    User ||--o{ Budget : "configura"
    User ||--o{ Goal : "estabelece"

    Account ||--o{ Entry : "recebe lançamento"
    Account ||--o{ RecurringExpense : "vincula"

    CreditCard ||--o{ Entry : "origina lançamento"
    CreditCard ||--o{ Installment : "financia"

    Category ||--o{ Entry : "classifica"
    Category ||--o{ Installment : "classifica"
    Category ||--o{ RecurringExpense : "classifica"
    Category ||--o{ Budget : "limita"
    Category |o--o{ Category : "subcategoria de"

    Installment ||--o{ Entry : "gera parcelas"
    RecurringExpense ||--o{ Entry : "gera mensalmente"

    User {
        String   id        PK
        String   name
        String   email     "unique"
        String   currency  "default BRL"
        DateTime createdAt
        DateTime updatedAt
    }

    Account {
        String      id       PK
        String      userId   FK
        String      name
        AccountType type     "enum: CHECKING, SAVINGS, CASH"
        Decimal     balance  "15,2"
        Boolean     isActive "default true"
        DateTime    createdAt
    }

    CreditCard {
        String   id         PK
        String   userId     FK
        String   name
        Decimal  limit      "15,2"
        Int      closingDay "dia fechamento 1-28"
        Int      dueDay     "dia vencimento 1-28"
        Boolean  isActive   "default true"
        DateTime createdAt
    }

    Category {
        String     id       PK
        String     userId   FK
        String     name
        EntryType  type     "enum: INCOME, EXPENSE"
        String     parentId FK "nullable — subcategoria"
        String     icon     "nullable"
        String     color    "nullable — hex"
    }

    Entry {
        String   id                 PK
        String   userId             FK
        String   accountId          FK "nullable"
        String   creditCardId       FK "nullable — se vinculado, dueDate é calculado"
        String   categoryId         FK "nullable"
        String   installmentId      FK "nullable — se é parcela gerada"
        String   recurringExpenseId FK "nullable — se é recorrência gerada"
        EntryType type              "enum: INCOME, EXPENSE"
        Decimal  amount             "15,2 sempre positivo"
        String   description
        DateTime dueDate            "vencimento — calculado ou manual"
        DateTime paidAt             "nullable — null=pendente, data=pago"
        String   notes              "nullable"
        DateTime createdAt
    }

    Installment {
        String   id                 PK
        String   userId             FK
        String   creditCardId       FK "obrigatório"
        String   categoryId         FK "nullable"
        String   description
        Decimal  totalAmount        "15,2 — valor total da compra"
        Decimal  installmentAmount  "15,2 — valor de cada parcela"
        Int      totalInstallments  "quantidade de parcelas"
        DateTime purchaseDate       "base para cálculo das datas"
        DateTime createdAt
    }

    RecurringExpense {
        String    id               PK
        String    userId           FK
        String    accountId        FK "nullable"
        String    creditCardId     FK "nullable"
        String    categoryId       FK "nullable"
        String    description
        Decimal   amount           "15,2"
        EntryType type             "enum: INCOME, EXPENSE"
        Int       dayOfMonth       "dia do vencimento 1-28"
        DateTime  startDate
        DateTime  endDate          "nullable — null=sem fim"
        DateTime  lastGeneratedAt  "nullable — controle do job"
        Boolean   isActive         "default true"
        DateTime  createdAt
    }

    Budget {
        String   id         PK
        String   userId     FK
        String   categoryId FK
        Decimal  amount     "15,2 — limite do mês"
        Int      month      "1-12"
        Int      year
        DateTime createdAt
    }

    Goal {
        String   id            PK
        String   userId        FK
        String   name
        Decimal  targetAmount  "15,2 — valor objetivo"
        Decimal  currentAmount "15,2 — valor acumulado"
        DateTime deadline      "nullable"
        Boolean  isCompleted   "default false"
        DateTime createdAt
    }
```

> **Leitura do diagrama:** `||--o{` significa "um para muitos obrigatório". `|o--o{` significa "um para muitos opcional". O `User` é a entidade raiz — tudo pertence a um usuário e é removido em cascata se o usuário for excluído. `Entry` é o núcleo — pode ser criada diretamente pelo usuário, gerada por um `Installment` ou gerada por um `RecurringExpense`.

---

### Schema Prisma

O modelo de dados completo é definido em `apps/api/prisma/schema.prisma`, que serve simultaneamente como documentação e fonte de verdade para geração das migrações e do cliente TypeScript. A conexão com o banco é configurada separadamente em `apps/api/prisma.config.ts` (arquitetura do Prisma 7.x — ver nota de versão na seção 1).

> Arquivo: `apps/api/prisma/schema.prisma`
> Config de conexão: `apps/api/prisma.config.ts`

---

## 3. Estrutura do projeto

### Decisões de estrutura

| Ponto                   | Decisão                                                                                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repositório             | Monorepo único — frontend e backend no mesmo repositório                                                                                            |
| Nome do repositório     | `outtimer-financas`                                                                                                                                 |
| Organização do frontend | Por tipo — `components/`, `hooks/`, `services/`, `pages/`                                                                                           |
| Organização do backend  | Por domínio — cada recurso tem sua pasta dentro de `modules/`                                                                                       |
| Tipos TypeScript        | Cada lado tem os seus próprios — `web/src/types/` e `api/src/types/`                                                                                |
| Schema Prisma           | Dentro de `apps/api/prisma/` — colocalizado com o backend, seguindo a arquitetura do Prisma 7.x (client gerado dentro de `apps/api/src/generated/`) |
| Variáveis de ambiente   | `.env.example` versionado no Git com comentários; `.env` real nunca sobe                                                                            |

### Diagrama de estrutura de pastas

```mermaid
flowchart TD
    root["📁 outtimer-financas/"]

    root --> apps["📁 apps/"]
    root --> github["📁 .github/"]
    root --> configs["📄 arquivos de configuração raiz"]

    apps --> web["📁 web/\nFrontend React"]
    apps --> api["📁 api/\nBackend Fastify"]

    web --> web_src["📁 src/"]
    web_src --> web_assets["📁 assets/\nimagens, fontes, ícones"]
    web_src --> web_components["📁 components/\ncomponentes reutilizáveis"]
    web_src --> web_hooks["📁 hooks/\nhooks React reutilizáveis"]
    web_src --> web_services["📁 services/\nchamadas à API"]
    web_src --> web_types["📁 types/\ntipos TypeScript do frontend"]
    web_src --> web_pages["📁 pages/\ncomponentes de página"]
    web_src --> web_lib["📁 lib/\nconfig de libs externas"]
    web_src --> web_main["📄 main.tsx\nentry point"]
    web --> web_config["📄 vite.config.ts\n📄 tailwind.config.ts\n📄 tsconfig.json\n📄 index.html"]

    api --> api_src["📁 src/"]
    api_src --> api_modules["📁 modules/\nmódulos por domínio"]
    api_modules --> api_mod_items["📁 entries/\n📁 installments/\n📁 recurring-expenses/\n📁 accounts/\n📁 credit-cards/\n📁 budgets/\n📁 goals/\n📁 auth/"]
    api_src --> api_lib["📁 lib/\nprisma client, instâncias globais"]
    api_src --> api_mid["📁 middlewares/\nautenticação, rate limit, logs"]
    api_src --> api_types["📁 types/\ntipos TypeScript do backend"]
    api_src --> api_utils["📁 utils/\nfunções utilitárias"]
    api_src --> api_server["📄 server.ts\nentry point"]
    api_src --> api_generated["📁 generated/prisma\nprisma client gerado (não versionado)"]
    api --> api_prisma["📁 prisma/"]
    api_prisma --> schema["📄 schema.prisma\nmodelo de dados"]
    api_prisma --> migrations["📁 migrations/\ngerado pelo Prisma"]
    api_prisma --> seed["📄 seed.ts\ndados iniciais para dev"]
    api --> api_prismaconfig["📄 prisma.config.ts\nconexão com o banco"]
    api --> api_config["📄 tsconfig.json\n📄 package.json"]

    github --> workflows["📁 workflows/"]
    workflows --> ci["📄 ci.yml\ntestes e lint a cada push"]
    workflows --> deploy["📄 deploy.yml\ndeploy automático na main"]

    configs --> dc["📄 docker-compose.yml\nPostgreSQL local (Redis na Fase 2)"]
    configs --> env["📄 .env.example\nvariáveis de ambiente documentadas"]
    configs --> gitignore["📄 .gitignore"]
    configs --> eslint["📄 .eslintrc.js"]
    configs --> prettier["📄 .prettierrc"]
    configs --> pkgjson["📄 package.json\nraiz do monorepo"]
    configs --> docmd["📄 DOCUMENTACAO.md"]
```

### Estrutura completa de pastas

```
outtimer-financas/
│
├── apps/
│   │
│   ├── web/                         ← Frontend React
│   │   ├── src/
│   │   │   ├── assets/              ← imagens, fontes, ícones estáticos
│   │   │   ├── components/          ← componentes reutilizáveis (Button, Card, Modal)
│   │   │   ├── hooks/               ← hooks React reutilizáveis
│   │   │   ├── services/            ← funções de chamada à API
│   │   │   ├── types/               ← tipos TypeScript do frontend
│   │   │   ├── pages/               ← componentes de página (roteamento)
│   │   │   ├── lib/                 ← config de libs externas (queryClient, axios)
│   │   │   └── main.tsx             ← entry point
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── api/                         ← Backend Fastify
│       ├── src/
│       │   ├── modules/             ← módulos por domínio
│       │   │   ├── entries/         ← routes, service, schema Zod
│       │   │   ├── installments/
│       │   │   ├── recurring-expenses/
│       │   │   ├── accounts/
│       │   │   ├── credit-cards/
│       │   │   ├── budgets/
│       │   │   ├── goals/
│       │   │   └── auth/
│       │   ├── lib/                 ← instâncias globais (importa o prisma client de generated/)
│       │   ├── generated/
│       │   │   └── prisma/          ← prisma client gerado (não versionado, gitignored)
│       │   ├── middlewares/         ← autenticação, rate limit, logs
│       │   ├── types/               ← tipos TypeScript do backend
│       │   ├── utils/               ← funções utilitárias (datas, formatação)
│       │   └── server.ts            ← entry point
│       ├── prisma/
│       │   ├── schema.prisma        ← modelo de dados (definido na seção 2)
│       │   ├── migrations/          ← gerado automaticamente pelo Prisma
│       │   └── seed.ts              ← dados iniciais para desenvolvimento
│       ├── prisma.config.ts         ← conexão com o banco (carrega .env da raiz)
│       ├── tsconfig.json
│       └── package.json
│
├── .github/
│   └── workflows/
│       ├── ci.yml                   ← testes e lint a cada push
│       └── deploy.yml               ← deploy automático na main
│
├── docker-compose.yml               ← PostgreSQL para dev local (Redis na Fase 2)
├── .env.example                     ← variáveis de ambiente documentadas (ver abaixo)
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── package.json                     ← raiz do monorepo (workspaces npm)
└── DOCUMENTACAO.md
```

### Variáveis de ambiente (.env.example)

O arquivo `.env.example` é versionado no Git e serve como documentação das variáveis necessárias para rodar o projeto. Ele contém os nomes e descrições de cada variável, mas **nunca os valores reais**.

O arquivo `.env` real (com senhas, chaves e URLs de produção) é listado no `.gitignore` e **jamais deve ser commitado**. Cada desenvolvedor cria o seu próprio `.env` local a partir do `.env.example`.

```bash
# =============================================================================
# OutTimer Finanças — variáveis de ambiente
# =============================================================================
# Copie este arquivo para .env e preencha os valores:
#   cp .env.example .env
#
# ATENÇÃO: o arquivo .env nunca deve ser commitado no Git.
# =============================================================================

# -----------------------------------------------------------------------------
# Banco de dados (PostgreSQL)
# Formato: postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO
# Exemplo local com Docker: postgresql://postgres:postgres@localhost:5432/outtimer
# -----------------------------------------------------------------------------
DATABASE_URL=

# -----------------------------------------------------------------------------
# Autenticação JWT
# Gere um valor seguro com: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# -----------------------------------------------------------------------------
JWT_SECRET=
JWT_EXPIRES_IN=7d

# -----------------------------------------------------------------------------
# API
# -----------------------------------------------------------------------------
API_PORT=3333
API_HOST=0.0.0.0
NODE_ENV=development

# -----------------------------------------------------------------------------
# Frontend
# URL base da API consumida pelo React
# -----------------------------------------------------------------------------
VITE_API_URL=http://localhost:3333
```

> **Regra:** sempre que uma nova variável de ambiente for necessária, ela deve ser adicionada ao `.env.example` com comentário explicativo **antes** de ser usada no código. Isso garante que o projeto seja sempre configurável por qualquer pessoa que clonar o repositório.

---

## 4. Fluxos da aplicação

Cada fluxo é documentado em três níveis:

- **Usuário** — o que a pessoa faz na tela
- **Dados** — o caminho técnico da requisição
- **Regras de negócio** — a lógica por trás da operação

---

### 4.1 Autenticação

**Usuário:**

```
Primeiro acesso:
  Acessa o app → clica em "Criar conta"
  → preenche nome, email, senha
  → sistema cria a conta e faz login automático
  → redireciona para o dashboard

Acessos seguintes:
  Preenche email e senha → acessa o sistema
  → sessão mantida por 7 dias (JWT)
  → após expirar → redireciona para o login
```

**Dados:**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as API (Fastify)
    participant D as Banco (PostgreSQL)

    Note over U,D: Cadastro
    U->>F: preenche nome, email, senha
    F->>A: POST /auth/register
    A->>A: Zod valida campos
    A->>A: bcrypt gera hash da senha
    A->>D: Prisma cria User
    D-->>A: User criado
    A-->>F: retorna JWT
    F->>F: armazena JWT
    F-->>U: redireciona para o dashboard

    Note over U,D: Login
    U->>F: preenche email e senha
    F->>A: POST /auth/login
    A->>A: Zod valida campos
    A->>D: Prisma busca User pelo email
    D-->>A: User encontrado
    A->>A: bcrypt compara senha com hash
    A-->>F: retorna JWT
    F->>F: armazena JWT
    F-->>U: redireciona para o dashboard
```

**Regras de negócio:**

- Senha nunca armazenada — apenas o hash bcrypt
- JWT expira em 7 dias (`JWT_EXPIRES_IN` do `.env`)
- Email é único — cadastro duplicado retorna erro
- JWT enviado em toda requisição no header `Authorization: Bearer <token>`
- Middleware do Fastify valida o token antes de cada rota protegida

---

### 4.2 Lançamento simples (sem cartão)

**Usuário:**

```
Clica em "Novo lançamento"
→ preenche: descrição, valor, tipo (despesa/receita),
   data de vencimento, categoria (opcional),
   conta (opcional), observações (opcional)
→ confirma
→ lançamento aparece na lista como PENDENTE
```

**Dados:**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as API (Fastify)
    participant D as Banco (PostgreSQL)

    U->>F: preenche e confirma formulário
    F->>A: POST /entries
    A->>A: Zod valida campos obrigatórios e tipos
    A->>D: Prisma cria Entry
    Note right of D: paidAt: null
    Note right of D: creditCardId: null
    Note right of D: installmentId: null
    Note right of D: recurringExpenseId: null
    D-->>A: Entry criada
    A-->>F: retorna Entry
    F-->>U: exibe lançamento como PENDENTE
```

**Regras de negócio:**

- `dueDate` é livre — o usuário define quando quiser
- `paidAt: null` significa pendente por definição
- Categoria e conta são opcionais — podem ser preenchidas depois

---

### 4.3 Lançamento com cartão de crédito

**Usuário:**

```
Clica em "Novo lançamento"
→ preenche: descrição, valor, tipo, categoria (opcional)
→ seleciona um cartão de crédito
→ informa a data da compra
→ sistema calcula e exibe o dueDate automaticamente
→ confirma
→ lançamento criado como PENDENTE com dueDate calculado
```

**Dados:**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as API (Fastify)
    participant D as Banco (PostgreSQL)

    U->>F: seleciona cartão e data da compra
    F->>A: GET /credit-cards/:id
    A-->>F: retorna closingDay e dueDay
    F->>F: calcula dueDate (feedback imediato)
    F-->>U: exibe dueDate calculado

    U->>F: confirma formulário
    F->>A: POST /entries (com creditCardId)
    A->>D: busca CreditCard (closingDay, dueDay)
    D-->>A: dados do cartão
    A->>A: recalcula e valida dueDate
    A->>D: Prisma cria Entry
    D-->>A: Entry criada
    A-->>F: retorna Entry
    F-->>U: exibe lançamento como PENDENTE
```

**Regras de negócio:**

```mermaid
flowchart TD
    A["purchaseDate.day <= closingDay?"]
    A -->|SIM| B["dueDate = dueDay do mês corrente"]
    A -->|NÃO| C["dueDate = dueDay do mês seguinte"]

    B --> D["Exemplo: compra dia 05, fecha dia 07, vence dia 10
    → dueDate: 10 do mês corrente"]
    C --> E["Exemplo: compra dia 08, fecha dia 07, vence dia 10
    → dueDate: 10 do mês seguinte"]
```

- O cálculo é feito no frontend para feedback imediato e **revalidado no backend** antes de persistir — o frontend nunca é a fonte de verdade para regras de negócio

---

### 4.4 Parcelamento

**Usuário:**

```
Clica em "Novo parcelamento"
→ preenche: descrição, valor total, quantidade de parcelas,
   cartão de crédito, data da compra, categoria (opcional)
→ sistema exibe prévia de todas as parcelas com datas e valores
→ confirma
→ N lançamentos criados com status calculado por data
```

**Dados:**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as API (Fastify)
    participant D as Banco (PostgreSQL)

    U->>F: preenche formulário
    F->>A: GET /credit-cards/:id
    A-->>F: closingDay, dueDay
    F->>F: gera prévia das N parcelas com datas
    F-->>U: exibe prévia para confirmação

    U->>F: confirma
    F->>A: POST /installments
    A->>D: busca CreditCard
    D-->>A: closingDay, dueDay
    A->>A: calcula dueDate da 1ª parcela
    A->>A: gera array de N Entries com datas (+1 mês cada)
    A->>A: aplica regra de paidAt por data
    A->>D: cria Installment + N Entries em transação atômica
    D-->>A: Installment e Entries criados
    A-->>F: retorna Installment com Entries
    F-->>U: exibe parcelas com status correto
```

**Regras de negócio — cálculo de datas:**

- `installmentAmount = totalAmount / totalInstallments`
- Diferenças de centavos são absorvidas na última parcela
- 1ª parcela calculada pela lógica de fechamento (ver fluxo 4.3)
- Parcelas seguintes: `dueDate da 1ª parcela + N meses`
- Criação atômica — ou todas as parcelas são criadas ou nenhuma

**Regras de negócio — `paidAt` na criação:**

```mermaid
flowchart TD
    A["Para cada parcela gerada"]
    A --> B{"dueDate vs hoje"}

    B -->|"dueDate < mês corrente"| C["paidAt = dueDate ✓"]
    B -->|"dueDate > mês corrente"| D["paidAt = null ⏳"]
    B -->|"dueDate = mês corrente"| E{"Fatura do mês corrente\ntem Entries pagas?"}

    E -->|"SIM"| F["paidAt = dueDate ✓"]
    E -->|"NÃO"| G["paidAt = null ⏳"]
```

---

### 4.5 Despesa recorrente

**Usuário:**

```
Clica em "Nova recorrência"
→ preenche: descrição, valor, tipo (despesa/receita),
   categoria (opcional), conta ou cartão (opcional),
   dia do mês, data de início, data de fim (opcional)
→ confirma
→ sistema gera imediatamente as Entries retroativas se aplicável
→ nos meses seguintes, job automático gera uma Entry por mês
```

**Dados:**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as API (Fastify)
    participant D as Banco (PostgreSQL)
    participant J as Job mensal

    U->>F: preenche e confirma formulário
    F->>A: POST /recurring-expenses
    A->>D: Prisma cria RecurringExpense
    A->>A: calcula Entries retroativas (startDate até hoje)
    A->>A: aplica regra de paidAt por data
    A->>D: cria Entries retroativas
    D-->>A: Entries criadas
    A-->>F: retorna RecurringExpense com Entries geradas
    F-->>U: exibe recorrência ativa

    Note over J,D: Todo dia 1 de cada mês
    J->>D: busca RecurringExpenses onde isActive=true
    Note right of D: E lastGeneratedAt < início do mês corrente
    D-->>J: lista de recorrências pendentes
    J->>D: cria Entry para cada recorrência
    J->>D: atualiza lastGeneratedAt
```

**Regras de negócio — `paidAt` na criação:**

```mermaid
flowchart TD
    A["Para cada mês gerado retroativamente"]
    A --> B{"dueDate vs hoje"}

    B -->|"dueDate < mês corrente"| C["paidAt = dueDate ✓"]
    B -->|"dueDate > mês corrente"| D["paidAt = null ⏳"]
    B -->|"dueDate = mês corrente"| E{"Vinculado a cartão?"}

    E -->|"SIM"| F{"Fatura do mês corrente\ntem Entries pagas?"}
    E -->|"NÃO"| G["paidAt = null ⏳"]

    F -->|"SIM"| H["paidAt = dueDate ✓"]
    F -->|"NÃO"| I["paidAt = null ⏳"]
```

**Demais regras:**

- `endDate` opcional — sem data de fim gera indefinidamente enquanto `isActive = true`
- Desativar (`isActive = false`) preserva todas as Entries já geradas
- Se vinculada a cartão, `dueDate` segue lógica de fechamento (fluxo 4.3)

---

### 4.6 Marcar lançamento como pago

**Usuário:**

```
Na lista de lançamentos, encontra um PENDENTE
→ clica em "Marcar como pago"
→ sistema sugere a data de hoje
→ confirma ou ajusta a data
→ lançamento exibe status PAGO com a data registrada

Para desfazer:
→ clica em "Marcar como pendente"
→ lançamento volta ao status PENDENTE
```

**Dados:**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as API (Fastify)
    participant D as Banco (PostgreSQL)

    Note over U,D: Marcar como pago
    U->>F: clica em "Marcar como pago" e confirma data
    F->>A: PATCH /entries/:id/pay
    Note right of A: body: { paidAt: "2026-05-10" }
    A->>A: Zod valida que paidAt é data válida
    A->>D: Prisma atualiza Entry.paidAt
    D-->>A: Entry atualizada
    A-->>F: retorna Entry
    F-->>U: exibe status PAGO

    Note over U,D: Desfazer pagamento
    U->>F: clica em "Marcar como pendente"
    F->>A: PATCH /entries/:id/pay
    Note right of A: body: { paidAt: null }
    A->>D: Prisma atualiza Entry.paidAt para null
    D-->>A: Entry atualizada
    A-->>F: retorna Entry
    F-->>U: exibe status PENDENTE
```

**Regras de negócio:**

- `paidAt` pode ser diferente de hoje — usuário pode registrar pagamento feito em data anterior
- Operação reversível — `paidAt: null` volta para pendente
- Sem cascata — marcar uma parcela não afeta as demais do mesmo parcelamento

---

### 4.7 Marcar fatura do cartão como paga

**Usuário:**

```
Acessa a tela do cartão de crédito
→ seleciona o mês da fatura
→ visualiza todas as Entries do mês agrupadas com total
→ clica em "Pagar fatura"
→ confirma a data de pagamento
→ todas as Entries pendentes do mês são marcadas como pagas
```

**Dados:**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as API (Fastify)
    participant D as Banco (PostgreSQL)

    U->>F: acessa fatura do mês
    F->>A: GET /credit-cards/:id/invoice?month=5&year=2026
    A->>D: busca Entries onde creditCardId=:id
    Note right of D: E dueDate entre 01/05 e 31/05
    D-->>A: lista de Entries + total
    A-->>F: retorna fatura
    F-->>U: exibe Entries agrupadas e total

    U->>F: clica em "Pagar fatura" e confirma data
    F->>A: PATCH /credit-cards/:id/invoice/pay
    Note right of A: body: { month: 5, year: 2026, paidAt: "2026-05-10" }
    A->>D: atualiza paidAt das Entries pendentes do grupo
    Note right of D: ignora Entries já pagas
    D-->>A: quantidade de Entries atualizadas
    A-->>F: retorna confirmação
    F-->>U: exibe fatura como PAGA
```

**Regras de negócio:**

- Somente Entries com `creditCardId` preenchido entram na fatura
- Entries sem cartão são pagas individualmente (fluxo 4.6)
- Entries já pagas no grupo são ignoradas na atualização
- O agrupamento por mês usa `dueDate`, não `createdAt`

---

### 4.8 Orçamento mensal

**Usuário:**

```
Acessa a tela de orçamentos
→ visualiza categorias com barra de progresso (gasto vs limite)
→ clica em "Definir orçamento" numa categoria
→ informa o valor limite para o mês
→ sistema passa a exibir o percentual consumido
```

**Dados:**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as API (Fastify)
    participant D as Banco (PostgreSQL)

    U->>F: acessa tela de orçamentos
    F->>A: GET /budgets?month=5&year=2026
    A->>D: busca Budgets do usuário para o mês
    A->>D: para cada Budget calcula gasto real
    Note right of D: SUM(Entry.amount) onde categoryId=budget.categoryId
    Note right of D: E dueDate no mês E type=EXPENSE
    D-->>A: budgets com gasto calculado
    A-->>F: retorna { limit, spent, remaining, percentage }
    F-->>U: exibe barras de progresso

    U->>F: define orçamento para uma categoria
    F->>A: POST /budgets
    Note right of A: body: { categoryId, amount, month, year }
    A->>A: Zod valida unicidade por categoria/mês
    A->>D: Prisma cria ou atualiza Budget
    D-->>A: Budget salvo
    A-->>F: retorna Budget
    F-->>U: atualiza barra de progresso
```

**Regras de negócio:**

- `spent` calculado pelo `dueDate` — o mês que a despesa vence, não quando foi paga
- Entries pendentes **e** pagas entram no cálculo — orçamento mostra compromissos, não só pagamentos realizados
- Apenas Entries do tipo `EXPENSE` entram no cálculo
- Um orçamento por categoria por mês — tentativa de duplicar atualiza o existente

---

### 4.9 Meta financeira

**Usuário:**

```
Acessa a tela de metas
→ visualiza metas com barra de progresso
→ cria nova meta: nome, valor objetivo, prazo (opcional)
→ conforme vai guardando dinheiro, atualiza o valor acumulado manualmente
→ ao atingir o objetivo, sistema marca como concluída automaticamente
```

**Dados:**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as API (Fastify)
    participant D as Banco (PostgreSQL)

    Note over U,D: Criar meta
    U->>F: preenche nome, valor objetivo, prazo (opcional)
    F->>A: POST /goals
    A->>D: Prisma cria Goal
    Note right of D: currentAmount: 0
    Note right of D: isCompleted: false
    D-->>A: Goal criada
    A-->>F: retorna Goal
    F-->>U: exibe meta com progresso 0%

    Note over U,D: Atualizar progresso
    U->>F: informa novo valor acumulado
    F->>A: PATCH /goals/:id
    Note right of A: body: { currentAmount: 500 }
    A->>A: verifica se currentAmount >= targetAmount
    A->>D: Prisma atualiza currentAmount
    Note right of D: SE atingido: isCompleted = true
    D-->>A: Goal atualizada
    A-->>F: retorna Goal
    F-->>U: atualiza barra de progresso
```

**Regras de negócio:**

- `currentAmount` é sempre atualizado manualmente pelo usuário
- `isCompleted` é definido automaticamente quando `currentAmount >= targetAmount`
- Meta concluída pode ser reaberta — basta atualizar `currentAmount` para valor menor que `targetAmount`
- `deadline` é informativo na Fase 1 — sem notificação automática de prazo

---

## 5. DevOps e infraestrutura

### Decisões de infraestrutura

| Ponto         | Decisão                                                          |
| ------------- | ---------------------------------------------------------------- |
| Bancos locais | Dois separados — dev (porta 5432) e test (porta 5433)            |
| Branches      | Git Flow simplificado: `main`, `develop`, `feature/*`, `fix/*`   |
| Pull Requests | Mantidos — CI obrigatório antes de mergear em `develop` e `main` |
| Staging       | Postergado para Fase 2                                           |
| Deploy        | Railway (recomendado), Render como alternativa                   |
| CI            | `ci.yml` — roda em `feature/*`, `fix/*` e `develop`              |
| CD            | `deploy.yml` — roda apenas em `main`                             |

---

### 5.1 Ambiente de desenvolvimento local (Docker Compose)

O ambiente local usa dois arquivos Docker Compose separados — um para desenvolvimento com dados persistentes e outro para testes com dados descartáveis.

#### Arquivos

**`docker-compose.yml`** — banco de desenvolvimento:

- PostgreSQL na porta `5432`
- Dados salvos em volume local — persistem entre reinicializações
- Usado no dia a dia de desenvolvimento

**`docker-compose.test.yml`** — banco de testes:

- PostgreSQL na porta `5433`
- Sem volume — dados descartados ao derrubar o contêiner
- Usado exclusivamente pelos testes automatizados

#### Variáveis de ambiente correspondentes

```bash
# Banco de desenvolvimento (docker-compose.yml)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/outtimer_dev

# Banco de testes (docker-compose.test.yml)
DATABASE_TEST_URL=postgresql://postgres:postgres@localhost:5433/outtimer_test
```

#### Comandos do dia a dia

```bash
# Sobe o banco de desenvolvimento em background
docker compose up -d

# Verifica se está rodando
docker compose ps

# Para o banco (dados preservados)
docker compose down

# Reset completo do banco de dev (apaga todos os dados)
docker compose down -v

# Sobe o banco de testes
docker compose -f docker-compose.test.yml up -d

# Derruba o banco de testes
docker compose -f docker-compose.test.yml down
```

#### Diagrama do ambiente local

```mermaid
flowchart LR
    subgraph local["Máquina local"]
        direction TB
        api["API (Node.js)\nporta 3333"]
        web["Frontend (Vite)\nporta 5173"]

        subgraph docker["Docker"]
            pgdev[("PostgreSQL dev\nporta 5432\nouttimer_dev")]
            pgtest[("PostgreSQL test\nporta 5433\nouttimer_test")]
        end
    end

    web -->|"HTTP REST"| api
    api -->|"DATABASE_URL"| pgdev
    api -->|"DATABASE_TEST_URL\n(apenas Vitest)"| pgtest
```

---

### 5.2 Estratégia de branches

O projeto usa um Git Flow simplificado com quatro tipos de branch.

#### Estrutura

```mermaid
gitGraph
    commit id: "init"
    branch develop
    checkout develop
    commit id: "setup projeto"

    branch feature/autenticacao
    checkout feature/autenticacao
    commit id: "feat: cadastro"
    commit id: "feat: login"
    checkout develop
    merge feature/autenticacao id: "merge auth"

    branch feature/lancamentos
    checkout feature/lancamentos
    commit id: "feat: entry simples"
    commit id: "feat: entry cartão"
    checkout develop
    merge feature/lancamentos id: "merge entries"

    checkout main
    merge develop id: "release v0.1" tag: "v0.1"
```

#### Regras por branch

| Branch      | Criada a partir de | Merge para | Quem commita                                  |
| ----------- | ------------------ | ---------- | --------------------------------------------- |
| `main`      | —                  | —          | Apenas via PR vindo de `develop`              |
| `develop`   | `main`             | `main`     | Apenas via PR vindo de `feature/*` ou `fix/*` |
| `feature/*` | `develop`          | `develop`  | Desenvolvimento direto                        |
| `fix/*`     | `develop`          | `develop`  | Correções diretas                             |

#### Convenção de nomes

```bash
feature/nome-da-funcionalidade    # nova funcionalidade
fix/descricao-do-problema         # correção de bug

# Exemplos:
feature/autenticacao
feature/lancamento-simples
feature/parcelamento
fix/calculo-fechamento-cartao
fix/geracao-recorrencia
```

#### Fluxo de uma nova funcionalidade

```mermaid
flowchart TD
    A["git checkout develop\ngit pull origin develop"]
    A --> B["git checkout -b feature/nome"]
    B --> C["desenvolve e commita\n(Conventional Commits)"]
    C --> D["git push origin feature/nome"]
    D --> E["abre Pull Request\nfeature/nome → develop"]
    E --> F["CI roda automaticamente\n(lint, types, testes)"]
    F --> G{"CI passou?"}
    G -->|"NÃO"| H["corrige e faz novo push\nCI roda novamente"]
    H --> F
    G -->|"SIM"| I["faz merge do PR"]
    I --> J["deleta branch feature"]
    J --> K{"conjunto de features\npronto para produção?"}
    K -->|"NÃO"| B
    K -->|"SIM"| L["abre PR: develop → main"]
    L --> M["CI roda novamente"]
    M --> N["merge aprovado\ndeploy automático dispara"]
```

---

### 5.3 Pipelines CI/CD (GitHub Actions)

#### `ci.yml` — Integração contínua

Roda automaticamente em pushes e Pull Requests para `feature/*`, `fix/*` e `develop`.

```mermaid
flowchart LR
    A["push ou PR"] --> B["npm install"]
    B --> C["ESLint"]
    C --> D["Prettier"]
    D --> E["TypeScript\ncompile check"]
    E --> F["Sobe banco test\n(Docker)"]
    F --> G["Prisma migrate\n(banco test)"]
    G --> H["Vitest"]
    H --> I{"Todos\npassaram?"}
    I -->|"SIM"| J["✅ CI aprovado\nPR pode ser mergeado"]
    I -->|"NÃO"| K["❌ CI falhou\nmerge bloqueado"]
```

#### `deploy.yml` — Deploy contínuo

Roda automaticamente apenas quando um merge chega na branch `main`.

```mermaid
flowchart LR
    A["merge na main"] --> B["executa CI completo"]
    B --> C{"CI passou?"}
    C -->|"NÃO"| D["❌ deploy cancelado"]
    C -->|"SIM"| E["build da aplicação"]
    E --> F["deploy no Railway\nvia CLI"]
    F --> G["Railway aplica\nvariáveis de ambiente"]
    G --> H["Prisma migrate\n(banco de produção)"]
    H --> I["✅ nova versão no ar"]
```

> O deploy nunca acontece se o CI falhar — produção só recebe código que passou por todos os checks.

---

### 5.4 Deploy e hospedagem

#### Plataforma recomendada: Railway

Railway é a plataforma de deploy recomendada para a Fase 1 por conectar diretamente ao repositório GitHub, ter PostgreSQL como serviço integrado e abstrair toda a configuração de servidor.

- Site: https://railway.app
- Documentação: https://docs.railway.app

#### Plataforma alternativa: Render

Render tem plano gratuito mais generoso, mas serviços "dormem" após 15 minutos sem uso, causando lentidão no primeiro acesso após inatividade. Indicado se o custo for uma restrição.

- Site: https://render.com
- Documentação: https://render.com/docs

#### Ambientes

| Ambiente    | Branch   | Banco                     | Plataforma        |
| ----------- | -------- | ------------------------- | ----------------- |
| Development | qualquer | PostgreSQL local (Docker) | máquina local     |
| Production  | `main`   | PostgreSQL Railway/Render | Railway ou Render |

> **Staging** será adicionado na Fase 2, quando o projeto tiver funcionalidades suficientes para justificar um ambiente intermediário de validação.

#### Variáveis de ambiente por ambiente

As variáveis do `.env.example` são configuradas em cada ambiente:

| Variável         | Development                   | Production                        |
| ---------------- | ----------------------------- | --------------------------------- |
| `DATABASE_URL`   | `localhost:5432/outtimer_dev` | URL fornecida pelo Railway/Render |
| `JWT_SECRET`     | qualquer string local         | string segura gerada com `crypto` |
| `JWT_EXPIRES_IN` | `7d`                          | `7d`                              |
| `API_PORT`       | `3333`                        | definido pela plataforma          |
| `NODE_ENV`       | `development`                 | `production`                      |
| `VITE_API_URL`   | `http://localhost:3333`       | URL pública da API em produção    |

---

## 6. Decisões técnicas registradas

Registro cronológico das decisões tomadas e o motivo de cada uma.

| Data       | Decisão                                                                                     | Motivo                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05    | TypeScript em todo o projeto (front e back)                                                 | Tipagem elimina erros em dados financeiros; uma linguagem nos dois lados reduz contexto a trocar                                                                                          |
| 2026-05    | React em vez de Vue.js                                                                      | Maior ecossistema, mais vagas de mercado, mais conteúdo de aprendizado disponível                                                                                                         |
| 2026-05    | Fastify em vez de Express                                                                   | Mais rápido, TypeScript nativo, validação de schema integrada, desenvolvimento ativo                                                                                                      |
| 2026-05    | PostgreSQL em vez de MySQL                                                                  | Suporte a `DECIMAL` com precisão exata, transações ACID mais robustas, melhor suporte a queries analíticas                                                                                |
| 2026-05    | Prisma como ORM                                                                             | Migrations automáticas, client TypeScript tipado gerado automaticamente, nunca fica preso em versão do banco                                                                              |
| 2026-08    | Prisma 7.x em vez de 5.x (planejado originalmente)                                          | Prisma 5.x é incompatível com Node.js 23+/24 (bug `isError is not a function` no CLI, sem correção). Prisma 7.x reescreveu o motor em TypeScript, resolvendo o problema                   |
| 2026-08    | `prisma/` movido para dentro de `apps/api/`, com `prisma.config.ts` próprio                 | Arquitetura do Prisma 7.x colocaliza schema, migrations e client gerado com o backend; `prisma.config.ts` carrega a `DATABASE_URL` do `.env` da raiz do monorepo manualmente              |
| 2026-08-13 | Todas as versões da stack atualizadas para as mais recentes disponíveis (tabela da seção 1) | O documento vinha com versões de maio/2026, já defasadas frente ao que existia no mercado em agosto — reflexo direto na tabela de stack, sem necessidade de linha própria por tecnologia  |
| 2026-08-13 | Backend organizado por módulos desde o início (`src/modules/<dominio>/`)                    | Seguindo a decisão original de estrutura por domínio; módulo `health` implementado primeiro como fundação (rotas + service + schema Zod), padrão a ser repetido em `auth`, `entries`, etc |
| 2026-05    | Vite em vez de Create React App                                                             | CRA descontinuado pela comunidade; Vite é o padrão atual, muito mais rápido                                                                                                               |
| 2026-05    | `amount` sempre positivo com `EntryType` definindo direção                                  | Evita erros de soma de saldos com valores negativos misturados                                                                                                                            |
| 2026-05    | `Decimal(15,2)` para valores monetários                                                     | `Float` causa erros de arredondamento (ex: 0.1 + 0.2 ≠ 0.3 em ponto flutuante)                                                                                                            |
| 2026-05    | Foco em controle manual na Fase 1 — sem integrações bancárias                               | Escopo claro e funcional antes de adicionar automações                                                                                                                                    |
| 2026-05    | `Transaction` renomeado para `Entry` (Lançamento)                                           | Termo mais neutro e preciso para registro manual de compromissos                                                                                                                          |
| 2026-05    | `RecurringTransaction` substituído por `RecurringExpense` com `dayOfMonth`                  | Frequência abstrata (DAILY/WEEKLY) desnecessária — controle pessoal é mensal                                                                                                              |
| 2026-05    | `EntryType` sem `TRANSFER` na Fase 1                                                        | Transferência entre contas requer lógica bancária; entra na Fase 2                                                                                                                        |
| 2026-05    | `AccountType` simplificado: CHECKING, SAVINGS, CASH                                         | INVESTMENT e WALLET postergados para quando o escopo financeiro expandir                                                                                                                  |
| 2026-05    | `Entry.paidAt` como controle de status (null=pendente, data=pago)                           | Mais expressivo que um enum de status; a data de pagamento é informação útil por si                                                                                                       |
| 2026-05    | `Installment.creditCardId` obrigatório                                                      | Parcelamentos são sempre vinculados a cartão — define o ciclo de vencimento                                                                                                               |
| 2026-05    | Lógica de fechamento: `purchaseDate.day <= closingDay` → fatura corrente                    | Reflete o comportamento real de cartões de crédito brasileiros                                                                                                                            |
| 2026-05    | Fatura do cartão derivada (sem entidade própria na Fase 1)                                  | Grouping por `creditCardId + dueDate mês` é suficiente; `CreditCardInvoice` na Fase 2 se necessário                                                                                       |
| 2026-05    | Redis movido para Fase 2                                                                    | Sem necessidade de cache em sistema de registro manual sem integrações externas                                                                                                           |
| 2026-05    | Monorepo único `outtimer-financas`                                                          | Projeto solo com tipos compartilhados; um repositório reduz overhead de configuração                                                                                                      |
| 2026-05    | Frontend organizado por tipo (`components/`, `hooks/`, `services/`)                         | Mais simples para o estágio atual; padrão Feature Sliced pode ser adotado futuramente                                                                                                     |
| 2026-05    | Tipos TypeScript separados por lado (web e api)                                             | Evita complexidade de pacote compartilhado no início; pode ser unificado na Fase 2                                                                                                        |
| 2026-05    | `prisma/` na raiz do monorepo                                                               | Schema pertence ao projeto todo, não só ao backend                                                                                                                                        |
| 2026-05    | `.env.example` versionado com comentários; `.env` real no `.gitignore`                      | Documenta todas as variáveis necessárias sem expor credenciais no repositório                                                                                                             |
| 2026-05    | dueDate calculado no frontend (UX) e revalidado no backend (segurança)                      | Frontend nunca é fonte de verdade para regras de negócio                                                                                                                                  |
| 2026-05    | Criação atômica de parcelamentos (Installment + N Entries em uma transação)                 | Se qualquer inserção falhar, nenhuma parcela é criada — evita dados inconsistentes                                                                                                        |
| 2026-05    | paidAt retroativo: meses passados = paidAt automático, futuros = null                       | Ao registrar compras passadas, parcelas vencidas já entram como pagas                                                                                                                     |
| 2026-05    | Mês corrente verifica se fatura do cartão já tem Entries pagas                              | Consistência com pagamentos já realizados no mês atual                                                                                                                                    |
| 2026-05    | Mês corrente sem cartão = paidAt null por padrão                                            | Sem como inferir se despesa avulsa de conta já foi paga sem que o usuário informe                                                                                                         |
| 2026-05    | Budget calculado por dueDate, inclui pendentes e pagas                                      | Orçamento reflete compromissos do mês, não apenas o que foi efetivamente pago                                                                                                             |
| 2026-05    | isCompleted da Goal definido automaticamente pelo backend                                   | Lógica centralizada no servidor — frontend não controla estado de conclusão                                                                                                               |
| 2026-05    | Docker Compose com dois bancos separados (dev e test)                                       | Testes não contaminam dados de desenvolvimento; banco de test é descartável                                                                                                               |
| 2026-05    | Git Flow simplificado: main, develop, feature/_, fix/_                                      | Boas práticas de versionamento mesmo em projeto solo; prepara para trabalho em equipe                                                                                                     |
| 2026-05    | Pull Requests mantidos mesmo em projeto solo                                                | CI obrigatório antes do merge protege develop e main de código com erro                                                                                                                   |
| 2026-05    | Staging postergado para Fase 2                                                              | Complexidade desnecessária na Fase 1; dois ambientes (dev e prod) são suficientes                                                                                                         |
| 2026-05    | Railway como plataforma de deploy recomendada                                               | Deploy conectado ao GitHub, PostgreSQL integrado, sem necessidade de gerenciar servidor                                                                                                   |
| 2026-05    | Deploy automático apenas na main, nunca se CI falhar                                        | Produção só recebe código validado; develop nunca vai direto para o ar                                                                                                                    |

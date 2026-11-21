# Backend FROTASYNC

API do sistema FROTASYNC, desenvolvida com NestJS e TypeScript, com PostgreSQL como banco de dados relacional, Prisma como ORM e Flyway como ferramenta exclusiva de gerenciamento de migrações de schema.

## Stack

- **NestJS** — Framework backend
- **TypeScript** — Linguagem
- **PostgreSQL 17** — Banco de dados
- **Prisma 7** — ORM e geração do Prisma Client
- **Flyway** — Versionamento e execução de migrações SQL
- **Docker Compose** — Ambiente local para o PostgreSQL

## Arquitetura de banco de dados

O projeto utiliza responsabilidades separadas para gerenciamento do banco:

- **Flyway:** responsável pela criação, alteração e versionamento do schema do banco de dados.
- **Prisma:** responsável pelo acesso aos dados, consultas e integração com a aplicação por meio do Prisma Client.

O Prisma não deve ser utilizado para executar alterações estruturais no banco. As migrações são gerenciadas exclusivamente pelo Flyway.

## Ambiente de desenvolvimento

### Requisitos

- Node.js 20.19 ou superior
- npm
- Docker
- Docker Compose

### PostgreSQL

O PostgreSQL 17 é executado localmente através do Docker Compose, configurado no diretório raiz do projeto.

O banco utiliza a porta `5433` no host, mapeada para a porta `5432` do container, e é exposto somente à interface local (`127.0.0.1`).

### Configuração da API

Na pasta `backend`, copie o arquivo de exemplo de ambiente:

```bash
cp .env.example .env
```

Configure a variável `DATABASE_URL` com as credenciais locais do PostgreSQL.

### Instalação

```bash
npm ci
```

### Executar em desenvolvimento

```bash
npm run start:dev
```

A API utiliza a porta `3000` por padrão, podendo ser alterada através da variável de ambiente `PORT`.

## Prisma

O Prisma Client é gerado durante o processo de build e seu código gerado não é versionado no Git.

A validação do schema pode ser realizada através do comando:

```bash
npx prisma validate
```

A geração do Prisma Client:

```bash
npx prisma generate
```

Esses comandos não executam migrações nem alteram a estrutura do banco de dados.

## Healthcheck

A API disponibiliza:

```http
GET /health
```

O endpoint retorna um status de liveness da aplicação. Ele confirma que a API está respondendo, mas não representa uma verificação completa da disponibilidade do PostgreSQL.

## Verificações

```bash
npm run lint
npm run build
npm test
```

## Migrações

O schema do PostgreSQL é gerenciado exclusivamente pelo Flyway, através de migrações SQL versionadas.

As migrações estão localizadas em:

```text
db/migration/
```

As alterações estruturais do banco devem ser realizadas por novas migrações Flyway, respeitando o histórico de versões existente.

## Status do desenvolvimento

A infraestrutura base do backend está configurada, incluindo NestJS, PostgreSQL, integração Prisma e versionamento do banco com Flyway.

Os módulos de negócio e funcionalidades da API estão sendo implementados de forma incremental.

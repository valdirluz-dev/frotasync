# FrotaSync

**Idiomas / Languages:** [English](README.md) · **[Português (Brasil)](README.pt-BR.md)**

**Sistema de Gestão de Unidades, Documentos e Tarefas** — aplicação web full-stack para acompanhar filiais, pátios, documentos de conformidade e tarefas relacionadas.

O **FrotaSync** é uma aplicação full-stack composta por frontend em **Next.js** e **TypeScript**, API REST em **NestJS** e banco de dados **PostgreSQL**, com infraestrutura implantada na **AWS**. O sistema centraliza a gestão de **unidades** (filiais e pátios), **documentos** com status de validade calculado automaticamente e **tarefas** vinculadas a cada unidade. As regras de negócio — autenticação, unidades inativas, vencimento de documentos e fluxo de tarefas — são executadas pela API, que é a fonte oficial dos dados. Até a integração entre frontend e API (Épico 13), essas regras são simuladas com **dados mockados** via **TanStack Query**, seguindo o contrato descrito em [`plan/versao_1.3.0/`](plan/versao_1.3.0/).

O cenário é uma transportadora fictícia (**FrotaSync**) com filiais e pátios. Exemplos de documentos: Licença Ambiental, Registro na ANTT e Seguro de Carga. Exemplo de tarefa: *“Renovar licença do pátio de Recife”*.

> **Projeto acadêmico / portfólio** — squad da Residência Motiron Technologies.

## Badges

![Licença: MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-API-E0234E?logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Flyway-4169E1?logo=postgresql&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-Terraform%20%2B%20Docker-FF9900?logo=amazonaws&logoColor=white)

<!-- Substitua quando CI/deploy existirem:
![Build](https://img.shields.io/github/actions/workflow/status/OWNER/frotasync/ci.yml)
![Deploy](https://img.shields.io/badge/deploy-AWS-FF9900?logo=amazonaws)
-->

## Capa / demonstração

| Indicadores do Dashboard | Lista global de documentos | Detalhe da unidade |
| :---: | :---: | :---: |
| *Espaço reservado para screenshot* | *Espaço reservado para screenshot* | *Espaço reservado para screenshot* |

Adicione capturas em `docs/images/` e atualize os links quando a interface estiver disponível.

**Regra de validade do documento** (calculada na leitura — nunca armazenada nem editada manualmente; a API é a fonte oficial dos dados, conforme RNF 007 e RNF 024):

```ts
// lib/status.ts — UTC, Math.floor
const DAY_MS = 24 * 60 * 60 * 1000;
function utcDay(value: Date | string): number { ... }
export function calcularStatusDocumento(
  dataValidade: Date | string,
  hoje: Date = new Date(),
): DocumentoStatus {
  const diasRestantes = Math.floor(
    (utcDay(dataValidade) - utcDay(hoje)) / DAY_MS,
  );
  if (diasRestantes < 0) return "Expirado";
  if (diasRestantes <= 15) return "Próximo do vencimento";
  return "Válido";
}
```

## Índice

- [Funcionalidades](#funcionalidades)
- [Status das funcionalidades](#status-das-funcionalidades)
- [Arquitetura](#arquitetura)
- [Instalação e uso](#instalação-e-uso)
- [Tecnologias](#tecnologias)
- [Documentação do projeto](#documentação-do-projeto)
- [Contribuidores e licença](#contribuidores-e-licença)

## Funcionalidades

- **Autenticação** — login com e-mail e senha e opção “Lembrar-me”; validação com Zod; cadastro em três etapas (usuário e empresa); recuperação de senha por código enviado por e-mail; JWT com autorização baseada em função e isolamento de dados por empresa na API. Rotas protegidas redirecionam para `/login` quando não há autenticação (RF 001, 019, 020, 027; RNF 004, 024, 025).
- **Dashboard** — cartões com totais de unidades, documentos, tarefas pendentes e **total de pendências abertas** (documentos vencendo/vencidos + tarefas pendentes/em andamento), calculados pela API, com invalidação de cache após alterações (RF 002–003). As listas globais exibem variação em relação ao período anterior (RF 024).
- **Unidades** — grade de cartões com pesquisa, filtros e paginação (TanStack Table); cadastro e edição com consulta de CEP realizada pelo backend; ativação/inativação com confirmação; detalhes da unidade com documentos e tarefas vinculados. Unidades inativas bloqueiam novos documentos e tarefas (RF 004–007, 021).
- **Documentos** — lista global na rota `/documentos` e listas por unidade; cadastro e edição em unidades ativas com anexos armazenados de forma privada no S3 e download autorizado; status automático de validade: válido, próximo do vencimento (≤15 dias) ou expirado (RF 008–011, 022, 026).
- **Tarefas** — lista global na rota `/tarefas` e listas por unidade; cadastro e edição em unidades ativas; fluxo de status (Pendente → Em andamento → Concluída), com modal de confirmação ao concluir (RF 012–015, 023).
- **Experiência e qualidade** — layout responsivo, estados de carregamento/erro/vazio, componentes de interface compartilhados e schemas Zod como contrato de dados (RNF 009–014).
- **Backend e nuvem (v1.3)** — API REST NestJS (`/api/v1`) com Swagger/OpenAPI; PostgreSQL com migrações Flyway; Docker para desenvolvimento local; Terraform na AWS (RDS, S3, ECR e ambiente de execução de contêineres); CI/CD com GitHub Actions (RNF 022–033, Épicos 11–14).
- **Opcionais (backlog)** — exclusão de unidade bloqueada quando existem pendências abertas; histórico de auditoria de alterações; tema claro/escuro; testes automatizados do frontend. A camada de API simulada foi descartada como solução definitiva, e o deploy na Vercel foi substituído pelo deploy na AWS na versão 1.3.

## Status das funcionalidades

| Funcionalidade | Status |
| --- | --- |
| Login | Pronto |
| Cadastro de unidades | Pronto |
| Documentos | Em andamento |
| Tarefas | Pendente |
| Banco de dados (PostgreSQL) | Pendente |
| API (NestJS) | Pendente |
| Integração frontend ↔ API | Pendente |
| Infraestrutura e deploy na AWS | Pendente |

## Arquitetura

```text
┌─────────────────────────────────────────────────────────────┐
│  Next.js (App Router) + React + Tailwind CSS                │
├─────────────────────────────────────────────────────────────┤
│  Telas: Login · Dashboard · Unidades · Documentos · Tarefas │
├─────────────────────────────────────────────────────────────┤
│  TanStack Query (estado do servidor) │ TanStack Table       │
│  React Hook Form + Zod (formulários e validação)            │
├─────────────────────────────────────────────────────────────┤
│  Cliente HTTP — API REST /api/v1 (JWT) [mocks até Épico 13] │
├─────────────────────────────────────────────────────────────┤
│  API NestJS — autenticação, regras de negócio, Swagger      │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL (Flyway) │ Amazon S3 (anexos de documentos)     │
├─────────────────────────────────────────────────────────────┤
│  Docker · Terraform · AWS · GitHub Actions (CI/CD)          │
└─────────────────────────────────────────────────────────────┘
```

Camadas de backend e nuvem (Épicos 11–14): **NestJS**, **PostgreSQL**, **JWT**, **Docker**, **Terraform** e **AWS**. Consulte [`Design_de_API_v1_3.md`](plan/versao_1.3.0/Design_de_API_v1_3.md) e [`Modelagem_de_Dados_v1_3.md`](plan/versao_1.3.0/Modelagem_de_Dados_v1_3.md).

## Instalação e uso

### Pré-requisitos

- **Node.js** 20 LTS ou superior
- **npm**, **pnpm** ou **yarn**
- **Docker** e **Docker Compose** (para o ambiente local full-stack, planejado na US 141)

### Configuração

```bash
git clone https://github.com/valdirluz-dev/frotasync.git
cd frotasync
npm run install:app
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Use as credenciais mock definidas na camada de usuários simulados do projeto (exemplo no design da API: `colaborador@frotasync.com.br`). Após a integração da API (Épico 13), utilize os usuários criados pelo seed de desenvolvimento (US 116).

### Ambiente full-stack com Docker (planejado — US 141)

Quando o ambiente Docker estiver implementado, um único comando iniciará o frontend, a API e o PostgreSQL, executando as migrações Flyway na inicialização:

```bash
docker compose up --build
```

As variáveis de ambiente estão documentadas em `.env.example`; nenhum segredo deve ser versionado.

### Scripts (Next.js — esperados)

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Executa o build de produção |
| `npm run lint` | Executa o lint (quando configurado) |

## Tecnologias

| Categoria | Stack |
| --- | --- |
| Linguagens | JavaScript, TypeScript |
| Frameworks | Next.js, React |
| Estilização | Tailwind CSS |
| Formulários e validação | React Hook Form, Zod |
| Dados e tabelas | TanStack Query, TanStack Table |
| Persistência | PostgreSQL, migrações Flyway (dados mockados até a integração do Épico 13) |
| API | NestJS, JWT, Swagger/OpenAPI |
| Infraestrutura e entrega | Docker, Terraform, AWS (RDS, S3, ECR), GitHub Actions |
| IDE | Visual Studio Code |

## Documentação do projeto

| Documento | Descrição |
| --- | --- |
| [`Analise_de_Requisitos_v1_3_FrotaSync.md`](plan/versao_1.3.0/Analise_de_Requisitos_v1_3_FrotaSync.md) | Requisitos funcionais e não funcionais (v1.3) |
| [`Estorias_de_Usuario_e_Backlog_v1_3.md`](plan/versao_1.3.0/Estorias_de_Usuario_e_Backlog_v1_3.md) | Estórias de usuário e backlog MoSCoW |
| [`Design_de_API_v1_3.md`](plan/versao_1.3.0/Design_de_API_v1_3.md) | Contrato da API REST (NestJS) |
| [`Modelagem_de_Dados_v1_3.md`](plan/versao_1.3.0/Modelagem_de_Dados_v1_3.md) | Modelo de dados (PostgreSQL e migrações Flyway) |

## Contribuidores e licença

**Squad de desenvolvimento (Residência Motiron):**

Valdir · Filipe · Gabrielli · Lucas Vinícius · Murilo · Niedson · Silas

**Licença:** [MIT](LICENSE) — Copyright (c) 2026 valdir_luz

# FrotaSync

**Languages / Idiomas:** **[English](README.md)** · [Português (Brasil)](README.pt-BR.md)

**Units, Documents & Tasks Management System** — a full-stack web app for tracking branches, yards, compliance documents, and related tasks.

**FrotaSync** is a full-stack application: a **Next.js** and **TypeScript** frontend, a **NestJS** REST API and a **PostgreSQL** database, deployed on **AWS**. It centralizes management of **units** (branches and yards), **documents** with automatic validity status, and **tasks** linked to each unit. Business rules (authentication, inactive units, document expiry, task workflow) are executed by the API, which is the source of truth; until the frontend–API integration (Epic 13) they are simulated with **mock data** served through **TanStack Query**, following the API contract described in [`plan/versao_1.3.0/`](plan/versao_1.3.0/).

The scenario is a fictional carrier (**FrotaSync**) with branches and yards. Example documents: Environmental License, ANTT Registration, Cargo Insurance. Example task: *“Renew Recife yard license.”*

> **Academic / portfolio project** — Motiron Technologies Residency squad.

## Badges

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-API-E0234E?logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Flyway-4169E1?logo=postgresql&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-Terraform%20%2B%20Docker-FF9900?logo=amazonaws&logoColor=white)

<!-- Replace when CI/deploy exist:
![Build](https://img.shields.io/github/actions/workflow/status/OWNER/frotasync/ci.yml)
![Deploy](https://img.shields.io/badge/deploy-AWS-FF9900?logo=amazonaws)
-->

## Cover / demo

| Dashboard indicators | Global document list | Unit detail |
| :---: | :---: | :---: |
| *Screenshot placeholder* | *Screenshot placeholder* | *Screenshot placeholder* |

Add screenshots under `docs/images/` and link them here when the UI is available.

**Document validity rule** (computed on read — never stored or edited manually; the API is the source of truth and the frontend only displays it, RNF 007 and RNF 024):

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

## Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [Installation and usage](#installation-and-usage)
- [Technologies](#technologies)
- [Project documentation](#project-documentation)
- [Contributors and license](#contributors-and-license)

## Features

- **Authentication** — Email/password login (with “Remember me”) with Zod validation, 3-step sign-up (user and company) and password recovery by e-mail code; JWT with role-based authorization and per-company data isolation on the API; protected routes redirect to `/login` when unauthenticated (RF 001, 019, 020, 027; RNF 004, 024, 025).
- **Dashboard** — Donut cards for total units, documents, pending tasks, and **total open items** (expiring/expired documents + pending/in-progress tasks), calculated by the API, with cache invalidation after changes (RF 002–003); variation against the previous period shown in the global lists (RF 024).
- **Units** — Card grid with search, filters, and pagination (TanStack Table); create/edit with CEP lookup done by the backend; activate/inactivate with confirmation; unit detail with linked documents and tasks; inactive units block new documents/tasks (RF 004–007, 021).
- **Documents** — Global list on the dedicated `/documentos` route and per-unit lists; create/edit on active units with file attachment (private S3 storage) and authorized download; automatic validity status: Valid / Due soon (≤15 days) / Expired (RF 008–011, 022, 026).
- **Tasks** — Global list on the dedicated `/tarefas` route and per-unit lists; create/edit on active units; status workflow (Pending → In progress → Done) with confirmation modal when marking Done (RF 012–015, 023).
- **UX & quality** — Responsive layout, loading/error/empty states, shared UI components, Zod schemas as data contract (RNF 009–014).
- **Backend & cloud (v1.3)** — NestJS REST API (`/api/v1`, Swagger/OpenAPI), PostgreSQL with Flyway migrations, Docker for local development, Terraform on AWS (RDS, S3, ECR, container runtime), and CI/CD with GitHub Actions (RNF 022–033, Epics 11–14).
- **Optional (backlog)** — Delete unit blocked when open items exist; change audit log; light/dark theme; automated frontend tests. The simulated API layer was discarded and the Vercel deploy was replaced by the AWS deploy in v1.3.


## Funcionalidade | Status

| Funcionalidade | Status |
| --- | --- |
| Login | Pronto |
| Cadastro (unidades) | Pronto |
| Documentos | Em andamento |
| Tarefas | Pendente |
| Banco de dados (PostgreSQL) | Pendente |
| API (NestJS) | Pendente |
| Integração frontend ↔ API | Pendente |
| Infraestrutura e deploy na AWS | Pendente |

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│  Next.js (App Router) + React + Tailwind CSS                │
├─────────────────────────────────────────────────────────────┤
│  Pages: Login · Dashboard · Units · Documents · Tasks       │
├─────────────────────────────────────────────────────────────┤
│  TanStack Query (server state)  │  TanStack Table (lists)   │
│  React Hook Form + Zod (forms & validation)                 │
├─────────────────────────────────────────────────────────────┤
│  HTTP client — REST API /api/v1 (JWT)  [mocks until Epic 13]│
├─────────────────────────────────────────────────────────────┤
│  NestJS API — auth, business rules, Swagger/OpenAPI         │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL (Flyway)  │  Amazon S3 (document attachments)   │
├─────────────────────────────────────────────────────────────┤
│  Docker · Terraform · AWS · GitHub Actions (CI/CD)          │
└─────────────────────────────────────────────────────────────┘
```

Backend and cloud layers (Epics 11–14): **NestJS**, **PostgreSQL**, **JWT**, **Docker**, **Terraform**, **AWS** — see [`Design_de_API_v1_3.md`](plan/versao_1.3.0/Design_de_API_v1_3.md) and [`Modelagem_de_Dados_v1_3.md`](plan/versao_1.3.0/Modelagem_de_Dados_v1_3.md).

## Installation and usage

### Prerequisites

- **Node.js** 20 LTS or newer
- **npm**, **pnpm**, or **yarn**
- **Docker** and **Docker Compose** (for the full-stack local environment, planned in US 141)

### Setup

```bash
git clone https://github.com/valdirluz-dev/frotasync.git
cd frotasync
npm run install:app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use mock credentials defined in the project’s mock user layer (example from API design: `colaborador@frotasync.com.br`); after the API integration (Epic 13), use the users created by the development seed (US 116).

### Full stack with Docker (planned — US 141)

Once the Docker environment is delivered, a single command will start the frontend, the API and PostgreSQL, running the Flyway migrations on startup:

```bash
docker compose up --build
```

Environment variables are documented in `.env.example`; no secrets are versioned.

### Scripts (expected Next.js)

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | Lint (when configured) |

## Technologies

| Category | Stack |
| --- | --- |
| Language | JavaScript, TypeScript |
| Framework | Next.js, React |
| Styling | Tailwind CSS |
| Forms & validation | React Hook Form, Zod |
| Data & tables | TanStack Query, TanStack Table |
| Persistence | PostgreSQL, Flyway migrations (mock data only until the Epic 13 integration) |
| API | NestJS, JWT, Swagger/OpenAPI |
| Infrastructure & delivery | Docker, Terraform, AWS (RDS, S3, ECR), GitHub Actions |
| IDE | Visual Studio Code |

## Project documentation

| Document | Description |
| --- | --- |
| [`Analise_de_Requisitos_v1_3_FrotaSync.md`](plan/versao_1.3.0/Analise_de_Requisitos_v1_3_FrotaSync.md) | Functional & non-functional requirements (v1.3) |
| [`Estorias_de_Usuario_e_Backlog_v1_3.md`](plan/versao_1.3.0/Estorias_de_Usuario_e_Backlog_v1_3.md) | User stories and MoSCoW backlog |
| [`Design_de_API_v1_3.md`](plan/versao_1.3.0/Design_de_API_v1_3.md) | REST API contract (NestJS) |
| [`Modelagem_de_Dados_v1_3.md`](plan/versao_1.3.0/Modelagem_de_Dados_v1_3.md) | Data model (PostgreSQL, Flyway migrations) |

## Contributors and license

**Development squad (Motiron Residency):**

Valdir · Filipe · Gabrielli · Lucas Vinícius · Murilo · Niedson · Silas

**License:** [MIT](LICENSE) — Copyright (c) 2026 valdir_luz

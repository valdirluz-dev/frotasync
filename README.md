# FrotaSync

**Languages / Idiomas:** **[English](README.md)** · [Português (Brasil)](README.pt-BR.md)

**Units, Documents & Tasks Management System** — a frontend web app for tracking branches, yards, compliance documents, and related tasks.

**FrotaSync** is a 100% frontend application built with **Next.js** and **TypeScript**. It centralizes management of **units** (branches and yards), **documents** with automatic validity status, and **tasks** linked to each unit. Business rules (authentication, inactive units, document expiry, task workflow) are simulated with **mock data** served through **TanStack Query**, aligned with the future API contract described in [`plan/versao_1.1.0/`](plan/versao_1.1.0/).

The scenario is a fictional carrier (**FrotaSync**) with branches and yards. Example documents: Environmental License, ANTT Registration, Cargo Insurance. Example task: *“Renew Recife yard license.”*

> **Academic / portfolio project** — Motiron Technologies Residency squad.

## Badges

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)

<!-- Replace when CI/deploy exist:
![Build](https://img.shields.io/github/actions/workflow/status/OWNER/frotasync/ci.yml)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)
-->

## Cover / demo

| Dashboard indicators | Global document list | Unit detail |
| :---: | :---: | :---: |
| *Screenshot placeholder* | *Screenshot placeholder* | *Screenshot placeholder* |

Add screenshots under `docs/images/` and link them here when the UI is available.

**Document validity rule** (computed on read — never stored or edited manually):

```ts
// RF 011 — reference date: today; threshold: 15 days
function documentValidityStatus(dataValidade: Date, today = new Date()): string {
  const diffDays = Math.ceil(
    (dataValidade.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 0) return "expirado";
  if (diffDays <= 15) return "proximo_vencimento";
  return "valido";
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

- **Authentication** — Email/password login with Zod validation; protected routes redirect to `/login` when unauthenticated (RNF 004).
- **Dashboard** — Cards for total units, documents, pending tasks, and **total open items** (expiring/expired documents + pending/in-progress tasks), with cache invalidation after changes (RF 002–003).
- **Units** — List with search, filters, and pagination (TanStack Table); create/edit; unit detail with linked documents and tasks; inactive units block new documents/tasks (RF 004–007).
- **Documents** — Global and per-unit lists; create on active units; automatic validity status: Valid / Due soon (≤15 days) / Expired (RF 008–011).
- **Tasks** — Global and per-unit lists; create on active units; status workflow (Pending → In progress → Done) with confirmation modal when marking Done (RF 012–015).
- **UX & quality** — Responsive layout, loading/error/empty states, shared UI components, Zod schemas as data contract (RNF 009–014).
- **Optional (v1.1 backlog)** — Delete unit blocked when open items exist; change audit log; light/dark theme; simulated API layer (MSW/Route Handlers); automated tests; production deploy.

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│  Next.js (App Router) + React + Tailwind CSS                │
├─────────────────────────────────────────────────────────────┤
│  Pages: Login · Dashboard · Units · Documents · Tasks     │
├─────────────────────────────────────────────────────────────┤
│  TanStack Query (server state)  │  TanStack Table (lists)   │
│  React Hook Form + Zod (forms & validation)                 │
├─────────────────────────────────────────────────────────────┤
│  Mock data layer (RNF 008) — swappable for REST API v1      │
└─────────────────────────────────────────────────────────────┘
```

Future backend reference (not in current scope): **NestJS**, **PostgreSQL**, **JWT** — see [`Design_de_API_v1_1.md`](plan/versao_1.1.0/Design_de_API_v1_1.md) and [`Modelagem_de_Dados_v1_1.md`](plan/versao_1.1.0/Modelagem_de_Dados_v1_1.md).

## Installation and usage

### Prerequisites

- **Node.js** 20 LTS or newer
- **npm**, **pnpm**, or **yarn**

### Setup

```bash
git clone https://github.com/<owner>/frotasync.git
cd frotasync
npm install
```

When the application source is added to the repository:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use mock credentials defined in the project’s mock user layer (example from API design: `colaborador@frotasync.com.br`).

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
| Persistence (current) | Mock data (no real database) |
| Persistence (future ref.) | PostgreSQL, Flyway migrations |
| API (future ref.) | NestJS, JWT, Swagger/OpenAPI |
| IDE | Visual Studio Code |

## Project documentation

| Document | Description |
| --- | --- |
| [`Analise_de_Requisitos_v1_1_FrotaSync.md`](plan/versao_1.1.0/Analise_de_Requisitos_v1_1_FrotaSync.md) | Functional & non-functional requirements (v1.1) |
| [`Estorias_de_Usuario_e_Backlog_v1_1.md`](plan/versao_1.1.0/Estorias_de_Usuario_e_Backlog_v1_1.md) | User stories and MoSCoW backlog |
| [`Design_de_API_v1_1.md`](plan/versao_1.1.0/Design_de_API_v1_1.md) | REST API contract (future integration) |
| [`Modelagem_de_Dados_v1_1.md`](plan/versao_1.1.0/Modelagem_de_Dados_v1_1.md) | Data model (PostgreSQL reference) |

## Contributors and license

**Development squad (Motiron Residency):**

Valdir · Filipe · Gabrielli · Lucas Vinícius · Murilo · Niedson · Silas

**License:** [MIT](LICENSE) — Copyright (c) 2026 valdir_luz

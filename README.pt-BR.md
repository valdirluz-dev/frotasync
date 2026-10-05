# FrotaSync

**Idiomas / Languages:** [English](README.md) · **[Português (Brasil)](README.pt-BR.md)**

**Sistema de Gestão de Unidades, Documentos e Tarefas** — aplicação web frontend para acompanhar filiais, pátios, documentos de conformidade e tarefas relacionadas.

O **FrotaSync** é uma aplicação **100% frontend** em **Next.js** e **TypeScript** que centraliza a gestão de **unidades** (filiais e pátios), **documentos** com status de validade calculado automaticamente e **tarefas** vinculadas a cada unidade. Regras de negócio (autenticação, unidades inativas, validade documental, fluxo de tarefas) são simuladas com **dados mockados** via **TanStack Query**, alinhados ao contrato de API futuro em [`plan/versao_1.1.0/`](plan/versao_1.1.0/).

Cenário: transportadora fictícia **FrotaSync**. Documentos exemplo: Licença Ambiental, Registro na ANTT, Seguro de Carga. Tarefa exemplo: *“Renovar licença do pátio de Recife”*.

> **Projeto acadêmico / portfólio** — squad da Residência Motiron Technologies.

## Badges

![Licença: MIT](https://img.shields.io/badge/Licença-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)

<!-- Substitua quando CI/deploy existirem:
![Build](https://img.shields.io/github/actions/workflow/status/OWNER/frotasync/ci.yml)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)
-->

## Capa / demonstração

| Indicadores do Dashboard | Lista global de documentos | Detalhe da unidade |
| :---: | :---: | :---: |
| *Espaço reservado para screenshot* | *Espaço reservado para screenshot* | *Espaço reservado para screenshot* |

Inclua capturas em `docs/images/` e atualize os links quando a interface estiver pronta.

**Regra de validade do documento** (calculada na leitura — nunca persistida nem editada manualmente):

```ts
// RF 011 — referência: data atual; limiar: 15 dias
function statusValidadeDocumento(dataValidade: Date, hoje = new Date()): string {
  const diffDias = Math.ceil(
    (dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDias < 0) return "expirado";
  if (diffDias <= 15) return "proximo_vencimento";
  return "valido";
}
```

## Índice

- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Instalação e uso](#instalação-e-uso)
- [Tecnologias](#tecnologias)
- [Documentação do projeto](#documentação-do-projeto)
- [Contribuidores e licença](#contribuidores-e-licença)

## Funcionalidades

- **Autenticação** — Login com e-mail e senha validados por Zod; rotas protegidas redirecionam para `/login` sem sessão válida (RNF 004).
- **Dashboard** — Totais de unidades, documentos, tarefas pendentes e **total de pendências** (documentos a vencer/vencidos + tarefas pendentes/em andamento), com atualização automática via cache (RF 002–003).
- **Unidades** — Listagem com pesquisa, filtros e paginação (TanStack Table); cadastro e edição; detalhamento com documentos e tarefas; unidades inativas não recebem novos vínculos (RF 004–007).
- **Documentos** — Listas global e por unidade; cadastro em unidades ativas; status automático: Válido / Próximo do vencimento (≤15 dias) / Expirado (RF 008–011).
- **Tarefas** — Listas global e por unidade; cadastro em unidades ativas; fluxo de status (Pendente → Em andamento → Concluída) com confirmação ao concluir (RF 012–015).
- **UX e qualidade** — Layout responsivo, estados de carregamento/erro/vazio, componentes reutilizáveis, schemas Zod como contrato de dados (RNF 009–014).
- **Opcionais (backlog v1.1)** — Bloqueio de exclusão de unidade com pendências; histórico de alterações; tema claro/escuro; camada de API simulada (MSW/Route Handlers); testes automatizados; deploy.

## Arquitetura

```text
┌─────────────────────────────────────────────────────────────┐
│  Next.js (App Router) + React + Tailwind CSS                │
├─────────────────────────────────────────────────────────────┤
│  Telas: Login · Dashboard · Unidades · Documentos · Tarefas │
├─────────────────────────────────────────────────────────────┤
│  TanStack Query (estado servidor) │ TanStack Table (listas) │
│  React Hook Form + Zod (formulários e validação)            │
├─────────────────────────────────────────────────────────────┤
│  Camada mock (RNF 008) — substituível por API REST v1       │
└─────────────────────────────────────────────────────────────┘
```

Referência de backend futuro (fora do escopo atual): **NestJS**, **PostgreSQL**, **JWT** — ver [`Design_de_API_v1_1.md`](plan/versao_1.1.0/Design_de_API_v1_1.md) e [`Modelagem_de_Dados_v1_1.md`](plan/versao_1.1.0/Modelagem_de_Dados_v1_1.md).

## Instalação e uso

### Pré-requisitos

- **Node.js** 20 LTS ou superior
- **npm**, **pnpm** ou **yarn**

### Configuração

```bash
git clone https://github.com/<owner>/frotasync.git
cd frotasync
npm install
```

Quando o código da aplicação estiver no repositório:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Use as credenciais mock definidas na camada de usuários do projeto (exemplo do design de API: `colaborador@frotasync.com.br`).

### Scripts (padrão Next.js esperado)

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Executa o build de produção |
| `npm run lint` | Lint (quando configurado) |

## Tecnologias

| Categoria | Stack |
| --- | --- |
| Linguagem | JavaScript, TypeScript |
| Framework | Next.js, React |
| Estilização | Tailwind CSS |
| Formulários e validação | React Hook Form, Zod |
| Dados e tabelas | TanStack Query, TanStack Table |
| Persistência (atual) | Dados mockados (sem banco real) |
| Persistência (ref. futura) | PostgreSQL, migrações Flyway |
| API (ref. futura) | NestJS, JWT, Swagger/OpenAPI |
| IDE | Visual Studio Code |

## Documentação do projeto

| Documento | Descrição |
| --- | --- |
| [`Analise_de_Requisitos_v1_1_FrotaSync.md`](plan/versao_1.1.0/Analise_de_Requisitos_v1_1_FrotaSync.md) | Requisitos funcionais e não funcionais (v1.1) |
| [`Estorias_de_Usuario_e_Backlog_v1_1.md`](plan/versao_1.1.0/Estorias_de_Usuario_e_Backlog_v1_1.md) | Estórias de usuário e backlog MoSCoW |
| [`Design_de_API_v1_1.md`](plan/versao_1.1.0/Design_de_API_v1_1.md) | Contrato REST (integração futura) |
| [`Modelagem_de_Dados_v1_1.md`](plan/versao_1.1.0/Modelagem_de_Dados_v1_1.md) | Modelagem de dados (referência PostgreSQL) |

## Contribuidores e licença

**Squad de desenvolvimento (Residência Motiron):**

Valdir · Filipe · Gabrieli · Lucas Vinícius · Murilo · Niedson · Silas

**Licença:** [MIT](LICENSE) — Copyright (c) 2026 valdir_luz

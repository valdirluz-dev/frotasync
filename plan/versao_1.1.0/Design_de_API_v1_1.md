# Design de API

**FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas**

- **Versão do documento:** 1.1 | **Data:** 29/09/2026
- Documento complementar à Análise de Requisitos (v1.1), às Estórias de Usuário e Backlog (v1.1) e à Modelagem de Dados (v1.1)

| Papel | Nome |
|---|---|
| Desenvolvedor(a) | Valdir |
| Desenvolvedor(a) | Filipe |
| Desenvolvedor(a) | Gabrieli |
| Desenvolvedor(a) | Lucas Vinícius |
| Desenvolvedor(a) | Murilo |
| Desenvolvedor(a) | Niedson |
| Desenvolvedor(a) | Silas |

> **Nota de contexto:** conforme registrado na Análise de Requisitos e na Modelagem de Dados, o projeto atual é 100% frontend (Next.js) e utiliza dados mockados, ambientados na empresa fictícia FrotaSync e isolados em uma camada de dados (RNF 008), sem backend real. Este documento especifica o contrato de API que seria adotado caso o sistema evolua para uma persistência real em PostgreSQL, servindo como referência de arquitetura de integração e como guia para que os dados mockados (via TanStack Query) repliquem fielmente o comportamento da API descrita aqui.

| Item | Definição |
|---|---|
| Linguagem | TypeScript (Node.js) |
| Framework | NestJS |
| Banco de dados | PostgreSQL (ver Modelagem de Dados v1.1) |
| Segurança | JWT (Passport JWT Strategy) + bcrypt para hash de senha |
| Validação | Zod (schemas aplicados via ValidationPipe sobre os DTOs) |
| Documentação interativa | Swagger / OpenAPI (gerado a partir dos schemas Zod/NestJS) |

---

## 1. Contexto, Propósito e Público-Alvo

### Contexto

A API descrita neste documento expõe as entidades definidas na Modelagem de Dados (Usuário, Unidade, Documento e Tarefa e, no escopo opcional, o Histórico de alteração) e implementa as regras de negócio levantadas na Análise de Requisitos (RF 001 a RF 017 e RNF 004) e detalhadas nas Estórias de Usuário do Backlog priorizado (US 011 a US 087). O RF 018 (tema claro/escuro) é exclusivamente de interface e não gera endpoints. A API é a camada que, em uma evolução futura do projeto, substituiria a massa de dados mockados hoje consumida via TanStack Query, mantendo os mesmos contratos de dados (hoje documentados em Zod no frontend) como base para os DTOs de requisição e resposta.

### Propósito

A API deve permitir que cada perfil de usuário (colaborador, gestor ou administrador) realize, de forma autenticada e com autorização por perfil (role-based access control), as operações de consulta e gestão sobre unidades, documentos e tarefas — sempre com validação consistente de entrada (Zod) e cálculo automático e centralizado de status derivados (status de validade do documento e indicadores do Dashboard, inclusive o total de pendências), nunca delegando esse cálculo ao cliente. Na fase atual, o mesmo cálculo é feito no frontend (RF 011, RNF 007), seguindo exatamente a regra descrita neste contrato.

### Público-alvo da API

- **Colaborador(a):** consome a listagem e o detalhamento de unidades, as listas de documentos e tarefas (por unidade e globais), realiza o cadastro de novos documentos e tarefas em unidades ativas e a alteração de status de tarefas (US 031, US 032, US 042, US 044, US 051, US 052, US 054).
- **Gestor(a):** consome principalmente o Dashboard de indicadores e as listas globais de documentos e de tarefas, para apoiar decisões sobre prioridades e pendências (US 021, US 022, US 041, US 053).
- **Administrador(a):** consome os mesmos endpoints de consulta, além do cadastro e edição de unidades (US 034), da ativação/inativação de unidades e das regras de bloqueio de novos registros em unidades inativas (US 033); no escopo opcional, da exclusão com bloqueio por pendências (US 081) e do histórico de alterações (US 082).
- **Aplicação frontend (Next.js/React):** cliente único e oficial da API nesta fase do projeto, consumindo todos os recursos autenticados via TanStack Query.

### Convenções gerais

- **URL base:** `https://api.gestaodeunidades.com.br/api/v1` — rotas versionadas com prefixo `/v1`.
- **Formato:** requisições e respostas em JSON (`Content-Type: application/json`).
- **Datas:** ISO-8601 com fuso horário para timestamps de auditoria (ex.: `2026-09-29T14:30:00-03:00`) e data pura (`YYYY-MM-DD`) para `data_validade` e `prazo`, conforme a Modelagem de Dados.
- **Identificadores:** UUID (gerado com `gen_random_uuid()`) como identificador público de todos os recursos (usuario, unidade, documento, tarefa, historico_alteracao).
- **Paginação:** listas usam os parâmetros de query `page` (0-based) e `size`, retornando o envelope de página descrito na seção 5 — mesmo padrão de paginação já utilizado no frontend com TanStack Table.
- **Pesquisa e filtros:** as listagens aceitam o parâmetro `q` (pesquisa textual) e filtros por status e por unidade, conforme detalhado na seção 4.6 (RF 004, RF 008 e RF 013).
- **Mocks e evolução:** enquanto não há backend, a camada de dados mockados (RNF 008) — opcionalmente servida por Route Handlers ou MSW com latência e erros simulados (RNF 017) — deve seguir este contrato de rotas, DTOs e erros, permitindo a troca futura por uma API real.

---

## 2. Autenticação

A autenticação é feita via JWT (JSON Web Token), emitido pela própria API e validado a cada requisição por um Guard do NestJS (estratégia stateless — a API não mantém sessão em servidor). O perfil do usuário (`usuario.papel`: colaborador, gestor ou administrador) é embutido no payload do token e usado pelas regras de autorização em cada endpoint (ver coluna "Autenticação" na seção 3). No frontend, uma resposta 401 em rota protegida leva ao redirecionamento imediato para `/login` (RNF 004).

### Fluxo de autenticação (passo a passo)

1. Cliente envia `POST /api/v1/auth/login` com e-mail e senha.
2. A API busca o usuário pelo e-mail e valida a senha comparando o hash com bcrypt (`usuario.senha_hash`).
3. Se válidas, a API gera e retorna o `accessToken` e o `refreshToken`.
4. O cliente envia o `accessToken` em requisições futuras (header `Authorization: Bearer <token>`).
5. Um Guard JWT (Passport) valida o token a cada requisição e popula o contexto de segurança (`request.user`) com id, papel e demais claims do usuário.
6. Um Guard de papéis (`RolesGuard` / decorator `@Roles(...)`) confere se o perfil do usuário autenticado pode acessar o endpoint solicitado.
7. Em caso de falha: 401 (token ausente, expirado ou inválido) ou 403 (usuário autenticado, mas sem permissão para a ação).

*(O diagrama visual completo do fluxo pode ser gerado a partir destes passos em uma ferramenta como draw.io ou Mermaid.)*

### Componentes de segurança

| Componente | Responsabilidade |
|---|---|
| JwtStrategy (Passport) | Extrai e valida o token JWT do header Authorization e popula `request.user`. |
| AuthGuard('jwt') | Bloqueia o acesso a rotas protegidas quando não há token válido (401). |
| RolesGuard + @Roles() | Confere se o papel do usuário autenticado está entre os papéis permitidos no endpoint (403). |
| AuthService | Valida credenciais, gera o hash de senha (bcrypt) e emite/renova os tokens JWT. |
| Zod ValidationPipe | Valida o corpo, os parâmetros de query e de rota de cada requisição contra o schema Zod do DTO. |

### Tokens emitidos

| Token | Duração sugerida | Uso |
|---|---|---|
| accessToken | 15 minutos | Enviado em toda requisição autenticada (header Authorization). |
| refreshToken | 7 dias | Usado exclusivamente em `POST /auth/refresh` para obter um novo accessToken. |

### Login social / OAuth2 (extensão opcional)

Não há requisito funcional para login social nas Estórias de Usuário atuais (US 011 exige apenas e-mail e senha). Caso venha a ser adotado no futuro, o login social se encaixaria no mesmo fluxo de emissão de tokens (accessToken/refreshToken JWT), apenas substituindo a etapa de validação de credenciais por um provider OAuth2 (ex.: Google), sem alterar os contratos dos demais endpoints.

### Exemplo de requisição de login

`POST /api/v1/auth/login`

```jsonc
// Requisição
{
  "email": "colaborador@frotasync.com.br",
  "senha": "SenhaForte123!"
}

// Resposta 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "8f14e45fceea167a5a36dedd4bea2543...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "usuario": {
    "id": "9f1c2e30-7b3a-4b7a-9c1e-2b3a4c5d6e7f",
    "nome": "Maria Souza",
    "email": "colaborador@frotasync.com.br",
    "role": "colaborador"
  }
}
```

### Exemplo de resposta de erro — credenciais inválidas

```jsonc
// Resposta 401 Unauthorized
{
  "timestamp": "2026-09-29T14:32:10-03:00",
  "status": 401,
  "error": "UNAUTHORIZED",
  "message": "E-mail ou senha inválidos",
  "path": "/api/v1/auth/login",
  "erros": []
}
```

---

## 3. Lista de Endpoints

Todas as rotas abaixo usam o prefixo `/api/v1`. A coluna "Autenticação" indica o perfil mínimo exigido ("Público" significa que não exige token; "Autenticado" aceita qualquer papel logado; papéis específicos — COLABORADOR, GESTOR, ADMINISTRADOR — indicam o mínimo exigido, sendo que GESTOR e ADMINISTRADOR também herdam os acessos de COLABORADOR).

### Recurso: Autenticação (RF 001 · RNF 004 · US 011, US 012)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| POST | `/auth/login` | Autentica o usuário por e-mail e senha e retorna os tokens JWT. | Público |
| POST | `/auth/refresh` | Gera um novo accessToken a partir de um refreshToken válido. | Público* |
| POST | `/auth/logout` | Invalida o refreshToken atual do usuário. | Autenticado |

\* `/auth/refresh` não exige accessToken, mas exige um refreshToken válido enviado no corpo da requisição.

### Recurso: Dashboard (RF 002, RF 003 · US 021, US 022)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/dashboard/indicadores` | Retorna os totais gerais (unidades, documentos, tarefas pendentes e total de pendências) para o Dashboard. | Autenticado |

> Após qualquer escrita confirmada (POST, PUT, PATCH ou DELETE) em unidades, documentos ou tarefas, o frontend invalida o cache desta consulta (TanStack Query) para atualizar o total de pendências sem recarregar a página (RF 003).

### Recurso: Unidades (RF 004, RF 005, RF 006, RF 007, RF 016 · US 031, US 032, US 033, US 034, US 081)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/unidades` | Lista unidades com paginação, pesquisa por nome/código e filtro por status (RF 004). | Autenticado |
| GET | `/unidades/{id}` | Retorna o detalhamento de uma unidade (dados cadastrais e status). | Autenticado |
| POST | `/unidades` | Cadastra uma nova unidade — nome, código, endereço e status (RF 005). | ADMINISTRADOR |
| PUT | `/unidades/{id}` | Atualiza os dados cadastrais de uma unidade (RF 005). | ADMINISTRADOR |
| PATCH | `/unidades/{id}/status` | Ativa ou inativa uma unidade (RF 007). | ADMINISTRADOR |
| DELETE | `/unidades/{id}` | Remove definitivamente uma unidade (uso excepcional — ver seção 6 da Modelagem de Dados). Opcional (RF 016): bloqueada com 409 se houver documentos próximos do vencimento/expirados ou tarefas em andamento. | ADMINISTRADOR |

### Recurso: Documentos (RF 008, RF 009, RF 010, RF 011 · US 041, US 042, US 043, US 044)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/documentos` | Lista global de todos os documentos, com pesquisa, filtros por status de validade e por unidade, paginação e status calculado (RF 008). | Autenticado |
| GET | `/unidades/{unidadeId}/documentos` | Lista os documentos vinculados a uma unidade específica (RF 010). | Autenticado |
| GET | `/documentos/{id}` | Retorna o detalhamento de um documento. | Autenticado |
| POST | `/unidades/{unidadeId}/documentos` | Cadastra um documento vinculado à unidade (RF 009); bloqueado se a unidade estiver inativa — RF 007. | COLABORADOR |
| PUT | `/documentos/{id}` | Atualiza os dados de um documento (bloqueado se a unidade estiver inativa). | COLABORADOR |
| DELETE | `/documentos/{id}` | Remove um documento. | GESTOR |

### Recurso: Tarefas (RF 012, RF 013, RF 014, RF 015 · US 051, US 052, US 053, US 054)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/tarefas` | Lista global de todas as tarefas, com pesquisa, filtros por status e por unidade, paginação, status e prazo (RF 013). | Autenticado |
| GET | `/unidades/{unidadeId}/tarefas` | Lista as tarefas vinculadas a uma unidade, com status e prazo (RF 012). | Autenticado |
| GET | `/tarefas/{id}` | Retorna o detalhamento de uma tarefa. | Autenticado |
| POST | `/unidades/{unidadeId}/tarefas` | Cria uma nova tarefa vinculada à unidade, com status inicial "pendente" (RF 014); bloqueado se a unidade estiver inativa — RF 007. | COLABORADOR |
| PUT | `/tarefas/{id}` | Atualiza título, descrição ou prazo da tarefa. | COLABORADOR |
| PATCH | `/tarefas/{id}/status` | Altera o status da tarefa; a transição para "concluida" exige confirmação explícita (RF 015). | COLABORADOR |
| DELETE | `/tarefas/{id}` | Remove uma tarefa. | GESTOR |

### Recurso: Histórico de alterações — opcional (RF 017 · US 082)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/unidades/{id}/historico` | Lista, com paginação, quem alterou o quê e quando na unidade, em seus documentos e em suas tarefas. | Autenticado |

> Não há endpoint de escrita para o histórico: quando o RF 017 é implementado, cada escrita confirmada grava automaticamente um registro em `historico_alteracao` com o usuário do token.

---

## 4. Parâmetros — DTOs e Validação (Zod)

Nenhuma entidade de persistência é exposta diretamente: toda entrada e saída da API passa por DTOs dedicados, validados contra um schema Zod (o mesmo padrão de contrato de dados já usado no frontend, conforme RNF 003) aplicado via ValidationPipe do NestJS antes de chegar ao controller.

### 4.1 POST /unidades

| Parâmetro | Local | Tipo | Obrigatório | Validação |
|---|---|---|---|---|
| nome | body | string | Sim | 3 a 150 caracteres |
| codigo | body | string | Sim | 1 a 30 caracteres, único (`unidade.codigo`) |
| endereco | body | string | Não | até 255 caracteres |
| status | body | enum | Não | um de: "ativa", "inativa" (padrão "ativa") |

**Schema Zod**

```ts
// criar-unidade.schema.ts
import { z } from "zod";

export const CriarUnidadeSchema = z.object({
  nome: z
    .string()
    .min(3, "Nome deve ter ao menos 3 caracteres")
    .max(150, "Nome deve ter no máximo 150 caracteres"),
  codigo: z
    .string()
    .min(1, "Código é obrigatório")
    .max(30, "Código deve ter no máximo 30 caracteres"),
  endereco: z.string().max(255).optional(),
  status: z.enum(["ativa", "inativa"]).default("ativa"),
});

export type CriarUnidadeRequest = z.infer<typeof CriarUnidadeSchema>;
```

Código já existente em outra unidade resulta em 409 Conflict. O `PUT /unidades/{id}` reaproveita este schema (RF 005).

### 4.2 PATCH /unidades/{id}/status

| Parâmetro | Local | Tipo | Obrigatório | Validação |
|---|---|---|---|---|
| id | path | UUID | Sim | deve existir em `unidade.id` |
| status | body | enum | Sim | um de: "ativa", "inativa" |

**Schema Zod**

```ts
// atualizar-status-unidade.schema.ts
import { z } from "zod";

export const AtualizarStatusUnidadeSchema = z.object({
  status: z.enum(["ativa", "inativa"], {
    errorMap: () => ({ message: "Status deve ser \"ativa\" ou \"inativa\"" }),
  }),
});

export type AtualizarStatusUnidadeRequest =
  z.infer<typeof AtualizarStatusUnidadeSchema>;
```

### 4.3 POST /unidades/{unidadeId}/documentos

| Parâmetro | Local | Tipo | Obrigatório | Validação |
|---|---|---|---|---|
| unidadeId | path | UUID | Sim | deve existir e estar com status "ativa" (RF 007) |
| nome | body | string | Sim | 1 a 150 caracteres |
| tipo | body | string | Não | até 60 caracteres (ex.: Licença Ambiental, Registro na ANTT, Seguro de Carga) |
| dataValidade | body | date (ISO) | Sim | formato YYYY-MM-DD |

A verificação de que a unidade referenciada por `unidadeId` está ativa (RF 007) é feita pelo service antes da persistência; unidade inativa resulta em 409 Conflict (ver seção 5). O status de validade não é um campo de entrada: qualquer tentativa de enviar `statusValidade` resulta em 400 (RF 011, RNF 007).

**Schema Zod**

```ts
// criar-documento.schema.ts
import { z } from "zod";

export const CriarDocumentoSchema = z
  .object({
    nome: z.string().min(1, "Nome é obrigatório").max(150),
    tipo: z.string().max(60).optional(),
    dataValidade: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de validade deve estar no formato YYYY-MM-DD"),
  })
  // statusValidade nunca é aceito na escrita: é sempre calculado pela API
  .strict();

export type CriarDocumentoRequest = z.infer<typeof CriarDocumentoSchema>;
```

### 4.4 POST /unidades/{unidadeId}/tarefas

| Parâmetro | Local | Tipo | Obrigatório | Validação |
|---|---|---|---|---|
| unidadeId | path | UUID | Sim | deve existir e estar com status "ativa" (RF 007) |
| titulo | body | string | Sim | 1 a 150 caracteres |
| descricao | body | string | Não | texto livre |
| prazo | body | date (ISO) | Sim | formato YYYY-MM-DD |

O status inicial da tarefa é sempre "pendente" (RF 014) e não é aceito no corpo da requisição; alterações de status seguem o endpoint da seção 4.5.

**Schema Zod**

```ts
// criar-tarefa.schema.ts
import { z } from "zod";

export const CriarTarefaSchema = z
  .object({
    titulo: z.string().min(1, "Título é obrigatório").max(150),
    descricao: z.string().optional(),
    prazo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Prazo é obrigatório e deve estar no formato YYYY-MM-DD"),
  })
  // o status inicial é sempre "pendente" (RF 014)
  .strict();

export type CriarTarefaRequest = z.infer<typeof CriarTarefaSchema>;
```

### 4.5 PATCH /tarefas/{id}/status

| Parâmetro | Local | Tipo | Obrigatório | Validação |
|---|---|---|---|---|
| id | path | UUID | Sim | deve existir em `tarefa.id` |
| status | body | enum | Sim | um de: "pendente", "em_andamento", "concluida" |
| confirmacao | body | boolean | Condicional | obrigatório e deve ser `true` quando status = "concluida" (RF 015 / US 052) |

Este schema reproduz no backend a mesma regra de confirmação explícita já exigida na UI (modal de confirmação da US 052), evitando que uma tarefa seja concluída por engano mesmo por clientes que não passem pela tela de confirmação.

**Schema Zod**

```ts
// atualizar-status-tarefa.schema.ts
import { z } from "zod";

export const AtualizarStatusTarefaSchema = z
  .object({
    status: z.enum(["pendente", "em_andamento", "concluida"]),
    confirmacao: z.boolean().optional(),
  })
  .refine(
    (data) => data.status !== "concluida" || data.confirmacao === true,
    {
      message:
        "A confirmação explícita (confirmacao: true) é obrigatória para concluir a tarefa",
      path: ["confirmacao"],
    }
  );

export type AtualizarStatusTarefaRequest =
  z.infer<typeof AtualizarStatusTarefaSchema>;
```

### 4.6 GET — listagens (unidades, documentos e tarefas)

| Parâmetro | Local | Tipo | Obrigatório | Validação |
|---|---|---|---|---|
| page | query | integer | Não | maior ou igual a 0 (padrão 0) |
| size | query | integer | Não | 1 a 100 (padrão 20) |
| q | query | string | Não | pesquisa textual: nome/código (unidades), nome/tipo (documentos), título (tarefas) |
| status | query | enum | Não | em `/unidades`: "ativa" ou "inativa"; em `/tarefas` e `/unidades/{unidadeId}/tarefas`: "pendente", "em_andamento" ou "concluida" |
| statusValidade | query | enum | Não | em `/documentos` e `/unidades/{unidadeId}/documentos`: "valido", "proximo_vencimento" ou "expirado" (RF 008) |
| unidadeId | query | UUID | Não | em `/documentos` e `/tarefas`: filtra por unidade (RF 008, RF 013) |

**Schema Zod**

```ts
// listar-query.schema.ts
import { z } from "zod";

export const PaginacaoSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(150).optional(),
});

export const ListarUnidadesQuerySchema = PaginacaoSchema.extend({
  status: z.enum(["ativa", "inativa"]).optional(),
});

export const ListarDocumentosQuerySchema = PaginacaoSchema.extend({
  statusValidade: z.enum(["valido", "proximo_vencimento", "expirado"]).optional(),
  unidadeId: z.string().uuid().optional(),
});

export const ListarTarefasQuerySchema = PaginacaoSchema.extend({
  status: z.enum(["pendente", "em_andamento", "concluida"]).optional(),
  unidadeId: z.string().uuid().optional(),
});
```

*(O mesmo padrão — parâmetro + tabela + schema Zod — se aplica aos demais endpoints de atualização (PUT) listados na seção 3, reaproveitando os campos opcionais dos schemas de criação correspondentes via `.partial()`.)*

---

## 5. Respostas — Status Codes, JSON e Erros Padronizados

### Códigos HTTP utilizados

| Código | Quando é usado |
|---|---|
| 200 OK | Consulta (GET) ou atualização (PUT/PATCH) bem-sucedida. |
| 201 Created | Criação de recurso (POST) bem-sucedida — ex.: nova unidade, documento ou tarefa. |
| 204 No Content | Exclusão (DELETE) bem-sucedida, sem corpo de resposta. |
| 400 Bad Request | Erro de validação Zod dos dados de entrada ou parâmetro inválido (inclusive campos derivados, como `statusValidade`, enviados em escrita). |
| 401 Unauthorized | Token ausente, expirado ou inválido. |
| 403 Forbidden | Usuário autenticado, mas sem o papel exigido pelo endpoint (ex.: colaborador tentando excluir uma unidade). |
| 404 Not Found | Recurso não encontrado (ex.: unidade, documento ou tarefa com id inexistente). |
| 409 Conflict | Conflito de regra de negócio — ex.: código de unidade duplicado, tentativa de cadastrar documento/tarefa em unidade inativa (RF 007) ou de excluir unidade com pendências (RF 016). |
| 500 Internal Server Error | Erro inesperado no servidor (o frontend exibe mensagem com opção de tentar novamente — RNF 009). |

### Envelope de sucesso — recurso único

**Exemplo — `GET /unidades/{id}` → 200 OK**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "nome": "Pátio Recife",
  "codigo": "PAT-REC",
  "endereco": "Av. Norte, 1200 - Recife/PE",
  "status": "ativa",
  "createdAt": "2026-01-10T09:00:00-03:00",
  "updatedAt": "2026-08-15T11:20:00-03:00"
}
```

**Exemplo — `GET /documentos/{id}` → 200 OK**

```json
{
  "id": "7c1a2b3d-4e5f-4a6b-8c9d-0e1f2a3b4c5d",
  "unidadeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "nome": "Licença Ambiental - Pátio Recife",
  "tipo": "Licença Ambiental",
  "dataValidade": "2026-10-05",
  "statusValidade": "proximo_vencimento",
  "createdAt": "2026-02-01T10:00:00-03:00",
  "updatedAt": "2026-02-01T10:00:00-03:00"
}
```

O campo `statusValidade` nunca é persistido nem aceito em requisições de escrita: é calculado pela API a cada leitura a partir de `dataValidade`, seguindo a mesma regra do RF 011 (valido / proximo_vencimento / expirado conforme os 15 dias de referência).

### Envelope de sucesso — listagem paginada

**Exemplo — `GET /unidades?page=0&size=20` → 200 OK**

```json
{
  "content": [
    { "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "nome": "Pátio Recife",
      "codigo": "PAT-REC", "status": "ativa" },
    { "id": "9b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e", "nome": "Filial Curitiba",
      "codigo": "FIL-CWB", "status": "inativa" }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 2,
  "totalPages": 1,
  "last": true
}
```

As listagens de documentos e de tarefas (globais e por unidade) usam o mesmo envelope; cada item de documento inclui o `statusValidade` calculado.

### Envelope de sucesso — indicadores do Dashboard

**Exemplo — `GET /dashboard/indicadores` → 200 OK**

```json
{
  "totalUnidades": 12,
  "totalDocumentos": 47,
  "totalTarefasPendentes": 9,
  "totalPendencias": 21
}
```

`totalPendencias` soma os documentos com status `proximo_vencimento` ou `expirado` e as tarefas com status `pendente` ou `em_andamento` (RF 002). No exemplo: 8 documentos + 13 tarefas.

### Envelope de sucesso — histórico de alterações (opcional)

**Exemplo — `GET /unidades/{id}/historico?page=0&size=20` → 200 OK**

```json
{
  "content": [
    { "id": "5d6e7f80-9a1b-4c2d-8e3f-4a5b6c7d8e9f",
      "usuarioId": "9f1c2e30-7b3a-4b7a-9c1e-2b3a4c5d6e7f",
      "usuarioNome": "Maria Souza",
      "entidade": "tarefa",
      "entidadeId": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
      "acao": "edicao",
      "descricao": "Status alterado de em_andamento para concluida",
      "createdAt": "2026-09-29T10:15:00-03:00" }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

### Formato de erro global

Todos os erros da API seguem um formato único, produzido centralmente por um Exception Filter global (`@Catch()` no NestJS). Isso evita tratamento inconsistente entre controllers.

**ApiErrorResponse (contrato)**

```ts
// api-error-response.interface.ts
export interface CampoInvalido {
  campo: string;
  mensagem: string;
}

export interface ApiErrorResponse {
  timestamp: string;   // ISO-8601
  status: number;
  error: string;       // ex.: "BAD_REQUEST", "NOT_FOUND"
  message: string;
  path: string;
  erros: CampoInvalido[];
}
```

**GlobalExceptionFilter.ts** (ajuste os tipos de exceção ao seu domínio)

```ts
// global-exception.filter.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.resolveStatus(exception); // 400 / 401 / 403 / 404 / 409 / 500
    const body: ApiErrorResponse = {
      timestamp: new Date().toISOString(),
      status,
      error: this.resolveErrorCode(status),
      message: this.resolveMessage(exception),
      path: request.url,
      erros: this.resolveFieldErrors(exception), // preenchido em erros de validação Zod
    };
    response.status(status).json(body);
  }
}
```

### Exemplos de resposta de erro

**400 Bad Request — falha de validação Zod**

```json
{
  "timestamp": "2026-09-29T15:10:42-03:00",
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Um ou mais campos são inválidos",
  "path": "/api/v1/unidades",
  "erros": [
    { "campo": "codigo", "mensagem": "Código é obrigatório" }
  ]
}
```

**409 Conflict — cadastro de documento em unidade inativa (RF 007)**

```json
{
  "timestamp": "2026-09-29T15:12:05-03:00",
  "status": 409,
  "error": "CONFLICT",
  "message": "Não é possível cadastrar documentos em uma unidade inativa",
  "path": "/api/v1/unidades/3fa85f64-5717-4562-b3fc-2c963f66afa6/documentos",
  "erros": []
}
```

**409 Conflict — exclusão de unidade com pendências (RF 016, opcional)**

```json
{
  "timestamp": "2026-09-29T15:20:31-03:00",
  "status": 409,
  "error": "CONFLICT",
  "message": "Unidade possui documentos pendentes ou tarefas em andamento e não pode ser excluída",
  "path": "/api/v1/unidades/3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "erros": []
}
```

401 / 403 / 404 seguem o mesmo formato, com `"erros": []` e a mensagem apropriada ao caso ("Token ausente ou inválido", "Sem permissão para a ação", "Unidade não encontrada", etc.).

---

## Histórico de Alterações

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 22/09/2026 | 1.0 | Criação inicial do documento de Design de API. | Equipe do projeto |
| 29/09/2026 | 1.1 | Contrato alinhado à Análise de Requisitos v1.1: numeração de RF e US atualizada e ambientação na FrotaSync; novos endpoints GET /tarefas (RF 013) e GET /unidades/{id}/historico (RF 017, opcional); total de pendências no Dashboard (RF 002); status e prazo nos cadastros de unidade e tarefa (RF 005, RF 014); pesquisa e filtros das listagens (RF 004, RF 008, RF 013); bloqueio de exclusão de unidade com pendências (RF 016); exemplos corrigidos. | Equipe do projeto |

# Design de API

**FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas**

- **Versão do documento:** 1.2 | **Data:** 05/10/2026
- Documento complementar à Análise de Requisitos (v1.2), às Estórias de Usuário e Backlog (v1.2) e à Modelagem de Dados (v1.2)

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
| Banco de dados | PostgreSQL (ver Modelagem de Dados v1.2) |
| Segurança | JWT (Passport JWT Strategy) + bcrypt para hash de senha |
| Validação | Zod (schemas aplicados via ValidationPipe sobre os DTOs) |
| Documentação interativa | Swagger / OpenAPI (gerado a partir dos schemas Zod/NestJS) |

### O que mudou na versão 1.2

- **Novos endpoints:** `POST /auth/cadastro` (RF 019); `POST /auth/recuperar-senha`, `POST /auth/verificar-codigo` e `POST /auth/redefinir-senha` (RF 020); `GET /unidades/{id}/indicadores` (RF 006, RF 024); `GET /enderecos/cep/{cep}` (RF 005); `GET /documentos/{id}/anexo` (RF 009).
- **Contratos alterados:** login com `lembrar`; unidade com endereço estruturado (CEP, logradouro, número, complemento, bairro, cidade e UF) e descrição, sem `status` na criação (RF 005, RF 021); documento com `categoria`, `dataEmissao`, `descricao` e anexo, enviados como `multipart/form-data` (RF 009, RF 022); tarefa com `dataInicio` e `dataConclusao` (RF 014, RF 015); Dashboard com distribuição por status e variação em relação ao período anterior (RF 002, RF 024); listagens com filtro por `categoria` e totais de documentos e tarefas por unidade (RF 004, RF 008).
- **Regras novas:** dados filtrados pela empresa do usuário (claim `empresaId` do token); edição e mudança de status em unidade inativa respondem 409 (RF 007); códigos HTTP 202, 413, 415 e 429.
- **Perfil do cadastro:** quem cadastra a empresa recebe o papel ADMINISTRADOR (decisão assumida, Análise de Requisitos v1.2, Apêndice B, item B8).

---

## 1. Contexto, Propósito e Público-Alvo

### Contexto

A API descrita neste documento expõe as entidades definidas na Modelagem de Dados (Usuário, Unidade, Documento e Tarefa e, no escopo opcional, o Histórico de alteração) e implementa as regras de negócio levantadas na Análise de Requisitos (RF 001 a RF 017, RF 019 a RF 024, RNF 004, RNF 020 e RNF 021) e detalhadas nas Estórias de Usuário do Backlog priorizado (US 011 a US 087). Os RF 018 (tema claro/escuro) e RF 025 (navegação e estrutura das telas) são exclusivamente de interface e não geram endpoints. A API é a camada que, em uma evolução futura do projeto, substituiria a massa de dados mockados hoje consumida via TanStack Query, mantendo os mesmos contratos de dados (hoje documentados em Zod no frontend) como base para os DTOs de requisição e resposta.

### Propósito

A API deve permitir que cada perfil de usuário (colaborador, gestor ou administrador) realize, de forma autenticada e com autorização por perfil (role-based access control), as operações de consulta e gestão sobre unidades, documentos e tarefas — sempre com validação consistente de entrada (Zod) e cálculo automático e centralizado de status derivados (status de validade do documento e indicadores do Dashboard, inclusive o total de pendências), nunca delegando esse cálculo ao cliente. Na fase atual, o mesmo cálculo é feito no frontend (RF 011, RNF 007), seguindo exatamente a regra descrita neste contrato.

### Público-alvo da API

- **Colaborador(a):** consome a listagem e o detalhamento de unidades, as listas de documentos e tarefas (por unidade e globais), realiza o cadastro de novos documentos e tarefas em unidades ativas, a edição de documentos e tarefas e a alteração de status de tarefas (US 031, US 032, US 042, US 044, US 045, US 051, US 052, US 054, US 055).
- **Gestor(a):** consome principalmente o Dashboard de indicadores e as listas globais de documentos e de tarefas, para apoiar decisões sobre prioridades e pendências (US 021, US 022, US 023, US 041, US 053).
- **Administrador(a):** consome os mesmos endpoints de consulta, além do cadastro e edição de unidades (US 034), da ativação/inativação de unidades (US 035) e das regras de bloqueio de novos registros e edições em unidades inativas (US 033); no escopo opcional, da exclusão com bloqueio por pendências (US 081) e do histórico de alterações (US 082).
- **Novo(a) usuário(a) (não autenticado):** usa apenas os endpoints públicos de cadastro de usuário e empresa e de recuperação de senha (US 013, US 014).
- **Aplicação frontend (Next.js/React):** cliente único e oficial da API nesta fase do projeto, consumindo todos os recursos autenticados via TanStack Query.

### Convenções gerais

- **URL base:** `https://api.gestaodeunidades.com.br/api/v1` — rotas versionadas com prefixo `/v1`.
- **Formato:** requisições e respostas em JSON (`Content-Type: application/json`).
- **Datas:** ISO-8601 com fuso horário para timestamps de auditoria (ex.: `2026-09-29T14:30:00-03:00`) e data pura (`YYYY-MM-DD`) para `data_validade` e `prazo`, conforme a Modelagem de Dados.
- **Identificadores:** UUID (gerado com `gen_random_uuid()`) como identificador público de todos os recursos (usuario, unidade, documento, tarefa, historico_alteracao).
- **Paginação:** listas usam os parâmetros de query `page` (0-based) e `size`, retornando o envelope de página descrito na seção 5 — mesmo padrão de paginação já utilizado no frontend com TanStack Table.
- **Pesquisa e filtros:** as listagens aceitam o parâmetro `q` (pesquisa textual) e filtros por status e por unidade, conforme detalhado na seção 4.6 (RF 004, RF 008 e RF 013).
- **Mocks e evolução:** enquanto não há backend, a camada de dados mockados (RNF 008) — opcionalmente servida por Route Handlers ou MSW com latência e erros simulados (RNF 017) — deve seguir este contrato de rotas, DTOs e erros, permitindo a troca futura por uma API real.
- **Escopo por empresa:** todos os recursos autenticados são filtrados pela empresa do usuário (claim `empresaId` do token). Um recurso de outra empresa responde 404.
- **Upload de arquivos:** endpoints com arquivo usam `multipart/form-data`. Sugestão: PDF, JPG ou PNG de até 10 MB (413 e 415 quando excedido ou não aceito).
- **Tamanho de página:** o padrão da API é 20; o frontend usa `size=12` na grade de unidades e `size=10` nas tabelas de documentos e tarefas.
- **Documentos de identificação e endereço:** CPF, CNPJ, CEP e telefone trafegam somente com dígitos, sem máscara (RNF 020).

---

## 2. Autenticação

A autenticação é feita via JWT (JSON Web Token), emitido pela própria API e validado a cada requisição por um Guard do NestJS (estratégia stateless — a API não mantém sessão em servidor). O perfil do usuário (`usuario.papel`: colaborador, gestor ou administrador) é embutido no payload do token, junto com o `empresaId`, e usado pelas regras de autorização e pelo filtro por empresa em cada endpoint (ver coluna "Autenticação" na seção 3). No frontend, uma resposta 401 em rota protegida leva ao redirecionamento imediato para `/login` (RNF 004).

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
| refreshToken | 7 dias (30 dias quando o login é feito com `lembrar: true`, valor sugerido) | Usado exclusivamente em `POST /auth/refresh` para obter um novo accessToken. |

### Login social / OAuth2 (extensão opcional)

Não há requisito funcional para login social nas Estórias de Usuário atuais (US 011 exige apenas e-mail e senha). Caso venha a ser adotado no futuro, o login social se encaixaria no mesmo fluxo de emissão de tokens (accessToken/refreshToken JWT), apenas substituindo a etapa de validação de credenciais por um provider OAuth2 (ex.: Google), sem alterar os contratos dos demais endpoints.

### Exemplo de requisição de login

`POST /api/v1/auth/login`

```jsonc
// Requisição
{
  "email": "colaborador@frotasync.com.br",
  "senha": "SenhaForte123!",
  "lembrar": false
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

### Fluxo de cadastro (RF 019)

1. O frontend valida cada uma das 3 etapas (dados pessoais, dados da empresa e dados de login) e, ao finalizar, envia tudo em uma única requisição `POST /api/v1/auth/cadastro`.
2. A API valida o corpo (Zod) e confere a unicidade de e-mail, CPF e CNPJ (409 em caso de conflito).
3. Em uma única transação, grava a empresa e o usuário, guarda a senha com bcrypt e registra `aceite_termos_em`.
4. O usuário criado recebe o papel ADMINISTRADOR da nova empresa.
5. A resposta é 201 com os dados básicos, sem tokens; o frontend leva o usuário ao login.

### Fluxo de recuperação de senha (RF 020)

1. `POST /auth/recuperar-senha` com o e-mail: se o usuário existir, a API gera um código de 5 dígitos, grava seu hash em `codigo_verificacao` (validade sugerida de 10 minutos), invalida os códigos anteriores não usados e envia o código por e-mail. A resposta é sempre 202 com a mesma mensagem, para não revelar se o e-mail existe. Chamar o endpoint novamente reenvia o código ("Enviar novo código"), com limite de frequência (429).
2. `POST /auth/verificar-codigo` com e-mail e código: a API confere o hash, a validade e o número de tentativas (limite sugerido de 5; ao atingi-lo o código é invalidado, 429). Sucesso: 200 com um `resetToken` de uso único e curta duração.
3. `POST /auth/redefinir-senha` com `resetToken`, nova senha e confirmação: a API atualiza `senha_hash`, marca o código como usado, invalida os refresh tokens do usuário e responde 204.

Como o código tem apenas 5 dígitos (100 mil combinações), o limite de tentativas e a validade curta são essenciais para a segurança do fluxo (RNF 004, RNF 021).

---

## 3. Lista de Endpoints

Todas as rotas abaixo usam o prefixo `/api/v1`. A coluna "Autenticação" indica o perfil mínimo exigido ("Público" significa que não exige token; "Autenticado" aceita qualquer papel logado; papéis específicos — COLABORADOR, GESTOR, ADMINISTRADOR — indicam o mínimo exigido, sendo que GESTOR e ADMINISTRADOR também herdam os acessos de COLABORADOR).

### Recurso: Autenticação (RF 001, RF 019, RF 020 · RNF 004 · US 011 a US 014)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| POST | `/auth/login` | Autentica o usuário por e-mail e senha (com a opção `lembrar`) e retorna os tokens JWT. | Público |
| POST | `/auth/refresh` | Gera um novo accessToken a partir de um refreshToken válido. | Público* |
| POST | `/auth/logout` | Invalida o refreshToken atual do usuário. | Autenticado |
| POST | `/auth/cadastro` | Cria a empresa e o usuário administrador a partir dos dados das 3 etapas do cadastro (RF 019). | Público |
| POST | `/auth/recuperar-senha` | Solicita (ou reenvia) o código de 5 dígitos por e-mail; responde sempre 202 (RF 020). | Público |
| POST | `/auth/verificar-codigo` | Valida o código recebido e retorna um `resetToken` de uso único (RF 020). | Público |
| POST | `/auth/redefinir-senha` | Define a nova senha usando o `resetToken` (RF 020). | Público |

\* `/auth/refresh` não exige accessToken, mas exige um refreshToken válido enviado no corpo da requisição.

### Recurso: Dashboard (RF 002, RF 003, RF 024 · US 021, US 022, US 023)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/dashboard/indicadores` | Retorna os totais gerais (unidades, documentos, tarefas pendentes e total de pendências), a distribuição por status dos gráficos de rosca e a variação em relação ao período anterior. | Autenticado |

> Após qualquer escrita confirmada (POST, PUT, PATCH ou DELETE) em unidades, documentos ou tarefas, o frontend invalida o cache desta consulta (TanStack Query) para atualizar os indicadores e o total de pendências sem recarregar a página (RF 003).

### Recurso: Unidades (RF 004 a RF 007, RF 016, RF 021, RF 024 · US 031 a US 035, US 081)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/unidades` | Lista unidades com paginação, pesquisa por nome/código e filtro por status (RF 004). Cada item traz o total de documentos e de tarefas da unidade. | Autenticado |
| GET | `/unidades/{id}` | Retorna o detalhamento de uma unidade (dados cadastrais, endereço estruturado, status e datas). | Autenticado |
| GET | `/unidades/{id}/indicadores` | Retorna a distribuição por status de documentos e tarefas da unidade e a variação em relação ao período anterior (RF 006, RF 024). | Autenticado |
| POST | `/unidades` | Cadastra uma nova unidade — nome, código, endereço estruturado e descrição; a unidade nasce ativa (RF 005). | ADMINISTRADOR |
| PUT | `/unidades/{id}` | Atualiza os dados cadastrais de uma unidade (RF 005). O status é alterado apenas pelo PATCH. | ADMINISTRADOR |
| PATCH | `/unidades/{id}/status` | Ativa ou inativa uma unidade (RF 021, RF 007). | ADMINISTRADOR |
| DELETE | `/unidades/{id}` | Remove definitivamente uma unidade (uso excepcional — ver seção 6 da Modelagem de Dados). Opcional (RF 016): bloqueada com 409 se houver documentos próximos do vencimento/expirados ou tarefas em andamento. | ADMINISTRADOR |

### Recurso: Endereços — apoio ao cadastro de unidade (RF 005)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/enderecos/cep/{cep}` | Consulta um CEP e retorna logradouro, bairro, cidade e UF, usados pelo botão "Buscar CEP". Responde 404 se o CEP não for encontrado. | Autenticado |

> Na fase atual a consulta é simulada na camada de mock. Em uma evolução, o backend consultaria um serviço público de CEP, sem expor essa dependência ao frontend.

### Recurso: Documentos (RF 008 a RF 011, RF 022 · US 041 a US 045)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/documentos` | Lista global de todos os documentos, com pesquisa, filtros por unidade, categoria e status de validade, paginação e status calculado (RF 008). | Autenticado |
| GET | `/unidades/{unidadeId}/documentos` | Lista os documentos vinculados a uma unidade específica, com pesquisa e filtros por categoria e status de validade (RF 010). | Autenticado |
| GET | `/documentos/{id}` | Retorna o detalhamento de um documento, incluindo descrição e dados do anexo. | Autenticado |
| GET | `/documentos/{id}/anexo` | Baixa o arquivo anexado ao documento. | Autenticado |
| POST | `/unidades/{unidadeId}/documentos` | Cadastra um documento vinculado à unidade, em `multipart/form-data`, com anexo obrigatório (RF 009); bloqueado se a unidade estiver inativa — RF 007. | COLABORADOR |
| PUT | `/documentos/{id}` | Atualiza os dados de um documento (RF 022), em `multipart/form-data`; o anexo só é substituído se um novo arquivo for enviado; bloqueado se a unidade estiver inativa. | COLABORADOR |
| DELETE | `/documentos/{id}` | Remove um documento. | GESTOR |

### Recurso: Tarefas (RF 012 a RF 015, RF 023 · US 051 a US 055)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/tarefas` | Lista global de todas as tarefas, com pesquisa, filtros por unidade e status, paginação, datas e prazo (RF 013). | Autenticado |
| GET | `/unidades/{unidadeId}/tarefas` | Lista as tarefas vinculadas a uma unidade, com datas, status e prazo (RF 012). | Autenticado |
| GET | `/tarefas/{id}` | Retorna o detalhamento de uma tarefa. | Autenticado |
| POST | `/unidades/{unidadeId}/tarefas` | Cria uma nova tarefa vinculada à unidade, com status inicial "pendente" e data de início igual à data do cadastro (RF 014); bloqueado se a unidade estiver inativa — RF 007. | COLABORADOR |
| PUT | `/tarefas/{id}` | Atualiza título, descrição ou prazo da tarefa (RF 023); bloqueado se a unidade estiver inativa. | COLABORADOR |
| PATCH | `/tarefas/{id}/status` | Altera o status da tarefa; a transição para "concluida" exige confirmação explícita e registra a data de conclusão (RF 015); bloqueado se a unidade estiver inativa. | COLABORADOR |
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
| codigo | body | string | Sim | 1 a 30 caracteres, único dentro da empresa |
| cep | body | string | Sim | 8 dígitos |
| logradouro | body | string | Sim | 1 a 150 caracteres |
| numero | body | string | Sim | 1 a 10 caracteres |
| complemento | body | string | Não | até 100 caracteres |
| bairro | body | string | Sim | 1 a 100 caracteres |
| cidade | body | string | Sim | 1 a 100 caracteres |
| uf | body | string | Sim | 2 letras maiúsculas |
| descricao | body | string | Não | texto livre |

**Schema Zod**

```ts
// criar-unidade.schema.ts
import { z } from "zod";

export const CriarUnidadeSchema = z
  .object({
    nome: z
      .string()
      .min(3, "Nome deve ter ao menos 3 caracteres")
      .max(150, "Nome deve ter no máximo 150 caracteres"),
    codigo: z
      .string()
      .min(1, "Identificador é obrigatório")
      .max(30, "Identificador deve ter no máximo 30 caracteres"),
    cep: z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos"),
    logradouro: z.string().min(1, "Logradouro é obrigatório").max(150),
    numero: z.string().min(1, "Número é obrigatório").max(10),
    complemento: z.string().max(100).optional(),
    bairro: z.string().min(1, "Bairro é obrigatório").max(100),
    cidade: z.string().min(1, "Cidade é obrigatória").max(100),
    uf: z.string().regex(/^[A-Z]{2}$/, "UF deve ter 2 letras maiúsculas"),
    descricao: z.string().optional(),
  })
  // o status não é aceito aqui: a unidade nasce "ativa" e muda pelo PATCH (RF 021)
  .strict();

export type CriarUnidadeRequest = z.infer<typeof CriarUnidadeSchema>;
```

Identificador já existente na mesma empresa resulta em 409 Conflict. O `PUT /unidades/{id}` reaproveita este schema (RF 005).

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

O corpo é enviado como `multipart/form-data`: os campos de texto abaixo mais a parte de arquivo `anexo`.

| Parâmetro | Local | Tipo | Obrigatório | Validação |
|---|---|---|---|---|
| unidadeId | path | UUID | Sim | deve existir e estar com status "ativa" (RF 007) |
| nome | body | string | Sim | 1 a 150 caracteres |
| tipo | body | string | Não | até 60 caracteres (ex.: Licença Ambiental, Registro na ANTT, Seguro de Carga) |
| categoria | body | string | Sim | 1 a 40 caracteres (ex.: Legal, Ambiental, Segurança) |
| dataEmissao | body | date (ISO) | Não | formato YYYY-MM-DD; não pode ser posterior a `dataValidade` |
| dataValidade | body | date (ISO) | Sim | formato YYYY-MM-DD |
| descricao | body | string | Não | texto livre |
| anexo | body (arquivo) | file | Sim na criação; opcional na edição | PDF, JPG ou PNG de até 10 MB (valores sugeridos); 413 se maior, 415 se o tipo não for aceito |

A verificação de que a unidade referenciada por `unidadeId` está ativa (RF 007) é feita pelo service antes da persistência; unidade inativa resulta em 409 Conflict (ver seção 5). O status de validade não é um campo de entrada: qualquer tentativa de enviar `statusValidade` resulta em 400 (RF 011, RNF 007). O arquivo é validado pelo interceptor de upload; os campos de texto, pelo schema abaixo.

**Schema Zod**

```ts
// criar-documento.schema.ts
import { z } from "zod";

const dataIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD");

export const DocumentoBaseSchema = z
  .object({
    nome: z.string().min(1, "Nome é obrigatório").max(150),
    tipo: z.string().max(60).optional(),
    categoria: z.string().min(1, "Categoria é obrigatória").max(40),
    dataEmissao: dataIso.optional(),
    dataValidade: dataIso,
    descricao: z.string().optional(),
  })
  // statusValidade nunca é aceito na escrita: é sempre calculado pela API
  .strict();

const emissaoAteValidade = (d: { dataEmissao?: string; dataValidade?: string }) =>
  !d.dataEmissao || !d.dataValidade || d.dataEmissao <= d.dataValidade;

export const CriarDocumentoSchema = DocumentoBaseSchema.refine(emissaoAteValidade, {
  message: "A data de emissão não pode ser posterior à data de validade",
  path: ["dataEmissao"],
});

// PUT /documentos/{id} (RF 022): campos opcionais, mesma regra de datas
export const AtualizarDocumentoSchema = DocumentoBaseSchema.partial().refine(emissaoAteValidade, {
  message: "A data de emissão não pode ser posterior à data de validade",
  path: ["dataEmissao"],
});

export type CriarDocumentoRequest = z.infer<typeof CriarDocumentoSchema>;
```

### 4.4 POST /unidades/{unidadeId}/tarefas

| Parâmetro | Local | Tipo | Obrigatório | Validação |
|---|---|---|---|---|
| unidadeId | path | UUID | Sim | deve existir e estar com status "ativa" (RF 007) |
| titulo | body | string | Sim | 1 a 150 caracteres |
| descricao | body | string | Não | texto livre |
| prazo | body | date (ISO) | Sim | formato YYYY-MM-DD |

O status inicial da tarefa é sempre "pendente" (RF 014) e não é aceito no corpo da requisição; alterações de status seguem o endpoint da seção 4.5. A data de início (`dataInicio`) também não é aceita no corpo: a API a preenche com a data do cadastro (RF 014). O `PUT /tarefas/{id}` (RF 023) reaproveita este schema com `.partial()`.

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

Este schema reproduz no backend a mesma regra de confirmação explícita já exigida na UI (modal de confirmação da US 052), evitando que uma tarefa seja concluída por engano mesmo por clientes que não passem pela tela de confirmação. Se a unidade da tarefa estiver inativa, a API responde 409 (RF 007). Ao concluir, a API registra `dataConclusao`; ao sair de "concluida", limpa o campo (RF 015).

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
| size | query | integer | Não | 1 a 100 (padrão 20; o frontend usa 12 na grade de unidades e 10 nas tabelas) |
| q | query | string | Não | pesquisa textual: nome/código (unidades), nome/tipo (documentos), título (tarefas) |
| status | query | enum | Não | em `/unidades`: "ativa" ou "inativa"; em `/tarefas` e `/unidades/{unidadeId}/tarefas`: "pendente", "em_andamento" ou "concluida" |
| statusValidade | query | enum | Não | em `/documentos` e `/unidades/{unidadeId}/documentos`: "valido", "proximo_vencimento" ou "expirado" (RF 008) |
| categoria | query | string | Não | em `/documentos` e `/unidades/{unidadeId}/documentos`: filtra por categoria (RF 008, RF 010) |
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
  categoria: z.string().trim().max(40).optional(),
  unidadeId: z.string().uuid().optional(),
});

export const ListarTarefasQuerySchema = PaginacaoSchema.extend({
  status: z.enum(["pendente", "em_andamento", "concluida"]).optional(),
  unidadeId: z.string().uuid().optional(),
});
```

*(O mesmo padrão — parâmetro + tabela + schema Zod — se aplica aos demais endpoints de atualização (PUT) listados na seção 3, reaproveitando os campos opcionais dos schemas de criação correspondentes via `.partial()`.)*

### 4.7 POST /auth/cadastro

Os dados das 3 etapas do cadastro são enviados juntos, agrupados por etapa.

| Parâmetro | Local | Tipo | Obrigatório | Validação |
|---|---|---|---|---|
| pessoais.nome | body | string | Sim | 3 a 150 caracteres |
| pessoais.cpf | body | string | Sim | 11 dígitos, com dígitos verificadores válidos; único |
| pessoais.telefone | body | string | Sim | 10 ou 11 dígitos (DDD + número) |
| pessoais.cargo | body | string | Sim | 2 a 100 caracteres |
| empresa.nomeFantasia | body | string | Sim | 1 a 150 caracteres |
| empresa.razaoSocial | body | string | Sim | 1 a 200 caracteres |
| empresa.cnpj | body | string | Sim | 14 dígitos, com dígitos verificadores válidos; único |
| empresa.segmento | body | string | Sim | 1 a 100 caracteres |
| empresa.tipoUnidade | body | enum | Sim | "matriz" ou "filial" |
| empresa.endereco | body | string | Sim | 1 a 255 caracteres |
| login.email | body | string | Sim | e-mail válido, até 180 caracteres; único |
| login.senha | body | string | Sim | 8 a 72 caracteres |
| login.confirmacaoSenha | body | string | Sim | igual a `senha` |
| login.aceiteTermos | body | boolean | Sim | deve ser `true` |

**Schema Zod**

```ts
// cadastro.schema.ts
import { z } from "zod";
import { cpfValido, cnpjValido } from "./validadores"; // dígitos verificadores (RNF 020)

export const CadastroSchema = z
  .object({
    pessoais: z.object({
      nome: z.string().min(3).max(150),
      cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos").refine(cpfValido, "CPF inválido"),
      telefone: z.string().regex(/^\d{10,11}$/, "Telefone deve ter DDD e 10 ou 11 dígitos"),
      cargo: z.string().min(2).max(100),
    }),
    empresa: z.object({
      nomeFantasia: z.string().min(1).max(150),
      razaoSocial: z.string().min(1).max(200),
      cnpj: z.string().regex(/^\d{14}$/, "CNPJ deve ter 14 dígitos").refine(cnpjValido, "CNPJ inválido"),
      segmento: z.string().min(1).max(100),
      tipoUnidade: z.enum(["matriz", "filial"]),
      endereco: z.string().min(1).max(255),
    }),
    login: z
      .object({
        email: z.string().email("E-mail inválido").max(180),
        senha: z.string().min(8, "A senha deve ter ao menos 8 caracteres").max(72),
        confirmacaoSenha: z.string(),
        aceiteTermos: z.literal(true, {
          errorMap: () => ({ message: "É necessário aceitar os Termos de Uso e a Política de Privacidade" }),
        }),
      })
      .refine((d) => d.senha === d.confirmacaoSenha, {
        message: "As senhas não conferem",
        path: ["confirmacaoSenha"],
      }),
  })
  .strict();

export type CadastroRequest = z.infer<typeof CadastroSchema>;
```

O limite de 72 caracteres na senha respeita o limite do bcrypt. E-mail, CPF ou CNPJ já cadastrados resultam em 409 Conflict, com o campo indicado em `erros`.

### 4.8 POST /auth/login

| Parâmetro | Local | Tipo | Obrigatório | Validação |
|---|---|---|---|---|
| email | body | string | Sim | e-mail válido |
| senha | body | string | Sim | não vazia |
| lembrar | body | boolean | Não | padrão `false`; quando `true`, estende a duração do refreshToken |

```ts
// login.schema.ts
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
  lembrar: z.boolean().default(false),
});
```

### 4.9 Recuperação de senha

| Endpoint | Parâmetro | Local | Tipo | Obrigatório | Validação |
|---|---|---|---|---|---|
| POST /auth/recuperar-senha | email | body | string | Sim | e-mail válido |
| POST /auth/verificar-codigo | email | body | string | Sim | e-mail válido |
| POST /auth/verificar-codigo | codigo | body | string | Sim | exatamente 5 dígitos |
| POST /auth/redefinir-senha | resetToken | body | string | Sim | token recebido em `/auth/verificar-codigo`, de uso único |
| POST /auth/redefinir-senha | novaSenha | body | string | Sim | 8 a 72 caracteres |
| POST /auth/redefinir-senha | confirmacaoSenha | body | string | Sim | igual a `novaSenha` |

```ts
// recuperar-senha.schema.ts
import { z } from "zod";

export const SolicitarCodigoSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const VerificarCodigoSchema = z.object({
  email: z.string().email("E-mail inválido"),
  codigo: z.string().regex(/^\d{5}$/, "O código deve ter 5 dígitos"),
});

export const RedefinirSenhaSchema = z
  .object({
    resetToken: z.string().min(1),
    novaSenha: z.string().min(8, "A senha deve ter ao menos 8 caracteres").max(72),
    confirmacaoSenha: z.string(),
  })
  .refine((d) => d.novaSenha === d.confirmacaoSenha, {
    message: "As senhas não conferem",
    path: ["confirmacaoSenha"],
  });
```

Respostas: `POST /auth/recuperar-senha` devolve sempre 202 (`{ "mensagem": "Se o e-mail estiver cadastrado, enviaremos um código de verificação." }`); `POST /auth/verificar-codigo` devolve 200 com `{ "resetToken": "...", "expiresIn": 600 }`; `POST /auth/redefinir-senha` devolve 204.

### 4.10 GET /enderecos/cep/{cep}

| Parâmetro | Local | Tipo | Obrigatório | Validação |
|---|---|---|---|---|
| cep | path | string | Sim | 8 dígitos (sem máscara) |

```json
// Resposta 200 OK
{
  "cep": "50000000",
  "logradouro": "Av. Norte",
  "bairro": "Centro",
  "cidade": "Recife",
  "uf": "PE"
}
```

CEP no formato inválido resulta em 400; CEP não encontrado, em 404 ("CEP não encontrado"). O frontend usa a resposta para preencher logradouro, bairro, cidade e UF e, em caso de 404, libera o preenchimento manual.

---

## 5. Respostas — Status Codes, JSON e Erros Padronizados

### Códigos HTTP utilizados

| Código | Quando é usado |
|---|---|
| 200 OK | Consulta (GET) ou atualização (PUT/PATCH) bem-sucedida. |
| 201 Created | Criação de recurso (POST) bem-sucedida — ex.: nova unidade, documento, tarefa ou cadastro de usuário e empresa. |
| 202 Accepted | Solicitação de código de recuperação de senha: a resposta é sempre a mesma, exista ou não o e-mail (RF 020). |
| 204 No Content | Exclusão (DELETE) ou redefinição de senha bem-sucedida, sem corpo de resposta. |
| 400 Bad Request | Erro de validação Zod dos dados de entrada ou parâmetro inválido (inclusive campos derivados, como `statusValidade`, enviados em escrita) e código de verificação inválido ou expirado. |
| 401 Unauthorized | Token ausente, expirado ou inválido; credenciais de login inválidas. |
| 403 Forbidden | Usuário autenticado, mas sem o papel exigido pelo endpoint (ex.: colaborador tentando excluir uma unidade). |
| 404 Not Found | Recurso não encontrado (ex.: unidade, documento ou tarefa com id inexistente ou de outra empresa; CEP não encontrado). |
| 409 Conflict | Conflito de regra de negócio — ex.: identificador de unidade, e-mail, CPF ou CNPJ duplicados; tentativa de cadastrar ou alterar documento/tarefa em unidade inativa (RF 007); exclusão de unidade com pendências (RF 016). |
| 413 Payload Too Large | Anexo de documento acima do tamanho máximo (sugerido: 10 MB). |
| 415 Unsupported Media Type | Anexo de documento em formato não aceito. |
| 429 Too Many Requests | Excesso de reenvios ou de tentativas de verificação do código de recuperação (RF 020). |
| 500 Internal Server Error | Erro inesperado no servidor (o frontend exibe mensagem com opção de tentar novamente — RNF 009). |

### Envelope de sucesso — recurso único

**Exemplo — `GET /unidades/{id}` → 200 OK**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "nome": "Pátio Recife",
  "codigo": "PAT-REC",
  "cep": "50000000",
  "logradouro": "Av. Norte",
  "numero": "1200",
  "complemento": "Galpão 2",
  "bairro": "Centro",
  "cidade": "Recife",
  "uf": "PE",
  "endereco": "Av. Norte, 1200 - Recife/PE",
  "descricao": "Pátio principal de operação",
  "status": "ativa",
  "createdAt": "2026-01-10T09:00:00-03:00",
  "updatedAt": "2026-08-15T11:20:00-03:00"
}
```

O campo `endereco` é derivado (logradouro, número, cidade e UF), usado nos cards da listagem; não é aceito em escrita.

**Exemplo — `GET /documentos/{id}` → 200 OK**

```json
{
  "id": "7c1a2b3d-4e5f-4a6b-8c9d-0e1f2a3b4c5d",
  "unidadeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "unidadeNome": "Pátio Recife",
  "nome": "Licença Ambiental - Pátio Recife",
  "tipo": "Licença Ambiental",
  "categoria": "Ambiental",
  "dataEmissao": "2025-10-05",
  "dataValidade": "2026-10-05",
  "descricao": "Renovação anual",
  "statusValidade": "proximo_vencimento",
  "anexo": {
    "nome": "licenca-ambiental.pdf",
    "url": "/api/v1/documentos/7c1a2b3d-4e5f-4a6b-8c9d-0e1f2a3b4c5d/anexo"
  },
  "createdAt": "2026-02-01T10:00:00-03:00",
  "updatedAt": "2026-02-01T10:00:00-03:00"
}
```

O campo `statusValidade` nunca é persistido nem aceito em requisições de escrita: é calculado pela API a cada leitura a partir de `dataValidade`, seguindo a mesma regra do RF 011 (valido / proximo_vencimento / expirado conforme os 15 dias de referência).

**Exemplo — `GET /tarefas/{id}` → 200 OK**

```json
{
  "id": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
  "unidadeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "unidadeNome": "Pátio Recife",
  "titulo": "Renovar licença do pátio de Recife",
  "descricao": "Reunir a documentação e protocolar a renovação",
  "status": "concluida",
  "dataInicio": "2026-09-01",
  "prazo": "2026-10-15",
  "dataConclusao": "2026-09-29T10:15:00-03:00",
  "createdAt": "2026-09-01T08:30:00-03:00",
  "updatedAt": "2026-09-29T10:15:00-03:00"
}
```

`dataInicio` é preenchida pela API com a data do cadastro e `dataConclusao` só existe quando o status é "concluida" (nula nos demais casos).

**Exemplo — `POST /auth/cadastro` → 201 Created**

```json
{
  "empresaId": "c0a8012e-1b2c-4d3e-8f4a-5b6c7d8e9f01",
  "usuario": {
    "id": "9f1c2e30-7b3a-4b7a-9c1e-2b3a4c5d6e7f",
    "nome": "Maria Souza",
    "email": "maria@frotasync.com.br",
    "papel": "administrador"
  }
}
```

### Envelope de sucesso — listagem paginada

**Exemplo — `GET /unidades?page=0&size=12` → 200 OK**

```json
{
  "content": [
    { "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "nome": "Pátio Recife",
      "codigo": "PAT-REC", "endereco": "Av. Norte, 1200 - Recife/PE",
      "status": "ativa", "totalDocumentos": 25, "totalTarefas": 32 },
    { "id": "9b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e", "nome": "Filial Curitiba",
      "codigo": "FIL-CWB", "endereco": "Rua das Flores, 45 - Curitiba/PR",
      "status": "inativa", "totalDocumentos": 12, "totalTarefas": 8 }
  ],
  "page": 0,
  "size": 12,
  "totalElements": 2,
  "totalPages": 1,
  "last": true
}
```

As listagens de documentos e de tarefas (globais e por unidade) usam o mesmo envelope; cada item de documento inclui `unidadeNome`, `categoria`, `dataEmissao`, `dataValidade` e o `statusValidade` calculado, e cada item de tarefa inclui `unidadeNome`, `dataInicio`, `prazo`, `status` e `dataConclusao`.

### Envelope de sucesso — indicadores do Dashboard

**Exemplo — `GET /dashboard/indicadores` → 200 OK**

```json
{
  "totalUnidades": 12,
  "totalDocumentos": 47,
  "totalTarefasPendentes": 9,
  "totalPendencias": 21,
  "unidades": { "ativas": 9, "inativas": 3 },
  "documentos": { "valido": 39, "proximoVencimento": 5, "expirado": 3 },
  "tarefas": { "pendente": 9, "emAndamento": 4, "concluida": 20 },
  "variacao": {
    "referencia": "mes_anterior",
    "documentosProximosVencimento": { "atual": 5, "anterior": 4, "percentual": 25.0 },
    "documentosExpirados": { "atual": 3, "anterior": 3, "percentual": 0.0 },
    "tarefasConcluidas": { "atual": 20, "anterior": 17, "percentual": 17.6 }
  }
}
```

`totalPendencias` soma os documentos com status `proximo_vencimento` ou `expirado` e as tarefas com status `pendente` ou `em_andamento` (RF 002). No exemplo: 8 documentos + 13 tarefas. Os blocos `unidades`, `documentos` e `tarefas` alimentam os gráficos de rosca.

Em `variacao`, o valor `anterior` é recalculado para a data de referência do período anterior (sugerido: mês anterior, Análise de Requisitos v1.2, Apêndice B, item B7) e `percentual = (atual − anterior) ÷ anterior × 100`, com uma casa decimal. Quando `anterior` é 0, `percentual` é `null` e o frontend não exibe a variação (RF 024).

**Exemplo — `GET /unidades/{id}/indicadores` → 200 OK**

```json
{
  "unidadeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "documentos": { "total": 8, "valido": 6, "proximoVencimento": 1, "expirado": 1 },
  "tarefas": { "total": 8, "pendente": 2, "emAndamento": 1, "concluida": 5 },
  "variacao": {
    "referencia": "mes_anterior",
    "documentosProximosVencimento": { "atual": 1, "anterior": 1, "percentual": 0.0 },
    "documentosExpirados": { "atual": 1, "anterior": 2, "percentual": -50.0 },
    "tarefasConcluidas": { "atual": 5, "anterior": 4, "percentual": 25.0 }
  }
}
```

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

**409 Conflict — alteração de tarefa em unidade inativa (RF 007)**

```json
{
  "timestamp": "2026-10-05T09:40:12-03:00",
  "status": 409,
  "error": "CONFLICT",
  "message": "Não é possível alterar registros de uma unidade inativa",
  "path": "/api/v1/tarefas/1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d/status",
  "erros": []
}
```

**400 Bad Request — código de verificação inválido ou expirado (RF 020)**

```json
{
  "timestamp": "2026-10-05T09:45:30-03:00",
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Código inválido ou expirado",
  "path": "/api/v1/auth/verificar-codigo",
  "erros": []
}
```

**429 Too Many Requests — tentativas excedidas (RF 020)**

```json
{
  "timestamp": "2026-10-05T09:47:02-03:00",
  "status": 429,
  "error": "TOO_MANY_REQUESTS",
  "message": "Número máximo de tentativas excedido. Solicite um novo código",
  "path": "/api/v1/auth/verificar-codigo",
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
| 05/10/2026 | 1.2 | Contrato alinhado à Análise de Requisitos v1.2 e ao protótipo de telas: novos endpoints de cadastro de usuário e empresa (RF 019), recuperação de senha (RF 020), indicadores da unidade (RF 006, RF 024), consulta de CEP (RF 005) e download de anexo (RF 009); login com `lembrar`; unidade com endereço estruturado e sem `status` na criação; documento com categoria, emissão, descrição e anexo (multipart); tarefa com data de início e de conclusão; Dashboard com distribuição por status e variação; escopo por empresa; bloqueio de edições em unidade inativa; novos códigos HTTP 202, 413, 415 e 429. | Equipe do projeto |

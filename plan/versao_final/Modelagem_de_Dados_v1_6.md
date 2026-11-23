# Modelagem de Dados

**FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas**

- **Versão do documento:** 1.6
- **Data:** 21/11/2026
- Documento complementar à Análise de Requisitos (v1.4), às Estórias de Usuário e Backlog (v1.4), ao Design de API (v1.6) e ao Planejamento de Infraestrutura (v1.5)

## Equipe de desenvolvimento

| Papel | Nome |
|---|---|
| Desenvolvedor(a) | Valdir |
| Desenvolvedor(a) | Filipe |
| Desenvolvedor(a) | Gabrieli |
| Desenvolvedor(a) | Lucas Vinícius |
| Desenvolvedor(a) | Murilo |
| Desenvolvedor(a) | Niedson |
| Desenvolvedor(a) | Silas |

## Tecnologias

- Linguagem: TypeScript | Frontend: Next.js (React) | Backend: NestJS (Node.js)
- Banco de dados: PostgreSQL, implementado conforme esta modelagem (RNF-022)
- Controle de versão do esquema de banco: Flyway (única ferramenta que cria, altera e versiona o esquema)
- Acesso aos dados pelo backend: Prisma ORM (Prisma Client), sem papel na evolução do esquema
- Contrato de dados: schemas Zod e Swagger/OpenAPI (ver Design de API v1.6)
- Armazenamento de anexos: Amazon S3 privado em produção; o banco guarda apenas os metadados

> **Nota de contexto:** o banco PostgreSQL real é criado pelas migrações Flyway da seção 7 e acessado pela API NestJS. O frontend (Next.js) já está completo e usa uma camada de dados mockada (`frontend/mocks` e `frontend/services`); esta modelagem foi **conferida contra os tipos, schemas e telas desse frontend** (`types/domain.ts`, `schemas/*`, `services/*`) e ajustada onde havia divergência. Os mocks permanecem apenas como camada de transição e base do seed de desenvolvimento (US 116).

### Persistência: Flyway e Prisma ORM

**Flyway gerencia a estrutura do banco; Prisma gerencia o acesso aos dados.** As duas ferramentas têm responsabilidades complementares e não concorrem na administração do esquema.

- **PostgreSQL** é o banco relacional oficial.
- **Flyway** é a única ferramenta que cria, altera e versiona a estrutura física (tabelas, colunas, índices, constraints, relacionamentos e histórico de migrações). Toda alteração estrutural é feita por uma nova migração SQL (seção 7); as migrações V1 a V8 permanecem como estão.
- **Prisma ORM** é usado pelo backend NestJS como camada de acesso aos dados: os módulos, repositories e services utilizam o Prisma Client para operações CRUD, consultas tipadas, relacionamentos e transações.
- **Sincronização:** o modelo Prisma (`schema.prisma`) apenas **reflete** o esquema físico criado pelo Flyway. Ele é atualizado por introspecção do banco (`prisma db pull`), seguida da geração do cliente (`prisma generate`), depois que as migrações são aplicadas.
- **Restrição obrigatória:** não utilizar Prisma Migrate, `prisma migrate dev`, `prisma migrate deploy` nem `prisma db push` para modificar o esquema, nem qualquer mecanismo de sincronização automática do ORM. O Flyway é a única fonte de verdade para a evolução do esquema (RNF-022).
- **Observação sobre a introspecção:** constraints CHECK e o índice único por expressão `lower(codigo)` (V10) existem apenas no banco e não são representados no modelo Prisma; continuam garantidos pelo PostgreSQL. As consultas que usam `unaccent` (pesquisa `q`) são executadas pelo Prisma Client como consulta SQL parametrizada (`$queryRaw`). Duas consequências para a API: (1) a violação do índice `uq_unidade_empresa_codigo_ci` não chega como `P2002` com o nome do campo, então o service pré-checa a duplicidade e converte o erro 23505 do PostgreSQL em 409 (`IDENTIFICADOR_DUPLICADO`); (2) colunas `bigint` (`anexo_tamanho_bytes`) chegam como `BigInt`, que o JSON não serializa, e são convertidas para `number` no DTO.

Esta divisão não altera o modelo conceitual, lógico ou físico descrito neste documento.

Este documento apresenta a modelagem em três níveis (conceitual, lógico e físico), o diagrama entidade-relacionamento, o dicionário de dados, as regras de integridade, os scripts Flyway e o mapeamento entre banco, API e frontend.

### O que mudou na versão 1.6

- **Nenhuma alteração no modelo:** tabelas, atributos, constraints, índices e scripts V1 a V14 permanecem idênticos à v1.5.
- **Esclarecimentos sobre o acesso pelo Prisma:** o índice `lower(codigo)` não existe no modelo Prisma, então a duplicidade do identificador é conferida pelo service e o erro 23505 do PostgreSQL é convertido em 409; o `bigint` do tamanho do anexo chega como `BigInt` e é convertido para `number` na API.

### O que mudou na versão 1.5

- **Arquitetura de persistência formalizada:** adoção do Prisma ORM (Prisma Client) para o acesso aos dados pelo NestJS, mantendo o Flyway como ferramenta exclusiva de versionamento e execução das migrações SQL do PostgreSQL.
- **Nenhuma alteração no modelo de dados:** tabelas, atributos, tipos, relacionamentos, constraints, índices, regras de integridade e scripts SQL (V1 a V14) permanecem idênticos à v1.4.

### O que mudou na versão 1.4

Resultado da conferência com o frontend. O modelo continua o mesmo em sua essência; as mudanças são **incrementais, em novas migrações V9 a V14** (as migrações V1 a V8 são imutáveis e não foram alteradas).

- **Empresa com endereço estruturado (V9):** o cadastro do frontend coleta CEP, estado, cidade, bairro, logradouro e número da empresa; a coluna única `endereco` foi substituída por colunas estruturadas, iguais às da unidade.
- **Identificador da unidade sem diferenciar maiúsculas (V10):** o frontend compara identificadores ignorando caixa e acentos; a unicidade por empresa passa a ser `(empresa_id, lower(codigo))`. A extensão `unaccent` é habilitada para a pesquisa (`q`) insensível a acentos, como a do frontend.
- **Metadados do anexo (V11):** `anexo_tamanho_bytes` e `anexo_tipo` (o frontend exibe o tamanho e decide entre visualizar imagem ou PDF pelo tipo).
- **Histórico com nome da entidade (V12):** `entidade_nome`, exibido nas telas de histórico por unidade e global, e preservado mesmo que o registro seja excluído.
- **Nova tabela `refresh_token` (V13):** guarda o hash dos refresh tokens para renovação e logout (RF-027), item que a infra v1.3 apontava como faltante.
- **Token de redefinição em `codigo_verificacao` (V14):** `reset_token_hash` e `reset_expira_em`, para o token de uso único devolvido após a verificação do código (RF-020).
- **Campo `tipo` do documento mantido como reservado:** a coluna continua opcional, mas o frontend não tem esse campo no formulário; a API aceita e devolve `tipo` nulo até haver decisão de produto.
- **Dados derivados:** incluídas as notificações (calculadas, sem tabela).
- **Nova seção 8:** mapeamento banco ↔ API ↔ frontend (nomes, enums, máscaras).

### Histórico das versões anteriores

- **v1.3:** banco real criado pelas migrações V1 a V8; anexos em S3 privado; seed de desenvolvimento; pasta das migrações `db/migration/`.
- **v1.2:** entidade Empresa; novos campos de usuário, unidade, documento e tarefa; tabela de código de verificação; ações de ativação e inativação no histórico.

---

## 1. Modelagem Conceitual

### Entidades principais

| Entidade | Descrição |
|---|---|
| Empresa | Organização cliente, criada no cadastro (nome comercial, razão social, CNPJ, segmento, tipo de unidade e **endereço estruturado**). Agrupa usuários e unidades. Base do RF-019. |
| Usuário | Pessoa que acessa o sistema (e-mail/senha), com papel (colaborador, gestor ou administrador) e uma empresa. Base dos RF-001, RF-019 e RNF-004. |
| Unidade | Filial ou pátio da empresa, com endereço estruturado, cujo status (ativa/inativa) determina se recebe novos documentos e tarefas. Base dos RF-004 a RF-007 e RF-021 (e RF-016, opcional). |
| Documento | Documento vinculado a uma unidade, com categoria, anexo e data de validade; o status de validade é sempre calculado. Base dos RF-008 a RF-011, RF-022 e RF-026. |
| Tarefa | Tarefa vinculada a uma unidade, com status, data de início, prazo e data de conclusão. Base dos RF-012 a RF-015 e RF-023. |
| Código de verificação | Código de 5 dígitos enviado por e-mail para recuperar a senha, com validade, limite de tentativas e token de redefinição. Base do RF-020. |
| Refresh token | Sessão renovável do usuário, guardada como hash. Base dos RF-001 e RF-027. |
| Histórico de alteração | Registro de quem alterou o quê e quando (unidade, documento ou tarefa), exibido por unidade e globalmente. Base do RF-017. |

### Relacionamentos principais

- **Empresa (1) — (N) Usuário** e **Empresa (1) — (N) Unidade**.
- **Unidade (1) — (N) Documento** e **Unidade (1) — (N) Tarefa**.
- **Usuário (1) — (N) Código de verificação** e **Usuário (1) — (N) Refresh token**.
- **Unidade (1) — (N) Histórico de alteração** e **Usuário (1) — (N) Histórico de alteração** (autor).

Documentos e tarefas pertencem à empresa por meio da unidade. Não há relacionamentos N:N.

---

## 2. Modelagem Lógica

### EMPRESA

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| nome_fantasia | Texto | - |
| razao_social | Texto | - |
| cnpj | Texto (14 dígitos) | Único |
| segmento | Texto | - |
| tipo_unidade | Enumerado (matriz, filial) | - |
| cep | Texto (8 dígitos) | - |
| logradouro | Texto | - |
| numero | Texto | - |
| complemento | Texto | - |
| bairro | Texto | - |
| cidade | Texto | - |
| uf | Texto (2 letras) | - |
| created_at / updated_at | Data-hora | - |

### USUÁRIO

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| empresa_id | Identificador | FK -> Empresa |
| nome, cargo | Texto | - |
| cpf | Texto (11 dígitos) | Único |
| telefone | Texto (10 ou 11 dígitos) | - |
| email | Texto | Único |
| senha_hash | Texto | - |
| papel | Enumerado (colaborador, gestor, administrador) | - |
| aceite_termos_em | Data-hora | - |
| created_at / updated_at | Data-hora | - |

### UNIDADE

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| empresa_id | Identificador | FK -> Empresa |
| nome | Texto | - |
| codigo | Texto | Único por empresa (sem diferenciar caixa) |
| cep, logradouro, numero, complemento, bairro, cidade, uf | Texto | - |
| descricao | Texto | - |
| status | Enumerado (ativa, inativa) | - |
| created_at / updated_at | Data-hora | - |

### DOCUMENTO

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| unidade_id | Identificador | FK -> Unidade |
| nome | Texto | - |
| tipo | Texto (reservado, opcional) | - |
| categoria | Texto | - |
| data_emissao | Data | - |
| data_validade | Data | - |
| descricao | Texto | - |
| anexo_nome, anexo_url | Texto | - |
| anexo_tamanho_bytes | Inteiro | - |
| anexo_tipo | Texto (tipo de mídia) | - |
| created_at / updated_at | Data-hora | - |

> O status de validade (Válido / Próximo do vencimento / Expirado) **não é persistido**: é calculado pela API a partir de `data_validade` (RF-011, RNF-007).

### TAREFA

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| unidade_id | Identificador | FK -> Unidade |
| titulo, descricao | Texto | - |
| status | Enumerado (pendente, em_andamento, concluida) | - |
| data_inicio, prazo | Data | - |
| data_conclusao | Data-hora | - |
| created_at / updated_at | Data-hora | - |

### CÓDIGO DE VERIFICAÇÃO (RF-020)

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| usuario_id | Identificador | FK -> Usuário |
| codigo_hash | Texto | - |
| expira_em | Data-hora | - |
| tentativas | Inteiro | - |
| reset_token_hash | Texto | - |
| reset_expira_em | Data-hora | - |
| usado_em | Data-hora | - |
| created_at | Data-hora | - |

### REFRESH TOKEN (RF-001, RF-027)

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| usuario_id | Identificador | FK -> Usuário |
| token_hash | Texto (SHA-256, 64 hex) | Único |
| lembrar | Booleano | - |
| expira_em | Data-hora | - |
| revogado_em | Data-hora | - |
| created_at | Data-hora | - |

### HISTÓRICO DE ALTERAÇÃO (RF-017)

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| unidade_id | Identificador | FK -> Unidade |
| usuario_id | Identificador | FK -> Usuário |
| entidade | Enumerado (unidade, documento, tarefa) | - |
| entidade_id | Identificador | - |
| entidade_nome | Texto | - |
| acao | Enumerado (criacao, edicao, exclusao, ativacao, inativacao) | - |
| descricao | Texto | - |
| created_at | Data-hora | - |

Somente inserção (sem `updated_at`). `entidade_id` referencia logicamente o registro alterado; `entidade_nome` guarda o nome no momento da alteração.

### Dados derivados (não persistidos)

| Dado | Origem | Requisito |
|---|---|---|
| Status de validade do documento | `data_validade` e data atual (15 dias de referência) | RF-011, RNF-007 |
| Quantidade de documentos e tarefas por unidade | Contagem por `unidade_id` | RF-004 |
| Indicadores e gráficos de rosca (Dashboard e unidade) | Agregações por status | RF-002, RF-006 |
| Total de pendências | Documentos próximos do vencimento ou expirados + tarefas pendentes ou em andamento | RF-002 |
| Variação em relação ao mês anterior | Recálculo com data de referência anterior, usando `created_at`, `data_validade` e `data_conclusao` | RF-024 |
| **Notificações** | Documentos próximos do vencimento/expirados e tarefas pendentes ou com prazo próximo, de unidades ativas (regras na seção 5 do Design de API) | RF-025 |

> A variação é calculada sem snapshots; exclusões e tarefas reabertas não são reconstruídas para o período anterior. As notificações não têm tabela: o estado "lida" e as preferências de notificação e tema ficam no navegador (`localStorage`), como já faz o frontend.

### Cardinalidade

- Toda unidade e todo usuário têm exatamente uma empresa.
- Uma unidade inativa não pode receber novos documentos ou tarefas nem ter os existentes modificados, mas os mantém em leitura (RF-007).
- Um usuário pode ter vários códigos de verificação (apenas o mais recente e não usado é válido) e vários refresh tokens ativos (um por dispositivo).

---

## 3. Modelagem Física (PostgreSQL)

### Principais decisões de tipagem

- **Chaves primárias:** `uuid` com `gen_random_uuid()`. O frontend trata IDs como texto opaco (`string`), sem depender do formato.
- **Auditoria e eventos:** `timestamptz`, inclusive `data_conclusao`.
- **Datas de negócio** (`data_emissao`, `data_validade`, `data_inicio`, `prazo`): `date`.
- **CPF, CNPJ, CEP e telefone:** somente dígitos, sem máscara, com CHECK de formato (RNF-020). A máscara é responsabilidade do frontend. O telefone é guardado com DDD (10 ou 11 dígitos); o prefixo do país (`+55`), que o frontend pode exibir, é removido antes do envio.
- **UF:** `char(2)` maiúsculo.
- **Enumerados:** `varchar` + CHECK, em minúsculas e sem acento (`em_andamento`, `concluida`). Os rótulos exibidos ("Em andamento", "Concluída") são responsabilidade do frontend (seção 8).
- **Categoria do documento:** `varchar` sem CHECK (configurável por empresa ou ramo, RNF-016).
- **Anexo:** o arquivo fica no S3 (ou disco/MinIO em ambiente local); o banco guarda nome, chave do objeto, tamanho e tipo de mídia (PDF, JPG ou PNG, até 10 MB). O acesso é só por download autorizado pela API (RF-026, RNF-026).
- **Senha, código de verificação, refresh token e token de redefinição:** apenas como hash.
- **Pesquisa:** extensão `unaccent` para busca sem diferenciar acentos e caixa (nome/código de unidades, nome de documentos, título de tarefas, histórico).
- **Histórico:** tabela de inserção, com índices por unidade e data.

---

## 4. Diagrama Entidade-Relacionamento

Código DBML para colar em [dbdiagram.io](https://dbdiagram.io):

```dbml
Table empresa {
  id uuid [pk, default: `gen_random_uuid()`]
  nome_fantasia varchar(150) [not null]
  razao_social varchar(200) [not null]
  cnpj char(14) [not null, unique]
  segmento varchar(100) [not null]
  tipo_unidade varchar(10) [not null]
  cep char(8) [not null]
  logradouro varchar(150) [not null]
  numero varchar(10) [not null]
  complemento varchar(100)
  bairro varchar(100) [not null]
  cidade varchar(100) [not null]
  uf char(2) [not null]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table usuario {
  id uuid [pk, default: `gen_random_uuid()`]
  empresa_id uuid [ref: > empresa.id, not null]
  nome varchar(150) [not null]
  cpf char(11) [not null, unique]
  telefone varchar(11) [not null]
  cargo varchar(100) [not null]
  email varchar(180) [not null, unique]
  senha_hash varchar(255) [not null]
  papel varchar(20) [not null, default: 'colaborador']
  aceite_termos_em timestamptz [not null]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  indexes { empresa_id }
}

Table unidade {
  id uuid [pk, default: `gen_random_uuid()`]
  empresa_id uuid [ref: > empresa.id, not null]
  nome varchar(150) [not null]
  codigo varchar(30) [not null]
  cep char(8) [not null]
  logradouro varchar(150) [not null]
  numero varchar(10) [not null]
  complemento varchar(100)
  bairro varchar(100) [not null]
  cidade varchar(100) [not null]
  uf char(2) [not null]
  descricao text
  status varchar(10) [not null, default: 'ativa']
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  indexes {
    (empresa_id, `lower(codigo)`) [unique]
    status
  }
}

Table documento {
  id uuid [pk, default: `gen_random_uuid()`]
  unidade_id uuid [ref: > unidade.id, not null]
  nome varchar(150) [not null]
  tipo varchar(60)
  categoria varchar(40) [not null]
  data_emissao date
  data_validade date [not null]
  descricao text
  anexo_nome varchar(255) [not null]
  anexo_url varchar(500) [not null]
  anexo_tamanho_bytes bigint [not null]
  anexo_tipo varchar(100) [not null]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  indexes { unidade_id
    data_validade
    categoria }
}

Table tarefa {
  id uuid [pk, default: `gen_random_uuid()`]
  unidade_id uuid [ref: > unidade.id, not null]
  titulo varchar(150) [not null]
  descricao text
  status varchar(20) [not null, default: 'pendente']
  data_inicio date [not null, default: `current_date`]
  prazo date [not null]
  data_conclusao timestamptz
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  indexes { unidade_id
    status }
}

Table codigo_verificacao {
  id uuid [pk, default: `gen_random_uuid()`]
  usuario_id uuid [ref: > usuario.id, not null]
  codigo_hash varchar(255) [not null]
  expira_em timestamptz [not null]
  tentativas smallint [not null, default: 0]
  reset_token_hash char(64)
  reset_expira_em timestamptz
  usado_em timestamptz
  created_at timestamptz [not null, default: `now()`]
  indexes { (usuario_id, created_at) }
}

Table refresh_token {
  id uuid [pk, default: `gen_random_uuid()`]
  usuario_id uuid [ref: > usuario.id, not null]
  token_hash char(64) [not null, unique]
  lembrar boolean [not null, default: false]
  expira_em timestamptz [not null]
  revogado_em timestamptz
  created_at timestamptz [not null, default: `now()`]
  indexes { usuario_id }
}

Table historico_alteracao {
  id uuid [pk, default: `gen_random_uuid()`]
  unidade_id uuid [ref: > unidade.id, not null]
  usuario_id uuid [ref: > usuario.id]
  entidade varchar(20) [not null]
  entidade_id uuid [not null]
  entidade_nome varchar(150) [not null]
  acao varchar(20) [not null]
  descricao text
  created_at timestamptz [not null, default: `now()`]
  indexes { unidade_id
    created_at }
}
```

---

## 5. Dicionário de Dados

### Tabela: `empresa`

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | Identificador único (PK). |
| nome_fantasia | varchar(150) | Não | Nome comercial ou marca (campo `nomeEmpresa` no frontend e na API). |
| razao_social | varchar(200) | Não | Razão social. |
| cnpj | char(14) | Não | CNPJ só com dígitos; único. |
| segmento | varchar(100) | Não | Segmento de mercado. |
| tipo_unidade | varchar(10) | Não | matriz ou filial. |
| cep | char(8) | Não | CEP só com dígitos. |
| logradouro | varchar(150) | Não | Logradouro. |
| numero | varchar(10) | Não | Número. |
| complemento | varchar(100) | Sim | Complemento. |
| bairro | varchar(100) | Não | Bairro. |
| cidade | varchar(100) | Não | Cidade. |
| uf | char(2) | Não | Sigla do estado, maiúscula (campo `estado` no formulário de cadastro). |
| created_at, updated_at | timestamptz | Não | Criação e última atualização. |

### Tabela: `usuario`

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | PK. |
| empresa_id | uuid | Não | FK para empresa.id. |
| nome | varchar(150) | Não | Nome completo. |
| cpf | char(11) | Não | CPF só com dígitos; único. |
| telefone | varchar(11) | Não | DDD + número, só dígitos. |
| cargo | varchar(100) | Não | Cargo ou função. |
| email | varchar(180) | Não | E-mail de login, único (guardado em minúsculas). |
| senha_hash | varchar(255) | Não | Hash bcrypt da senha. |
| papel | varchar(20) | Não | colaborador, gestor ou administrador (exposto como `perfil` na API). |
| aceite_termos_em | timestamptz | Não | Aceite dos Termos de Uso e da Política de Privacidade (RNF-021). |
| created_at, updated_at | timestamptz | Não | Auditoria. |

### Tabela: `unidade`

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | PK. |
| empresa_id | uuid | Não | FK para empresa.id. |
| nome | varchar(150) | Não | Nome da unidade. |
| codigo | varchar(30) | Não | Identificador (ex.: 002, PAT-REC); único por empresa sem diferenciar caixa. A API limita a 10 caracteres (letras, números e hífen), como o formulário (campo `identificador`). |
| cep | char(8) | Não | CEP só com dígitos. |
| logradouro | varchar(150) | Não | Logradouro. |
| numero | varchar(10) | Não | Número ou S/N. |
| complemento | varchar(100) | Sim | Complemento. |
| bairro | varchar(100) | Não | Bairro. |
| cidade | varchar(100) | Não | Cidade. |
| uf | char(2) | Não | UF maiúscula. |
| descricao | text | Sim | Descrição (a API limita a 500 caracteres). |
| status | varchar(10) | Não | ativa (inicial) ou inativa. |
| created_at, updated_at | timestamptz | Não | Exibidas como criação e última modificação. |

### Tabela: `documento`

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | PK. |
| unidade_id | uuid | Não | FK para unidade.id. |
| nome | varchar(150) | Não | Nome do documento. |
| tipo | varchar(60) | Sim | Reservado (ex.: Licença Ambiental). Não existe no formulário atual; a API devolve nulo. |
| categoria | varchar(40) | Não | Categoria exibida e usada como filtro. |
| data_emissao | date | Sim | Data de emissão. |
| data_validade | date | Não | Vencimento; base do status (RF-011). |
| descricao | text | Sim | Descrição (a API limita a 500 caracteres). |
| anexo_nome | varchar(255) | Não | Nome original do arquivo. |
| anexo_url | varchar(500) | Não | Chave do objeto no armazenamento (não é URL pública). |
| anexo_tamanho_bytes | bigint | Não | Tamanho em bytes (até 10 MB). O Prisma o lê como `BigInt`; a API o devolve como `number` (`tamanhoBytes`). |
| anexo_tipo | varchar(100) | Não | Tipo de mídia: application/pdf, image/jpeg ou image/png. |
| created_at, updated_at | timestamptz | Não | Auditoria. |

### Tabela: `tarefa`

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | PK. |
| unidade_id | uuid | Não | FK para unidade.id. |
| titulo | varchar(150) | Não | Título. |
| descricao | text | Sim | Detalhamento (a API limita a 500 caracteres). |
| status | varchar(20) | Não | pendente (inicial), em_andamento ou concluida. |
| data_inicio | date | Não | Data do cadastro (RF-014). |
| prazo | date | Não | Prazo final (campo `prazoFinal` na API e no frontend). |
| data_conclusao | timestamptz | Sim | Preenchida ao concluir; limpa ao sair de concluida (RF-015). |
| created_at, updated_at | timestamptz | Não | Auditoria. |

### Tabela: `codigo_verificacao` (RF-020)

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | PK. |
| usuario_id | uuid | Não | FK para usuario.id. |
| codigo_hash | varchar(255) | Não | Hash do código de 5 dígitos. |
| expira_em | timestamptz | Não | Validade do código (10 minutos). |
| tentativas | smallint | Não | Verificações tentadas; ao atingir 5 o código é invalidado. |
| reset_token_hash | char(64) | Sim | SHA-256 do token de redefinição emitido após a verificação do código. |
| reset_expira_em | timestamptz | Sim | Validade do token de redefinição (10 minutos). |
| usado_em | timestamptz | Sim | Preenchido quando a senha é redefinida. |
| created_at | timestamptz | Não | Criação (usada no intervalo mínimo de 60 s entre solicitações). |

### Tabela: `refresh_token` (RF-001, RF-027)

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | PK. |
| usuario_id | uuid | Não | FK para usuario.id. |
| token_hash | char(64) | Não | SHA-256 do token opaco enviado no cookie; único. |
| lembrar | boolean | Não | Login com "Lembre-me" (validade de 30 dias em vez de 7). |
| expira_em | timestamptz | Não | Validade. |
| revogado_em | timestamptz | Sim | Preenchido no logout, na rotação ou na redefinição de senha. |
| created_at | timestamptz | Não | Criação. |

### Tabela: `historico_alteracao` (RF-017)

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | PK. |
| unidade_id | uuid | Não | FK para unidade.id. |
| usuario_id | uuid | Sim | FK para usuario.id (nulo se o usuário for removido). |
| entidade | varchar(20) | Não | unidade, documento ou tarefa. |
| entidade_id | uuid | Não | Identificador do registro alterado (referência lógica). |
| entidade_nome | varchar(150) | Não | Nome do registro no momento da alteração. |
| acao | varchar(20) | Não | criacao, edicao, exclusao, ativacao ou inativacao. |
| descricao | text | Sim | Texto exibido no histórico (ex.: "Cadastrou o documento"). |
| created_at | timestamptz | Não | Momento da alteração. |

---

## 6. Regras de Integridade

### Chaves únicas

- `usuario.email`, `usuario.cpf`, `empresa.cnpj`.
- `unidade (empresa_id, lower(codigo))`.
- `refresh_token.token_hash` e `codigo_verificacao.reset_token_hash` (quando não nulo).

### Chaves estrangeiras e exclusão

| Tabela.Coluna | Referência | ON DELETE | Justificativa |
|---|---|---|---|
| usuario.empresa_id | empresa.id | RESTRICT | Empresa com usuários não é removida por engano. |
| unidade.empresa_id | empresa.id | RESTRICT | Idem para unidades. |
| documento.unidade_id | unidade.id | CASCADE | Documento não existe sem a unidade. |
| tarefa.unidade_id | unidade.id | CASCADE | Idem. |
| codigo_verificacao.usuario_id | usuario.id | CASCADE | Sem sentido sem o usuário. |
| refresh_token.usuario_id | usuario.id | CASCADE | Idem. |
| historico_alteracao.unidade_id | unidade.id | CASCADE | O histórico descreve a vida da unidade. |
| historico_alteracao.usuario_id | usuario.id | SET NULL | Preserva a auditoria. |

> Na prática, unidades são inativadas, não excluídas (RF-007, RF-021). O frontend atual não oferece exclusão de unidade, documento ou tarefa; o CASCADE é salvaguarda para a remoção excepcional (RF-016, opcional).

### Regras CHECK

- `usuario.papel` ∈ colaborador, gestor, administrador; `cpf` 11 dígitos; `telefone` 10 ou 11 dígitos.
- `empresa.cnpj` 14 dígitos; `tipo_unidade` ∈ matriz, filial; `cep` 8 dígitos; `uf` 2 letras maiúsculas.
- `unidade.status` ∈ ativa, inativa; `cep` 8 dígitos; `uf` 2 letras maiúsculas.
- `tarefa.status` ∈ pendente, em_andamento, concluida; `data_conclusao` obrigatória se concluida e nula nos demais.
- `documento.data_emissao` ≤ `data_validade`; `anexo_tamanho_bytes` entre 0 e 10 MB; `anexo_tipo` ∈ application/pdf, image/jpeg, image/png.
- `codigo_verificacao.tentativas` ≥ 0; `reset_token_hash` e `reset_expira_em` são ambos nulos ou ambos preenchidos.
- `historico_alteracao.entidade` e `acao` nos valores listados.

### Regras aplicadas pela aplicação

- Documentos e tarefas só são criados, editados ou têm o status alterado se a unidade estiver ativa (RF-007).
- A API valida CPF e CNPJ (dígitos verificadores) e o identificador da unidade (`^[\p{L}0-9-]+$`, até 10 caracteres).
- Ao editar uma tarefa, o novo prazo não pode ser anterior a hoje (regra já presente no frontend).
- A unicidade do identificador (`lower(codigo)`) é conferida pelo service antes da gravação; em caso de corrida, o erro 23505 do PostgreSQL é convertido em 409.
- Todo acesso a unidades, documentos e tarefas é filtrado pela empresa do usuário (RNF-025).
- O seed de desenvolvimento (US 116) nunca é executado em produção.

---

## 7. Scripts de Criação — Flyway

Migrações em `db/migration/`, na raiz do repositório do backend, no padrão `V{versão}__descrição.sql`. **V1 a V8 são imutáveis; V9 a V14 (v1.4) são incrementais.** A V7 é opcional (RF-017), mas, como o frontend usa o histórico, passa a ser aplicada em todos os ambientes.

### V1__habilita_extensoes.sql

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### V2__cria_tabela_empresa.sql

```sql
CREATE TABLE empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_fantasia VARCHAR(150) NOT NULL,
    razao_social VARCHAR(200) NOT NULL,
    cnpj CHAR(14) NOT NULL,
    segmento VARCHAR(100) NOT NULL,
    tipo_unidade VARCHAR(10) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_empresa_cnpj UNIQUE (cnpj),
    CONSTRAINT ck_empresa_cnpj CHECK (cnpj ~ '^[0-9]{14}$'),
    CONSTRAINT ck_empresa_tipo_unidade CHECK (tipo_unidade IN ('matriz', 'filial'))
);
```

### V3__cria_tabela_usuario.sql

```sql
CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id) ON DELETE RESTRICT,
    nome VARCHAR(150) NOT NULL,
    cpf CHAR(11) NOT NULL,
    telefone VARCHAR(11) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    email VARCHAR(180) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    papel VARCHAR(20) NOT NULL DEFAULT 'colaborador',
    aceite_termos_em TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_usuario_email UNIQUE (email),
    CONSTRAINT uq_usuario_cpf UNIQUE (cpf),
    CONSTRAINT ck_usuario_cpf CHECK (cpf ~ '^[0-9]{11}$'),
    CONSTRAINT ck_usuario_telefone CHECK (telefone ~ '^[0-9]{10,11}$'),
    CONSTRAINT ck_usuario_papel CHECK (papel IN ('colaborador', 'gestor', 'administrador'))
);

CREATE INDEX idx_usuario_empresa_id ON usuario (empresa_id);
```

### V4__cria_tabela_unidade.sql

```sql
CREATE TABLE unidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id) ON DELETE RESTRICT,
    nome VARCHAR(150) NOT NULL,
    codigo VARCHAR(30) NOT NULL,
    cep CHAR(8) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    descricao TEXT,
    status VARCHAR(10) NOT NULL DEFAULT 'ativa',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_unidade_empresa_codigo UNIQUE (empresa_id, codigo),
    CONSTRAINT ck_unidade_cep CHECK (cep ~ '^[0-9]{8}$'),
    CONSTRAINT ck_unidade_uf CHECK (uf ~ '^[A-Z]{2}$'),
    CONSTRAINT ck_unidade_status CHECK (status IN ('ativa', 'inativa'))
);

CREATE INDEX idx_unidade_status ON unidade (status);
```

### V5__cria_tabela_documento.sql

```sql
CREATE TABLE documento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID NOT NULL REFERENCES unidade(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    tipo VARCHAR(60),
    categoria VARCHAR(40) NOT NULL,
    data_emissao DATE,
    data_validade DATE NOT NULL,
    descricao TEXT,
    anexo_nome VARCHAR(255) NOT NULL,
    anexo_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_documento_datas CHECK (data_emissao IS NULL OR data_emissao <= data_validade)
);

CREATE INDEX idx_documento_unidade_id ON documento (unidade_id);
CREATE INDEX idx_documento_data_validade ON documento (data_validade);
CREATE INDEX idx_documento_categoria ON documento (categoria);
```

### V6__cria_tabela_tarefa.sql

```sql
CREATE TABLE tarefa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID NOT NULL REFERENCES unidade(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    prazo DATE NOT NULL,
    data_conclusao TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_tarefa_status CHECK (status IN ('pendente', 'em_andamento', 'concluida')),
    CONSTRAINT ck_tarefa_conclusao CHECK (
        (status = 'concluida' AND data_conclusao IS NOT NULL)
        OR (status <> 'concluida' AND data_conclusao IS NULL)
    )
);

CREATE INDEX idx_tarefa_unidade_id ON tarefa (unidade_id);
CREATE INDEX idx_tarefa_status ON tarefa (status);
```

### V7__cria_tabela_historico_alteracao.sql

```sql
CREATE TABLE historico_alteracao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID NOT NULL REFERENCES unidade(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuario(id) ON DELETE SET NULL,
    entidade VARCHAR(20) NOT NULL,
    entidade_id UUID NOT NULL,
    acao VARCHAR(20) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_historico_entidade CHECK (entidade IN ('unidade', 'documento', 'tarefa')),
    CONSTRAINT ck_historico_acao CHECK (acao IN ('criacao', 'edicao', 'exclusao', 'ativacao', 'inativacao'))
);

CREATE INDEX idx_historico_unidade_id ON historico_alteracao (unidade_id);
CREATE INDEX idx_historico_created_at ON historico_alteracao (created_at);
```

### V8__cria_tabela_codigo_verificacao.sql

```sql
CREATE TABLE codigo_verificacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    codigo_hash VARCHAR(255) NOT NULL,
    expira_em TIMESTAMPTZ NOT NULL,
    tentativas SMALLINT NOT NULL DEFAULT 0,
    usado_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_codigo_tentativas CHECK (tentativas >= 0)
);

CREATE INDEX idx_codigo_usuario_created ON codigo_verificacao (usuario_id, created_at);
```

### V9__empresa_endereco_estruturado.sql (novo na v1.4)

```sql
-- O cadastro da empresa coleta endereço estruturado (RF-019).
-- Linhas legadas (apenas dados fictícios) recebem valores neutros.
ALTER TABLE empresa
    ADD COLUMN cep CHAR(8),
    ADD COLUMN logradouro VARCHAR(150),
    ADD COLUMN numero VARCHAR(10),
    ADD COLUMN complemento VARCHAR(100),
    ADD COLUMN bairro VARCHAR(100),
    ADD COLUMN cidade VARCHAR(100),
    ADD COLUMN uf CHAR(2);

UPDATE empresa
   SET cep = '00000000',
       logradouro = LEFT(endereco, 150),
       numero = 'S/N',
       bairro = 'Não informado',
       cidade = 'Não informada',
       uf = 'PE';

ALTER TABLE empresa
    ALTER COLUMN cep SET NOT NULL,
    ALTER COLUMN logradouro SET NOT NULL,
    ALTER COLUMN numero SET NOT NULL,
    ALTER COLUMN bairro SET NOT NULL,
    ALTER COLUMN cidade SET NOT NULL,
    ALTER COLUMN uf SET NOT NULL,
    ADD CONSTRAINT ck_empresa_cep CHECK (cep ~ '^[0-9]{8}$'),
    ADD CONSTRAINT ck_empresa_uf CHECK (uf ~ '^[A-Z]{2}$'),
    DROP COLUMN endereco;
```

### V10__unidade_codigo_ci_e_unaccent.sql (novo na v1.4)

```sql
CREATE EXTENSION IF NOT EXISTS "unaccent";

ALTER TABLE unidade DROP CONSTRAINT uq_unidade_empresa_codigo;
CREATE UNIQUE INDEX uq_unidade_empresa_codigo_ci ON unidade (empresa_id, lower(codigo));
```

### V11__documento_anexo_metadados.sql (novo na v1.4)

```sql
ALTER TABLE documento
    ADD COLUMN anexo_tamanho_bytes BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN anexo_tipo VARCHAR(100) NOT NULL DEFAULT 'application/pdf';

ALTER TABLE documento
    ALTER COLUMN anexo_tamanho_bytes DROP DEFAULT,
    ALTER COLUMN anexo_tipo DROP DEFAULT,
    ADD CONSTRAINT ck_documento_anexo_tamanho CHECK (anexo_tamanho_bytes BETWEEN 0 AND 10485760),
    ADD CONSTRAINT ck_documento_anexo_tipo CHECK (anexo_tipo IN ('application/pdf', 'image/jpeg', 'image/png'));
```

### V12__historico_entidade_nome.sql (novo na v1.4)

```sql
ALTER TABLE historico_alteracao
    ADD COLUMN entidade_nome VARCHAR(150) NOT NULL DEFAULT '';

ALTER TABLE historico_alteracao
    ALTER COLUMN entidade_nome DROP DEFAULT;
```

### V13__cria_tabela_refresh_token.sql (novo na v1.4)

```sql
CREATE TABLE refresh_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL,
    lembrar BOOLEAN NOT NULL DEFAULT false,
    expira_em TIMESTAMPTZ NOT NULL,
    revogado_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_refresh_token_hash UNIQUE (token_hash)
);

CREATE INDEX idx_refresh_token_usuario_id ON refresh_token (usuario_id);
```

### V14__codigo_verificacao_reset_token.sql (novo na v1.4)

```sql
ALTER TABLE codigo_verificacao
    ADD COLUMN reset_token_hash CHAR(64),
    ADD COLUMN reset_expira_em TIMESTAMPTZ,
    ADD CONSTRAINT ck_codigo_reset CHECK (
        (reset_token_hash IS NULL AND reset_expira_em IS NULL)
        OR (reset_token_hash IS NOT NULL AND reset_expira_em IS NOT NULL)
    );

CREATE UNIQUE INDEX uq_codigo_reset_token
    ON codigo_verificacao (reset_token_hash) WHERE reset_token_hash IS NOT NULL;
```

---

## 8. Mapeamento banco ↔ API ↔ frontend

### Nomes de campos

| Banco | API (JSON) | Frontend (`types/domain.ts`) |
|---|---|---|
| empresa.nome_fantasia | nomeEmpresa | Empresa.nomeEmpresa |
| empresa.uf / unidade.uf | uf | `estado` no formulário de cadastro da empresa; `uf` na unidade |
| usuario.papel | perfil | PerfilUsuario |
| unidade.codigo | codigo (no formulário: `identificador`) | Unidade.codigo |
| unidade.cep, logradouro… uf | objeto `endereco` na resposta; campos planos no corpo | Unidade.endereco (EnderecoUnidade) |
| tarefa.prazo | prazoFinal | Tarefa.prazoFinal |
| created_at / updated_at | criadoEm / atualizadoEm | criadoEm / atualizadoEm |
| documento.anexo_* | objeto `anexo` {nome, tamanhoBytes, tipo, url} | DocumentoAnexo |
| historico_alteracao.descricao | descricao | HistoricoUnidadeEvento.acao (texto exibido) |

### Enumerados

| Banco / API | Rótulo exibido no frontend |
|---|---|
| ativa / inativa | Ativa / Inativa |
| matriz / filial | Matriz / Filial |
| colaborador / gestor / administrador | Colaborador / Gestor / Administrador |
| pendente / em_andamento / concluida | Pendente / Em andamento / Concluída |
| valido / proximo_vencimento / expirado (status de validade) | Válido / Próximo do vencimento / Expirado |
| unidade / documento / tarefa (histórico) | Unidade / Documento / Tarefa |

### Formatos

| Dado | No banco e na API | No frontend |
|---|---|---|
| CPF, CNPJ, CEP | só dígitos | máscara na digitação e na exibição; remover a máscara antes de enviar |
| Telefone | 10 ou 11 dígitos com DDD | pode exibir `+55 (81) 98765-4321`; remover não dígitos e o prefixo 55 antes de enviar |
| Datas de negócio | `YYYY-MM-DD` | igual |
| Timestamps | ISO-8601 com fuso | igual |
| Tamanho do anexo | `bigint` em bytes; `number` em `tamanhoBytes` | exibe em KB ou MB |

---

## 9. Histórico de Alterações

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 22/09/2026 | 1.0 | Criação inicial. | Equipe do projeto |
| 29/09/2026 | 1.1 | Alinhamento à Análise de Requisitos v1.1; entidade opcional de histórico. | Equipe do projeto |
| 05/10/2026 | 1.2 | Entidade Empresa, novos campos, código de verificação, scripts V1 a V8. | Equipe do projeto |
| 20/10/2026 | 1.3 | Banco real via Flyway; anexos em S3 privado; seed. | Equipe do projeto |
| 20/11/2026 | 1.4 | Conferência com o frontend completo: endereço estruturado da empresa (V9), identificador da unidade sem diferenciar caixa e `unaccent` (V10), metadados do anexo (V11), nome da entidade no histórico (V12), tabela `refresh_token` (V13), token de redefinição de senha (V14), notificações derivadas, seção de mapeamento banco ↔ API ↔ frontend. | Equipe do projeto |
| 20/11/2026 | 1.5 | Atualização da arquitetura de persistência: adoção do Prisma ORM para acesso aos dados pelo NestJS, mantendo o Flyway como ferramenta exclusiva de versionamento e execução das migrações SQL do PostgreSQL. Nenhuma alteração nos contratos da API ou na modelagem de dados. | Equipe do projeto |
| 21/11/2026 | 1.6 | Esclarecimentos sobre o acesso pelo Prisma: duplicidade do identificador (índice `lower(codigo)` fora do modelo Prisma, erro 23505 convertido em 409) e conversão do `BigInt` do tamanho do anexo. Nenhuma alteração no modelo, nas constraints ou nos scripts. | Equipe do projeto |

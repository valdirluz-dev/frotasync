# Modelagem de Dados

**FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas**

- **Versão do documento:** 1.1
- **Data:** 29/09/2026
- Documento complementar à Análise de Requisitos (v1.1) e às Estórias de Usuário e Backlog (v1.1)

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

- Linguagem: JavaScript / TypeScript | Framework: Next.js (React)
- Banco de dados de referência para esta modelagem: PostgreSQL
- Controle de versão do esquema de banco: Flyway
- Documentação da API/contrato de dados: Zod (schemas de validação)

> **Nota de contexto:** conforme descrito na Análise de Requisitos, o projeto atual é 100% frontend e utiliza dados mockados (sem backend real), ambientados na empresa fictícia FrotaSync (transportadora com filiais e pátios) e isolados em uma camada de dados (RNF 008). Este documento apresenta a modelagem de dados que seria adotada caso o sistema evolua para uma persistência real, servindo como referência de arquitetura de dados e como base para a estrutura dos mocks, dos types TypeScript (RNF 010) e dos schemas Zod (RNF 003) (entidades, atributos e relacionamentos).

Este documento apresenta a modelagem de dados do sistema em três níveis (conceitual, lógico e físico), o diagrama entidade-relacionamento, o dicionário de dados, as regras de integridade e os scripts de criação do banco, com base nos requisitos funcionais (RF 001 a RF 018) da Análise de Requisitos v1.1 e nas estórias de usuário do Backlog priorizado. As estruturas ligadas a requisitos opcionais (RF 017) aparecem identificadas como opcionais.

---

## 1. Modelagem Conceitual

O modelo conceitual descreve as principais entidades do domínio e como elas se relacionam, sem se preocupar com tipos de dados, chaves ou detalhes de implementação. É a visão mais próxima da linguagem de negócio, derivada diretamente dos requisitos funcionais RF 001 a RF 018.

### Entidades principais

| Entidade | Descrição |
|---|---|
| Usuário | Pessoa que acessa o sistema mediante login (e-mail/senha) e possui um papel (colaborador, gestor ou administrador). Base do RF 001 e do RNF 004 (proteção de rotas). |
| Unidade | Filial ou pátio da empresa, cujo status (ativa/inativa) determina se pode receber novos documentos e tarefas. Base dos RF 004, RF 005, RF 006 e RF 007 (e do RF 016, opcional). |
| Documento | Documento vinculado a uma unidade (ex.: Licença Ambiental, Registro na ANTT, Seguro de Carga), cujo status de validade (Válido, Próximo do vencimento, Expirado) é sempre calculado a partir da data de validade. Base dos RF 008, RF 009, RF 010 e RF 011. |
| Tarefa | Tarefa vinculada a uma unidade, com status (Pendente, Em andamento, Concluída) e prazo. Base dos RF 012, RF 013, RF 014 e RF 015. |
| Histórico de alteração (opcional) | Registro de quem alterou o quê e quando (unidade, documento ou tarefa), exibido no detalhamento da unidade. Base do RF 017. |

### Relacionamentos principais

- **Unidade (1) — (N) Documento:** uma unidade pode possuir vários documentos vinculados; um documento pertence a exatamente uma unidade (RF 006, RF 009, RF 010).
- **Unidade (1) — (N) Tarefa:** uma unidade pode possuir várias tarefas vinculadas; uma tarefa pertence a exatamente uma unidade (RF 006, RF 012, RF 014).
- **Unidade (1) — (N) Histórico de alteração** e **Usuário (1) — (N) Histórico de alteração** (opcional, RF 017): cada registro pertence a uma unidade e indica o usuário que realizou a alteração.
- **Usuário:** entidade responsável pela autenticação e pelo controle de acesso às telas do sistema (RF 001, RNF 004); nos requisitos obrigatórios não possui vínculo direto com Unidade, Documento ou Tarefa. Somente no RF 017 (opcional) passa a ser referenciado, como autor dos registros de histórico.

Não há, nos requisitos atuais, relacionamentos N:N — portanto o modelo conceitual não exige tabelas associativas nesta versão.

---

## 2. Modelagem Lógica

O modelo lógico detalha os atributos de cada entidade, seus tipos abstratos, chaves primárias e estrangeiras, e a cardinalidade dos relacionamentos — ainda independente do SGBD que será usado.

### USUÁRIO

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| nome | Texto | - |
| email | Texto | Único |
| senha_hash | Texto | - |
| papel | Enumerado (colaborador, gestor, administrador) | - |
| created_at | Data-hora | - |
| updated_at | Data-hora | - |

### UNIDADE

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| nome | Texto | - |
| codigo | Texto | Único |
| endereco | Texto | - |
| status | Enumerado (ativa, inativa) | - |
| created_at | Data-hora | - |
| updated_at | Data-hora | - |

### DOCUMENTO

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| unidade_id | Identificador | FK -> Unidade |
| nome | Texto | - |
| tipo | Texto | - |
| data_validade | Data | - |
| created_at | Data-hora | - |
| updated_at | Data-hora | - |

> O status de validade do documento (Válido / Próximo do vencimento / Expirado) **não é um atributo persistido**: conforme RF 011 e RNF 007, ele é sempre calculado dinamicamente pela aplicação a partir de `data_validade`, nunca digitado ou editado manualmente.

### TAREFA

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| unidade_id | Identificador | FK -> Unidade |
| titulo | Texto | - |
| descricao | Texto | - |
| status | Enumerado (pendente, em_andamento, concluida) | - |
| prazo | Data | - |
| created_at | Data-hora | - |
| updated_at | Data-hora | - |

### HISTÓRICO DE ALTERAÇÃO (opcional — RF 017)

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| unidade_id | Identificador | FK -> Unidade |
| usuario_id | Identificador | FK -> Usuário |
| entidade | Enumerado (unidade, documento, tarefa) | - |
| entidade_id | Identificador | - |
| acao | Enumerado (criacao, edicao, exclusao) | - |
| descricao | Texto | - |
| created_at | Data-hora | - |

O histórico é somente de inserção (não possui `updated_at`): um registro de auditoria não é editado depois de criado. `entidade_id` referencia logicamente o registro alterado, conforme o valor de `entidade`.

### Cardinalidade dos relacionamentos

- **Unidade (1) — (N) Documento** — uma unidade inativa não pode receber novos documentos, mas mantém os já existentes em modo somente leitura (RF 007).
- **Unidade (1) — (N) Tarefa** — uma unidade inativa não pode receber novas tarefas, mas mantém as já existentes em modo somente leitura (RF 007).
- **Unidade (1) — (N) Histórico de alteração** e **Usuário (1) — (N) Histórico de alteração** — um registro de histórico pertence a exatamente uma unidade e tem, no máximo, um usuário autor (RF 017, opcional).

---

## 3. Modelagem Física (PostgreSQL)

O modelo físico traduz o modelo lógico para tipos e recursos reais do PostgreSQL. O detalhamento completo, coluna a coluna, fica no Dicionário de Dados (seção 5); os scripts de criação ficam na seção 7.

### Principais decisões de tipagem

- **Chaves primárias:** `uuid` gerado com `gen_random_uuid()`, evitando IDs sequenciais previsíveis expostos pela API.
- **Datas e horas de auditoria (`created_at`/`updated_at`):** `timestamptz`, garantindo consistência de fuso horário.
- **Datas de negócio (`data_validade`, `prazo`):** `date`, pois representam apenas o dia relevante para o cálculo de status (RF 011) e prazo da tarefa.
- **Enumerados** (status de unidade, status de tarefa, papel de usuário e, no histórico, entidade e ação): `varchar` + CHECK constraint, para facilitar evolução via migração sem depender de tipos ENUM nativos.
- **Senha:** armazenada apenas como hash (`senha_hash varchar`), nunca em texto plano, em conformidade com RNF 004 (segurança e controle de acesso).
- **Histórico (opcional):** tabela apenas de inserção, sem `updated_at`, com índice por unidade e data para exibir o histórico no detalhamento da unidade (RF 017).

---

## 4. Diagrama Entidade-Relacionamento

O código DBML abaixo pode ser colado diretamente em [dbdiagram.io](https://dbdiagram.io) para gerar (e editar) o diagrama de forma interativa.

```dbml
Table usuario {
  id uuid [pk, default: `gen_random_uuid()`]
  nome varchar(150) [not null]
  email varchar(180) [not null, unique]
  senha_hash varchar(255) [not null]
  papel varchar(20) [not null, default: 'colaborador']
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table unidade {
  id uuid [pk, default: `gen_random_uuid()`]
  nome varchar(150) [not null]
  codigo varchar(30) [not null, unique]
  endereco varchar(255)
  status varchar(10) [not null, default: 'ativa']
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table documento {
  id uuid [pk, default: `gen_random_uuid()`]
  unidade_id uuid [ref: > unidade.id, not null]
  nome varchar(150) [not null]
  tipo varchar(60)
  data_validade date [not null]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    unidade_id
    data_validade
  }
}

Table tarefa {
  id uuid [pk, default: `gen_random_uuid()`]
  unidade_id uuid [ref: > unidade.id, not null]
  titulo varchar(150) [not null]
  descricao text
  status varchar(20) [not null, default: 'pendente']
  prazo date
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    unidade_id
    status
  }
}

// Opcional (RF 017)
Table historico_alteracao {
  id uuid [pk, default: `gen_random_uuid()`]
  unidade_id uuid [ref: > unidade.id, not null]
  usuario_id uuid [ref: > usuario.id]
  entidade varchar(20) [not null]
  entidade_id uuid [not null]
  acao varchar(20) [not null]
  descricao text
  created_at timestamptz [not null, default: `now()`]

  indexes {
    unidade_id
    created_at
  }
}
```

---

## 5. Dicionário de Dados

Detalhamento coluna a coluna de cada tabela do modelo físico.

### Tabela: `usuario`

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | Identificador único (PK). |
| nome | varchar(150) | Não | Nome completo do usuário. |
| email | varchar(180) | Não | E-mail utilizado no login; único no sistema. |
| senha_hash | varchar(255) | Não | Hash da senha do usuário (nunca texto plano). |
| papel | varchar(20) | Não | Papel do usuário: colaborador, gestor ou administrador. |
| created_at | timestamptz | Não | Data/hora de criação do registro. |
| updated_at | timestamptz | Não | Data/hora da última atualização do registro. |

### Tabela: `unidade`

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | Identificador único (PK). |
| nome | varchar(150) | Não | Nome da unidade (filial ou pátio). |
| codigo | varchar(30) | Não | Código único de identificação da unidade. |
| endereco | varchar(255) | Sim | Endereço completo da unidade. |
| status | varchar(10) | Não | Situação da unidade: ativa ou inativa (RF 005, RF 007). |
| created_at | timestamptz | Não | Data/hora de criação do registro. |
| updated_at | timestamptz | Não | Data/hora da última atualização do registro. |

### Tabela: `documento`

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | Identificador único (PK). |
| unidade_id | uuid | Não | FK para unidade.id; unidade à qual o documento pertence. |
| nome | varchar(150) | Não | Nome/título do documento. |
| tipo | varchar(60) | Sim | Categoria do documento (ex.: Licença Ambiental, Registro na ANTT, Seguro de Carga). |
| data_validade | date | Não | Data de validade; base do cálculo de status (RF 011). |
| created_at | timestamptz | Não | Data/hora de criação do registro. |
| updated_at | timestamptz | Não | Data/hora da última atualização do registro. |

### Tabela: `tarefa`

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | Identificador único (PK). |
| unidade_id | uuid | Não | FK para unidade.id; unidade à qual a tarefa pertence. |
| titulo | varchar(150) | Não | Título/resumo da tarefa. |
| descricao | text | Sim | Detalhamento da tarefa. |
| status | varchar(20) | Não | Situação da tarefa: pendente (valor inicial, RF 014), em_andamento ou concluida (RF 015). |
| prazo | date | Sim | Data limite para conclusão da tarefa. |
| created_at | timestamptz | Não | Data/hora de criação do registro. |
| updated_at | timestamptz | Não | Data/hora da última atualização do registro. |

> **Observação:** o status de validade exibido para o documento (Válido / Próximo do vencimento / Expirado) não é uma coluna do banco — é derivado em tempo de leitura a partir de `data_validade`, conforme RF 011 e RNF 007.

### Tabela: `historico_alteracao` (opcional — RF 017)

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | Identificador único (PK). |
| unidade_id | uuid | Não | FK para unidade.id; unidade a que a alteração se refere. |
| usuario_id | uuid | Sim | FK para usuario.id; usuário que realizou a alteração (nulo se o usuário for removido). |
| entidade | varchar(20) | Não | Tipo do registro alterado: unidade, documento ou tarefa. |
| entidade_id | uuid | Não | Identificador do registro alterado (referência lógica, sem FK). |
| acao | varchar(20) | Não | Ação realizada: criacao, edicao ou exclusao. |
| descricao | text | Sim | Resumo do que foi alterado. |
| created_at | timestamptz | Não | Data/hora em que a alteração ocorreu. |

---

## 6. Regras de Integridade

### Chaves únicas (UNIQUE)

- `usuario.email` — não podem existir dois usuários com o mesmo e-mail, pois o e-mail é a credencial de login (RF 001).
- `unidade.codigo` — cada unidade deve ter um código único para evitar ambiguidade na busca/filtro da listagem de unidades (RF 004) e no cadastro/edição (RF 005).

### Chaves estrangeiras (FOREIGN KEY) e comportamento de exclusão

| Tabela.Coluna | Referência | ON DELETE | Justificativa |
|---|---|---|---|
| documento.unidade_id | unidade.id | CASCADE | Um documento não faz sentido sem a unidade à qual pertence; ao excluir a unidade, seus documentos são removidos junto. |
| tarefa.unidade_id | unidade.id | CASCADE | Mesma lógica de documento: a tarefa é sempre dependente de uma unidade existente. |
| historico_alteracao.unidade_id | unidade.id | CASCADE | O histórico (opcional, RF 017) descreve a vida da unidade; sem a unidade, o registro perde o sentido. |
| historico_alteracao.usuario_id | usuario.id | SET NULL | Preserva o registro de auditoria mesmo que o usuário autor seja removido. |

> **Observação:** na prática de negócio, unidades não costumam ser fisicamente excluídas — apenas inativadas (RF 007). Quando a exclusão é oferecida (RF 016, opcional), a aplicação a bloqueia se a unidade tiver documentos próximos do vencimento ou expirados, ou tarefas em andamento; como o status do documento é derivado, essa verificação é feita pela aplicação, e não por constraint. O CASCADE aqui é uma salvaguarda de consistência para o cenário excepcional de remoção definitiva.

### Outras regras de validação (CHECK)

- `usuario.papel` deve ser um dos valores: colaborador, gestor, administrador.
- `unidade.status` deve ser um dos valores: ativa, inativa.
- `tarefa.status` deve ser um dos valores: pendente, em_andamento, concluida; toda tarefa criada nasce como pendente (RF 014).
- `historico_alteracao.entidade` deve ser um dos valores: unidade, documento, tarefa; `historico_alteracao.acao`: criacao, edicao, exclusao (RF 017).
- `documento.data_validade` não pode ser nula, pois é a base obrigatória do cálculo automático de status (RF 011).

---

## 7. Scripts de Criação — Flyway

O esquema é versionado como migrações, seguindo a convenção de nomes `V{versão}__descrição.sql`, localizadas em `src/main/resources/db/migration/`. Cada migração representa uma mudança incremental e imutável do esquema, respeitando a ordem de dependência entre chaves estrangeiras (`unidade` e `usuario` antes de `documento`, `tarefa` e `historico_alteracao`). A migração V6 é opcional (RF 017).

### V1__habilita_extensoes.sql

```sql
-- Habilita geração de UUID (gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### V2__cria_tabela_usuario.sql

```sql
CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    papel VARCHAR(20) NOT NULL DEFAULT 'colaborador',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_usuario_email UNIQUE (email),
    CONSTRAINT ck_usuario_papel CHECK (papel IN ('colaborador', 'gestor', 'administrador'))
);
```

### V3__cria_tabela_unidade.sql

```sql
CREATE TABLE unidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    codigo VARCHAR(30) NOT NULL,
    endereco VARCHAR(255),
    status VARCHAR(10) NOT NULL DEFAULT 'ativa',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_unidade_codigo UNIQUE (codigo),
    CONSTRAINT ck_unidade_status CHECK (status IN ('ativa', 'inativa'))
);
```

### V4__cria_tabela_documento.sql

```sql
CREATE TABLE documento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID NOT NULL REFERENCES unidade(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    tipo VARCHAR(60),
    data_validade DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documento_unidade_id ON documento (unidade_id);
CREATE INDEX idx_documento_data_validade ON documento (data_validade);
```

### V5__cria_tabela_tarefa.sql

```sql
CREATE TABLE tarefa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID NOT NULL REFERENCES unidade(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    prazo DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_tarefa_status CHECK (status IN ('pendente', 'em_andamento', 'concluida'))
);

CREATE INDEX idx_tarefa_unidade_id ON tarefa (unidade_id);
CREATE INDEX idx_tarefa_status ON tarefa (status);
```

### V6__cria_tabela_historico_alteracao.sql (opcional — RF 017)

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
    CONSTRAINT ck_historico_acao CHECK (acao IN ('criacao', 'edicao', 'exclusao'))
);

CREATE INDEX idx_historico_unidade_id ON historico_alteracao (unidade_id);
CREATE INDEX idx_historico_created_at ON historico_alteracao (created_at);
```

> **Observação:** em ambientes com Liquibase, o mesmo conteúdo seria expresso como changesets em `changelog-master.xml` (ou formato YAML/JSON), um por tabela, mantendo a mesma ordem de dependências entre chaves estrangeiras.

---

## 8. Histórico de Alterações

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 22/09/2026 | 1.0 | Criação inicial do documento de modelagem de dados. | Equipe do projeto |
| 29/09/2026 | 1.1 | Referências de RF atualizadas para a numeração da Análise de Requisitos v1.1; contexto ajustado à FrotaSync; inclusão dos requisitos RF 005, 009, 013, 014 e 016 nas descrições e regras; inclusão da entidade opcional Histórico de alteração (RF 017), com DBML, dicionário, integridade e migração V6. | Equipe do projeto |

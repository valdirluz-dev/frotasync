# Modelagem de Dados

**FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas**

- **Versão do documento:** 1.2
- **Data:** 05/10/2026
- Documento complementar à Análise de Requisitos (v1.2) e às Estórias de Usuário e Backlog (v1.2)

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

Este documento apresenta a modelagem de dados do sistema em três níveis (conceitual, lógico e físico), o diagrama entidade-relacionamento, o dicionário de dados, as regras de integridade e os scripts de criação do banco, com base nos requisitos funcionais (RF 001 a RF 025) e não funcionais da Análise de Requisitos v1.2 e nas estórias de usuário do Backlog priorizado. As estruturas ligadas a requisitos opcionais (RF 017) aparecem identificadas como opcionais.

### O que mudou na versão 1.2

- **Nova entidade Empresa**, criada pelo cadastro em 3 etapas (RF 019). Usuários e unidades passam a pertencer a uma empresa.
- **Usuário** ganha CPF, telefone, cargo, empresa e data de aceite dos termos (RF 019, RNF 021).
- **Unidade** troca o endereço em um único campo por endereço estruturado (CEP, logradouro, número, complemento, bairro, cidade e UF) e ganha descrição (RF 005). O identificador da unidade passa a ser único por empresa.
- **Documento** ganha categoria, data de emissão, descrição e anexo (RF 009).
- **Tarefa** ganha data de início e data de conclusão; o prazo passa a ser obrigatório, alinhando o banco ao formulário (RF 014, RF 015).
- **Nova tabela Código de verificação**, para a recuperação de senha (RF 020).
- **Histórico de alteração** (opcional) ganha as ações de ativação e inativação (RF 021).
- Os scripts Flyway foram reorganizados (V1 a V8). Como as migrações da v1.1 eram apenas de referência e não foram aplicadas a nenhum ambiente, a reorganização não exige migração de dados.

---

## 1. Modelagem Conceitual

O modelo conceitual descreve as principais entidades do domínio e como elas se relacionam, sem se preocupar com tipos de dados, chaves ou detalhes de implementação. É a visão mais próxima da linguagem de negócio, derivada diretamente dos requisitos funcionais.

### Entidades principais

| Entidade | Descrição |
|---|---|
| Empresa | Organização cliente do sistema, criada no cadastro (nome comercial, razão social, CNPJ, segmento, tipo de unidade e endereço). Agrupa usuários e unidades. Base do RF 019. |
| Usuário | Pessoa que acessa o sistema mediante login (e-mail/senha) e possui um papel (colaborador, gestor ou administrador) e uma empresa. Base dos RF 001, RF 019 e do RNF 004 (proteção de rotas). |
| Unidade | Filial ou pátio da empresa, com endereço estruturado, cujo status (ativa/inativa) determina se pode receber novos documentos e tarefas. Base dos RF 004, RF 005, RF 006, RF 007 e RF 021 (e do RF 016, opcional). |
| Documento | Documento vinculado a uma unidade (ex.: Licença Ambiental, Registro na ANTT, Seguro de Carga), com categoria, anexo e data de validade, cujo status de validade (Válido, Próximo do vencimento, Expirado) é sempre calculado. Base dos RF 008, RF 009, RF 010, RF 011 e RF 022. |
| Tarefa | Tarefa vinculada a uma unidade, com status (Pendente, Em andamento, Concluída), data de início, prazo e data de conclusão. Base dos RF 012, RF 013, RF 014, RF 015 e RF 023. |
| Código de verificação | Código de 5 dígitos enviado por e-mail para recuperar a senha, com validade e limite de tentativas. Base do RF 020. |
| Histórico de alteração (opcional) | Registro de quem alterou o quê e quando (unidade, documento ou tarefa), exibido no detalhamento da unidade. Base do RF 017. |

### Relacionamentos principais

- **Empresa (1) — (N) Usuário:** uma empresa possui vários usuários; cada usuário pertence a uma empresa (RF 019).
- **Empresa (1) — (N) Unidade:** uma empresa possui várias unidades; cada unidade pertence a uma empresa (RF 004, RF 005).
- **Unidade (1) — (N) Documento:** uma unidade pode possuir vários documentos vinculados; um documento pertence a exatamente uma unidade (RF 006, RF 009, RF 010).
- **Unidade (1) — (N) Tarefa:** uma unidade pode possuir várias tarefas vinculadas; uma tarefa pertence a exatamente uma unidade (RF 006, RF 012, RF 014).
- **Usuário (1) — (N) Código de verificação:** cada código pertence a um usuário (RF 020).
- **Unidade (1) — (N) Histórico de alteração** e **Usuário (1) — (N) Histórico de alteração** (opcional, RF 017): cada registro pertence a uma unidade e indica o usuário que realizou a alteração.

Documentos e tarefas pertencem à empresa por meio da unidade. Não há, nos requisitos atuais, relacionamentos N:N — portanto o modelo conceitual não exige tabelas associativas nesta versão.

---

## 2. Modelagem Lógica

O modelo lógico detalha os atributos de cada entidade, seus tipos abstratos, chaves primárias e estrangeiras, e a cardinalidade dos relacionamentos — ainda independente do SGBD que será usado.

### EMPRESA

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| nome_fantasia | Texto | - |
| razao_social | Texto | - |
| cnpj | Texto (14 dígitos) | Único |
| segmento | Texto | - |
| tipo_unidade | Enumerado (matriz, filial) | - |
| endereco | Texto | - |
| created_at | Data-hora | - |
| updated_at | Data-hora | - |

### USUÁRIO

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| empresa_id | Identificador | FK -> Empresa |
| nome | Texto | - |
| cpf | Texto (11 dígitos) | Único |
| telefone | Texto (10 ou 11 dígitos) | - |
| cargo | Texto | - |
| email | Texto | Único |
| senha_hash | Texto | - |
| papel | Enumerado (colaborador, gestor, administrador) | - |
| aceite_termos_em | Data-hora | - |
| created_at | Data-hora | - |
| updated_at | Data-hora | - |

### UNIDADE

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| empresa_id | Identificador | FK -> Empresa |
| nome | Texto | - |
| codigo | Texto | Único por empresa |
| cep | Texto (8 dígitos) | - |
| logradouro | Texto | - |
| numero | Texto | - |
| complemento | Texto | - |
| bairro | Texto | - |
| cidade | Texto | - |
| uf | Texto (2 letras) | - |
| descricao | Texto | - |
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
| categoria | Texto | - |
| data_emissao | Data | - |
| data_validade | Data | - |
| descricao | Texto | - |
| anexo_nome | Texto | - |
| anexo_url | Texto | - |
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
| data_inicio | Data | - |
| prazo | Data | - |
| data_conclusao | Data-hora | - |
| created_at | Data-hora | - |
| updated_at | Data-hora | - |

### CÓDIGO DE VERIFICAÇÃO (RF 020)

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| usuario_id | Identificador | FK -> Usuário |
| codigo_hash | Texto | - |
| expira_em | Data-hora | - |
| tentativas | Inteiro | - |
| usado_em | Data-hora | - |
| created_at | Data-hora | - |

### HISTÓRICO DE ALTERAÇÃO (opcional — RF 017)

| Atributo | Tipo | Chave |
|---|---|---|
| id | Identificador | PK |
| unidade_id | Identificador | FK -> Unidade |
| usuario_id | Identificador | FK -> Usuário |
| entidade | Enumerado (unidade, documento, tarefa) | - |
| entidade_id | Identificador | - |
| acao | Enumerado (criacao, edicao, exclusao, ativacao, inativacao) | - |
| descricao | Texto | - |
| created_at | Data-hora | - |

O histórico é somente de inserção (não possui `updated_at`): um registro de auditoria não é editado depois de criado. `entidade_id` referencia logicamente o registro alterado, conforme o valor de `entidade`.

### Dados derivados (não persistidos)

| Dado | Origem | Requisito |
|---|---|---|
| Status de validade do documento | `data_validade` e data atual (15 dias de referência) | RF 011, RNF 007 |
| Quantidade de documentos e de tarefas de cada unidade (cards da lista) | Contagem por `unidade_id` | RF 004 |
| Endereço resumido do card (logradouro, número, cidade/UF) | Composição dos campos de endereço da unidade | RF 004 |
| Indicadores e gráficos de rosca do Dashboard e da unidade | Agregações por status | RF 002, RF 006 |
| Total de pendências | Documentos próximos do vencimento ou expirados + tarefas pendentes ou em andamento | RF 002 |
| Variação em relação ao período anterior | Recálculo com uma data de referência anterior, usando `created_at`, `data_validade` e `data_conclusao` | RF 024 |

> A variação é calculada sem snapshots. Por isso, exclusões de registros e tarefas concluídas que foram reabertas depois não são reconstruídas para o período anterior.

### Cardinalidade dos relacionamentos

- **Empresa (1) — (N) Usuário** e **Empresa (1) — (N) Unidade** — toda unidade e todo usuário têm exatamente uma empresa.
- **Unidade (1) — (N) Documento** — uma unidade inativa não pode receber novos documentos nem ter os existentes modificados, mas os mantém em modo somente leitura (RF 007).
- **Unidade (1) — (N) Tarefa** — uma unidade inativa não pode receber novas tarefas nem ter as existentes modificadas, mas as mantém em modo somente leitura (RF 007).
- **Usuário (1) — (N) Código de verificação** — um usuário pode ter vários códigos ao longo do tempo (reenvios); apenas o mais recente e não usado é válido.
- **Unidade (1) — (N) Histórico de alteração** e **Usuário (1) — (N) Histórico de alteração** — um registro de histórico pertence a exatamente uma unidade e tem, no máximo, um usuário autor (RF 017, opcional).

---

## 3. Modelagem Física (PostgreSQL)

O modelo físico traduz o modelo lógico para tipos e recursos reais do PostgreSQL. O detalhamento completo, coluna a coluna, fica no Dicionário de Dados (seção 5); os scripts de criação ficam na seção 7.

### Principais decisões de tipagem

- **Chaves primárias:** `uuid` gerado com `gen_random_uuid()`, evitando IDs sequenciais previsíveis expostos pela API.
- **Datas e horas de auditoria (`created_at`/`updated_at`) e eventos:** `timestamptz`, garantindo consistência de fuso horário. Isso inclui `data_conclusao` da tarefa, que guarda data e hora.
- **Datas de negócio (`data_emissao`, `data_validade`, `data_inicio`, `prazo`):** `date`, pois representam apenas o dia relevante.
- **Documentos brasileiros e endereço:** CPF (`char(11)`), CNPJ (`char(14)`), CEP (`char(8)`) e telefone (`varchar(11)`) são guardados somente com dígitos, sem máscara, com CHECK de formato (RNF 020). UF é `char(2)` em maiúsculas.
- **Enumerados** (status de unidade, status de tarefa, papel de usuário, tipo de unidade da empresa e, no histórico, entidade e ação): `varchar` + CHECK constraint, para facilitar evolução via migração sem depender de tipos ENUM nativos.
- **Categoria do documento:** `varchar` sem CHECK, pois as categorias (Legal, Ambiental, Segurança, Fiscal, Contratual, Técnica, Sanitária etc.) devem poder ser configuradas por empresa ou ramo (RNF 016).
- **Anexo do documento:** o arquivo fica em armazenamento de objetos; o banco guarda apenas o nome e a URL (`anexo_nome`, `anexo_url`).
- **Senha e código de verificação:** armazenados apenas como hash (`senha_hash`, `codigo_hash`), nunca em texto plano, em conformidade com RNF 004 e RNF 021.
- **Histórico (opcional):** tabela apenas de inserção, sem `updated_at`, com índice por unidade e data para exibir o histórico no detalhamento da unidade (RF 017).

---

## 4. Diagrama Entidade-Relacionamento

O código DBML abaixo pode ser colado diretamente em [dbdiagram.io](https://dbdiagram.io) para gerar (e editar) o diagrama de forma interativa.

```dbml
Table empresa {
  id uuid [pk, default: `gen_random_uuid()`]
  nome_fantasia varchar(150) [not null]
  razao_social varchar(200) [not null]
  cnpj char(14) [not null, unique]
  segmento varchar(100) [not null]
  tipo_unidade varchar(10) [not null]
  endereco varchar(255) [not null]
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

  indexes {
    empresa_id
  }
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
    (empresa_id, codigo) [unique]
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
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  indexes {
    unidade_id
    data_validade
    categoria
  }
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

  indexes {
    unidade_id
    status
  }
}

Table codigo_verificacao {
  id uuid [pk, default: `gen_random_uuid()`]
  usuario_id uuid [ref: > usuario.id, not null]
  codigo_hash varchar(255) [not null]
  expira_em timestamptz [not null]
  tentativas smallint [not null, default: 0]
  usado_em timestamptz
  created_at timestamptz [not null, default: `now()`]

  indexes {
    (usuario_id, created_at)
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

### Tabela: `empresa`

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | Identificador único (PK). |
| nome_fantasia | varchar(150) | Não | Nome comercial ou marca da empresa. |
| razao_social | varchar(200) | Não | Razão social (nome de registro oficial). |
| cnpj | char(14) | Não | CNPJ somente com dígitos; único no sistema. |
| segmento | varchar(100) | Não | Segmento de mercado da empresa. |
| tipo_unidade | varchar(10) | Não | Tipo de unidade informado no cadastro: matriz ou filial. |
| endereco | varchar(255) | Não | Endereço da empresa informado no cadastro. |
| created_at | timestamptz | Não | Data/hora de criação do registro. |
| updated_at | timestamptz | Não | Data/hora da última atualização do registro. |

### Tabela: `usuario`

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | Identificador único (PK). |
| empresa_id | uuid | Não | FK para empresa.id; empresa do usuário. |
| nome | varchar(150) | Não | Nome completo do usuário. |
| cpf | char(11) | Não | CPF somente com dígitos; único no sistema. |
| telefone | varchar(11) | Não | Telefone com DDD, somente dígitos. |
| cargo | varchar(100) | Não | Cargo ou função na empresa. |
| email | varchar(180) | Não | E-mail corporativo utilizado no login; único no sistema. |
| senha_hash | varchar(255) | Não | Hash da senha do usuário (nunca texto plano). |
| papel | varchar(20) | Não | Papel do usuário: colaborador, gestor ou administrador. |
| aceite_termos_em | timestamptz | Não | Data/hora do aceite dos Termos de Uso e da Política de Privacidade (RNF 021). |
| created_at | timestamptz | Não | Data/hora de criação do registro. |
| updated_at | timestamptz | Não | Data/hora da última atualização do registro. |

### Tabela: `unidade`

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | Identificador único (PK). |
| empresa_id | uuid | Não | FK para empresa.id; empresa dona da unidade. |
| nome | varchar(150) | Não | Nome da unidade (filial ou pátio). |
| codigo | varchar(30) | Não | Identificador da unidade (ex.: 002); único dentro da empresa. |
| cep | char(8) | Não | CEP somente com dígitos. |
| logradouro | varchar(150) | Não | Logradouro (rua, avenida etc.). |
| numero | varchar(10) | Não | Número do endereço. |
| complemento | varchar(100) | Sim | Complemento (ex.: Galpão 2). |
| bairro | varchar(100) | Não | Bairro. |
| cidade | varchar(100) | Não | Cidade. |
| uf | char(2) | Não | Sigla do estado, em maiúsculas. |
| descricao | text | Sim | Descrição livre sobre a unidade. |
| status | varchar(10) | Não | Situação da unidade: ativa (valor inicial) ou inativa (RF 005, RF 007, RF 021). |
| created_at | timestamptz | Não | Data/hora de criação do registro (exibida em "Informações da unidade"). |
| updated_at | timestamptz | Não | Data/hora da última atualização (exibida como última modificação). |

### Tabela: `documento`

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | Identificador único (PK). |
| unidade_id | uuid | Não | FK para unidade.id; unidade à qual o documento pertence. |
| nome | varchar(150) | Não | Nome do documento (ex.: Alvará de funcionamento). |
| tipo | varchar(60) | Sim | Tipo do documento (ex.: Licença Ambiental, Registro na ANTT, Seguro de Carga). |
| categoria | varchar(40) | Não | Categoria exibida nas tabelas e usada como filtro (ex.: Legal, Ambiental, Segurança). |
| data_emissao | date | Sim | Data de emissão do documento. |
| data_validade | date | Não | Data de validade (vencimento); base do cálculo de status (RF 011). |
| descricao | text | Sim | Descrição livre do documento. |
| anexo_nome | varchar(255) | Não | Nome original do arquivo anexado. |
| anexo_url | varchar(500) | Não | Local de armazenamento do arquivo anexado. |
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
| data_inicio | date | Não | Data de início; preenchida automaticamente com a data do cadastro (RF 014). |
| prazo | date | Não | Data limite para conclusão da tarefa (prazo final). |
| data_conclusao | timestamptz | Sim | Data e hora da conclusão; preenchida ao concluir e limpa se a tarefa sair de concluida (RF 015). |
| created_at | timestamptz | Não | Data/hora de criação do registro. |
| updated_at | timestamptz | Não | Data/hora da última atualização do registro. |

> **Observação:** o status de validade exibido para o documento (Válido / Próximo do vencimento / Expirado) não é uma coluna do banco — é derivado em tempo de leitura a partir de `data_validade`, conforme RF 011 e RNF 007.

### Tabela: `codigo_verificacao` (RF 020)

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | Identificador único (PK). |
| usuario_id | uuid | Não | FK para usuario.id; usuário que solicitou a recuperação. |
| codigo_hash | varchar(255) | Não | Hash do código de 5 dígitos enviado por e-mail (nunca o código em texto plano). |
| expira_em | timestamptz | Não | Data/hora limite de validade do código (sugerido: 10 minutos após a criação). |
| tentativas | smallint | Não | Quantidade de verificações já tentadas; ao atingir o limite (sugerido: 5), o código é invalidado. |
| usado_em | timestamptz | Sim | Data/hora em que o código foi usado com sucesso; preenchido uma única vez. |
| created_at | timestamptz | Não | Data/hora de criação do código. |

### Tabela: `historico_alteracao` (opcional — RF 017)

| Coluna | Tipo | Nulo? | Descrição |
|---|---|---|---|
| id | uuid | Não | Identificador único (PK). |
| unidade_id | uuid | Não | FK para unidade.id; unidade a que a alteração se refere. |
| usuario_id | uuid | Sim | FK para usuario.id; usuário que realizou a alteração (nulo se o usuário for removido). |
| entidade | varchar(20) | Não | Tipo do registro alterado: unidade, documento ou tarefa. |
| entidade_id | uuid | Não | Identificador do registro alterado (referência lógica, sem FK). |
| acao | varchar(20) | Não | Ação realizada: criacao, edicao, exclusao, ativacao ou inativacao. |
| descricao | text | Sim | Resumo do que foi alterado. |
| created_at | timestamptz | Não | Data/hora em que a alteração ocorreu. |

---

## 6. Regras de Integridade

### Chaves únicas (UNIQUE)

- `usuario.email` — não podem existir dois usuários com o mesmo e-mail, pois o e-mail é a credencial de login (RF 001).
- `usuario.cpf` — um CPF só pode estar associado a um usuário (RF 019).
- `empresa.cnpj` — um CNPJ só pode estar associado a uma empresa (RF 019).
- `unidade (empresa_id, codigo)` — o identificador da unidade é único dentro da empresa, evitando ambiguidade na busca da listagem (RF 004) e no cadastro/edição (RF 005), sem impedir que empresas diferentes usem o mesmo código.

### Chaves estrangeiras (FOREIGN KEY) e comportamento de exclusão

| Tabela.Coluna | Referência | ON DELETE | Justificativa |
|---|---|---|---|
| usuario.empresa_id | empresa.id | RESTRICT | Uma empresa com usuários não pode ser removida por engano. |
| unidade.empresa_id | empresa.id | RESTRICT | Uma empresa com unidades não pode ser removida por engano. |
| documento.unidade_id | unidade.id | CASCADE | Um documento não faz sentido sem a unidade à qual pertence; ao excluir a unidade, seus documentos são removidos junto. |
| tarefa.unidade_id | unidade.id | CASCADE | Mesma lógica de documento: a tarefa é sempre dependente de uma unidade existente. |
| codigo_verificacao.usuario_id | usuario.id | CASCADE | Os códigos de recuperação não têm sentido sem o usuário. |
| historico_alteracao.unidade_id | unidade.id | CASCADE | O histórico (opcional, RF 017) descreve a vida da unidade; sem a unidade, o registro perde o sentido. |
| historico_alteracao.usuario_id | usuario.id | SET NULL | Preserva o registro de auditoria mesmo que o usuário autor seja removido. |

> **Observação:** na prática de negócio, unidades não costumam ser fisicamente excluídas — apenas inativadas (RF 007, RF 021). Quando a exclusão é oferecida (RF 016, opcional), a aplicação a bloqueia se a unidade tiver documentos próximos do vencimento ou expirados, ou tarefas em andamento; como o status do documento é derivado, essa verificação é feita pela aplicação, e não por constraint. O CASCADE aqui é uma salvaguarda de consistência para o cenário excepcional de remoção definitiva.

### Outras regras de validação (CHECK)

- `usuario.papel` deve ser um dos valores: colaborador, gestor, administrador.
- `usuario.cpf` deve ter 11 dígitos e `usuario.telefone`, 10 ou 11 dígitos (RNF 020). A validade dos dígitos verificadores é conferida pela aplicação.
- `empresa.cnpj` deve ter 14 dígitos; `empresa.tipo_unidade` deve ser matriz ou filial.
- `unidade.status` deve ser um dos valores: ativa, inativa.
- `unidade.cep` deve ter 8 dígitos e `unidade.uf`, 2 letras maiúsculas.
- `tarefa.status` deve ser um dos valores: pendente, em_andamento, concluida; toda tarefa criada nasce como pendente (RF 014).
- `tarefa.data_conclusao` é obrigatória quando o status é concluida e deve ser nula nos demais status (RF 015).
- `documento.data_validade` não pode ser nula, pois é a base obrigatória do cálculo automático de status (RF 011); `documento.data_emissao`, quando informada, não pode ser posterior à validade.
- `codigo_verificacao.tentativas` não pode ser negativa.
- `historico_alteracao.entidade` deve ser um dos valores: unidade, documento, tarefa; `historico_alteracao.acao`: criacao, edicao, exclusao, ativacao, inativacao (RF 017).

### Regras aplicadas pela aplicação (fora do banco)

- Documentos e tarefas só podem ser criados, editados ou ter o status alterado se a unidade estiver ativa (RF 007).
- O código de verificação expira após o prazo configurado, é invalidado após o limite de tentativas e só pode ser usado uma vez (RF 020).
- Todo acesso a unidades, documentos e tarefas é filtrado pela empresa do usuário autenticado.

---

## 7. Scripts de Criação — Flyway

O esquema é versionado como migrações, seguindo a convenção de nomes `V{versão}__descrição.sql`, localizadas em `src/main/resources/db/migration/`. Cada migração representa uma mudança incremental e imutável do esquema, respeitando a ordem de dependência entre chaves estrangeiras (`empresa` antes de `usuario` e `unidade`; estas antes de `documento`, `tarefa`, `codigo_verificacao` e `historico_alteracao`). A migração V7 é opcional (RF 017).

### V1__habilita_extensoes.sql

```sql
-- Habilita geração de UUID (gen_random_uuid)
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

### V7__cria_tabela_historico_alteracao.sql (opcional — RF 017)

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

### V8__cria_tabela_codigo_verificacao.sql (RF 020)

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

> **Observação:** em ambientes com Liquibase, o mesmo conteúdo seria expresso como changesets em `changelog-master.xml` (ou formato YAML/JSON), um por tabela, mantendo a mesma ordem de dependências entre chaves estrangeiras.

---

## 8. Histórico de Alterações

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 22/09/2026 | 1.0 | Criação inicial do documento de modelagem de dados. | Equipe do projeto |
| 29/09/2026 | 1.1 | Referências de RF atualizadas para a numeração da Análise de Requisitos v1.1; contexto ajustado à FrotaSync; inclusão dos requisitos RF 005, 009, 013, 014 e 016 nas descrições e regras; inclusão da entidade opcional Histórico de alteração (RF 017), com DBML, dicionário, integridade e migração V6. | Equipe do projeto |
| 05/10/2026 | 1.2 | Alinhamento à Análise de Requisitos v1.2 e ao protótipo de telas: nova entidade Empresa (RF 019); novos campos em Usuário, Unidade (endereço estruturado, descrição), Documento (categoria, emissão, descrição, anexo) e Tarefa (data de início e de conclusão, prazo obrigatório); nova tabela Código de verificação (RF 020); ações de ativação e inativação no histórico (RF 021); seção de dados derivados; scripts Flyway reorganizados (V1 a V8). | Equipe do projeto |

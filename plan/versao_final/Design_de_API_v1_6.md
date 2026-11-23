# Design de API

**FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas**

- **Versão do documento:** 1.6 | **Data:** 21/11/2026
- Documento complementar à Análise de Requisitos (v1.4), às Estórias de Usuário e Backlog (v1.4), à Modelagem de Dados (v1.6) e ao Planejamento de Infraestrutura (v1.5)

| Papel | Nome |
|---|---|
| Desenvolvedor(a) | Valdir |
| Desenvolvedor(a) | Filipe |
| Desenvolvedor(a) | Gabrieli |
| Desenvolvedor(a) | Lucas Vinícius |
| Desenvolvedor(a) | Murilo |
| Desenvolvedor(a) | Niedson |
| Desenvolvedor(a) | Silas |

> **Nota de contexto:** a API NestJS é o backend real do sistema (a partir da v1.3). O frontend Next.js, já completo, é o cliente oficial e hoje usa uma camada mockada (`frontend/services` e `frontend/mocks`). Este contrato foi **conferido contra os tipos, schemas e telas do frontend** e ajustado para que a troca dos mocks pela API exija apenas um cliente HTTP e os mapeamentos descritos na seção 6. Quando o contrato e o frontend divergiam, o contrato passou a seguir o frontend (nomes de campos, paginação, regras de formulário), exceto onde a segurança ou o banco exigem o contrário.

| Item | Definição |
|---|---|
| Linguagem | TypeScript (Node.js) |
| Framework | NestJS |
| Banco de dados | PostgreSQL (ver Modelagem de Dados v1.5) |
| Migrações do esquema | Flyway (única ferramenta que cria, altera e versiona o esquema) |
| Persistência e acesso aos dados | Prisma ORM (Prisma Client), usado pelos módulos NestJS para acessar o PostgreSQL |
| Segurança | JWT (Passport) em cookies httpOnly + bcrypt para senhas |
| Validação | Zod 4 (o mesmo major do frontend), aplicado por um pipe de validação sobre os DTOs |
| Documentação interativa | Swagger / OpenAPI, gerada a partir dos schemas Zod |

### Persistência: Flyway e Prisma ORM

**Flyway gerencia a estrutura do banco; Prisma gerencia o acesso aos dados.** As ferramentas têm responsabilidades complementares e não concorrem na administração do esquema.

- **Flyway** é a única ferramenta que cria, altera e versiona o esquema do PostgreSQL (migrações SQL em `db/migration/`, ver Modelagem de Dados v1.5).
- **Prisma ORM** é a camada de acesso e manipulação dos dados: os módulos, repositories e services do NestJS usam o Prisma Client para operações CRUD, consultas tipadas, relacionamentos e transações.
- O modelo Prisma apenas reflete o esquema físico criado pelo Flyway, sincronizado por introspecção (`prisma db pull`) e geração do cliente (`prisma generate`).
- **Não** são usados Prisma Migrate (`prisma migrate dev`, `prisma migrate deploy`), `prisma db push` nem sincronização automática do ORM.

Essa decisão é interna ao backend: **nenhum endpoint, DTO, schema Zod, regra de autenticação ou autorização, formato de resposta ou código de erro deste contrato foi alterado.**

### O que mudou na versão 1.6

Resultado da conferência com os tipos, schemas e services do frontend. Nenhum endpoint foi criado ou removido.

- **Limites de campos:** corrigida a afirmação de que a API era mais permissiva que o frontend. No cadastro a API é mais estrita (nome de 3 a 150, cargo de 2 a 100 e máximos nos campos da empresa). **Decisão: os limites da API prevalecem e o frontend os replica nos schemas Zod** (seção 6, item 11).
- **Mapeamento de requisições (seção 6):** incluídos `UnidadesFilters.size` → `pageSize`, `search` → `q`, `entidade` (rótulo → valor) e o filtro `entidade: "Todas"`.
- **Recuperação de senha:** definido que a verificação com o limite de tentativas já atingido responde 429; antes, a seção 2 dizia 400 e a tabela de códigos HTTP dizia 429.
- **Logout:** `POST /auth/logout` passa a ser público (usa o cookie `frotasync_refresh`), para revogar a sessão mesmo com o accessToken expirado.
- **Identificador duplicado:** a unicidade `lower(codigo)` não existe no modelo Prisma; o service confere antes de gravar e converte o erro 23505 do PostgreSQL em 409, sem depender do `P2002` (seção 4.1).
- **Tamanho do anexo:** o `bigint` do banco chega como `BigInt` no Prisma e é convertido para `number` no DTO (seção 5).
- **Ponto em aberto:** semântica da variação dos indicadores (seção 6, "Pontos em aberto").

### O que mudou na versão 1.5

- **Arquitetura de persistência formalizada:** adoção do Prisma ORM para acesso aos dados pelo NestJS, mantendo o Flyway como ferramenta exclusiva de versionamento e execução das migrações SQL do PostgreSQL.
- **Nenhuma alteração nos contratos da API:** endpoints, métodos HTTP, DTOs, schemas Zod, respostas, códigos de erro e regras de negócio permanecem idênticos à v1.4.

### O que mudou na versão 1.4

- **Paginação igual à do frontend:** `page` a partir de 1, `pageSize`, e envelope `{ items, page, pageSize, total, totalPages }`.
- **Nomes de campos do frontend:** `nomeEmpresa`, `perfil`, `lembreMe`, `confirmarSenha`, `prazoFinal`, `criadoEm`/`atualizadoEm`, `endereco` aninhado na unidade, `anexo` com `tamanhoBytes` e `tipo`.
- **Sessão por cookies httpOnly emitidos pela API** (mesma origem, via Caddy); o frontend deixa de assinar um cookie próprio. Proteção contra CSRF por cabeçalho obrigatório. Substitui "tokens no corpo da resposta".
- **Recuperação de senha** com os nomes do frontend (`code`, `token`, `senha`, `confirmarSenha`), intervalo mínimo de 60 s entre solicitações e invalidação dos códigos anteriores.
- **Novos endpoints:** `GET /auth/me` (perfil), `GET /historico` (histórico global), `GET /notificacoes`, `GET /health`.
- **Cadastro:** `POST /auth/cadastro` com endereço estruturado da empresa e senha forte; o frontend acumula as 3 etapas e envia tudo no final.
- **Regras do frontend adotadas:** limites de tamanho dos campos, identificador da unidade (letras, números e hífen, até 10), prazo da tarefa não anterior a hoje quando alterado, pesquisa sem diferenciar caixa e acentos.
- **Erros:** novo campo `codigo` para distinguir os 409 (ex.: `UNIDADE_INATIVA`).
- **Campo `tipo` do documento** mantido como reservado (opcional, não usado pela interface).
- **Nova seção 6:** mapeamento de enums e DTOs e adaptações necessárias no frontend.

---

## 1. Contexto, Propósito e Público-Alvo

### Contexto

A API expõe as entidades da Modelagem de Dados (Empresa, Usuário, Unidade, Documento, Tarefa, Histórico) e implementa as regras da Análise de Requisitos (RF-001 a RF-027, RNF-004, RNF-007, RNF-020, RNF-021, RNF-024, RNF-025). Os RF-018 (tema) e RF-025 (navegação) são de interface; as preferências de tema e de notificação ficam no navegador e não geram endpoints.

### Propósito

Permitir que cada perfil (colaborador, gestor, administrador) consulte e gerencie unidades, documentos e tarefas, com autorização por perfil, validação consistente (Zod) e cálculo centralizado dos status derivados (validade do documento, indicadores, total de pendências e variação), nunca delegado ao cliente.

### Público-alvo

- **Colaborador(a):** consulta, cadastra e edita documentos e tarefas em unidades ativas e altera o status de tarefas.
- **Gestor(a):** consome Dashboard e listas globais; pode excluir documentos e tarefas (opcional).
- **Administrador(a):** cadastra e edita unidades, ativa e inativa unidades; exclusão de unidade (opcional).
- **Novo(a) usuário(a) (público):** cadastro e recuperação de senha.
- **Frontend Next.js:** cliente único e oficial.

### Convenções gerais

- **URL base:** `https://<host>/api/v1`. O frontend e a API ficam na mesma origem (o Caddy roteia `/api/v1/*` para a API); não há CORS.
- **Formato:** JSON (`Content-Type: application/json`); `multipart/form-data` nos endpoints com arquivo.
- **Datas:** ISO-8601 com fuso nos timestamps (`criadoEm`, `atualizadoEm`) e `YYYY-MM-DD` nas datas de negócio.
- **Identificadores:** UUID. O cliente os trata como texto opaco.
- **Paginação:** `page` (a partir de 1, padrão 1) e `pageSize` (1 a 100, padrão 20; o frontend usa 12 na grade de unidades e 10 nas tabelas). Um `page` acima do último é ajustado para a última página. Envelope: `{ "items": [], "page": 1, "pageSize": 10, "total": 0, "totalPages": 1 }`, com `totalPages` mínimo 1.
- **Pesquisa:** `q`, sem diferenciar caixa e acentos (`unaccent`). Filtros ausentes equivalem a "todos" (o frontend não envia `todas`/`Todos`).
- **Ordenação padrão:** unidades por nome; documentos por data de validade (mais próxima primeiro); tarefas por prazo final; históricos por data decrescente.
- **Escopo por empresa:** todo recurso é filtrado pela empresa do usuário; recurso de outra empresa responde 404.
- **Valores enumerados:** em minúsculas e sem acento (`em_andamento`, `concluida`); os rótulos são do frontend (seção 6).
- **Upload:** PDF, JPG ou PNG de até 10 MB (413 e 415).
- **CPF, CNPJ, CEP e telefone** trafegam só com dígitos (RNF-020). O telefone vai sem o prefixo `55`.

---

## 2. Autenticação

JWT emitido pela API e validado a cada requisição (stateless para o accessToken). O perfil (`usuario.papel`, exposto como `perfil`) e o `empresaId` vão nos claims do token.

### Sessão por cookies httpOnly

| Cookie | Conteúdo | Atributos | Validade |
|---|---|---|---|
| `frotasync_access` | accessToken (JWT) | `HttpOnly; Secure; SameSite=Lax; Path=/api/v1` | 15 minutos |
| `frotasync_refresh` | refreshToken opaco (aleatório; só o SHA-256 fica em `refresh_token`) | `HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth` | 7 dias (30 com `lembreMe: true`) |
| `frotasync_session` | expiração da sessão (epoch em segundos); só indica sessão ao `proxy.ts` do Next, sem valor de segurança | `HttpOnly; Secure; SameSite=Lax; Path=/` | igual ao refreshToken |

- O navegador envia o accessToken automaticamente. Os tokens só viajam em cookies (o corpo do login não os devolve); testes automatizados e o Swagger reaproveitam o `Set-Cookie` do login.
- **CSRF:** toda requisição `POST`, `PUT`, `PATCH` e `DELETE` autenticada por cookie (inclusive `/auth/refresh` e `/auth/logout`) deve enviar o cabeçalho `X-FrotaSync-Client: web`; sem ele, 403. Isso, somado ao `SameSite=Lax`, bloqueia requisições entre sites.
- **Renovação:** em 401, o cliente chama `POST /auth/refresh` uma vez (o refreshToken vai por cookie) e repete a requisição; se falhar, redireciona para `/login`. O refreshToken é rotacionado a cada uso (o anterior é revogado).
- **Logout:** revoga o refreshToken do cookie e apaga os três cookies. A rota é pública e usa o cookie `frotasync_refresh`, para funcionar mesmo com o accessToken expirado; sem o cookie, responde 204 do mesmo jeito.
- **Redefinição de senha:** revoga todos os refreshTokens do usuário.

### Fluxo de autenticação

1. `POST /auth/login` com e-mail, senha e `lembreMe`.
2. A API busca o usuário (e-mail em minúsculas), compara a senha com bcrypt e cria o refreshToken.
3. A resposta 200 traz os dados do usuário e define os cookies.
4. O Guard JWT valida o accessToken e popula `request.user`; o `RolesGuard` confere o perfil (403).
5. Falhas: 401 (sem sessão válida) ou 403 (sem permissão).

### Componentes de segurança

| Componente | Responsabilidade |
|---|---|
| JwtStrategy (Passport) | Lê o accessToken do cookie `frotasync_access` e popula `request.user`. |
| AuthGuard('jwt') | Bloqueia rotas protegidas sem token válido (401). |
| RolesGuard + @Roles() | Confere o perfil permitido no endpoint (403). |
| CsrfGuard | Exige `X-FrotaSync-Client` nas escritas por cookie (403). |
| AuthService | Valida credenciais, gera o hash bcrypt e emite, rotaciona e revoga tokens. |
| ZodValidationPipe | Valida corpo, query e parâmetros contra o schema Zod. |
| ThrottlerGuard | Limita tentativas nas rotas públicas de autenticação (429). |

### Exemplo — login

`POST /api/v1/auth/login`

```jsonc
// Requisição
{
  "email": "marialuiza@logisticaexpress.com.br",
  "senha": "SenhaForte123!",
  "lembreMe": false
}

// Resposta 200 OK (os tokens vão nos cookies Set-Cookie)
{
  "expiresIn": 900,
  "usuario": {
    "id": "9f1c2e30-7b3a-4b7a-9c1e-2b3a4c5d6e7f",
    "nome": "Maria Luiza da Silva",
    "email": "marialuiza@logisticaexpress.com.br",
    "cargo": "Administradora de Frotas",
    "perfil": "administrador"
  }
}
```

Credenciais inválidas: 401 com a mensagem "E-mail ou senha incorretos." (a mesma, exista ou não o e-mail).

### Fluxo de cadastro (RF-019)

1. O frontend valida cada uma das 3 etapas, **guarda os dados no cliente** e envia tudo em um único `POST /auth/cadastro` ao concluir a terceira etapa.
2. A API valida o corpo, confere e-mail, CPF e CNPJ únicos (409 com `codigo` indicando o campo) e, em uma transação, grava a empresa e o usuário (bcrypt, `aceite_termos_em`).
3. O usuário nasce com perfil **administrador** da nova empresa. O cadastro **não cria unidade** (o tipo Matriz/Filial fica na empresa).
4. Resposta 201 sem sessão; o frontend leva ao login (`/cadastro/Sucesso`).

### Fluxo de recuperação de senha (RF-020)

1. `POST /auth/recuperar-senha` com o e-mail: se o usuário existir, gera um código de 5 dígitos, guarda o hash (validade de 10 minutos), invalida os códigos anteriores não usados e envia por e-mail. Resposta sempre 202 com a mesma mensagem. Nova solicitação em menos de 60 s para o mesmo e-mail: 429 ("Aguarde um minuto antes de solicitar outro código.").
2. `POST /auth/verificar-codigo` com `email` e `code`: confere hash, validade e tentativas (limite 5; ao atingir, o código é invalidado). Sucesso: 200 com `token` de uso único (validade de 10 minutos, guardado como hash). Falha: 400 "Código inválido ou expirado. Solicite um novo código.". Ao atingir o limite de 5 tentativas, o código fica invalidado e novas verificações respondem 429 ("Muitas tentativas. Solicite um novo código.").
3. `POST /auth/redefinir-senha` com `token`, `senha` e `confirmarSenha`: atualiza `senha_hash`, marca o código como usado, revoga os refreshTokens e responde 204. Token inválido ou expirado: 400.

---

## 3. Lista de Endpoints

Prefixo `/api/v1`. Coluna "Autenticação": "Público" não exige sessão; "Autenticado" aceita qualquer perfil; os demais indicam o perfil mínimo (GESTOR e ADMINISTRADOR herdam COLABORADOR).

### Autenticação (RF-001, RF-019, RF-020, RF-027)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| POST | `/auth/login` | Autentica por e-mail e senha (`lembreMe`) e define os cookies. | Público |
| POST | `/auth/refresh` | Renova o accessToken a partir do refreshToken do cookie (rotaciona). | Público* |
| POST | `/auth/logout` | Revoga o refreshToken do cookie e apaga os cookies; funciona com o accessToken expirado e responde 204 mesmo sem cookie. | Público* |
| GET | `/auth/me` | Dados do usuário e da empresa (tela Meu Perfil e barra superior). | Autenticado |
| POST | `/auth/cadastro` | Cria empresa e usuário administrador. | Público |
| POST | `/auth/recuperar-senha` | Solicita ou reenvia o código; sempre 202. | Público |
| POST | `/auth/verificar-codigo` | Valida o código e devolve o `token` de redefinição. | Público |
| POST | `/auth/redefinir-senha` | Define a nova senha com o `token`. | Público |

\* `/auth/refresh` exige o cookie `frotasync_refresh` válido; `/auth/logout` usa o cookie quando existe.

### Operação

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/health` | Verificação de saúde (API e conexão com o banco), usada pelo compose e pelo alarme. | Público |

### Dashboard e notificações (RF-002, RF-003, RF-024, RF-025)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/dashboard/indicadores` | Totais, distribuição por status (rosca) e variação em relação ao mês anterior. Também alimenta os cabeçalhos de `/documentos` e `/tarefas`. | Autenticado |
| GET | `/notificacoes` | Notificações calculadas para o sino da barra superior (seção 5). | Autenticado |

Após qualquer escrita em unidades, documentos ou tarefas, o frontend invalida o cache dessas consultas (RF-003).

### Unidades (RF-004 a RF-007, RF-016, RF-021, RF-024)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/unidades` | Lista paginada com `q` (nome/código) e filtro `status`; cada item traz `totalDocumentos` e `totalTarefas`. | Autenticado |
| GET | `/unidades/{id}` | Detalhamento da unidade. | Autenticado |
| GET | `/unidades/{id}/indicadores` | Distribuição por status e variação da unidade. | Autenticado |
| POST | `/unidades` | Cadastra unidade (nasce ativa). | ADMINISTRADOR |
| PUT | `/unidades/{id}` | Atualiza dados cadastrais (status só pelo PATCH). | ADMINISTRADOR |
| PATCH | `/unidades/{id}/status` | Ativa ou inativa. | ADMINISTRADOR |
| DELETE | `/unidades/{id}` | Exclusão excepcional (RF-016, opcional); 409 se houver pendências. **Sem tela no frontend atual.** | ADMINISTRADOR |

### Endereços (RF-005, RF-019)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/enderecos/cep/{cep}` | Consulta o CEP (a API consulta o ViaCEP; o navegador não chama serviços externos). 400 se o formato for inválido; 404 se não encontrado. | Público com limite de requisições |

Público porque o cadastro da empresa o usa antes do login; protegido por limite de requisições (429) e cache de 24 h.

### Documentos (RF-008 a RF-011, RF-022, RF-026)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/documentos` | Lista global com `q` (nome), `unidadeId`, `categoria`, `statusValidade`. | Autenticado |
| GET | `/unidades/{unidadeId}/documentos` | Lista da unidade, com `q`, `categoria` e `statusValidade`. | Autenticado |
| GET | `/documentos/categorias` | Categorias existentes na empresa (alimenta filtros e formulários). | Autenticado |
| GET | `/documentos/{id}` | Detalhamento. | Autenticado |
| GET | `/documentos/{id}/anexo` | Entrega o arquivo (`Content-Disposition: inline`, `Content-Type` do anexo); usado pelo visualizador e pelo download. | Autenticado |
| POST | `/unidades/{unidadeId}/documentos` | Cadastra em `multipart/form-data`, anexo obrigatório; 409 se a unidade estiver inativa. | COLABORADOR |
| PUT | `/documentos/{id}` | Atualiza em `multipart/form-data`; o anexo só é substituído se um novo arquivo vier. | COLABORADOR |
| DELETE | `/documentos/{id}` | Remove (e apaga o arquivo). **Sem tela no frontend atual.** | GESTOR |

### Tarefas (RF-012 a RF-015, RF-023)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/tarefas` | Lista global com `q` (título), `unidadeId`, `status`. | Autenticado |
| GET | `/unidades/{unidadeId}/tarefas` | Lista da unidade, com `q` e `status`. | Autenticado |
| GET | `/tarefas/{id}` | Detalhamento. | Autenticado |
| POST | `/unidades/{unidadeId}/tarefas` | Cria (status inicial `pendente`, `dataInicio` = data do cadastro); 409 se a unidade estiver inativa. | COLABORADOR |
| PUT | `/tarefas/{id}` | Atualiza título, descrição e prazo final. | COLABORADOR |
| PATCH | `/tarefas/{id}/status` | Altera o status; concluir exige `confirmacao: true`. | COLABORADOR |
| DELETE | `/tarefas/{id}` | Remove. **Sem tela no frontend atual.** | GESTOR |

### Histórico de alterações (RF-017)

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| GET | `/historico` | Histórico global paginado, com `q`, `unidadeId` e `entidade` (tela `/historico`). | Autenticado |
| GET | `/unidades/{id}/historico` | Histórico de uma unidade (detalhamento e `/unidades/{id}/historico`). | Autenticado |

Não há escrita: cada operação confirmada grava automaticamente um registro com o usuário da sessão e o nome da entidade. Como o frontend usa as duas telas, o RF-017 passa a ser tratado como necessário.

---

## 4. Parâmetros — DTOs e Validação (Zod 4)

Nenhuma entidade de persistência é exposta: toda entrada e saída usa DTOs validados por Zod. Os limites desta seção são a fonte da verdade: o frontend os replica nos seus schemas Zod (seção 6, item 11), e a API rejeita campos desconhecidos.

### 4.1 POST /unidades e PUT /unidades/{id}

| Parâmetro | Tipo | Obrigatório | Validação |
|---|---|---|---|
| nome | string | Sim | 2 a 100 caracteres |
| codigo | string | Sim | 1 a 10 caracteres; letras, números e hífen; único na empresa sem diferenciar caixa |
| cep | string | Sim | 8 dígitos |
| logradouro | string | Sim | 1 a 150 |
| numero | string | Sim | 1 a 10 (ou S/N) |
| complemento | string | Não | até 100 |
| bairro | string | Sim | 1 a 100 |
| cidade | string | Sim | 1 a 100 |
| uf | string | Sim | sigla de UF válida |
| descricao | string | Não | até 500 |

```ts
// criar-unidade.schema.ts
import { z } from "zod";

export const UF_SIGLAS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
] as const;

export const CriarUnidadeSchema = z.strictObject({
  nome: z.string().trim().min(2).max(100),
  codigo: z.string().trim().min(1).max(10).regex(/^[\p{L}0-9-]+$/u, "Use somente letras, números e hífen"),
  cep: z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos"),
  logradouro: z.string().trim().min(1).max(150),
  numero: z.string().trim().min(1).max(10),
  complemento: z.string().trim().max(100).optional(),
  bairro: z.string().trim().min(1).max(100),
  cidade: z.string().trim().min(1).max(100),
  uf: z.enum(UF_SIGLAS),
  descricao: z.string().trim().max(500).optional(),
});
// o status não é aceito: a unidade nasce "ativa" e muda pelo PATCH (RF-021)
```

Identificador repetido na empresa: 409 com `codigo: "IDENTIFICADOR_DUPLICADO"` ("Já existe uma unidade com este identificador"). O frontend envia o campo do formulário `identificador` como `codigo`. A unicidade `(empresa_id, lower(codigo))` é um índice por expressão que não existe no modelo Prisma; por isso o service confere a duplicidade antes de gravar e, para a corrida entre duas requisições, converte o erro 23505 do PostgreSQL (índice `uq_unidade_empresa_codigo_ci`) em 409, sem depender do erro `P2002` do Prisma.

### 4.2 PATCH /unidades/{id}/status

```ts
export const AtualizarStatusUnidadeSchema = z.strictObject({
  status: z.enum(["ativa", "inativa"]),
});
```

### 4.3 POST /unidades/{unidadeId}/documentos e PUT /documentos/{id}

`multipart/form-data`: campos de texto mais a parte de arquivo `anexo`.

| Parâmetro | Tipo | Obrigatório | Validação |
|---|---|---|---|
| unidadeId | path | Sim | existe, da empresa e **ativa** (409 `UNIDADE_INATIVA`) |
| nome | string | Sim | 2 a 150 |
| categoria | string | Sim | 1 a 40 |
| dataEmissao | date | Não | `YYYY-MM-DD`; não posterior a `dataValidade`; vazio equivale a ausente |
| dataValidade | date | Sim | `YYYY-MM-DD` |
| descricao | string | Não | até 500 |
| tipo | string | Não | reservado, até 60 (a interface não envia) |
| anexo | arquivo | Sim na criação; opcional na edição | PDF, JPG ou PNG, até 10 MB (413 e 415) |

O corpo do PUT não aceita mudança de unidade. `statusValidade` enviado em escrita resulta em 400 (RF-011, RNF-007).

```ts
// documento.schema.ts
const dataIso = z.iso.date();

const DocumentoBase = z.strictObject({
  nome: z.string().trim().min(2).max(150),
  categoria: z.string().trim().min(1).max(40),
  dataEmissao: z.union([z.literal(""), dataIso]).optional(),
  dataValidade: dataIso,
  descricao: z.string().trim().max(500).optional(),
  tipo: z.string().trim().max(60).optional(),
});

const emissaoAteValidade = (d: { dataEmissao?: string; dataValidade?: string }) =>
  !d.dataEmissao || !d.dataValidade || d.dataEmissao <= d.dataValidade;

export const CriarDocumentoSchema = DocumentoBase.refine(emissaoAteValidade, {
  error: "A emissão não pode ser posterior ao vencimento",
  path: ["dataEmissao"],
});
export const AtualizarDocumentoSchema = DocumentoBase.partial().refine(emissaoAteValidade, {
  error: "A emissão não pode ser posterior ao vencimento",
  path: ["dataEmissao"],
});
```

### 4.4 POST /unidades/{unidadeId}/tarefas e PUT /tarefas/{id}

| Parâmetro | Tipo | Obrigatório | Validação |
|---|---|---|---|
| unidadeId | path | Sim | existe, da empresa e ativa |
| titulo | string | Sim | 2 a 150 |
| prazoFinal | date | Sim | `YYYY-MM-DD` |
| descricao | string | Não | até 500 |

Status inicial sempre `pendente` e `dataInicio` preenchida pela API; nenhum dos dois é aceito no corpo. No `PUT`, o status e a unidade não mudam, e **um prazo final diferente do atual não pode ser anterior a hoje** (400, campo `prazoFinal`), regra do formulário de edição.

```ts
const dataIso = z.iso.date();

export const CriarTarefaSchema = z.strictObject({
  titulo: z.string().trim().min(2).max(150),
  prazoFinal: dataIso,
  descricao: z.string().trim().max(500).optional(),
});
// PUT: mesmo schema; a regra "prazo não anterior a hoje se alterado" é aplicada no service.
```

### 4.5 PATCH /tarefas/{id}/status

```ts
export const AtualizarStatusTarefaSchema = z
  .strictObject({
    status: z.enum(["pendente", "em_andamento", "concluida"]),
    confirmacao: z.boolean().optional(),
  })
  .refine((d) => d.status !== "concluida" || d.confirmacao === true, {
    error: "A confirmação explícita (confirmacao: true) é obrigatória para concluir a tarefa",
    path: ["confirmacao"],
  });
```

Unidade inativa: 409 `UNIDADE_INATIVA`. Ao concluir, a API grava `dataConclusao`; ao sair de `concluida`, limpa o campo (RF-015). Alterar o status também atualiza `atualizadoEm` da unidade.

### 4.6 GET — listagens

| Parâmetro | Tipo | Validação |
|---|---|---|
| page | integer | ≥ 1 (padrão 1) |
| pageSize | integer | 1 a 100 (padrão 20) |
| q | string | até 150; sem caixa e sem acentos |
| status | enum | `/unidades`: `ativa`, `inativa`; `/tarefas`: `pendente`, `em_andamento`, `concluida` |
| statusValidade | enum | `/documentos`: `valido`, `proximo_vencimento`, `expirado` |
| categoria | string | até 40 |
| unidadeId | UUID | filtra por unidade |
| entidade | enum | `/historico`: `unidade`, `documento`, `tarefa` |

```ts
export const PaginacaoSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(150).optional(),
});
export const ListarUnidadesQuerySchema = PaginacaoSchema.extend({ status: z.enum(["ativa", "inativa"]).optional() });
export const ListarDocumentosQuerySchema = PaginacaoSchema.extend({
  statusValidade: z.enum(["valido", "proximo_vencimento", "expirado"]).optional(),
  categoria: z.string().trim().max(40).optional(),
  unidadeId: z.uuid().optional(),
});
export const ListarTarefasQuerySchema = PaginacaoSchema.extend({
  status: z.enum(["pendente", "em_andamento", "concluida"]).optional(),
  unidadeId: z.uuid().optional(),
});
export const ListarHistoricoQuerySchema = PaginacaoSchema.extend({
  unidadeId: z.uuid().optional(),
  entidade: z.enum(["unidade", "documento", "tarefa"]).optional(),
});
```

### 4.7 POST /auth/cadastro

| Parâmetro | Validação |
|---|---|
| pessoais.nome | 3 a 150 |
| pessoais.cpf | 11 dígitos, dígitos verificadores válidos; único |
| pessoais.telefone | 10 ou 11 dígitos (DDD + número) |
| pessoais.cargo | 2 a 100 |
| empresa.nomeEmpresa | 1 a 150 |
| empresa.razaoSocial | 1 a 200 |
| empresa.cnpj | 14 dígitos, dígitos verificadores válidos; único |
| empresa.segmento | 1 a 100 |
| empresa.tipoUnidade | `matriz` ou `filial` |
| empresa.cep / logradouro / numero / bairro / cidade / uf | iguais às regras da unidade |
| login.email | e-mail válido, até 180; único |
| login.senha | 8 a 72 caracteres, com maiúscula, minúscula, número e símbolo |
| login.confirmarSenha | igual a `senha` |
| login.aceiteTermos | deve ser `true` |

```ts
import { cpfValido, cnpjValido } from "./validadores";

const senhaForte = z
  .string()
  .min(8).max(72)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_])/, "A senha deve ter maiúscula, minúscula, número e símbolo");

export const CadastroSchema = z.strictObject({
  pessoais: z.strictObject({
    nome: z.string().trim().min(3).max(150),
    cpf: z.string().regex(/^\d{11}$/).refine(cpfValido, "CPF inválido"),
    telefone: z.string().regex(/^\d{10,11}$/),
    cargo: z.string().trim().min(2).max(100),
  }),
  empresa: z.strictObject({
    nomeEmpresa: z.string().trim().min(1).max(150),
    razaoSocial: z.string().trim().min(1).max(200),
    cnpj: z.string().regex(/^\d{14}$/).refine(cnpjValido, "CNPJ inválido"),
    segmento: z.string().trim().min(1).max(100),
    tipoUnidade: z.enum(["matriz", "filial"]),
    cep: z.string().regex(/^\d{8}$/),
    logradouro: z.string().trim().min(1).max(150),
    numero: z.string().trim().min(1).max(10),
    complemento: z.string().trim().max(100).optional(),
    bairro: z.string().trim().min(1).max(100),
    cidade: z.string().trim().min(1).max(100),
    uf: z.enum(UF_SIGLAS),
  }),
  login: z
    .strictObject({
      email: z.email().max(180),
      senha: senhaForte,
      confirmarSenha: z.string(),
      aceiteTermos: z.literal(true),
    })
    .refine((d) => d.senha === d.confirmarSenha, { error: "As senhas não coincidem", path: ["confirmarSenha"] }),
});
```

O campo `website` do honeypot do frontend não é enviado: o frontend descarta o envio antes da chamada. O limite de 72 caracteres respeita o bcrypt. E-mail, CPF ou CNPJ repetidos: 409 com `codigo` `EMAIL_DUPLICADO`, `CPF_DUPLICADO` ou `CNPJ_DUPLICADO` (e o campo em `erros`; o frontend exibe "Este e-mail corporativo já está em uso.").

Os limites desta tabela valem também nos schemas Zod do frontend, para que o erro apareça no campo e na etapa certos e não só no envio final (seção 6, item 11).

### 4.8 POST /auth/login

```ts
export const LoginSchema = z.strictObject({
  email: z.email(),
  senha: z.string().min(1),
  lembreMe: z.boolean().default(false),
});
```

### 4.9 Recuperação de senha

```ts
export const SolicitarCodigoSchema = z.strictObject({ email: z.email() });
export const VerificarCodigoSchema = z.strictObject({
  email: z.email(),
  code: z.string().regex(/^\d{5}$/, "Informe o código de 5 dígitos."),
});
export const RedefinirSenhaSchema = z
  .strictObject({ token: z.string().min(1), senha: senhaForte, confirmarSenha: z.string() })
  .refine((d) => d.senha === d.confirmarSenha, { error: "As senhas não coincidem", path: ["confirmarSenha"] });
```

Respostas: `POST /auth/recuperar-senha` 202 `{ "mensagem": "Se houver uma conta para este e-mail, enviaremos um código de verificação." }`; `POST /auth/verificar-codigo` 200 `{ "token": "...", "expiresIn": 600 }`; `POST /auth/redefinir-senha` 204. Os nomes `code` e `token` seguem o frontend.

### 4.10 GET /enderecos/cep/{cep}

`cep`: 8 dígitos. Resposta 200:

```json
{ "logradouro": "Avenida Conde da Boa Vista", "bairro": "Boa Vista", "cidade": "Recife", "uf": "PE" }
```

CEP em formato inválido: 400; não encontrado: 404 ("CEP não encontrado."), caso em que o frontend libera o preenchimento manual. O CEP consultado já é conhecido pelo cliente, então não volta na resposta.

---

## 5. Respostas — Status Codes, JSON e Erros

### Códigos HTTP

| Código | Quando é usado |
|---|---|
| 200 | Consulta ou atualização bem-sucedida. |
| 201 | Criação (unidade, documento, tarefa, cadastro). |
| 202 | Solicitação de código de recuperação de senha. |
| 204 | Exclusão, refresh, logout ou redefinição de senha, sem corpo. |
| 400 | Validação Zod, parâmetro inválido, campo derivado enviado, código de verificação inválido ou expirado, CEP inválido. |
| 401 | Sem sessão válida; credenciais inválidas. |
| 403 | Sem o perfil exigido; cabeçalho CSRF ausente. |
| 404 | Recurso inexistente ou de outra empresa; CEP não encontrado. |
| 409 | Conflito de regra de negócio (duplicidade, unidade inativa, exclusão com pendências). |
| 413 / 415 | Anexo acima de 10 MB / formato não aceito. |
| 429 | Reenvio em menos de 60 s, tentativas de código excedidas, excesso de requisições. |
| 500 | Erro inesperado (o frontend oferece "tentar novamente"). |

### Formato de erro global

```ts
export interface CampoInvalido { campo: string; mensagem: string; }

export interface ApiErrorResponse {
  timestamp: string;   // ISO-8601
  status: number;
  error: string;       // "BAD_REQUEST", "NOT_FOUND"...
  codigo?: string;     // códigos de negócio, ver tabela abaixo
  message: string;
  path: string;
  erros: CampoInvalido[];
}
```

Produzido por um `GlobalExceptionFilter` (`@Catch()`). Códigos de negócio (`codigo`), que o cliente usa para escolher a mensagem e o tratamento:

| codigo | Status | Equivalente no frontend |
|---|---|---|
| `UNIDADE_INATIVA` | 409 | `UnidadeInativaError` |
| `IDENTIFICADOR_DUPLICADO` | 409 | `IdentificadorUnidadeDuplicadoError` |
| `PERFIL_SEM_PERMISSAO` | 403 | `PerfilSemPermissaoError` |
| `RECURSO_NAO_ENCONTRADO` | 404 | `RecursoNaoEncontradoError` |
| `UNIDADE_COM_PENDENCIAS` | 409 | (exclusão, sem tela) |
| `EMAIL_DUPLICADO`, `CPF_DUPLICADO`, `CNPJ_DUPLICADO` | 409 | erro no campo do cadastro |

```json
{
  "timestamp": "2026-11-20T15:12:05-03:00",
  "status": 409,
  "error": "CONFLICT",
  "codigo": "UNIDADE_INATIVA",
  "message": "Não é possível modificar registros de uma unidade inativa.",
  "path": "/api/v1/unidades/3fa85f64-5717-4562-b3fc-2c963f66afa6/documentos",
  "erros": []
}
```

```json
{
  "timestamp": "2026-11-20T15:10:42-03:00",
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Um ou mais campos são inválidos",
  "path": "/api/v1/unidades",
  "erros": [{ "campo": "codigo", "mensagem": "Use somente letras, números e hífen" }]
}
```

### Unidade — `GET /unidades/{id}` → 200

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "nome": "Pátio Recife",
  "codigo": "PAT-REC",
  "status": "ativa",
  "endereco": {
    "cep": "50000000",
    "logradouro": "Av. Norte",
    "numero": "1200",
    "complemento": "Galpão 2",
    "bairro": "Centro",
    "cidade": "Recife",
    "uf": "PE"
  },
  "descricao": "Pátio principal de operação",
  "criadoEm": "2026-01-10T09:00:00-03:00",
  "atualizadoEm": "2026-08-15T11:20:00-03:00"
}
```

O resumo exibido nos cards ("Av. Norte, 1200 - Recife/PE") é composto no frontend a partir de `endereco`. Itens de `GET /unidades` são esse mesmo objeto mais `totalDocumentos` e `totalTarefas`.

### Documento — `GET /documentos/{id}` → 200

```json
{
  "id": "7c1a2b3d-4e5f-4a6b-8c9d-0e1f2a3b4c5d",
  "unidadeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "unidadeNome": "Pátio Recife",
  "nome": "Licença Ambiental - Pátio Recife",
  "tipo": null,
  "categoria": "Ambiental",
  "dataEmissao": "2025-10-05",
  "dataValidade": "2026-12-05",
  "descricao": "Renovação anual",
  "statusValidade": "proximo_vencimento",
  "anexo": {
    "nome": "licenca-ambiental.pdf",
    "tamanhoBytes": 482311,
    "tipo": "application/pdf",
    "url": "/api/v1/documentos/7c1a2b3d-4e5f-4a6b-8c9d-0e1f2a3b4c5d/anexo"
  },
  "criadoEm": "2026-02-01T10:00:00-03:00",
  "atualizadoEm": "2026-02-01T10:00:00-03:00"
}
```

`statusValidade` nunca é persistido nem aceito em escrita; é calculado a cada leitura (RF-011): **expirado** se a validade já passou; **proximo_vencimento** se faltam de 0 a 15 dias; **valido** acima de 15 dias (dias contados em UTC, como no frontend). O `url` do anexo exige a sessão e funciona dentro de `<iframe>` e `<img>` do visualizador. `anexo_tamanho_bytes` é `bigint` no banco e o Prisma o devolve como `BigInt`, que o JSON não serializa; o DTO o converte para `number` em `tamanhoBytes` (o limite de 10 MB cabe com folga).

### Tarefa — `GET /tarefas/{id}` → 200

```json
{
  "id": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
  "unidadeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "unidadeNome": "Pátio Recife",
  "titulo": "Renovar licença do pátio de Recife",
  "descricao": "Reunir a documentação e protocolar a renovação",
  "status": "concluida",
  "dataInicio": "2026-09-01",
  "prazoFinal": "2026-10-15",
  "dataConclusao": "2026-09-29T10:15:00-03:00",
  "criadoEm": "2026-09-01T08:30:00-03:00",
  "atualizadoEm": "2026-09-29T10:15:00-03:00"
}
```

### Listagem paginada — `GET /unidades?page=1&pageSize=12` → 200

```json
{
  "items": [
    { "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "nome": "Pátio Recife", "codigo": "PAT-REC",
      "status": "ativa", "endereco": { "cep": "50000000", "logradouro": "Av. Norte", "numero": "1200",
      "bairro": "Centro", "cidade": "Recife", "uf": "PE" },
      "criadoEm": "2026-01-10T09:00:00-03:00", "atualizadoEm": "2026-08-15T11:20:00-03:00",
      "totalDocumentos": 25, "totalTarefas": 32 }
  ],
  "page": 1,
  "pageSize": 12,
  "total": 1,
  "totalPages": 1
}
```

Documentos e tarefas (globais e por unidade) usam o mesmo envelope, com os DTOs acima como itens.

### Indicadores do Dashboard — `GET /dashboard/indicadores` → 200

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

`totalPendencias` = documentos `proximo_vencimento` ou `expirado` + tarefas `pendente` ou `em_andamento` (no exemplo: 8 + 13). `anterior` é recalculado para a data de referência do mês anterior e `percentual = (atual − anterior) ÷ anterior × 100` com uma casa decimal (o frontend arredonda na exibição); se `anterior` for 0, `percentual` é `null` e a variação não é exibida (RF-024). Os blocos `unidades`, `documentos` e `tarefas` alimentam as roscas; rótulos e cores são do frontend.

### Indicadores da unidade — `GET /unidades/{id}/indicadores` → 200

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

### Perfil — `GET /auth/me` → 200

```json
{
  "usuario": {
    "id": "9f1c2e30-7b3a-4b7a-9c1e-2b3a4c5d6e7f",
    "nome": "Maria Luiza da Silva",
    "cpf": "11144477735",
    "telefone": "81987654321",
    "cargo": "Administradora de Frotas",
    "email": "marialuiza@logisticaexpress.com.br",
    "perfil": "administrador",
    "empresaId": "c0a8012e-1b2c-4d3e-8f4a-5b6c7d8e9f01",
    "criadoEm": "2026-09-29T09:00:00-03:00"
  },
  "empresa": {
    "id": "c0a8012e-1b2c-4d3e-8f4a-5b6c7d8e9f01",
    "nomeEmpresa": "Logística Express Ltda",
    "razaoSocial": "Logística Express Transportes e Serviços S.A.",
    "cnpj": "11222333000181",
    "segmento": "Transporte e Distribuição",
    "tipoUnidade": "matriz",
    "endereco": { "cep": "50000000", "logradouro": "Rua Exemplo", "numero": "100", "bairro": "Santo Amaro", "cidade": "Recife", "uf": "PE" },
    "criadoEm": "2026-09-29T09:00:00-03:00"
  }
}
```

Este endpoint substitui `useSessao` e `obterPerfilConsolidado`. As máscaras de CPF, CNPJ, CEP e telefone são aplicadas pelo frontend.

### Cadastro — `POST /auth/cadastro` → 201

```json
{
  "empresaId": "c0a8012e-1b2c-4d3e-8f4a-5b6c7d8e9f01",
  "usuario": { "id": "9f1c2e30-7b3a-4b7a-9c1e-2b3a4c5d6e7f", "nome": "Maria Luiza da Silva",
               "email": "marialuiza@logisticaexpress.com.br", "perfil": "administrador" }
}
```

### Notificações — `GET /notificacoes` → 200

Calculadas na leitura, sem persistência, apenas para unidades **ativas**, no máximo 50 itens, da mais recente para a mais antiga. O estado "lida" e as preferências por categoria ficam no navegador, chaveados pelo `id`, que é determinístico (`{categoria}:{entidadeId}`).

| categoria | Condição | `criadaEm` (momento em que o item entrou na condição) |
|---|---|---|
| `documento_proximo_vencimento` | documento `proximo_vencimento` | validade − 15 dias |
| `documento_vencido` | documento `expirado` | validade + 1 dia |
| `tarefa_pendente` | tarefa `pendente` com início há 7 dias ou mais | início + 7 dias |
| `prazo_tarefa_proximo` | tarefa não concluída com prazo final entre hoje e 7 dias | prazo final − 7 dias |

```json
{
  "items": [
    { "id": "documento_vencido:7c1a2b3d-4e5f-4a6b-8c9d-0e1f2a3b4c5d",
      "categoria": "documento_vencido",
      "titulo": "Documento vencido",
      "descricao": "O Certificado de Bombeiros está vencido.",
      "criadaEm": "2026-11-12T00:00:00-03:00",
      "entidade": "documento",
      "entidadeId": "7c1a2b3d-4e5f-4a6b-8c9d-0e1f2a3b4c5d",
      "unidadeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6" }
  ]
}
```

O frontend monta o destino (`/documentos/{id}/editar` ou `/tarefas/{id}/editar`) a partir de `entidade` e `entidadeId`.

### Histórico — `GET /historico` e `GET /unidades/{id}/historico` → 200

```json
{
  "items": [
    { "id": "5d6e7f80-9a1b-4c2d-8e3f-4a5b6c7d8e9f",
      "unidadeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "unidadeNome": "Pátio Recife",
      "usuarioId": "9f1c2e30-7b3a-4b7a-9c1e-2b3a4c5d6e7f",
      "usuarioNome": "Maria Luiza da Silva",
      "entidade": "tarefa",
      "entidadeId": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
      "entidadeNome": "Renovar licença do pátio de Recife",
      "acao": "edicao",
      "descricao": "Alterou o status da tarefa de Em andamento para Concluída",
      "criadoEm": "2026-11-20T10:15:00-03:00" }
  ],
  "page": 1, "pageSize": 10, "total": 1, "totalPages": 1
}
```

O texto exibido na tela é `descricao`. A pesquisa `q` do histórico global procura em `descricao`, `usuarioNome`, `entidadeNome`, rótulo da entidade e `unidadeNome`.

### Saúde — `GET /health` → 200

```json
{ "status": "ok", "db": "up" }
```

Responde 503 se o banco estiver indisponível.

---

## 6. Integração com o frontend

### Mapeamento de valores

| API | Frontend |
|---|---|
| `ativa` / `inativa` | Ativa / Inativa |
| `matriz` / `filial` | Matriz / Filial |
| `colaborador` / `gestor` / `administrador` | Colaborador / Gestor / Administrador |
| `pendente` / `em_andamento` / `concluida` | Pendente / Em andamento / Concluída |
| `valido` / `proximo_vencimento` / `expirado` | Válido / Próximo do vencimento / Expirado |

### Mapeamento de requisições

| Frontend | API |
|---|---|
| `page` (≥ 1), `pageSize` | iguais; `UnidadesFilters.size` → `pageSize` |
| `search` (`DocumentFilters`, `TaskFilters`, `HistoricoFilters`) | `q` |
| `unidadeId: "todas"`, `categoria: "todas"`, `status: "Todos"`, `entidade: "Todas"` | omitir o parâmetro |
| `DocumentFilters.status` (rótulo) | `statusValidade` (valor) |
| `HistoricoFilters.entidade` (rótulo: Unidade, Documento, Tarefa) | `entidade` (valor: `unidade`, `documento`, `tarefa`) |
| formulário de unidade `identificador` | `codigo` |
| formulário de cadastro `estado` | `uf` |
| `UnidadeFormValues.cep` (já normalizado) | `endereco.cep` |
| `lembreMe` (login) | `lembreMe` |
| `DashboardIndicators.documentosAVencer` | `documentos.proximoVencimento` |
| `DashboardIndicators.tarefasConcluidas` | `tarefas.concluida` |
| `variacao*` (inteiro) | `variacao.*.percentual` (arredondar na exibição) |

### Adaptações necessárias no frontend ao integrar

1. **Cliente HTTP único** (`fetch` com `credentials: "same-origin"`, cabeçalho `X-FrotaSync-Client: web` nas escritas, renovação em 401 e redirecionamento a `/login`, tratamento de 403, 404, 409, 413, 415 e 429), no lugar de `mocks/*` e `wait`. Os services passam a converter DTO ↔ tipos de domínio.
2. **Sessão:** remover os Route Handlers `app/api/auth/*`, o cookie HMAC e `FROTASYNC_SESSION_SECRET`. O `proxy.ts` passa a verificar o cookie `frotasync_session` (existência e `exp` no futuro); a autorização real é da API.
3. **Cadastro em 3 etapas:** manter os dados das etapas 1 e 2 em estado do cliente (por exemplo, um contexto) e enviar `POST /auth/cadastro` na etapa 3; remover `mockValidarDados*`. Normalizar CPF, CNPJ, CEP e telefone para dígitos (sem `+55`) antes de enviar.
4. **Recuperação de senha:** chamar os três endpoints; o `token` fica no `sessionStorage` entre os passos, como hoje.
5. **CEP:** trocar a chamada direta ao ViaCEP na tela de cadastro da empresa e o mock `buscarCep` por `GET /enderecos/cep/{cep}`.
6. **Documentos:** enviar `FormData` com o `File` do formulário em vez de um objeto `DocumentoAnexo`; remover `public/mock-docs`. Carregar as categorias de `GET /documentos/categorias` em vez de `mockCategorias`. No formulário, exibir o `codigo` da unidade em "ID", não o `unidadeId` (UUID).
7. **Perfil, sessão e barra superior:** usar `GET /auth/me`; as notificações vêm de `GET /notificacoes` (estado "lida" e preferências em `localStorage`).
8. **Permissões na interface:** ocultar ou desabilitar "Nova unidade" e "Editar unidade" para quem não é administrador (hoje só o status é checado); a API é a autoridade (403).
9. **Totais de cabeçalho** de `/documentos`, `/tarefas` e da unidade vêm de `/dashboard/indicadores` e `/unidades/{id}/indicadores`.
10. **Exclusões:** o frontend não tem fluxo de exclusão; os `DELETE` ficam disponíveis na API, sem uso por enquanto.
11. **Limites nos schemas Zod do frontend:** hoje os schemas de cadastro validam apenas "não vazio" e o de login não valida o formato do e-mail. Passam a replicar os limites da seção 4, mesmo onde a tela usa seletor:

| Schema do frontend | Regra a acrescentar |
|---|---|
| `cadastroPessoal.nome` | 3 a 150 caracteres |
| `cadastroPessoal.cargo` | 2 a 100 caracteres |
| `cadastroPessoal.telefone` | 10 ou 11 dígitos, depois de remover a máscara e o `+55` (hoje só há mínimo de 10) |
| `cadastroEmpresa.nomeEmpresa` / `razaoSocial` / `segmento` | até 150 / 200 / 100 caracteres |
| `cadastroEmpresa.tipoUnidade` | Matriz ou Filial (enviado como `matriz` ou `filial`) |
| `cadastroEmpresa.cep` | 8 dígitos |
| `cadastroEmpresa.estado` | UF válida (enviada como `uf`) |
| `cadastroEmpresa.logradouro` / `numero` / `bairro` / `cidade` | até 150 / 10 / 100 / 100 caracteres |
| `cadastroAcesso.email` | e-mail válido, até 180 caracteres |
| `senhaForte` (cadastro e redefinição) | no máximo 72 caracteres, o limite do bcrypt |
| `loginSchema.email` | formato de e-mail válido (US-011); sem isso a API responde 400, e não 401 |

Os schemas de unidade, documento e tarefa do frontend já coincidem com a seção 4.

### Pontos em aberto

- **Semântica da variação dos indicadores (RF-024):** o frontend compara documentos "a vencer" pelo mês de `dataValidade` e tarefas concluídas pelo mês de `dataConclusao`. Esta API recalcula o status e a contagem na data de referência do mês anterior (seção 5). Os números tendem a diferir dos exibidos hoje com os mocks. Decidir qual regra vale antes da integração do Dashboard (US-136) e ajustar este contrato ou o cálculo do frontend.

---

## Histórico de Alterações

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 22/09/2026 | 1.0 | Criação inicial do Design de API. | Equipe do projeto |
| 29/09/2026 | 1.1 | Alinhamento à Análise de Requisitos v1.1; `GET /tarefas`, histórico, total de pendências. | Equipe do projeto |
| 05/10/2026 | 1.2 | Cadastro, recuperação de senha, indicadores da unidade, CEP, anexo; novos códigos HTTP. | Equipe do projeto |
| 20/11/2026 | 1.4 | Conferência com o frontend completo: paginação e nomes de campos do frontend; sessão por cookies httpOnly com CSRF; recuperação de senha com os nomes do frontend e intervalo de 60 s; `GET /auth/me`, `GET /historico`, `GET /notificacoes`, `GET /health`, `GET /documentos/categorias`; `codigo` nos erros; regras de formulário adotadas; seção de integração com o frontend. Documento deixa de se declarar "100% frontend" e passa a descrever a API real. | Equipe do projeto |
| 20/11/2026 | 1.5 | Atualização da arquitetura de persistência: adoção do Prisma ORM para acesso aos dados pelo NestJS, mantendo o Flyway como ferramenta exclusiva de versionamento e execução das migrações SQL do PostgreSQL. Nenhuma alteração nos contratos da API ou na modelagem de dados. | Equipe do projeto |
| 21/11/2026 | 1.6 | Conferência com o frontend: limites de campos replicados nos schemas Zod do frontend (a API prevalece); mapeamentos `size`, `search` e `entidade`; 429 na verificação de código com tentativas esgotadas; logout público por cookie de refresh; tratamento do identificador duplicado sem depender do `P2002`; conversão do `BigInt` do tamanho do anexo; ponto em aberto sobre a variação dos indicadores. Nenhum endpoint criado ou removido. | Equipe do projeto |

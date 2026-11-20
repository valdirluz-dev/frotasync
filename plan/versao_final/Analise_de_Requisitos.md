# FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas

**Versão do documento:** 1.3 | **Data:** 20/10/2026\
**Documento:** Análise de Requisitos\
*Documento complementar ao Brief (01) e a Personas & Jornadas (02). Base para Estórias (04), Infra (05), Dados (06) e API (07).*

---

## Equipe de desenvolvimento

- **Desenvolvedor(a):** Valdir
- **Desenvolvedor(a):** Filipe
- **Desenvolvedor(a):** Gabriely
- **Desenvolvedor(a):** Lucas Vinícius
- **Desenvolvedor(a):** Murilo
- **Desenvolvedor(a):** Niedson
- **Desenvolvedor(a):** Silas

---

## Tecnologias utilizadas no projeto

Esta seção é a **fonte única da stack**: os demais documentos apenas a referenciam.

- **Linguagem de programação (back-end):** TypeScript (Node.js)
- **Framework (back-end):** NestJS (API REST), Zod, Passport/JWT, bcrypt
- **Front-end:** Next.js, React, Tailwind CSS, React Hook Form, Zod, TanStack Query e TanStack Table
- **Tipo de sistema:** aplicação fullstack (frontend web responsivo, também utilizável como aplicativo mobile, API REST e banco de dados), executada em contêineres na nuvem AWS
- **Banco de dados:** PostgreSQL, com versionamento de esquema via Flyway (RNF-022). Os dados mockados (RNF-008) permanecem apenas como camada de transição até a integração com a API e como base do seed de desenvolvimento
- **IDE utilizada no dpreencha o esenvolvimento:** Visual Studio Code (VSCode)
- **Documentação da API:** Swagger/OpenAPI (gerada pela API NestJS), schemas Zod como contrato dos dados e documento Design de API
- **Protótipo de interface:** Figma (arquivo SystemDesign)
- **Infraestrutura e entrega:** Docker e Docker Compose (ambiente local), Terraform, AWS (RDS, S3, ECR e execução dos contêineres) e GitHub Actions (CI/CD) — RNF-028 a RNF-032

---

## Introdução

### Descrição geral do sistema

A FrotaSync é uma aplicação fullstack (frontend em Next.js, API REST em NestJS e banco PostgreSQL, em contêineres na AWS) que apoia a gestão das unidades (filiais e pátios) de uma transportadora fictícia, dos documentos vinculados a cada unidade (Licença Ambiental, Registro na ANTT, Seguro de Carga) e das tarefas relacionadas (ex.: "renovar licença do pátio de Recife"). O problema que resolve: um documento vencido pode causar apreensão de veículo, atraso de carga e multas, e o volume de datas a controlar é grande. O usuário se cadastra (usuário e empresa, em três etapas), recupera a senha por código enviado ao e-mail e faz login. Depois, visualiza o Dashboard Global (cards com gráficos de rosca e total de pendências), consulta listas globais de documentos e de tarefas, gerencia unidades em cards, ativa ou inativa unidades e cadastra, edita e acompanha documentos e tarefas, de forma global e por unidade. O sistema é consumido pelo frontend web responsivo, cliente oficial da API.

Nas versões 1.0 a 1.2 o projeto era 100% frontend com dados mockados. A partir da v1.3, as regras de negócio (autenticação, status de unidades, validade de documentos, status de tarefas e indicadores) são executadas e persistidas no backend.

**Escopo:** os documentos são vinculados às unidades. O controle por veículo (CRLV, tacógrafo) e por motorista (CNH, exame toxicológico, MOPP) é evolução futura, fora do escopo atual.

### Público alvo

Perfis vindos do documento de Personas (02). IDs provisórios, atribuídos a partir das personas das Estórias de Usuário (ver Pendências).

- **P-01 — Colaborador(a) / usuário administrativo da FrotaSync:** acompanha filiais e pátios, consulta e cadastra documentos e gerencia as tarefas de cada unidade no dia a dia.
- **P-02 — Gestor(a) / tomador de decisão:** usa o Dashboard e as listas globais para ter visão rápida da situação da empresa e apoiar decisões sobre prioridades e pendências.
- **P-03 — Administrador(a):** garante a segurança de acesso e a consistência dos dados (cadastro, ativação e inativação de unidades, regras de unidades inativas).
- **P-04 — Novo(a) usuário(a):** ainda não tem acesso; cadastra a si e a empresa ou recupera a senha.
- **P-05 — Desenvolvedor(a):** constrói e mantém o sistema, o banco, a API, os dados de demonstração (mocks e seed) e a integração entre as camadas.
- **P-06 — Responsável pela operação:** publica versões, acompanha a disponibilidade na nuvem e recupera os dados após falhas.

### Objetivo

Centralizar, em um único sistema, o acompanhamento de unidades, documentos e tarefas da FrotaSync, com indicadores rápidos e regras automáticas de status (validade de documentos e andamento de tarefas), reduzindo o controle manual e o risco de documentos vencidos ou tarefas esquecidas, para colaboradores, gestores e administradores.

---

## Tipos de Requisitos

Os requisitos do sistema são divididos em duas categorias:

- **Requisitos funcionais (RF):** definem o que o sistema deve fazer.
- **Requisitos não funcionais (RNF):** definem como o sistema deve funcionar (atributos de qualidade), sempre com uma **meta mensurável**.

## Níveis de Prioridade dos Requisitos

A mesma escala é usada nas estórias (04), onde recebe o nome MoSCoW.

- **Obrigatório (= Must have):** o sistema não funciona sem este requisito.
- **Necessário (= Should have):** o sistema funciona, mas de forma insatisfatória sem ele. Deve ser implementado.
- **Opcional (= Could have):** o sistema funciona bem sem ele; pode ficar para uma versão futura.
- **Fora do escopo agora (= Won't have):** não entra nesta fase. Fica registrado no Brief (01 §4) e no 04, não neste documento.

---

## Requisitos Funcionais

O campo **Origem** indica a persona (P-NN), a estória de usuário correspondente (US) e a versão em que o requisito foi criado ou alterado. Os IDs originais foram mantidos ("RF 001" passa a "RF-001"), preservando a rastreabilidade com as estórias.

### RF-001 — Autenticação de usuário (login)

- **Origem:** P-01, P-02, P-03; US 011; alterado na v1.2
- **Descrição:** O usuário se autentica com e-mail corporativo e senha, com a opção "Lembre-me" e links para "Esqueceu a senha?" (RF-020) e "Cadastre-se" (RF-019). Os campos são validados com Zod antes do envio.
- **Entradas e pré-condições:** E-mail corporativo, senha e, opcionalmente, "Lembre-me".
- **Saídas e pós-condições:** Sucesso: usuário autenticado e redirecionado ao Dashboard Global, com feedback de sucesso; com "Lembre-me", a sessão dura mais. Erro (credenciais inválidas ou campos mal preenchidos): mensagem específica, sem redirecionamento.
- **Prioridade:** Obrigatório

### RF-002 — Dashboard Global com indicadores gerais

- **Origem:** P-02; US 021; alterado na v1.3 e na v1.2
- **Descrição:** A tela inicial após o login exibe três cards com gráfico de rosca: Unidades (ativas e inativas), Documentos (Válido, Próximo do vencimento e Expirado) e Tarefas (Concluída, Em andamento e Pendente), além do total de pendências (documentos próximos do vencimento ou expirados + tarefas pendentes ou em andamento). As listas globais ficam em rotas dedicadas (RF-008 e RF-013).
- **Entradas e pré-condições:** Indicadores fornecidos pela API (`GET /dashboard/indicadores`) e consumidos via TanStack Query.
- **Saídas e pós-condições:** Cards com totais e distribuição por status, usando os mesmos rótulos dos RF-011 e RF-015. Sem dados, exibe zero, sem erro.
- **Prioridade:** Obrigatório

### RF-003 — Atualização automática do total de pendências

- **Origem:** P-02; US 022; v1.1
- **Descrição:** O total de pendências do Dashboard reflete qualquer alteração em documentos, tarefas e unidades, sem recarregar a página.
- **Entradas e pré-condições:** Alterações de status ou cadastros confirmados em outras telas.
- **Saídas e pós-condições:** Indicadores atualizados por invalidação/refetch do cache do TanStack Query. Concluir uma tarefa no detalhamento da unidade também atualiza a lista de tarefas.
- **Prioridade:** Obrigatório

### RF-004 — Listagem de unidades

- **Origem:** P-01; US 031; alterado na v1.2
- **Descrição:** Grade paginada de cards (12 por página, "Mostrando 1 a 12 de N unidades") com identificador, endereço, quantidade de documentos e de tarefas e selo de status (ATIVA em verde, INATIVA em vermelho). Oferece pesquisa por nome/identificador, filtro de status e botão "Nova Unidade". Clicar em um card abre o detalhamento (RF-006).
- **Entradas e pré-condições:** Termo de pesquisa, filtros e página atual.
- **Saídas e pós-condições:** Grade atualizada conforme pesquisa, filtros e paginação. Sem resultados: mensagem de lista vazia.
- **Prioridade:** Obrigatório

### RF-005 — Cadastro e edição de unidade

- **Origem:** P-03; US 034; alterado na v1.3 e na v1.2; novo na v1.1
- **Descrição:** Formulário validado com Zod: nome, identificador (código único por empresa), CEP, logradouro, número, complemento (opcional), bairro, cidade, UF e descrição (opcional). O botão "Buscar CEP" preenche logradouro, bairro, cidade e UF, consultando o backend (`GET /enderecos/cep/{cep}`). Antes de gravar, o modal "Deseja cadastrar a unidade?" pede confirmação. A edição reutiliza o formulário. A unidade nasce ativa; o status muda pelo RF-021.
- **Entradas e pré-condições:** Dados do formulário; CEP com 8 dígitos (RNF-020); perfil Administrador.
- **Saídas e pós-condições:** Unidade criada ou atualizada e refletida na listagem e no Dashboard. Erros por campo. CEP não encontrado (404): mensagem informativa e preenchimento manual. Identificador repetido: erro no campo (409).
- **Prioridade:** Obrigatório

### RF-006 — Detalhamento da unidade

- **Origem:** P-01; US 032; alterado na v1.2
- **Descrição:** Tela com título "Unidade \<nome> (ID \<identificador>)", endereço e selo de status; card "Informações da unidade" (status, data de criação, última modificação e "Mais detalhes"); cards de Documentos e de Tarefas com gráficos de rosca da unidade; e tabela alternável entre Documentos e Tarefas (RF-010 e RF-012), com os botões "Novo documento" e "Nova Tarefa". O administrador ativa ou inativa a unidade aqui (RF-021).
- **Entradas e pré-condições:** Identificador da unidade selecionada.
- **Saídas e pós-condições:** Tela com dados, cards e listas. Unidade inativa: documentos e tarefas em modo somente leitura (RF-007).
- **Prioridade:** Obrigatório

### RF-007 — Restrição de unidades inativas

- **Origem:** P-03; US 033; alterado na v1.2
- **Descrição:** Unidades inativas não recebem novos documentos ou tarefas nem têm os existentes modificados. As ações de cadastro e edição ficam desabilitadas; ao tentar cadastrar uma tarefa, aparece o aviso "Não é possível cadastrar a tarefa", com a ação "Voltar para unidades". Os seletores de unidade dos formulários listam apenas unidades ativas. A API também bloqueia (409).
- **Entradas e pré-condições:** Status da unidade (ativa ou inativa).
- **Saídas e pós-condições:** Ativa: ações habilitadas. Inativa: ações bloqueadas e itens existentes apenas para leitura.
- **Prioridade:** Obrigatório

### RF-008 — Lista global de documentos

- **Origem:** P-02; US 041; alterado na v1.3 e na v1.2
- **Descrição:** Tela Documentos (rota `/documentos`, no menu lateral) com todos os documentos de todas as unidades: busca por nome, filtros (unidade, categoria e status), paginação (10 por página) e botão "Novo documento" (RF-009). Colunas: documento, unidade, categoria, emissão, validade, status e ações ("Editar", RF-022). O cabeçalho exibe o total de documentos a vencer, com variação (RF-024).
- **Entradas e pré-condições:** Filtros e pesquisa do usuário.
- **Saídas e pós-condições:** Tabela com o status calculado (Válido, Próximo do vencimento ou Expirado). Sem resultados: lista vazia.
- **Prioridade:** Obrigatório

### RF-009 — Cadastro de documento

- **Origem:** P-01; US 044; alterado na v1.2; novo na v1.1
- **Descrição:** Formulário validado com Zod: nome, anexo (obrigatório), unidade vinculada, categoria, data de emissão (opcional), data de vencimento e descrição (opcional). O status não é informado (RF-011). Antes de gravar, o modal "Deseja cadastrar o documento?". Aberto a partir de uma unidade, o campo de unidade vem preenchido e bloqueado.
- **Entradas e pré-condições:** Dados e arquivo anexo; unidade ativa.
- **Saídas e pós-condições:** Documento criado com status calculado e refletido nas listas e no Dashboard. A emissão, se informada, não pode ser posterior ao vencimento. Erros por campo.
- **Prioridade:** Obrigatório

### RF-010 — Lista de documentos por unidade

- **Origem:** P-01; US 042; alterado na v1.2
- **Descrição:** Na aba Documentos do detalhamento, lista apenas os documentos da unidade, com busca, filtros (categoria e status), paginação e colunas documento, categoria, emissão, validade, status e ações. O cabeçalho exibe o total de documentos expirados, com variação (RF-024).
- **Entradas e pré-condições:** Identificador da unidade.
- **Saídas e pós-condições:** Lista filtrada com o status calculado em cada item.
- **Prioridade:** Obrigatório

### RF-011 — Cálculo automático do status do documento

- **Origem:** P-01; US 043; alterado na v1.3
- **Descrição:** O status é calculado pelo backend (fonte da verdade) a partir da data de validade, sem digitação livre. **Válido:** validade a mais de 15 dias da data atual. **Próximo do vencimento:** faltam até 15 dias. **Expirado:** validade já passou. O frontend apenas exibe o status recebido.
- **Entradas e pré-condições:** Data de validade e data atual do servidor.
- **Saídas e pós-condições:** Status derivado, exibido com cores/etiquetas nas listagens. O cliente nunca o envia (400 se tentar).
- **Prioridade:** Obrigatório

### RF-012 — Lista de tarefas por unidade

- **Origem:** P-01; US 051; alterado na v1.2
- **Descrição:** Na aba Tarefas do detalhamento, lista as tarefas da unidade, com busca, filtro de status, paginação e colunas: tarefa, data de início, prazo final, status visual (Pendente, Em andamento, Concluída), data de conclusão e ações. O cabeçalho exibe o total de tarefas concluídas, com variação (RF-024).
- **Entradas e pré-condições:** Identificador da unidade.
- **Saídas e pós-condições:** Lista com status, datas e prazo, com destaque visual por status.
- **Prioridade:** Obrigatório

### RF-013 — Lista global de tarefas

- **Origem:** P-02; US 053; alterado na v1.3 e na v1.2; novo na v1.1
- **Descrição:** Tela Tarefas (rota `/tarefas`, no menu lateral) com todas as tarefas de todas as unidades: busca por título, filtros (unidade e status), paginação (10 por página), botão "Nova Tarefa" (RF-014) e colunas tarefa, unidade, data de início, prazo final, status, data de conclusão e ações. O cabeçalho exibe o total de tarefas concluídas, com variação (RF-024).
- **Entradas e pré-condições:** Filtros e pesquisa do usuário.
- **Saídas e pós-condições:** Tabela com status e prazo; sem resultados, lista vazia. A alteração de status segue o RF-015.
- **Prioridade:** Obrigatório

### RF-014 — Cadastro de tarefa

- **Origem:** P-01; US 054; alterado na v1.2; novo na v1.1
- **Descrição:** Formulário validado com Zod: título, unidade vinculada, prazo (obrigatório) e descrição (opcional). O status inicial é Pendente (exibido, não editável) e a data de início é a data do cadastro, preenchida pela API. Antes de gravar, o modal "Deseja criar a tarefa?". Aberto a partir de uma unidade, o campo de unidade vem preenchido e bloqueado.
- **Entradas e pré-condições:** Dados do formulário; unidade ativa.
- **Saídas e pós-condições:** Tarefa criada e refletida nas listas e no Dashboard. Erros por campo.
- **Prioridade:** Obrigatório

### RF-015 — Alteração de status da tarefa com confirmação

- **Origem:** P-01; US 052; alterado na v1.2
- **Descrição:** O usuário altera o status entre Pendente, Em andamento e Concluída. A transição para Concluída exige confirmação explícita (modal "Concluir tarefa?", citando o título), validada também na API (`confirmacao: true`). Ao concluir, registra data e hora de conclusão. Tarefas de unidades inativas não mudam de status (RF-007).
- **Entradas e pré-condições:** Novo status selecionado.
- **Saídas e pós-condições:** Ao confirmar: status atualizado nas listagens e no Dashboard. Ao cancelar: inalterado. Se sair de Concluída, a data de conclusão é limpa.
- **Prioridade:** Obrigatório

### RF-016 — Bloqueio de exclusão de unidade com pendências

- **Origem:** P-03; US 081; v1.1
- **Descrição:** Impede a exclusão de unidade com documentos pendentes (próximos do vencimento ou expirados) ou tarefas em andamento, com mensagem explicando o motivo (409 na API).
- **Entradas e pré-condições:** Solicitação de exclusão (perfil Administrador).
- **Saídas e pós-condições:** Sem pendências: exclusão permitida, com confirmação. Com pendências: bloqueada, com mensagem.
- **Prioridade:** Opcional

### RF-017 — Histórico de alterações (auditoria simples)

- **Origem:** P-02; US 082; alterado na v1.3; novo na v1.1
- **Descrição:** Registra quem alterou o quê e quando (unidade, documento, tarefa) na tabela `historico_alteracao` (migration V7) e exibe o histórico no detalhamento da unidade (`GET /unidades/{id}/historico`).
- **Entradas e pré-condições:** Alterações confirmadas por usuário autenticado.
- **Saídas e pós-condições:** Lista paginada de eventos (usuário, ação, data/hora).
- **Prioridade:** Opcional

### RF-018 — Alternância de tema claro/escuro

- **Origem:** P-01; US 083; v1.1
- **Descrição:** O usuário alterna entre tema claro e escuro, com a escolha persistida entre sessões e sem perda de contraste dos status visuais. Exclusivamente de interface.
- **Entradas e pré-condições:** Ação no seletor de tema.
- **Saídas e pós-condições:** Interface no tema escolhido, mantido ao reabrir o sistema.
- **Prioridade:** Opcional

### RF-019 — Cadastro de usuário e empresa em 3 etapas

- **Origem:** P-04; US 013; alterado na v1.3; novo na v1.2
- **Descrição:** A partir de "Cadastre-se", cadastro em três etapas com indicador de progresso. **1, Dados pessoais:** nome, CPF, telefone e cargo. **2, Dados da empresa:** nome comercial, razão social, CNPJ, segmento, tipo de unidade (Matriz ou Filial) e endereço. **3, Dados de login:** e-mail corporativo, senha (mínimo de 8 caracteres), confirmação e aceite dos Termos de Uso e da Política de Privacidade. Cada etapa é validada com Zod antes de avançar.
- **Entradas e pré-condições:** Dados das três etapas, com máscaras e validações do RNF-020.
- **Saídas e pós-condições:** Empresa e usuário (perfil Administrador) criados na mesma transação (`POST /auth/cadastro`), com aceite registrado com data e hora, e redirecionamento ao login com mensagem de sucesso. E-mail, CPF ou CNPJ já cadastrados: erro no campo (409).
- **Prioridade:** Necessário

### RF-020 — Recuperação de senha

- **Origem:** P-04; US 014, US 124; alterado na v1.3; novo na v1.2
- **Descrição:** Redefinição em três passos: (1) informar o e-mail e solicitar o código; (2) informar o código de 5 dígitos recebido por e-mail, com "Enviar novo código"; (3) definir e confirmar a nova senha.
- **Entradas e pré-condições:** E-mail cadastrado, código e nova senha com confirmação.
- **Saídas e pós-condições:** Senha redefinida e redirecionamento ao login. Código inválido ou expirado: erro, sem avançar. O sistema não revela se o e-mail existe (resposta sempre 202). O código é enviado por e-mail (console em desenvolvimento, Amazon SES no ambiente publicado), guardado só como hash, com expiração, limite de tentativas e uso único.
- **Prioridade:** Necessário

### RF-021 — Ativação e inativação de unidade com confirmação

- **Origem:** P-03; US 035; v1.2
- **Descrição:** No detalhamento, o administrador ativa ou inativa a unidade. Ao inativar, o modal "Deseja desativar a unidade?" informa que documentos e tarefas deixarão de poder ser modificados; ao ativar, "Deseja ativar a unidade?" informa que poderão voltar a ser modificados.
- **Entradas e pré-condições:** Unidade existente; perfil Administrador.
- **Saídas e pós-condições:** Ao confirmar: selo, listagem, cards e Dashboard atualizados (RF-003) e restrições do RF-007 aplicadas. Ao cancelar: nada muda.
- **Prioridade:** Obrigatório

### RF-022 — Edição de documento

- **Origem:** P-01; US 045; v1.2
- **Descrição:** A ação "Editar" abre o formulário do RF-009 já preenchido; o anexo só é substituído se um novo arquivo for enviado.
- **Entradas e pré-condições:** Documento existente de unidade ativa.
- **Saídas e pós-condições:** Documento atualizado, status recalculado e listas e Dashboard atualizados. Unidade inativa: edição bloqueada (RF-007).
- **Prioridade:** Necessário

### RF-023 — Edição de tarefa

- **Origem:** P-01; US 055; v1.2
- **Descrição:** O usuário edita título, descrição e prazo de uma tarefa. O status muda apenas pelo RF-015.
- **Entradas e pré-condições:** Tarefa existente de unidade ativa.
- **Saídas e pós-condições:** Tarefa atualizada e refletida nas listas e no Dashboard. Unidade inativa: edição bloqueada (RF-007).
- **Prioridade:** Necessário

### RF-024 — Indicadores de variação

- **Origem:** P-02; US 023; alterado na v1.3; novo na v1.2
- **Descrição:** O cabeçalho das tabelas exibe o total acompanhado da variação percentual em relação ao período anterior, com seta e cor: em `/documentos`, "Total de documentos a vencer"; em `/tarefas`, "Total de Tarefas Concluídas"; no detalhamento da unidade, "Total de documentos expirados" e "Total de Tarefas Concluídas". A variação é calculada pela API, sem snapshots.
- **Entradas e pré-condições:** Datas de validade, criação e conclusão e um período de referência (mês anterior).
- **Saídas e pós-condições:** Total e variação exibidos; se o valor anterior for zero, o percentual é nulo e a variação não é exibida.
- **Prioridade:** Necessário

### RF-025 — Navegação principal e estrutura das telas

- **Origem:** P-01, P-02, P-03; US 024; alterado na v1.3; novo na v1.2
- **Descrição:** Todas as telas autenticadas têm menu lateral (Dashboard, Documentos, Tarefas, Unidades e Configurações), barra superior (logotipo, busca, notificações, ajuda e nome e perfil do usuário), breadcrumbs conforme a rota e botão "Voltar para …" nos formulários. Exclusivamente de interface.
- **Entradas e pré-condições:** Usuário autenticado.
- **Saídas e pós-condições:** Navegação consistente, com o item da seção atual destacado.
- **Prioridade:** Necessário

### RF-026 — Download do anexo do documento

- **Origem:** P-01, P-02; US 126, US 134; novo na v1.3
- **Descrição:** O usuário autenticado baixa o arquivo anexado a um documento a partir das listas e do detalhamento. O download é autorizado pela API (`GET /documentos/{id}/anexo`); os arquivos não são públicos.
- **Entradas e pré-condições:** Documento existente da empresa do usuário.
- **Saídas e pós-condições:** Arquivo entregue. Documento de outra empresa: 404; sem sessão válida: 401. Documentos de unidades inativas podem ser baixados.
- **Prioridade:** Obrigatório

### RF-027 — Encerramento de sessão (logout)

- **Origem:** P-01, P-02, P-03; US 122, US 132; novo na v1.3
- **Descrição:** O usuário encerra a sessão pela identificação do usuário na barra superior. O refreshToken atual é invalidado (`POST /auth/logout`) e o usuário vai para `/login`.
- **Entradas e pré-condições:** Usuário autenticado.
- **Saídas e pós-condições:** Sessão encerrada no servidor e no cliente; rotas protegidas inacessíveis até novo login.
- **Prioridade:** Necessário

---

## Requisitos Não Funcionais

Cada RNF traz uma **meta mensurável** e a sua origem (persona, estória ou versão). Os IDs originais foram mantidos para preservar a rastreabilidade; por isso a numeração segue a do projeto, e não a sugerida no modelo. Metas marcadas com *(sugerida)* não constavam nas versões anteriores e devem ser validadas pela squad (ver Pendências). O RNF-017 (camada de API simulada, descartado) e o RNF-019 (deploy com pipeline, substituído pelos RNF-029 e RNF-031) não constam nesta lista.

- **RNF-001 — Arquitetura de software:** aplicação fullstack (Next.js + TypeScript, API REST em NestJS e PostgreSQL), com separação clara entre UI, formulários, acesso a dados (cliente da API) e lógica de negócio, que fica nos serviços da API (RNF-024). **Meta:** nenhuma regra de negócio implementada somente no frontend. *Origem: P-05; US 074, US 121; alterado na v1.3.* **Prioridade:** Obrigatório.
- **RNF-002 — Tecnologia utilizada:** conforme a seção "Tecnologias": Next.js, TypeScript, Tailwind CSS, React Hook Form + Zod, TanStack Query e TanStack Table no frontend; NestJS, PostgreSQL com Flyway, Docker, Terraform, AWS e GitHub Actions no restante. **Meta:** 100% do código em TypeScript. *Origem: P-05; US 074; alterado na v1.3.* **Prioridade:** Obrigatório.
- **RNF-003 — Documentação:** regras de dados documentadas em schemas Zod; API documentada em Swagger/OpenAPI; README com descrição, tecnologias, arquitetura (frontend, API, banco e nuvem) e instruções de execução local e de deploy. **Meta:** documentação OpenAPI idêntica às respostas reais, verificada em teste automatizado (RNF-033). *Origem: P-05; US 076, US 129; alterado na v1.3.* **Prioridade:** Obrigatório.
- **RNF-004 — Segurança e controle de acesso:** apenas `/login`, `/cadastro` e `/recuperar-senha` são públicas; as demais rotas exigem sessão válida, e o usuário sem sessão é redirecionado a `/login` sem ver conteúdo protegido. No servidor, autenticação JWT e autorização por perfil (colaborador, gestor, administrador) são aplicadas a cada requisição. **Meta:** 100% dos endpoints protegidos respondem 401 sem token válido e 403 sem o perfil exigido, cobertos por testes; accessToken de 15 minutos e refreshToken de 7 dias (30 dias com "Lembre-me"); HTTPS obrigatório em produção. *Origem: P-03; US 012, US 123, US 131; alterado na v1.3 e na v1.2.* **Prioridade:** Obrigatório.
- **RNF-005 — Desempenho:** listagens paginadas (12 por página nas unidades e 10 nas tabelas; padrão da API de 20) e cache do TanStack Query para evitar requisições e re-renderizações desnecessárias. **Meta *(sugerida)*:** p95 abaixo de 500 ms nas listagens e nos indicadores, com até 10 mil registros por empresa. *Origem: P-01, P-02; US 072, US 115.* **Prioridade:** Obrigatório.
- **RNF-006 — Usabilidade e responsividade:** interface responsiva em desktop, tablet e mobile com Tailwind CSS, mantendo a legibilidade dos status (cores e etiquetas). **Meta *(sugerida)*:** todas as telas utilizáveis a partir de 360 px de largura, sem rolagem horizontal da página. *Origem: P-01; US 072.* **Prioridade:** Obrigatório.
- **RNF-007 — Consistência dos dados calculados:** status derivados (como o do documento) nunca são digitados nem editados; são recalculados pelo backend a partir dos dados-fonte, e o cliente nunca os envia. **Meta:** 0 campos derivados aceitos em requisições de escrita (400 caso enviados), verificado por testes. *Origem: P-01; US 043; alterado na v1.3.* **Prioridade:** Obrigatório.
- **RNF-008 — Massa de dados mockados e seed:** dados fictícios ambientados na FrotaSync, que cobrem unidades ativas e inativas, documentos nos três status, tarefas nos três status e registros do mês anterior para a variação. Isolados em uma camada de dados, servidos via TanStack Query e, após a integração, base do seed de desenvolvimento. **Meta:** 100% dos estados relevantes representados; seed executado somente em desenvolvimento. *Origem: P-05; US 061, US 116; alterado na v1.3.* **Prioridade:** Obrigatório.
- **RNF-009 — Feedback visual (loading, erro e estado vazio):** toda tela que depende de dados exibe carregamento, mensagem de erro com opção de tentar novamente e estado vazio. **Meta:** 100% das telas com dados cobertas pelos três estados. *Origem: P-01; US 071; v1.1.* **Prioridade:** Obrigatório.
- **RNF-010 — Tipagem:** as entidades Unidade, Documento e Tarefa têm interfaces/types próprios. **Meta:** 0 usos de `any` no código. *Origem: P-05; US 074; v1.1.* **Prioridade:** Obrigatório.
- **RNF-011 — Componentização:** componentes reutilizáveis (Button, Input, Select, DatePicker, Textarea, FileUpload, Switch, Checkbox, Stepper, OtpInput, Badge de status, ConfirmDialog, SegmentedToggle, DataTable, DonutChart, StatTrend, filtros, estados de loading/erro/vazio e componentes de layout), sem duplicação de lógica de UI. Os formulários de documento e de tarefa são únicos e servem às rotas globais e por unidade. **Meta:** 1 formulário de documento e 1 de tarefa para todas as rotas. *Origem: P-05; US 074; alterado na v1.2.* **Prioridade:** Obrigatório.
- **RNF-012 — Gerenciamento de estado:** separação entre estado de servidor (dados da API, via TanStack Query) e estado de UI (filtros, modais, formulários abertos). **Meta:** 0 dados da API duplicados em estado de UI. *Origem: P-05; US 074; alterado na v1.3.* **Prioridade:** Obrigatório.
- **RNF-013 — Acessibilidade:** labels corretamente associados nos formulários, contraste mínimo, navegação por teclado e mensagens de erro que não dependam apenas de cor. **Meta *(sugerida)*:** conformidade com WCAG 2.1 AA nas telas principais. *Origem: P-01; US 073; v1.1.* **Prioridade:** Obrigatório.
- **RNF-014 — Consistência visual (design system):** tipografia, cores e espaçamentos seguem o design system, e os status usam os mesmos rótulos e cores em tabelas, cards e legendas (Válido / Próximo do vencimento / Expirado; Pendente / Em andamento / Concluída; Ativa / Inativa). **Meta:** 100% dos status exibidos com o mesmo rótulo e cor em todas as telas. *Origem: P-05; US 075; alterado na v1.2.* **Prioridade:** Obrigatório.
- **RNF-015 — Versionamento e entrega:** repositório público, com código organizado, estrutura de pastas clara e histórico de commits com mensagens claras; aplicação funcional, executável localmente ou publicada online. **Meta:** ambiente completo executável com um único comando de subida (RNF-028). *Origem: P-05; US 077; v1.1.* **Prioridade:** Obrigatório.
- **RNF-016 — Adaptabilidade a diferentes empresas:** nome da empresa, vocabulário e tipos de documento definidos em arquivo de configuração, sem alterar a lógica. **Meta:** trocar de ramo alterando apenas o arquivo de configuração. *Origem: P-05; US 084; v1.1.* **Prioridade:** Opcional.
- **RNF-018 — Testes automatizados do frontend:** testes unitários do cálculo de status do documento exibido e dos bloqueios de unidade inativa na interface (os testes da API estão no RNF-033). **Meta *(sugerida)*:** cobertura mínima de 80% nessas regras. *Origem: P-05; US 086; alterado na v1.3.* **Prioridade:** Opcional.
- **RNF-020 — Validação e máscaras de campos brasileiros:** CPF e CNPJ com dígitos verificadores válidos, telefone com DDD (10 ou 11 dígitos), CEP com 8 dígitos e UF com 2 letras, com máscara de digitação; valores normalizados (somente dígitos) antes de enviar ou armazenar; senha com no mínimo 8 e no máximo 72 caracteres, com confirmação igual. **Meta:** 0 registros com CPF, CNPJ, telefone, CEP ou UF fora do formato (garantido por Zod e por CHECK no banco). *Origem: P-04; US 078; v1.2.* **Prioridade:** Necessário.
- **RNF-021 — Proteção de dados pessoais e LGPD:** dados pessoais (CPF, telefone, e-mail) coletados apenas para o cadastro; aceite dos Termos de Uso e da Política de Privacidade obrigatório e registrado com data e hora; senhas e códigos de recuperação guardados apenas como hash; senhas e tokens nunca em logs; apenas dados fictícios em mocks e seed. **Meta:** 0 senhas em texto plano no banco ou nos logs; 100% dos cadastros com aceite registrado. *Origem: P-04; US 079; alterado na v1.3; novo na v1.2.* **Prioridade:** Necessário.
- **RNF-022 — Persistência em PostgreSQL com migrations versionadas:** dados persistidos conforme a Modelagem de Dados (empresa, usuário, unidade, documento, tarefa, código de verificação e, se o RF-017 for entregue, histórico de alteração). O esquema é criado exclusivamente por migrations Flyway (V1 a V8), sem SQL manual; UNIQUE, FOREIGN KEY e CHECK são aplicados pelo banco; há índices para listagens e indicadores. **Meta:** banco vazio criado do zero apenas pelas migrations; testes confirmam que o banco rejeita dados inválidos sem passar pela API. *Origem: P-05; US 111 a 117; novo na v1.3.* **Prioridade:** Obrigatório.
- **RNF-023 — API REST (NestJS):** API em NestJS com prefixo `/api/v1`, organizada em módulos, controllers e serviços; DTOs validados com Zod; respostas de sucesso e de erro no formato padronizado do Design de API, com filtro global de exceções; configuração por variáveis de ambiente validadas na inicialização. **Meta:** 100% das respostas de erro no formato `ApiErrorResponse`; API não inicia com configuração inválida. *Origem: P-05; US 121; novo na v1.3.* **Prioridade:** Obrigatório.
- **RNF-024 — Regras de negócio aplicadas no servidor:** status do documento, bloqueios de unidade inativa (RF-007), transições de status e data de conclusão da tarefa, total de pendências e variação dos indicadores são calculados e aplicados no backend; o cliente nunca envia valores derivados. **Meta:** 100% dessas regras cobertas por testes unitários da API. *Origem: P-01, P-02, P-03; US 125 a 128; novo na v1.3.* **Prioridade:** Obrigatório.
- **RNF-025 — Isolamento de dados por empresa:** toda consulta e escrita em recursos protegidos é filtrada pela empresa do token; recurso de outra empresa responde 404. **Meta:** 0 vazamentos entre empresas, verificado por testes de integração em todos os recursos. *Origem: P-03; US 123; novo na v1.3.* **Prioridade:** Obrigatório.
- **RNF-026 — Armazenamento seguro de anexos:** o banco guarda apenas nome e referência do anexo; no ambiente publicado, os arquivos ficam em bucket privado do Amazon S3, sem acesso público e com criptografia, entregues só por download autorizado (RF-026). Aceitos PDF, JPG e PNG de até 10 MB (413 e 415 quando excedido ou não aceito). A edição sem novo arquivo preserva o anexo, e a exclusão do documento remove o arquivo. **Meta:** 0 anexos acessíveis sem autenticação. *Origem: P-01, P-06; US 126, US 144; novo na v1.3.* **Prioridade:** Obrigatório.
- **RNF-027 — Integração entre frontend e API:** cliente HTTP tipado, com URL base por ambiente, envio automático do token, renovação transparente da sessão em caso de 401 e redirecionamento a `/login` se a renovação falhar; tratamento e mensagens adequadas para 403, 404, 409, 413, 415 e 429; estados de carregamento, erro e vazio e invalidação de cache preservados. **Meta:** 0 operações de negócio dependentes dos mocks após a integração. *Origem: P-05; US 131 a 137; novo na v1.3.* **Prioridade:** Obrigatório.
- **RNF-028 — Contêineres e ambiente local reproduzível:** Dockerfile multi-stage para frontend e API; docker-compose que sobe frontend, API e PostgreSQL com healthchecks, ordem de inicialização e migrations na subida; imagens sem credenciais; README com subir, ver logs, parar e reiniciar do zero. **Meta:** ambiente completo no ar com um único comando. *Origem: P-05; US 111, US 141; novo na v1.3.* **Prioridade:** Obrigatório.
- **RNF-029 — Infraestrutura como código e implantação na AWS:** infraestrutura provisionada com Terraform (módulos, variáveis, convenção de nomes, tags e estado remoto em S3 com bloqueio): VPC, sub-redes e security groups com acesso mínimo; RDS PostgreSQL em sub-rede privada, acessível só pela API; bucket S3 de anexos; repositórios ECR; execução dos contêineres com health checks; acesso por HTTPS. **Meta:** ambiente recriável com `terraform apply`; `fmt` e `validate` sem erros; 0 segredos versionados. *Origem: P-06; US 142 a 145; novo na v1.3.* **Prioridade:** Obrigatório.
- **RNF-030 — Segredos e configuração:** credenciais do banco e segredos de token ficam no Secrets Manager ou no SSM Parameter Store, acessados por permissões IAM, sem chaves fixas; nada de segredos no repositório, nas imagens ou nos logs. **Meta:** 0 segredos versionados ou em logs. *Origem: P-06; US 146; novo na v1.3.* **Prioridade:** Obrigatório.
- **RNF-031 — Integração e entrega contínuas (CI/CD):** o GitHub Actions executa lint, tipos e build do frontend; lint, build e testes da API com PostgreSQL de serviço; build das imagens Docker; e `terraform fmt`, `validate` e `plan`. O deploy autentica por OIDC, envia as imagens ao ECR, roda as migrations antes da nova versão da API e exige aprovação manual para produção; o rollback é documentado. **Meta:** 100% dos pull requests passam pelas verificações antes do merge; 0 chaves de longa duração. *Origem: P-05, P-06; US 147, US 148; novo na v1.3.* **Prioridade:** Obrigatório.
- **RNF-032 — Observabilidade, backup e recuperação:** logs centralizados (CloudWatch Logs), ao menos um alarme de indisponibilidade, health checks nos serviços e backup automático do banco, com restauração testada. **Meta:** ao menos 1 alarme de indisponibilidade ativo e 1 teste de restauração de backup realizado; retenção de backup de 7 dias *(sugerida)*. *Origem: P-06; US 143, US 149; novo na v1.3.* **Prioridade:** Necessário.
- **RNF-033 — Testes automatizados da API:** testes unitários para o status do documento, as transições da tarefa e o bloqueio de unidade inativa; testes de integração com banco de teste para autenticação, isolamento por empresa e CRUD de unidades, documentos e tarefas; testes dos erros de upload (413 e 415); conferência da documentação OpenAPI. **Meta *(sugerida)*:** cobertura mínima de 80% nas camadas de regra de negócio e zero vulnerabilidades críticas. *Origem: P-05; US 129; novo na v1.3.* **Prioridade:** Obrigatório.

---

## Custos e prazos

Projeto acadêmico/de portfólio desenvolvido na Residência da Motiron Technologies (squad de estudos), sem contrato comercial associado.

- **Preço total do projeto:** A definir
- **Forma de divisão do projeto:** A definir
- **Formas de pagamento:** A definir
- **Prazo de entrega máximo:** A definir

*O orçamento de infraestrutura na AWS ainda não tem meta definida (ver Pendências, item 6).*

---

## Stakeholders

A lista-mestre de stakeholders e o poder de decisão ficam no Brief (01 §3). Aqui constam apenas os que influenciam os requisitos:

- **Equipe de desenvolvimento (squad):** Valdir, Filipe, Gabrieli, Lucas Vinícius, Murilo, Niedson e Silas, responsáveis pelo frontend, backend (API e banco), infraestrutura em nuvem e regras de negócio.
- **Usuários finais (equipe interna simulada da FrotaSync):** personas P-01 a P-04, com perfis administrativos e de gestão.
- **Motiron Technologies (residência/mentoria):** define o briefing, avalia o projeto e é a potencial interessada em uma eventual comercialização.
- **Product Owner / Orientador(a):** valida requisitos, prioridades e alinhamento da solução.
- **Equipe de testes/QA:** valida os cenários na aplicação integrada (API e banco reais).
- **Responsáveis pela operação (P-06):** publicam versões e acompanham a disponibilidade.

## Histórico de Alterações

| Data | Versão | Descrição | Autor |
| :-- | :-- | :-- | :-- |
| 22/09/2026 | 1.0 | Criação inicial do documento de análise de requisitos. | Equipe do projeto |
| 29/09/2026 | 1.1 | Definição da empresa fictícia FrotaSync; inclusão dos requisitos faltantes frente ao briefing da Motiron; inclusão das entregas extras como requisitos opcionais; reclassificação de RF 002 e RF 013 como RNF; renumeração dos RFs. | Equipe do projeto |
| 05/10/2026 | 1.2 | Incorporação do protótipo de telas (SystemDesign): novos RF 019 a RF 025 e RNF 020 e RNF 021; alteração de RFs e RNFs existentes; IDs mantidos. | Equipe do projeto |
| 20/10/2026 | 1.3 | Evolução de frontend com mocks para aplicação fullstack na nuvem: novos RF 026 e RF 027 e RNF 022 a RNF 033; RNF 017 descartado e RNF 019 substituído; rotas dedicadas `/documentos` e `/tarefas`. | Equipe do projeto |
| 20/10/2026 | 1.3 | Conteúdo migrado para o modelo 03 (formato RF-NNN e RNF-NNN, origem por persona e estória, metas mensuráveis nos RNFs, seções Pendências e Premissas assumidas). Sem alteração de escopo. | Equipe do projeto |

---

## Pendências

Pontos em aberto, a validar com a squad (vindos do Apêndice B da versão anterior e da migração para o modelo):

1. **Brief (01) e Personas (02):** não foram fornecidos; os IDs P-01 a P-06 foram atribuídos a partir das personas das Estórias de Usuário, e não há objetivos `O-NN` ou funcionalidades `F-NNN` para referenciar no campo Origem.
2. **Metas sugeridas dos RNFs:** as marcadas como *(sugerida)* nos RNF-005, 006, 013, 018, 032 e 033 não existiam nas versões anteriores e precisam ser confirmadas.
3. **RNFs do modelo sem equivalente no projeto:** disponibilidade (ex.: 99,5% ao mês) e escalabilidade (usuários simultâneos) não foram definidos; decidir se entram como novos RNFs.
4. **Tela e comportamento não desenhados no protótipo:** Configurações, edição de unidade, documento e tarefa, "Mais detalhes", busca global, notificações, ajuda, Termos de Uso e Política de Privacidade, e a posição das ações de download do anexo (RF-026) e de sair (RF-027).
5. **Categoria do documento e tarefa:** a categoria e a data de emissão aparecem nas tabelas, mas não no formulário do protótipo (incluídas na especificação); o filtro "Categoria" na lista de tarefas não tem campo correspondente (remover do protótipo ou definir categoria de tarefa).
6. **Plataforma de execução e custo na AWS:** definir ECS Fargate ou uma instância EC2 com Docker Compose; balanceador, NAT Gateway e Fargate geram custo fora do nível gratuito. Definir meta de orçamento de infraestrutura.
7. **Número de ambientes:** assumido um único ambiente (produção), sem homologação separada; confirmar.
8. **Armazenamento dos tokens no cliente:** decidir na integração (US 131); recomendado cookie httpOnly.
9. **Serviço público de CEP no backend:** definir (por exemplo, ViaCEP).
10. **Tipo de unidade (Matriz ou Filial):** guardado na empresa; decidir se o cadastro gera uma unidade automaticamente ou se o formulário de unidade ganha um campo de tipo.
11. **Dashboard:** onde exibir o total de pendências no layout e se haverá atalho ou resumo das listas, agora em rotas dedicadas; atualizar o protótipo.
12. **Textos do protótipo a corrigir:** "Voltar para documentos" em Cadastrar Unidade (deveria ser "Voltar para unidades"); placeholder "Digite o nome da tarefa..." nos formulários de unidade e de documento; modal "Deseja cadastrando o documento?"; legenda de Documentos com "Vigente" duplicado e rótulos diferentes dos status do RF-011; rótulo "à vencer" para "a vencer". Números do protótipo (128 documentos, 400 unidades, 55 a vencer) são ilustrativos.

## Premissas assumidas

- **Multiempresa:** cada usuário pertence a uma empresa e as unidades pertencem à empresa; quem cadastra a empresa recebe o perfil Administrador; o isolamento é aplicado no servidor (RNF-025).
- **Data de início da tarefa:** é a data do cadastro, preenchida automaticamente (RF-014).
- **Variação dos indicadores:** período de referência do mês anterior, calculada sem snapshots; exclusões e tarefas reabertas não são reconstruídas para o período anterior (RF-024).
- **Total de documentos a vencer** (cabeçalho): documentos Próximos do vencimento; o rodapé da tabela mostra o total de itens da lista filtrada.
- **Sessão:** refreshToken de 7 dias (30 dias com "Lembre-me").
- **Código de recuperação de senha:** validade de 10 minutos e limite de 5 tentativas, pois tem apenas 5 dígitos (RF-020).
- **Anexos:** PDF, JPG e PNG de até 10 MB (RNF-026).
- **E-mail de recuperação:** registrado no console em desenvolvimento e enviado pelo Amazon SES no ambiente publicado.
- **Migrations:** Flyway é a única ferramenta de alteração do esquema, sem migrations gerenciadas por ORM (RNF-022).
- **Itens descartados na v1.3:** RNF 017 (camada de API simulada, substituída pela API real) e RNF 019 (deploy com Vercel, substituído pelos RNF-029 e RNF-031). O controle de documentos por veículo e por motorista segue fora do escopo.
- **Mapa de telas e rotas (antigo Apêndice A):** não consta neste modelo; permanece na versão anterior da Análise de Requisitos e nas Estórias de Usuário.

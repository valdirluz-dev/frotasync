# Estórias de Usuário e Backlog

**Sistema de Gestão de Unidades, Documentos e Tarefas**
Documento complementar à Análise de Requisitos

- **Versão do documento:** 1.0
- **Data:** 22/09/2026
- **Documento base:** Análise de Requisitos v1.0

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

## Sobre este documento

Este documento apresenta as estórias de usuário derivadas dos requisitos funcionais e não funcionais descritos na Análise de Requisitos (v1.0) do Sistema de Gestão de Unidades, Documentos e Tarefas, organizadas em épicos. Cada estória segue o formato "Como [persona], quero [ação], para [motivo]" e possui critérios de aceite que definem quando ela pode ser considerada "pronta" (Definition of Done). Ao final, o backlog completo é apresentado já priorizado pelo critério MoSCoW, pronto para ser distribuído em sprints (Scrum) ou em colunas de um quadro Kanban.

## Personas consideradas

- **Colaborador(a) / Usuário administrativo:** acompanha a situação das unidades, consulta e cadastra documentos e gerencia as tarefas vinculadas a cada unidade no dia a dia.
- **Gestor(a) / Tomador de decisão:** utiliza principalmente o Dashboard e as listas globais para ter uma visão rápida da situação da empresa e apoiar decisões sobre prioridades e pendências.
- **Administrador(a):** responsável por garantir a segurança de acesso e a consistência dos dados do sistema (autenticação, regras de unidades inativas).
- **Desenvolvedor(a):** constrói, documenta e mantém o sistema, incluindo a massa de dados mockados que simula o backend.

## Critério de priorização — MoSCoW

- **Must have (Obrigatório):** essencial para o sistema funcionar; deve estar na primeira entrega.
- **Should have (Importante):** agrega muito valor, mas o sistema funciona sem ele no curto prazo.
- **Could have (Desejável):** melhora a experiência, pode ficar para uma versão futura.
- **Won't have (Fora do escopo por ora):** não será implementado nesta fase do projeto.

---

## Estórias de Usuário por Épico

### Épico 1 — Autenticação e Acesso

#### US 011

Como usuário do sistema, quero me autenticar informando e-mail e senha, para acessar as informações e funcionalidades restritas do sistema com segurança.

**Critérios de aceite (Definition of Done):**

- O formulário de login valida e-mail (formato válido) e senha (obrigatória) com Zod antes do envio.
- Login com credenciais válidas redireciona o usuário para o Dashboard e exibe feedback visual de sucesso.
- Login com credenciais inválidas ou campos mal preenchidos exibe mensagem de erro específica, sem redirecionar o usuário.

**Prioridade:** Must have — Obrigatório

#### US 012

Como administrador(a) do sistema, quero que todas as telas protegidas exijam autenticação válida, para impedir que usuários não autorizados acessem dados da empresa.

**Critérios de aceite (Definition of Done):**

- Usuário sem sessão válida que tentar acessar qualquer rota protegida (Dashboard, Unidades, Documentos, Tarefas) é redirecionado automaticamente para `/login`.
- A verificação de autenticação ocorre a cada navegação ou carregamento de rota protegida.
- Usuário autenticado tem acesso normal à rota solicitada, sem redirecionamentos indevidos.

**Prioridade:** Must have — Obrigatório

### Épico 2 — Dashboard e Indicadores Gerais

#### US 021

Como gestor(a), quero visualizar um painel com indicadores gerais (total de unidades, documentos e tarefas pendentes) logo após o login, para ter uma visão rápida da situação geral da empresa.

**Critérios de aceite (Definition of Done):**

- O Dashboard é exibido como tela inicial imediatamente após o login.
- Cards exibem o total de unidades, o total de documentos e o total de tarefas pendentes, calculados a partir dos dados mockados via TanStack Query.
- Quando não há dados cadastrados, os indicadores exibem zero, sem gerar erro na tela.

**Prioridade:** Must have — Obrigatório

#### US 022

Como gestor(a), quero que o total de pendências do Dashboard se atualize automaticamente após alterações feitas nas telas de documentos e tarefas, para não precisar recarregar a página manualmente para ver a situação atual.

**Critérios de aceite (Definition of Done):**

- Qualquer alteração de status de documento ou tarefa dispara invalidação/refetch do cache do TanStack Query.
- O indicador de pendências do Dashboard reflete a alteração imediatamente após a confirmação da mudança.
- Nenhuma ação manual de reload da página é necessária para ver o valor atualizado.

**Prioridade:** Must have — Obrigatório

### Épico 3 — Gestão de Unidades

#### US 031

Como colaborador(a), quero visualizar a lista de todas as unidades cadastradas, com pesquisa, filtros e paginação, para localizar rapidamente a unidade que preciso consultar.

**Critérios de aceite (Definition of Done):**

- A listagem utiliza TanStack Table com paginação dos resultados.
- É possível pesquisar unidades por nome/código e aplicar filtros (ex.: status ativo/inativo).
- Quando nenhum resultado é encontrado para a pesquisa/filtro aplicado, é exibida uma mensagem de lista vazia.

**Prioridade:** Must have — Obrigatório

#### US 032

Como colaborador(a), quero acessar o detalhamento de uma unidade selecionada, para visualizar suas informações, documentos e tarefas vinculados em um só lugar.

**Critérios de aceite (Definition of Done):**

- Ao selecionar uma unidade na listagem, o sistema exibe nome, endereço, status e demais dados da unidade.
- A tela de detalhamento exibe a lista de documentos e a lista de tarefas vinculados àquela unidade.
- Se a unidade estiver inativa, os documentos e tarefas são exibidos apenas em modo somente leitura.

**Prioridade:** Must have — Obrigatório

#### US 033

Como administrador(a), quero que unidades inativas não possam receber novos documentos ou tarefas, para manter a consistência dos dados e evitar registros indevidos em unidades encerradas.

**Critérios de aceite (Definition of Done):**

- Em unidades com status "Inativa", as ações de cadastro/vinculação de novos documentos e tarefas ficam desabilitadas na tela de detalhamento.
- Em unidades ativas, essas mesmas ações permanecem habilitadas normalmente.
- Documentos e tarefas já existentes de uma unidade inativa continuam visíveis, apenas em modo leitura.

**Prioridade:** Must have — Obrigatório

### Épico 4 — Gestão de Documentos

#### US 041

Como gestor(a), quero visualizar uma lista global com todos os documentos cadastrados no sistema, independentemente da unidade, para acompanhar a validade de todos os documentos da empresa em um único lugar.

**Critérios de aceite (Definition of Done):**

- A tela exibe todos os documentos cadastrados, de todas as unidades.
- Cada documento exibe seu status calculado (Válido, Próximo do vencimento ou Expirado).

**Prioridade:** Should have — Necessário

#### US 042

Como colaborador(a), quero visualizar, na tela de detalhamento da unidade, apenas os documentos vinculados àquela unidade específica, para acompanhar a validade documental da unidade sem precisar filtrar a lista global.

**Critérios de aceite (Definition of Done):**

- A lista exibida na tela de detalhamento da unidade contém somente os documentos vinculados a ela.
- Cada documento da lista exibe seu status de validade calculado (Válido, Próximo do vencimento ou Expirado).

**Prioridade:** Must have — Obrigatório

#### US 043

Como colaborador(a), quero que o status de validade de cada documento seja calculado automaticamente a partir da data de validade, para evitar erros de preenchimento manual e garantir a confiabilidade da informação.

**Critérios de aceite (Definition of Done):**

- Documentos com validade a mais de 15 dias da data atual recebem status "Válido".
- Documentos com até 15 dias para o vencimento recebem status "Próximo do vencimento".
- Documentos com data de validade já ultrapassada recebem status "Expirado"; o status nunca pode ser digitado ou editado manualmente.

**Prioridade:** Must have — Obrigatório

### Épico 5 — Gestão de Tarefas

#### US 051

Como colaborador(a), quero visualizar as tarefas vinculadas a cada unidade, com status e prazos, para acompanhar o andamento do trabalho relacionado àquela unidade.

**Critérios de aceite (Definition of Done):**

- A lista de tarefas de uma unidade exibe status (Pendente, Em andamento, Concluída) e prazo de cada tarefa.
- Cada status possui destaque visual (cor/etiqueta) que facilita a identificação rápida.

**Prioridade:** Must have — Obrigatório

#### US 052

Como colaborador(a), quero alterar o status de uma tarefa e confirmar explicitamente quando ela for concluída, para evitar que tarefas sejam marcadas como concluídas por engano.

**Critérios de aceite (Definition of Done):**

- O usuário pode alterar o status de uma tarefa entre Pendente, Em andamento e Concluída.
- Ao selecionar o status "Concluída", um modal de confirmação é exibido antes da efetivação da mudança.
- Ao confirmar, o novo status é refletido na listagem de tarefas e no Dashboard; ao cancelar, o status permanece inalterado.

**Prioridade:** Must have — Obrigatório

### Épico 6 — Dados de Demonstração (Mocks)

#### US 061

Como desenvolvedor(a), quero manter uma massa de dados mockados que cubra todos os estados relevantes do sistema, para demonstrar e testar todas as regras de negócio sem depender de um backend real.

**Critérios de aceite (Definition of Done):**

- Os dados mockados incluem unidades ativas e inativas.
- Os dados mockados incluem documentos em cada um dos três status (válido, próximo do vencimento, expirado).
- Os dados mockados incluem tarefas em cada um dos três status (pendente, em andamento, concluída), disponibilizadas via TanStack Query.

**Prioridade:** Must have — Obrigatório

---

## Backlog Priorizado

A tabela abaixo consolida todas as estórias já priorizadas pelo critério MoSCoW, prontas para alimentar o Product Backlog do Scrum (organização em sprints) ou as colunas de um quadro Kanban (Must have e Should have primeiro, seguidas de eventuais Could have futuras).

| ID | Estória | Persona | Prioridade (MoSCoW) |
|---|---|---|---|
| US 011 | Login com e-mail e senha | Usuário do sistema | Must have |
| US 012 | Proteção obrigatória de rotas | Administrador(a) | Must have |
| US 021 | Indicadores gerais no Dashboard | Gestor(a) | Must have |
| US 022 | Atualização automática das pendências | Gestor(a) | Must have |
| US 031 | Listagem de unidades com busca/filtros/paginação | Colaborador(a) | Must have |
| US 032 | Detalhamento da unidade | Colaborador(a) | Must have |
| US 033 | Bloqueio de novos registros em unidades inativas | Administrador(a) | Must have |
| US 042 | Documentos por unidade | Colaborador(a) | Must have |
| US 043 | Cálculo automático do status do documento | Colaborador(a) | Must have |
| US 051 | Tarefas por unidade com status e prazo | Colaborador(a) | Must have |
| US 052 | Confirmação ao concluir tarefa | Colaborador(a) | Must have |
| US 061 | Massa de dados mockados | Desenvolvedor(a) | Must have |
| US 041 | Lista global de documentos | Gestor(a) | Should have |

## Como usar este backlog

- **No Scrum:** priorize as estórias "Must have" para a(s) primeira(s) sprint(s) (Épicos 1 a 3, mais US 042, 043, 051, 052 e 061), seguidas pela estória "Should have" (US 041 — Lista global de documentos).
- **No Kanban:** use as prioridades para ordenar o topo da coluna "To Do" — as estórias "Must have" sobem para o topo do backlog e são puxadas primeiro para "Em andamento".

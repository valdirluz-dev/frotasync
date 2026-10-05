# Estórias de Usuário e Backlog

**FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas**

Documento complementar à Análise de Requisitos

- **Versão do documento:** 1.1
- **Data:** 29/09/2026
- **Documento base:** Análise de Requisitos v1.1 — FrotaSync

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

---

## Sobre este documento

Este documento apresenta as estórias de usuário derivadas dos requisitos funcionais e não funcionais descritos na Análise de Requisitos (v1.1) do sistema FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas, organizadas em épicos. Cada estória segue o formato "Como [persona], quero [ação], para [motivo]" e possui critérios de aceite que definem quando ela pode ser considerada "pronta" (Definition of Done). Ao final, o backlog completo é apresentado já priorizado pelo critério MoSCoW, pronto para ser distribuído em sprints (Scrum) ou em colunas de um quadro Kanban, seguido da rastreabilidade entre estórias e requisitos.

### O que mudou na versão 1.1

- Estórias alinhadas à numeração da Análise de Requisitos v1.1 (ver rastreabilidade ao final do documento).
- Novas estórias para os requisitos incluídos na v1.1: cadastro e edição de unidade (US 034), cadastro de documento (US 044), lista global de tarefas (US 053) e cadastro de tarefa (US 054).
- Novo Épico 7, com as estórias dos requisitos não funcionais, e novo Épico 8, com as entregas extras opcionais.
- US 041 (lista global de documentos) passou de Should have para Must have; US 021, 022 e 061 foram ajustadas ao novo escopo (total de pendências, novas telas e ambientação na FrotaSync).

### Personas consideradas

- **Colaborador(a) / Usuário administrativo:** acompanha a situação das filiais e pátios, consulta e cadastra documentos e gerencia as tarefas vinculadas a cada unidade no dia a dia.
- **Gestor(a) / Tomador de decisão:** utiliza principalmente o Dashboard e as listas globais para ter uma visão rápida da situação da empresa e apoiar decisões sobre prioridades e pendências.
- **Administrador(a):** responsável por garantir a segurança de acesso e a consistência dos dados do sistema (autenticação, cadastro e inativação de unidades, regras de unidades inativas).
- **Desenvolvedor(a):** constrói, documenta e mantém o sistema, incluindo a massa de dados mockados que simula o backend.

### Critério de priorização — MoSCoW

- **Must have (Obrigatório):** essencial para o sistema funcionar; deve estar na primeira entrega.
- **Should have (Importante):** agrega muito valor, mas o sistema funciona sem ele no curto prazo.
- **Could have (Desejável):** melhora a experiência, pode ficar para uma versão futura. Inclui as entregas extras do briefing.
- **Won't have (Fora do escopo por ora):** não será implementado nesta fase do projeto (nesta versão: controle de documentos por veículo e por motorista).

---

## Estórias de Usuário por Épico

## Épico 1 — Autenticação e Acesso

### US 011

Como usuário do sistema, quero me autenticar informando e-mail e senha, para acessar as informações e funcionalidades restritas do sistema com segurança.

**Critérios de aceite (Definition of Done):**

- O formulário de login valida e-mail (formato válido) e senha (obrigatória) com Zod antes do envio.
- Login com credenciais válidas redireciona o usuário para o Dashboard e exibe feedback visual de sucesso.
- Login com credenciais inválidas ou campos mal preenchidos exibe mensagem de erro específica, sem redirecionar o usuário.

**Prioridade:** Must have — Obrigatório

### US 012

Como administrador(a) do sistema, quero que todas as telas protegidas exijam autenticação válida, para impedir que usuários não autorizados acessem dados da empresa.

**Critérios de aceite (Definition of Done):**

- Usuário sem sessão válida que tentar acessar qualquer rota protegida (Dashboard, Unidades, Detalhamento, Documentos, Tarefas) é redirecionado automaticamente para /login.
- A verificação de autenticação ocorre a cada navegação ou carregamento de rota protegida.
- Nenhum conteúdo protegido é exibido antes do redirecionamento, inclusive quando o acesso é feito diretamente pela URL.
- Usuário autenticado tem acesso normal à rota solicitada, sem redirecionamentos indevidos.

**Prioridade:** Must have — Obrigatório

---

## Épico 2 — Dashboard e Indicadores Gerais

### US 021

Como gestor(a), quero visualizar um painel com indicadores gerais (total de unidades, de documentos, de tarefas pendentes e de pendências) logo após o login, para ter uma visão rápida da situação geral da empresa.

**Critérios de aceite (Definition of Done):**

- O Dashboard é exibido como tela inicial imediatamente após o login.
- Cards exibem o total de unidades, o total de documentos, o total de tarefas pendentes e o total de pendências (documentos próximos do vencimento ou expirados + tarefas pendentes ou em andamento), calculados a partir dos dados mockados via TanStack Query.
- Quando não há dados cadastrados, os indicadores exibem zero, sem gerar erro na tela.

**Prioridade:** Must have — Obrigatório

### US 022

Como gestor(a), quero que o total de pendências do Dashboard se atualize automaticamente após alterações feitas nas telas de documentos, tarefas e unidades, para não precisar recarregar a página manualmente para ver a situação atual.

**Critérios de aceite (Definition of Done):**

- Qualquer alteração de status ou cadastro dispara invalidação/refetch do cache do TanStack Query.
- O indicador de pendências do Dashboard reflete a alteração imediatamente após a confirmação da mudança.
- Ao concluir uma tarefa no detalhamento da unidade, a lista de tarefas também é atualizada.
- Nenhuma ação manual de reload da página é necessária para ver o valor atualizado.

**Prioridade:** Must have — Obrigatório

---

## Épico 3 — Gestão de Unidades

### US 031

Como colaborador(a), quero visualizar a lista de todas as unidades (filiais e pátios) cadastradas, com pesquisa, filtros e paginação, para localizar rapidamente a unidade que preciso consultar.

**Critérios de aceite (Definition of Done):**

- A listagem utiliza TanStack Table com paginação dos resultados.
- É possível pesquisar unidades por nome/código e aplicar filtros (ex.: status ativa/inativa).
- Quando nenhum resultado é encontrado para a pesquisa/filtro aplicado, é exibida uma mensagem de lista vazia.

**Prioridade:** Must have — Obrigatório

### US 032

Como colaborador(a), quero acessar o detalhamento de uma unidade selecionada, para visualizar suas informações, documentos e tarefas vinculados em um só lugar.

**Critérios de aceite (Definition of Done):**

- Ao selecionar uma unidade na listagem, o sistema exibe nome, endereço, status e demais dados da unidade.
- A tela de detalhamento exibe a lista de documentos e a lista de tarefas vinculados àquela unidade.
- Se a unidade estiver inativa, os documentos e tarefas são exibidos apenas em modo somente leitura.

**Prioridade:** Must have — Obrigatório

### US 033

Como administrador(a), quero que unidades inativas não possam receber novos documentos ou tarefas, para manter a consistência dos dados e evitar registros indevidos em unidades encerradas.

**Critérios de aceite (Definition of Done):**

- Em unidades com status "Inativa", as ações de cadastro/vinculação de novos documentos e tarefas ficam desabilitadas na tela de detalhamento.
- Em unidades ativas, essas mesmas ações permanecem habilitadas normalmente.
- Documentos e tarefas já existentes de uma unidade inativa continuam visíveis, apenas em modo leitura.

**Prioridade:** Must have — Obrigatório

### US 034

Como administrador(a), quero cadastrar e editar unidades (filiais e pátios) por meio de um formulário validado, para manter a base de unidades da empresa atualizada e consistente.

**Critérios de aceite (Definition of Done):**

- O formulário, construído com React Hook Form e validado com Zod, contém nome, código, endereço e status (Ativa/Inativa).
- Campos inválidos ou obrigatórios não preenchidos exibem mensagem de erro junto ao campo.
- A unidade criada ou editada é refletida imediatamente na listagem e no Dashboard.
- Ao alterar o status para "Inativa", aplicam-se as restrições da US 033.

**Prioridade:** Must have — Obrigatório

---

## Épico 4 — Gestão de Documentos

### US 041

Como gestor(a), quero visualizar uma lista global com todos os documentos cadastrados no sistema, com pesquisa, filtros e paginação, para acompanhar a validade de todos os documentos da empresa em um único lugar.

**Critérios de aceite (Definition of Done):**

- A tela exibe todos os documentos cadastrados, de todas as unidades.
- Cada documento exibe seu status calculado (Válido, Próximo do vencimento ou Expirado).
- É possível pesquisar, filtrar por status e por unidade e paginar os resultados com TanStack Table.
- Quando nenhum resultado é encontrado, é exibida uma mensagem de lista vazia.

**Prioridade:** Must have — Obrigatório

### US 042

Como colaborador(a), quero visualizar, na tela de detalhamento da unidade, apenas os documentos vinculados àquela unidade específica, para acompanhar a validade documental da unidade sem precisar filtrar a lista global.

**Critérios de aceite (Definition of Done):**

- A lista exibida na tela de detalhamento da unidade contém somente os documentos vinculados a ela.
- Cada documento da lista exibe seu status de validade calculado (Válido, Próximo do vencimento ou Expirado).

**Prioridade:** Must have — Obrigatório

### US 043

Como colaborador(a), quero que o status de validade de cada documento seja calculado automaticamente a partir da data de validade, para evitar erros de preenchimento manual e garantir a confiabilidade da informação.

**Critérios de aceite (Definition of Done):**

- Documentos com validade a mais de 15 dias da data atual recebem status "Válido".
- Documentos com até 15 dias para o vencimento recebem status "Próximo do vencimento".
- Documentos com data de validade já ultrapassada recebem status "Expirado"; o status nunca pode ser digitado ou editado manualmente.

**Prioridade:** Must have — Obrigatório

### US 044

Como colaborador(a), quero cadastrar um documento em uma unidade ativa, informando o tipo e a data de validade, para manter o controle de validade da documentação de cada unidade (ex.: Licença Ambiental, Registro na ANTT, Seguro de Carga).

**Critérios de aceite (Definition of Done):**

- O formulário, validado com Zod, contém nome/tipo do documento, unidade vinculada e data de validade.
- O status do documento não é informado pelo usuário: é calculado automaticamente (US 043).
- O cadastro só é permitido em unidades ativas.
- O documento criado é refletido nas listas e no Dashboard; erros de preenchimento aparecem junto a cada campo.

**Prioridade:** Must have — Obrigatório

---

## Épico 5 — Gestão de Tarefas

### US 051

Como colaborador(a), quero visualizar as tarefas vinculadas a cada unidade, com status e prazos, para acompanhar o andamento do trabalho relacionado àquela unidade.

**Critérios de aceite (Definition of Done):**

- A lista de tarefas de uma unidade exibe status (Pendente, Em andamento, Concluída) e prazo de cada tarefa.
- Cada status possui destaque visual (cor/etiqueta) que facilita a identificação rápida.

**Prioridade:** Must have — Obrigatório

### US 052

Como colaborador(a), quero alterar o status de uma tarefa e confirmar explicitamente quando ela for concluída, para evitar que tarefas sejam marcadas como concluídas por engano.

**Critérios de aceite (Definition of Done):**

- O usuário pode alterar o status de uma tarefa entre Pendente, Em andamento e Concluída.
- Ao selecionar o status "Concluída", um modal de confirmação é exibido antes da efetivação da mudança.
- Ao confirmar, o novo status é refletido na listagem de tarefas e no Dashboard; ao cancelar, o status permanece inalterado.

**Prioridade:** Must have — Obrigatório

### US 053

Como gestor(a), quero visualizar uma lista global com todas as tarefas de todas as unidades, com pesquisa, filtros e paginação, para acompanhar prazos e andamento do trabalho da empresa em um único lugar.

**Critérios de aceite (Definition of Done):**

- A tabela exibe as tarefas de todas as unidades, com status visual e prazo.
- É possível pesquisar, filtrar por status e por unidade e paginar os resultados com TanStack Table.
- Quando nenhum resultado é encontrado, é exibida uma mensagem de lista vazia.
- A alteração de status a partir da lista segue as regras da US 052.

**Prioridade:** Must have — Obrigatório

### US 054

Como colaborador(a), quero cadastrar uma tarefa em uma unidade ativa, informando título e prazo, para registrar e acompanhar o trabalho necessário (ex.: renovar licença do pátio de Recife).

**Critérios de aceite (Definition of Done):**

- O formulário, validado com Zod, contém título, unidade vinculada e prazo.
- A tarefa é criada com o status inicial "Pendente".
- O cadastro só é permitido em unidades ativas.
- A tarefa criada é refletida nas listas e no Dashboard; erros de preenchimento aparecem junto a cada campo.

**Prioridade:** Must have — Obrigatório

---

## Épico 6 — Dados de Demonstração (Mocks)

### US 061

Como desenvolvedor(a), quero manter uma massa de dados mockados que cubra todos os estados relevantes do sistema, para demonstrar e testar todas as regras de negócio sem depender de um backend real.

**Critérios de aceite (Definition of Done):**

- Os dados mockados incluem unidades ativas e inativas.
- Os dados mockados incluem documentos em cada um dos três status (válido, próximo do vencimento, expirado).
- Os dados mockados incluem tarefas em cada um dos três status (pendente, em andamento, concluída).
- Os dados são ambientados na FrotaSync (filiais e pátios; Licença Ambiental, Registro na ANTT e Seguro de Carga).
- Os dados ficam isolados em uma camada de dados e são disponibilizados via TanStack Query, permitindo a troca futura por uma API real.

**Prioridade:** Must have — Obrigatório

---

## Épico 7 — Qualidade Técnica e Entrega

### US 071

Como colaborador(a), quero ver indicação de carregamento, mensagem de erro com opção de tentar novamente e estado vazio nas telas que dependem de dados, para entender o que está acontecendo e não ficar diante de uma tela em branco.

**Critérios de aceite (Definition of Done):**

- Todas as telas que dependem de dados exibem um estado de carregamento enquanto os dados são obtidos.
- Em caso de erro, é exibida uma mensagem com a opção de tentar novamente.
- Quando não há dados a exibir, é apresentado um estado vazio.

**Prioridade:** Must have — Obrigatório

### US 072

Como colaborador(a), quero usar o sistema em desktop, tablet ou celular, com listagens rápidas, para consultar unidades, documentos e tarefas em qualquer dispositivo.

**Critérios de aceite (Definition of Done):**

- A interface é responsiva (Tailwind CSS) em desktop, tablet e mobile, mantendo a legibilidade dos status (cores/etiquetas).
- As listagens de Unidades, Documentos e Tarefas usam paginação via TanStack Table para evitar renderização excessiva.
- O cache do TanStack Query evita recomputações e requisições desnecessárias aos dados mockados.

**Prioridade:** Must have — Obrigatório

### US 073

Como colaborador(a), quero que a interface seja acessível por teclado, com rótulos e contraste adequados, para usar o sistema com conforto e sem depender apenas de cores.

**Critérios de aceite (Definition of Done):**

- Os campos dos formulários possuem labels corretamente associados.
- As cores respeitam um contraste mínimo e a navegação por teclado é possível em todas as telas.
- As mensagens de erro não dependem apenas de cor para serem percebidas.

**Prioridade:** Must have — Obrigatório

### US 074

Como desenvolvedor(a), quero manter o código tipado, componentizado e com o estado de servidor separado do estado de UI, para facilitar o reuso, a manutenção e a troca futura dos mocks por uma API real.

**Critérios de aceite (Definition of Done):**

- O projeto usa Next.js e TypeScript, com Tailwind CSS, React Hook Form + Zod, TanStack Query e TanStack Table, organizados em camadas (UI, formulários, dados e regras de negócio).
- As entidades Unidade, Documento e Tarefa possuem interfaces/types próprios, sem uso de any.
- Componentes reutilizáveis (Button, Input, Modal, Table, Badge etc.) evitam duplicação de lógica de UI entre telas.
- O estado de servidor (TanStack Query) é mantido separado do estado de UI (filtros, modais, formulários abertos).

**Prioridade:** Must have — Obrigatório

### US 075

Como desenvolvedor(a), quero seguir um design system único em toda a aplicação, para garantir tipografia, cores e espaçamentos consistentes entre as telas.

**Critérios de aceite (Definition of Done):**

- Tipografia, cores e espaçamentos seguem o design system definido no documento de UI.
- Os status de documentos e tarefas usam o mesmo padrão de cores/etiquetas em todas as telas.

**Prioridade:** Must have — Obrigatório

### US 076

Como desenvolvedor(a), quero documentar as regras de dados em schemas Zod e manter um README no repositório, para que qualquer pessoa entenda o projeto e consiga executá-lo.

**Critérios de aceite (Definition of Done):**

- Existem schemas Zod para login, unidades, documentos e tarefas, descrevendo formato e obrigatoriedade dos dados.
- O README traz descrição do projeto, tecnologias, arquitetura e instruções de execução.

**Prioridade:** Must have — Obrigatório

### US 077

Como desenvolvedor(a), quero entregar o projeto em um repositório público e organizado, com histórico de commits claro, para que ele possa ser avaliado e executado por outras pessoas.

**Critérios de aceite (Definition of Done):**

- O repositório é público, com código organizado e estrutura de pastas clara.
- O histórico de commits no Git possui mensagens claras.
- A aplicação está funcional, executável localmente ou publicada online.

**Prioridade:** Must have — Obrigatório

---

## Épico 8 — Entregas Extras (Opcionais)

### US 081

Como administrador(a), quero que o sistema impeça a exclusão de unidades com pendências, para evitar perder o controle de documentos e tarefas ainda em aberto.

**Critérios de aceite (Definition of Done):**

- A exclusão é bloqueada quando a unidade possui documentos pendentes (próximos do vencimento ou expirados) ou tarefas em andamento.
- O sistema exibe uma mensagem explicando o motivo do bloqueio.
- Unidades sem pendências podem ser excluídas, mediante confirmação.

**Prioridade:** Could have — Desejável

### US 082

Como gestor(a), quero consultar o histórico de alterações de uma unidade, para saber quem alterou o quê e quando.

**Critérios de aceite (Definition of Done):**

- O sistema registra localmente usuário, ação e data/hora das alterações confirmadas em unidades, documentos e tarefas.
- O histórico é exibido na tela de detalhamento da unidade.

**Prioridade:** Could have — Desejável

### US 083

Como colaborador(a), quero alternar entre tema claro e escuro, para usar o sistema com maior conforto visual.

**Critérios de aceite (Definition of Done):**

- O usuário alterna o tema por um seletor na interface.
- A escolha é mantida ao reabrir o sistema.
- O contraste dos status visuais é preservado nos dois temas.

**Prioridade:** Could have — Desejável

### US 084

Como desenvolvedor(a), quero definir nome da empresa, vocabulário e tipos de documento em um arquivo de configuração, para adaptar o sistema a outros ramos sem alterar a lógica.

**Critérios de aceite (Definition of Done):**

- Nome da empresa, vocabulário e tipos de documento são definidos em um arquivo de configuração.
- A troca da configuração altera a interface sem exigir mudanças na lógica do sistema.

**Prioridade:** Could have — Desejável

### US 085

Como desenvolvedor(a), quero uma camada de API simulada que reproduza latência e erros de rede, para preparar a troca futura dos mocks por uma API real.

**Critérios de aceite (Definition of Done):**

- Existem rotas (Next.js Route Handlers ou mock server como MSW) que simulam latência e erros de rede.
- As telas continuam exibindo loading e erro conforme a US 071.

**Prioridade:** Could have — Desejável

### US 086

Como desenvolvedor(a), quero testes automatizados para as regras de negócio principais, para garantir que o cálculo de status e os bloqueios continuem corretos após mudanças.

**Critérios de aceite (Definition of Done):**

- Há testes unitários para o cálculo de status do documento (Válido, Próximo do vencimento e Expirado).
- Há testes unitários para os bloqueios de unidade inativa.

**Prioridade:** Could have — Desejável

### US 087

Como desenvolvedor(a), quero publicar a aplicação (Vercel ou similar) com pipeline de build automatizado, para disponibilizar o sistema online de forma repetível.

**Critérios de aceite (Definition of Done):**

- A aplicação está publicada e acessível online.
- O build é executado por um pipeline automatizado.

**Prioridade:** Could have — Desejável

---

## Backlog Priorizado

A tabela abaixo consolida todas as estórias já priorizadas pelo critério MoSCoW, prontas para alimentar o Product Backlog do Scrum (organização em sprints) ou as colunas de um quadro Kanban (Must have e Should have primeiro, seguidas das Could have).

| ID | Estória | Persona | Prioridade (MoSCoW) |
|---|---|---|---|
| US 011 | Login com e-mail e senha | Usuário do sistema | Must have |
| US 012 | Proteção obrigatória de rotas | Administrador(a) | Must have |
| US 021 | Indicadores gerais no Dashboard | Gestor(a) | Must have |
| US 022 | Atualização automática das pendências | Gestor(a) | Must have |
| US 031 | Listagem de unidades com busca/filtros/paginação | Colaborador(a) | Must have |
| US 032 | Detalhamento da unidade | Colaborador(a) | Must have |
| US 033 | Bloqueio de novos registros em unidades inativas | Administrador(a) | Must have |
| US 034 | Cadastro e edição de unidade | Administrador(a) | Must have |
| US 041 | Lista global de documentos | Gestor(a) | Must have |
| US 042 | Documentos por unidade | Colaborador(a) | Must have |
| US 043 | Cálculo automático do status do documento | Colaborador(a) | Must have |
| US 044 | Cadastro de documento | Colaborador(a) | Must have |
| US 051 | Tarefas por unidade com status e prazo | Colaborador(a) | Must have |
| US 052 | Confirmação ao concluir tarefa | Colaborador(a) | Must have |
| US 053 | Lista global de tarefas | Gestor(a) | Must have |
| US 054 | Cadastro de tarefa | Colaborador(a) | Must have |
| US 061 | Massa de dados mockados | Desenvolvedor(a) | Must have |
| US 071 | Loading, erro e estado vazio | Colaborador(a) | Must have |
| US 072 | Responsividade e desempenho | Colaborador(a) | Must have |
| US 073 | Acessibilidade básica | Colaborador(a) | Must have |
| US 074 | Código tipado e componentizado | Desenvolvedor(a) | Must have |
| US 075 | Consistência visual (design system) | Desenvolvedor(a) | Must have |
| US 076 | Schemas Zod e README | Desenvolvedor(a) | Must have |
| US 077 | Repositório e entrega | Desenvolvedor(a) | Must have |
| US 081 | Bloqueio de exclusão de unidade com pendências | Administrador(a) | Could have |
| US 082 | Histórico de alterações da unidade | Gestor(a) | Could have |
| US 083 | Tema claro/escuro | Colaborador(a) | Could have |
| US 084 | Adaptabilidade a diferentes empresas | Desenvolvedor(a) | Could have |
| US 085 | Camada de API simulada | Desenvolvedor(a) | Could have |
| US 086 | Testes automatizados | Desenvolvedor(a) | Could have |
| US 087 | Deploy com pipeline de build | Desenvolvedor(a) | Could have |

### Como usar este backlog

- **No Scrum:** priorize as estórias "Must have" para as primeiras sprints — Épicos 1 a 3 e 6 e as estórias de qualidade do Épico 7 primeiro, seguidos dos Épicos 4 e 5 (incluindo a lista global de documentos, US 041, e os cadastros) — deixando as estórias "Could have" (Épico 8) para o fim, apenas se houver tempo.
- **No Kanban:** use as prioridades para ordenar o topo da coluna "To Do" — as estórias "Must have" sobem para o topo do backlog e são puxadas primeiro para "Em andamento"; as "Could have" ficam no fim da fila.

---

## Rastreabilidade com a Análise de Requisitos v1.1

A tabela relaciona cada estória ao(s) requisito(s) da Análise de Requisitos v1.1 e indica o que mudou em relação à versão 1.0 deste documento.

| ID | Requisito(s) v1.1 | Situação em relação à v1.0 |
|---|---|---|
| US 011 | RF 001 | Mantida (antigo RF 001) |
| US 012 | RNF 004 | Ajustada (antigo RF 002, reclassificado) |
| US 021 | RF 002 | Ajustada (antigo RF 003) |
| US 022 | RF 003 | Ajustada (antigo RF 004) |
| US 031 | RF 004 | Mantida (antigo RF 005) |
| US 032 | RF 006 | Mantida |
| US 033 | RF 007 | Mantida |
| US 034 | RF 005 | Nova |
| US 041 | RF 008 | Ajustada (Should para Must) |
| US 042 | RF 010 | Mantida (antigo RF 009) |
| US 043 | RF 011, RNF 007 | Mantida (antigo RF 010) |
| US 044 | RF 009 | Nova |
| US 051 | RF 012 | Mantida (antigo RF 011) |
| US 052 | RF 015 | Mantida (antigo RF 012) |
| US 053 | RF 013 | Nova |
| US 054 | RF 014 | Nova |
| US 061 | RNF 008 | Ajustada (antigo RF 013, reclassificado) |
| US 071 | RNF 009 | Nova |
| US 072 | RNF 005, RNF 006 | Nova |
| US 073 | RNF 013 | Nova |
| US 074 | RNF 001, 002, 010, 011, 012 | Nova |
| US 075 | RNF 014 | Nova |
| US 076 | RNF 003 | Nova |
| US 077 | RNF 015 | Nova |
| US 081 | RF 016 | Nova |
| US 082 | RF 017 | Nova |
| US 083 | RF 018 | Nova |
| US 084 | RNF 016 | Nova |
| US 085 | RNF 017 | Nova |
| US 086 | RNF 018 | Nova |
| US 087 | RNF 019 | Nova |

# Estórias de Usuário e Backlog

**FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas**

Documento complementar à Análise de Requisitos

- **Versão do documento:** 1.2
- **Data:** 05/10/2026
- **Documento base:** Análise de Requisitos v1.2 — FrotaSync

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

Este documento apresenta as estórias de usuário derivadas dos requisitos funcionais e não funcionais descritos na Análise de Requisitos (v1.2) do sistema FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas, organizadas em épicos. Cada estória segue o formato "Como [persona], quero [ação], para [motivo]" e possui critérios de aceite que definem quando ela pode ser considerada "pronta" (Definition of Done). Ao final, o backlog completo é apresentado já priorizado pelo critério MoSCoW, pronto para ser distribuído em sprints (Scrum) ou em colunas de um quadro Kanban, seguido da rastreabilidade entre estórias e requisitos.

### O que mudou na versão 1.2

- Estórias alinhadas à Análise de Requisitos v1.2 e ao protótipo de telas (SystemDesign), com os IDs existentes mantidos.
- Novas estórias: cadastro de usuário e empresa (US 013), recuperação de senha (US 014), variação nos indicadores (US 023), navegação principal (US 024), ativação e inativação de unidade (US 035), edição de documento (US 045), edição de tarefa (US 055), validação e máscaras de campos (US 078) e proteção de dados pessoais (US 079).
- Estórias ajustadas: US 011, 012, 021, 031 a 034, 041, 042, 044, 051 a 054, 061 e 075 (login com "Lembre-me"; Dashboard com gráficos de rosca; unidades em cards; endereço com CEP; novos campos de documento e de tarefa; confirmações antes de gravar; listas globais dentro do Dashboard).
- O Épico 2 passou a se chamar "Dashboard, Indicadores e Navegação".
- Prioridades: requisitos "Necessário" da v1.2 entram como Should have; os "Obrigatório", como Must have.

### O que mudou na versão 1.1 (histórico)

- Estórias alinhadas à numeração da Análise de Requisitos v1.1 (ver rastreabilidade ao final do documento).
- Novas estórias para os requisitos incluídos na v1.1: cadastro e edição de unidade (US 034), cadastro de documento (US 044), lista global de tarefas (US 053) e cadastro de tarefa (US 054).
- Novo Épico 7, com as estórias dos requisitos não funcionais, e novo Épico 8, com as entregas extras opcionais.
- US 041 (lista global de documentos) passou de Should have para Must have; US 021, 022 e 061 foram ajustadas ao novo escopo (total de pendências, novas telas e ambientação na FrotaSync).

### Personas consideradas

- **Colaborador(a) / Usuário administrativo:** acompanha a situação das filiais e pátios, consulta e cadastra documentos e gerencia as tarefas vinculadas a cada unidade no dia a dia.
- **Gestor(a) / Tomador de decisão:** utiliza principalmente o Dashboard e as listas globais para ter uma visão rápida da situação da empresa e apoiar decisões sobre prioridades e pendências.
- **Administrador(a):** responsável por garantir a segurança de acesso e a consistência dos dados do sistema (autenticação, cadastro e inativação de unidades, regras de unidades inativas).
- **Novo(a) usuário(a):** pessoa que ainda não tem acesso ao sistema e realiza o cadastro de si mesma e da empresa, ou que precisa recuperar a senha.
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

Como usuário do sistema, quero me autenticar informando e-mail corporativo e senha, com a opção "Lembre-me" e acesso rápido a "Esqueceu a senha?" e "Cadastre-se", para acessar as informações e funcionalidades restritas do sistema com segurança.

**Critérios de aceite (Definition of Done):**

- O formulário de login valida e-mail (formato válido) e senha (obrigatória) com Zod antes do envio.
- Login com credenciais válidas redireciona o usuário para o Dashboard Global e exibe feedback visual de sucesso.
- Login com credenciais inválidas ou campos mal preenchidos exibe mensagem de erro específica, sem redirecionar o usuário.
- Com "Lembre-me" ativo, a sessão é mantida por um período estendido.
- Os links "Esqueceu a senha?" e "Cadastre-se" levam às telas de recuperação de senha e de cadastro.

**Prioridade:** Must have — Obrigatório

### US 012

Como administrador(a) do sistema, quero que todas as telas protegidas exijam autenticação válida, para impedir que usuários não autorizados acessem dados da empresa.

**Critérios de aceite (Definition of Done):**

- Usuário sem sessão válida que tentar acessar qualquer rota protegida (Dashboard, Unidades, Detalhamento, Documentos, Tarefas, Configurações) é redirecionado automaticamente para /login.
- Apenas /login, /cadastro e /recuperar-senha são acessíveis sem autenticação.
- A verificação de autenticação ocorre a cada navegação ou carregamento de rota protegida.
- Nenhum conteúdo protegido é exibido antes do redirecionamento, inclusive quando o acesso é feito diretamente pela URL.
- Usuário autenticado tem acesso normal à rota solicitada, sem redirecionamentos indevidos.

**Prioridade:** Must have — Obrigatório

### US 013

Como novo(a) usuário(a), quero me cadastrar informando meus dados pessoais, os dados da empresa e meus dados de login em etapas, para criar meu acesso ao sistema.

**Critérios de aceite (Definition of Done):**

- O cadastro tem 3 etapas com indicador de progresso: Dados Pessoais (nome, CPF, telefone, cargo/função), Dados da Empresa (nome comercial, razão social, CNPJ, segmento, tipo de unidade Matriz ou Filial, endereço) e Dados de Login (e-mail corporativo, senha, confirmação de senha e aceite dos termos).
- Cada etapa é validada com Zod antes de avançar: CPF e CNPJ válidos, telefone com DDD, senha com no mínimo 8 caracteres e confirmação igual à senha.
- O aceite dos Termos de Uso e da Política de Privacidade é obrigatório para finalizar.
- "Finalizar Cadastro" cria o usuário e a empresa (mock) e leva ao login com mensagem de sucesso.
- E-mail, CPF ou CNPJ já cadastrados exibem erro junto ao campo.

**Prioridade:** Should have — Importante

### US 014

Como usuário(a) que esqueceu a senha, quero redefinir minha senha por meio de um código enviado ao meu e-mail, para recuperar o acesso sem depender de outra pessoa.

**Critérios de aceite (Definition of Done):**

- Passo 1: o usuário informa o e-mail cadastrado e solicita o código ("Enviar Código").
- Passo 2: o usuário informa o código de 5 dígitos ("Verificar código") e pode pedir um novo código ("Enviar novo código").
- Passo 3: o usuário define e confirma a nova senha (mínimo de 8 caracteres) e conclui em "Confirmar".
- Código inválido ou expirado exibe mensagem de erro e não avança.
- O sistema não informa se o e-mail digitado existe ou não.
- Ao concluir, o usuário é levado ao login.

**Prioridade:** Should have — Importante

---

## Épico 2 — Dashboard, Indicadores e Navegação

### US 021

Como gestor(a), quero visualizar o Dashboard Global com a distribuição de unidades, documentos e tarefas por status e o total de pendências logo após o login, para ter uma visão rápida da situação geral da empresa.

**Critérios de aceite (Definition of Done):**

- O Dashboard Global é exibido como tela inicial imediatamente após o login.
- Três cards com gráfico de rosca mostram: Unidades (ativas e inativas), Documentos (Válido, Próximo do vencimento e Expirado) e Tarefas (Concluída, Em andamento e Pendente), calculados a partir dos dados mockados via TanStack Query.
- O total de pendências (documentos próximos do vencimento ou expirados + tarefas pendentes ou em andamento) é exibido no painel.
- Abaixo dos cards, uma tabela alterna entre Documentos e Tarefas (US 041 e US 053).
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

### US 023

Como gestor(a), quero ver, junto ao total de documentos a vencer e de tarefas concluídas, a variação em relação ao período anterior, para perceber rapidamente se a situação está melhorando ou piorando.

**Critérios de aceite (Definition of Done):**

- No Dashboard Global, o cabeçalho da tabela exibe o total de documentos a vencer (aba Documentos) e o total de tarefas concluídas (aba Tarefas), com a variação percentual, seta de alta ou queda e cor.
- No detalhamento da unidade, o mesmo padrão é usado para o total de documentos expirados e o total de tarefas concluídas da unidade.
- Sem dados no período anterior, a variação não é exibida.

**Prioridade:** Should have — Importante

### US 024

Como usuário(a), quero um menu lateral, uma barra superior e breadcrumbs consistentes em todas as telas, para navegar entre Dashboard, Unidades e Configurações e saber em que parte do sistema estou.

**Critérios de aceite (Definition of Done):**

- O menu lateral tem Dashboard, Unidades e Configurações, com o item da seção atual destacado.
- A barra superior exibe o logotipo, o campo de busca, os ícones de notificações e ajuda e o nome e perfil do usuário logado.
- Os breadcrumbs refletem a rota atual (ex.: Unidades / Caruaru (ID 002) / Documentos / Novo Documento).
- Os formulários têm o botão "Voltar para …" que leva à lista de origem.

**Prioridade:** Should have — Importante

---

## Épico 3 — Gestão de Unidades

### US 031

Como colaborador(a), quero visualizar todas as unidades (filiais e pátios) cadastradas em uma grade de cards, com pesquisa, filtro e paginação, para localizar rapidamente a unidade que preciso consultar.

**Critérios de aceite (Definition of Done):**

- Cada card exibe o identificador, o endereço, a quantidade de documentos e de tarefas e o selo de status (ATIVA em verde ou INATIVA em vermelho).
- É possível pesquisar por nome/identificador e filtrar por status (Ativo/Inativo).
- A grade é paginada (12 cards por página), com o texto "Mostrando 1 a 12 de N unidades".
- Quando nenhum resultado é encontrado, é exibida uma mensagem de lista vazia.
- O botão "Nova Unidade" leva ao cadastro (US 034).

**Prioridade:** Must have — Obrigatório

### US 032

Como colaborador(a), quero acessar o detalhamento de uma unidade selecionada, para visualizar suas informações, documentos e tarefas vinculados em um só lugar.

**Critérios de aceite (Definition of Done):**

- Ao selecionar uma unidade na listagem, o sistema exibe o título com nome e identificador, o endereço e o selo de status.
- O card "Informações da unidade" mostra status, data de criação e última modificação, com o botão "Mais detalhes".
- Os cards de Documentos e de Tarefas mostram gráficos de rosca por status da unidade.
- Uma tabela alterna entre os documentos e as tarefas vinculados àquela unidade.
- Se a unidade estiver inativa, os documentos e tarefas são exibidos apenas em modo somente leitura.

**Prioridade:** Must have — Obrigatório

### US 033

Como administrador(a), quero que unidades inativas não possam receber novos documentos ou tarefas nem ter os existentes modificados, para manter a consistência dos dados e evitar registros indevidos em unidades encerradas.

**Critérios de aceite (Definition of Done):**

- Em unidades com status "Inativa", as ações de cadastro e edição de documentos e tarefas ficam desabilitadas na tela de detalhamento.
- Ao tentar cadastrar uma tarefa em unidade inativa, é exibido o aviso "Não é possível cadastrar a tarefa", com a ação "Voltar para unidades".
- Os campos de seleção de unidade nos formulários de documento e de tarefa listam apenas unidades ativas.
- Em unidades ativas, essas mesmas ações permanecem habilitadas normalmente.
- Documentos e tarefas já existentes de uma unidade inativa continuam visíveis, apenas em modo leitura.

**Prioridade:** Must have — Obrigatório

### US 034

Como administrador(a), quero cadastrar e editar unidades (filiais e pátios) por meio de um formulário validado, para manter a base de unidades da empresa atualizada e consistente.

**Critérios de aceite (Definition of Done):**

- O formulário, construído com React Hook Form e validado com Zod, contém nome da unidade, identificador, CEP, logradouro, número, complemento (opcional), bairro, cidade, UF e descrição (opcional).
- O botão "Buscar CEP" preenche logradouro, bairro, cidade e UF; se o CEP não for encontrado, o usuário preenche manualmente.
- Campos inválidos ou obrigatórios não preenchidos exibem mensagem de erro junto ao campo; identificador repetido é recusado.
- Antes de gravar, o modal "Deseja cadastrar a unidade?" pede confirmação.
- A unidade criada ou editada é refletida imediatamente na listagem e no Dashboard.
- A unidade nasce ativa; a mudança de status é feita na US 035.

**Prioridade:** Must have — Obrigatório

### US 035

Como administrador(a), quero ativar e inativar uma unidade com confirmação, para encerrar ou retomar a operação de uma unidade sem perder seus dados.

**Critérios de aceite (Definition of Done):**

- No detalhamento da unidade há a ação de ativar (se inativa) ou inativar (se ativa).
- Ao inativar, o modal "Deseja desativar a unidade?" informa que documentos e tarefas deixarão de poder ser modificados.
- Ao ativar, o modal "Deseja ativar a unidade?" informa que documentos e tarefas poderão voltar a ser modificados.
- Ao confirmar, o selo de status, a listagem, os cards e o Dashboard são atualizados; ao cancelar, nada muda.
- Passam a valer as restrições da US 033.

**Prioridade:** Must have — Obrigatório

---

## Épico 4 — Gestão de Documentos

### US 041

Como gestor(a), quero visualizar uma lista global com todos os documentos cadastrados no sistema, com pesquisa, filtros e paginação, para acompanhar a validade de todos os documentos da empresa em um único lugar.

**Critérios de aceite (Definition of Done):**

- A lista fica na aba Documentos do Dashboard Global e exibe os documentos de todas as unidades, com as colunas documento, unidade, categoria, emissão, validade, status e ações.
- Cada documento exibe seu status calculado (Válido, Próximo do vencimento ou Expirado).
- É possível pesquisar por nome, filtrar por unidade, categoria e status e paginar os resultados (10 por página) com TanStack Table.
- O botão "Novo documento" leva ao cadastro (US 044) e a ação "Editar" de cada linha leva à edição (US 045).
- Quando nenhum resultado é encontrado, é exibida uma mensagem de lista vazia.

**Prioridade:** Must have — Obrigatório

### US 042

Como colaborador(a), quero visualizar, na tela de detalhamento da unidade, apenas os documentos vinculados àquela unidade específica, para acompanhar a validade documental da unidade sem precisar filtrar a lista global.

**Critérios de aceite (Definition of Done):**

- A lista exibida na aba Documentos do detalhamento da unidade contém somente os documentos vinculados a ela, com busca, filtros de categoria e status e paginação.
- Cada documento da lista exibe categoria, emissão, validade e seu status de validade calculado (Válido, Próximo do vencimento ou Expirado).

**Prioridade:** Must have — Obrigatório

### US 043

Como colaborador(a), quero que o status de validade de cada documento seja calculado automaticamente a partir da data de validade, para evitar erros de preenchimento manual e garantir a confiabilidade da informação.

**Critérios de aceite (Definition of Done):**

- Documentos com validade a mais de 15 dias da data atual recebem status "Válido".
- Documentos com até 15 dias para o vencimento recebem status "Próximo do vencimento".
- Documentos com data de validade já ultrapassada recebem status "Expirado"; o status nunca pode ser digitado ou editado manualmente.

**Prioridade:** Must have — Obrigatório

### US 044

Como colaborador(a), quero cadastrar um documento em uma unidade ativa, informando os dados e anexando o arquivo, para manter o controle de validade da documentação de cada unidade (ex.: Licença Ambiental, Registro na ANTT, Seguro de Carga).

**Critérios de aceite (Definition of Done):**

- O formulário, validado com Zod, contém nome do documento, anexo (obrigatório), unidade vinculada, categoria, data de emissão (opcional), data de vencimento e descrição (opcional).
- O status do documento não é informado pelo usuário: é calculado automaticamente (US 043).
- O cadastro só é permitido em unidades ativas; a seleção lista apenas unidades ativas.
- Quando aberto a partir do detalhamento de uma unidade, o campo de unidade vem preenchido e bloqueado.
- Antes de gravar, o modal "Deseja cadastrar o documento?" pede confirmação.
- O documento criado é refletido nas listas e no Dashboard; erros de preenchimento aparecem junto a cada campo.

**Prioridade:** Must have — Obrigatório

### US 045

Como colaborador(a), quero editar um documento já cadastrado, para corrigir dados ou atualizar a validade e o anexo quando o documento é renovado.

**Critérios de aceite (Definition of Done):**

- A ação "Editar" de cada linha abre o formulário do documento já preenchido.
- O anexo só é substituído se um novo arquivo for enviado.
- Após salvar, o status de validade é recalculado e as listas e o Dashboard são atualizados.
- Documentos de unidades inativas não podem ser editados.

**Prioridade:** Should have — Importante

---

## Épico 5 — Gestão de Tarefas

### US 051

Como colaborador(a), quero visualizar as tarefas vinculadas a cada unidade, com status, datas e prazos, para acompanhar o andamento do trabalho relacionado àquela unidade.

**Critérios de aceite (Definition of Done):**

- A lista de tarefas de uma unidade (aba Tarefas do detalhamento) exibe tarefa, data de início, prazo final, status (Pendente, Em andamento, Concluída) e data de conclusão, com busca, filtro de status e paginação.
- Cada status possui destaque visual (cor/etiqueta) que facilita a identificação rápida.

**Prioridade:** Must have — Obrigatório

### US 052

Como colaborador(a), quero alterar o status de uma tarefa e confirmar explicitamente quando ela for concluída, para evitar que tarefas sejam marcadas como concluídas por engano.

**Critérios de aceite (Definition of Done):**

- O usuário pode alterar o status de uma tarefa entre Pendente, Em andamento e Concluída.
- Ao selecionar o status "Concluída", o modal "Concluir tarefa?" é exibido, citando o título da tarefa, antes da efetivação da mudança.
- Ao confirmar, o novo status e a data e hora de conclusão são refletidos na listagem de tarefas e no Dashboard; ao cancelar, o status permanece inalterado.
- Se uma tarefa concluída voltar a outro status, a data de conclusão é limpa.
- Tarefas de unidades inativas não podem ter o status alterado.

**Prioridade:** Must have — Obrigatório

### US 053

Como gestor(a), quero visualizar uma lista global com todas as tarefas de todas as unidades, com pesquisa, filtros e paginação, para acompanhar prazos e andamento do trabalho da empresa em um único lugar.

**Critérios de aceite (Definition of Done):**

- A lista fica na aba Tarefas do Dashboard Global e exibe tarefa, unidade, data de início, prazo final, status e data de conclusão.
- É possível pesquisar por título, filtrar por unidade e por status e paginar os resultados (10 por página) com TanStack Table.
- O botão "Nova Tarefa" leva ao cadastro (US 054) e a ação de edição de cada linha leva à US 055.
- Quando nenhum resultado é encontrado, é exibida uma mensagem de lista vazia.
- A alteração de status a partir da lista segue as regras da US 052.

**Prioridade:** Must have — Obrigatório

### US 054

Como colaborador(a), quero cadastrar uma tarefa em uma unidade ativa, informando título, prazo e descrição, para registrar e acompanhar o trabalho necessário (ex.: renovar licença do pátio de Recife).

**Critérios de aceite (Definition of Done):**

- O formulário, validado com Zod, contém título, unidade vinculada, prazo e descrição (opcional).
- A tarefa é criada com o status inicial "Pendente" (exibido, não editável) e com a data de início igual à data do cadastro.
- O cadastro só é permitido em unidades ativas; a seleção lista apenas unidades ativas.
- Quando aberto a partir do detalhamento de uma unidade, o campo de unidade vem preenchido e bloqueado.
- Antes de gravar, o modal "Deseja criar a tarefa?" pede confirmação.
- A tarefa criada é refletida nas listas e no Dashboard; erros de preenchimento aparecem junto a cada campo.

**Prioridade:** Must have — Obrigatório

### US 055

Como colaborador(a), quero editar título, descrição e prazo de uma tarefa já cadastrada, para ajustar o planejamento quando necessário.

**Critérios de aceite (Definition of Done):**

- A ação de edição de cada linha abre o formulário da tarefa já preenchido.
- O status não é alterado por esse formulário; segue a US 052.
- Após salvar, as listas e o Dashboard são atualizados.
- Tarefas de unidades inativas não podem ser editadas.

**Prioridade:** Should have — Importante

---

## Épico 6 — Dados de Demonstração (Mocks)

### US 061

Como desenvolvedor(a), quero manter uma massa de dados mockados que cubra todos os estados relevantes do sistema, para demonstrar e testar todas as regras de negócio sem depender de um backend real.

**Critérios de aceite (Definition of Done):**

- Os dados mockados incluem unidades ativas e inativas, com endereço estruturado.
- Os dados mockados incluem documentos em cada um dos três status (válido, próximo do vencimento, expirado), em categorias variadas (ex.: Legal, Ambiental, Segurança, Fiscal, Contratual, Técnica, Sanitária) e com anexos fictícios.
- Os dados mockados incluem tarefas em cada um dos três status (pendente, em andamento, concluída), com datas de início e de conclusão.
- Há dados em períodos anteriores suficientes para exibir a variação dos indicadores (US 023).
- Há uma empresa e usuários fictícios para login, cadastro e recuperação de senha (com código simulado).
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
- Os status de documentos, tarefas e unidades usam os mesmos rótulos e o mesmo padrão de cores/etiquetas em tabelas, cards e legendas de gráficos (RNF 014).

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

### US 078

Como usuário(a), quero que campos como CPF, CNPJ, telefone e CEP tenham máscara e validação, para evitar erros de digitação nos formulários.

**Critérios de aceite (Definition of Done):**

- CPF e CNPJ são validados pelos dígitos verificadores; telefone exige DDD; CEP tem 8 dígitos; UF tem 2 letras.
- Os campos têm máscara de digitação e os valores são normalizados (somente dígitos) antes de serem gravados.
- A senha exige no mínimo 8 caracteres e a confirmação deve ser igual.

**Prioridade:** Should have — Importante

### US 079

Como usuário(a), quero que meus dados pessoais sejam tratados com cuidado e que o aceite dos Termos de Uso e da Política de Privacidade fique registrado, para ter segurança e transparência no uso do sistema.

**Critérios de aceite (Definition of Done):**

- O cadastro exige o aceite dos Termos de Uso e da Política de Privacidade, registrado com data e hora.
- Senhas nunca são armazenadas em texto plano nem registradas em logs.
- Os mocks usam apenas dados fictícios.

**Prioridade:** Should have — Importante

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
| US 011 | Login com e-mail, senha e "Lembre-me" | Usuário do sistema | Must have |
| US 012 | Proteção obrigatória de rotas | Administrador(a) | Must have |
| US 013 | Cadastro de usuário e empresa em 3 etapas | Novo(a) usuário(a) | Should have |
| US 014 | Recuperação de senha por código | Novo(a) usuário(a) | Should have |
| US 021 | Dashboard Global com indicadores por status | Gestor(a) | Must have |
| US 022 | Atualização automática das pendências | Gestor(a) | Must have |
| US 023 | Variação dos indicadores | Gestor(a) | Should have |
| US 024 | Navegação principal e breadcrumbs | Usuário(a) | Should have |
| US 031 | Listagem de unidades em cards, com busca, filtro e paginação | Colaborador(a) | Must have |
| US 032 | Detalhamento da unidade | Colaborador(a) | Must have |
| US 033 | Bloqueio de registros e edições em unidades inativas | Administrador(a) | Must have |
| US 034 | Cadastro e edição de unidade | Administrador(a) | Must have |
| US 035 | Ativação e inativação de unidade com confirmação | Administrador(a) | Must have |
| US 041 | Lista global de documentos | Gestor(a) | Must have |
| US 042 | Documentos por unidade | Colaborador(a) | Must have |
| US 043 | Cálculo automático do status do documento | Colaborador(a) | Must have |
| US 044 | Cadastro de documento | Colaborador(a) | Must have |
| US 045 | Edição de documento | Colaborador(a) | Should have |
| US 051 | Tarefas por unidade com status, datas e prazo | Colaborador(a) | Must have |
| US 052 | Confirmação ao concluir tarefa | Colaborador(a) | Must have |
| US 053 | Lista global de tarefas | Gestor(a) | Must have |
| US 054 | Cadastro de tarefa | Colaborador(a) | Must have |
| US 055 | Edição de tarefa | Colaborador(a) | Should have |
| US 061 | Massa de dados mockados | Desenvolvedor(a) | Must have |
| US 071 | Loading, erro e estado vazio | Colaborador(a) | Must have |
| US 072 | Responsividade e desempenho | Colaborador(a) | Must have |
| US 073 | Acessibilidade básica | Colaborador(a) | Must have |
| US 074 | Código tipado e componentizado | Desenvolvedor(a) | Must have |
| US 075 | Consistência visual (design system) | Desenvolvedor(a) | Must have |
| US 076 | Schemas Zod e README | Desenvolvedor(a) | Must have |
| US 077 | Repositório e entrega | Desenvolvedor(a) | Must have |
| US 078 | Validação e máscaras de campos | Usuário(a) | Should have |
| US 079 | Proteção de dados pessoais e aceite de termos | Usuário(a) | Should have |
| US 081 | Bloqueio de exclusão de unidade com pendências | Administrador(a) | Could have |
| US 082 | Histórico de alterações da unidade | Gestor(a) | Could have |
| US 083 | Tema claro/escuro | Colaborador(a) | Could have |
| US 084 | Adaptabilidade a diferentes empresas | Desenvolvedor(a) | Could have |
| US 085 | Camada de API simulada | Desenvolvedor(a) | Could have |
| US 086 | Testes automatizados | Desenvolvedor(a) | Could have |
| US 087 | Deploy com pipeline de build | Desenvolvedor(a) | Could have |

### Como usar este backlog

- **No Scrum:** priorize as estórias "Must have" para as primeiras sprints — Épicos 1 a 3 e 6 e as estórias de qualidade do Épico 7 primeiro, seguidos dos Épicos 4 e 5 (incluindo a lista global de documentos, US 041, e os cadastros) — deixando as estórias "Could have" (Épico 8) para o fim, apenas se houver tempo. As estórias "Should have" incluídas na v1.2 (US 013, 014, 023, 024, 045, 055, 078 e 079) entram depois das "Must have" do mesmo épico.
- **No Kanban:** use as prioridades para ordenar o topo da coluna "To Do" — as estórias "Must have" sobem para o topo do backlog e são puxadas primeiro para "Em andamento"; as "Could have" ficam no fim da fila.

---

## Rastreabilidade com a Análise de Requisitos v1.2

A tabela relaciona cada estória ao(s) requisito(s) da Análise de Requisitos v1.2 e indica o que mudou em relação à versão 1.1 deste documento. Nenhum ID de estória foi renumerado.

| ID | Requisito(s) v1.2 | Situação em relação à v1.1 |
|---|---|---|
| US 011 | RF 001 | Ajustada na v1.2 |
| US 012 | RNF 004 | Ajustada na v1.2 |
| US 013 | RF 019, RNF 020, RNF 021 | Nova na v1.2 |
| US 014 | RF 020 | Nova na v1.2 |
| US 021 | RF 002 | Ajustada na v1.2 |
| US 022 | RF 003 | Mantida |
| US 023 | RF 024 | Nova na v1.2 |
| US 024 | RF 025 | Nova na v1.2 |
| US 031 | RF 004 | Ajustada na v1.2 |
| US 032 | RF 006 | Ajustada na v1.2 |
| US 033 | RF 007 | Ajustada na v1.2 |
| US 034 | RF 005 | Ajustada na v1.2 |
| US 035 | RF 021 | Nova na v1.2 |
| US 041 | RF 008 | Ajustada na v1.2 |
| US 042 | RF 010 | Ajustada na v1.2 |
| US 043 | RF 011, RNF 007 | Mantida |
| US 044 | RF 009 | Ajustada na v1.2 |
| US 045 | RF 022 | Nova na v1.2 |
| US 051 | RF 012 | Ajustada na v1.2 |
| US 052 | RF 015 | Ajustada na v1.2 |
| US 053 | RF 013 | Ajustada na v1.2 |
| US 054 | RF 014 | Ajustada na v1.2 |
| US 055 | RF 023 | Nova na v1.2 |
| US 061 | RNF 008 | Ajustada na v1.2 |
| US 071 | RNF 009 | Mantida |
| US 072 | RNF 005, RNF 006 | Mantida |
| US 073 | RNF 013 | Mantida |
| US 074 | RNF 001, 002, 010, 011, 012 | Mantida |
| US 075 | RNF 014 | Ajustada na v1.2 |
| US 076 | RNF 003 | Mantida |
| US 077 | RNF 015 | Mantida |
| US 078 | RNF 020 | Nova na v1.2 |
| US 079 | RNF 021 | Nova na v1.2 |
| US 081 | RF 016 | Mantida |
| US 082 | RF 017 | Mantida |
| US 083 | RF 018 | Mantida |
| US 084 | RNF 016 | Mantida |
| US 085 | RNF 017 | Mantida |
| US 086 | RNF 018 | Mantida |
| US 087 | RNF 019 | Mantida |

---

## Histórico de Alterações

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 22/09/2026 | 1.0 | Criação inicial das estórias de usuário e do backlog. | Equipe do projeto |
| 29/09/2026 | 1.1 | Alinhamento à Análise de Requisitos v1.1; novas US 034, 044, 053 e 054; novos Épicos 7 e 8. | Equipe do projeto |
| 05/10/2026 | 1.2 | Alinhamento à Análise de Requisitos v1.2 e ao protótipo de telas; novas US 013, 014, 023, 024, 035, 045, 055, 078 e 079; ajuste das US 011, 012, 021, 031 a 034, 041, 042, 044, 051 a 054, 061 e 075. | Equipe do projeto |

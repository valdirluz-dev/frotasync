# Estórias de Usuário e Backlog

**FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas**

Documento complementar à Análise de Requisitos

- **Versão do documento:** 1.3
- **Data:** 20/10/2026
- **Documento base:** Análise de Requisitos v1.3 — FrotaSync

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

Este documento apresenta as estórias de usuário derivadas dos requisitos funcionais e não funcionais descritos na Análise de Requisitos (v1.3) do sistema FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas, organizadas em épicos. Cada estória segue o formato "Como [persona], quero [ação], para [motivo]" e possui critérios de aceite que definem quando ela pode ser considerada "pronta" (Definition of Done). Ao final, o backlog completo é apresentado já priorizado pelo critério MoSCoW, pronto para ser distribuído em sprints (Scrum) ou em colunas de um quadro Kanban, seguido da rastreabilidade entre estórias e requisitos.

### O que mudou na versão 1.3

- Evolução do projeto de frontend com mocks para uma aplicação fullstack completa, executada na nuvem, alinhada à Análise de Requisitos v1.3, à Modelagem de Dados v1.2 e ao Design de API v1.2.
- Quatro novos épicos, que seguem o padrão de numeração existente: Épico 11 — Banco de Dados (PostgreSQL), com as US 111 a 117; Épico 12 — API e Backend (NestJS), com as US 121 a 129; Épico 13 — Integração Frontend ↔ API, com as US 131 a 137; e Épico 14 — Infraestrutura e Cloud (Docker, Terraform, AWS, CI/CD), com as US 141 a 149.
- US 085 (camada de API simulada) descartada, pois a API real a substitui, e US 087 (deploy com Vercel ou similar) substituída pelas US 141 a 149.
- US 043 e US 061 ajustadas: o status do documento passa a ser calculado pelo backend, e a massa de dados mockados passa a ser a base do seed do banco.
- Os Épicos 4.1 (Tela de Gestão Global de Documentos) e 5.1 (Gestão Global de Tarefas) do quadro correspondem às US 041 e US 053, ajustadas para que as listas globais fiquem nas rotas dedicadas `/documentos` e `/tarefas`, acessíveis pelo menu lateral. O Dashboard mantém os cards e o total de pendências. Foram ajustadas também as US 021, 023 e 024.
- Prioridades dos novos épicos: as estórias necessárias para o sistema funcionar integrado e publicado entram como Must have; recuperação de senha no servidor (US 124) e índices (US 115) entram como Should have, alinhadas à prioridade "Necessário" dos requisitos correspondentes.

### O que mudou na versão 1.2 (histórico)

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
- **Desenvolvedor(a):** constrói, documenta e mantém o sistema, incluindo o banco de dados, a API, a massa de dados de demonstração (mocks e seed) e a integração entre as camadas.
- **Responsável pela operação:** publica novas versões, acompanha a disponibilidade do sistema na nuvem e recupera os dados após falhas.

### Critério de priorização — MoSCoW

- **Must have (Obrigatório):** essencial para o sistema funcionar; deve estar na primeira entrega.
- **Should have (Importante):** agrega muito valor, mas o sistema funciona sem ele no curto prazo.
- **Could have (Desejável):** melhora a experiência, pode ficar para uma versão futura. Inclui as entregas extras do briefing.
- **Won't have (Fora do escopo por ora):** não será implementado nesta fase do projeto (nesta versão: controle de documentos por veículo e por motorista, além das estórias descartadas ou substituídas na v1.3: US 085 e US 087).

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
- O Dashboard Global mantém os cards e o total de pendências; as listas de documentos e de tarefas ficam nas rotas dedicadas `/documentos` e `/tarefas` (US 041 e US 053).
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

- Nas listas globais, o cabeçalho da tabela exibe o total de documentos a vencer (em `/documentos`) e o total de tarefas concluídas (em `/tarefas`), com a variação percentual, seta de alta ou queda e cor.
- No detalhamento da unidade, o mesmo padrão é usado para o total de documentos expirados e o total de tarefas concluídas da unidade.
- Sem dados no período anterior, a variação não é exibida.

**Prioridade:** Should have — Importante

### US 024

Como usuário(a), quero um menu lateral, uma barra superior e breadcrumbs consistentes em todas as telas, para navegar entre Dashboard, Documentos, Tarefas, Unidades e Configurações e saber em que parte do sistema estou.

**Critérios de aceite (Definition of Done):**

- O menu lateral tem Dashboard, Documentos, Tarefas, Unidades e Configurações, com o item da seção atual destacado.
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

- A lista fica na rota dedicada `/documentos`, acessível diretamente pelo menu lateral, e exibe os documentos de todas as unidades, com as colunas documento, unidade, categoria, emissão, validade, status e ações.
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
- O cálculo é executado pelo backend a cada consulta, que é a fonte da verdade; o cliente nunca envia o status.

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

- A lista fica na rota dedicada `/tarefas`, acessível diretamente pelo menu lateral, e exibe tarefa, unidade, data de início, prazo final, status e data de conclusão.
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
- Após a integração com a API (US 137), os dados mockados deixam de ser usados no fluxo de negócio e passam a ser a base do seed do banco (US 116).

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

**Prioridade:** Won't have — Descartada na v1.3 (a API real do Épico 12 substitui a camada simulada)

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

**Prioridade:** Won't have — Substituída na v1.3 pelas US 141 a 149 (deploy completo na AWS com pipeline)

---

## Épico 11 — Banco de Dados (PostgreSQL)

### US 111

Como desenvolvedor(a), quero subir o PostgreSQL localmente com Docker, configurado por variáveis de ambiente, para desenvolver e testar a API sem instalar nem configurar o banco manualmente.

**Critérios de aceite (Definition of Done):**

- O container do PostgreSQL sobe via docker-compose, com volume persistente.
- A conexão é configurada por variáveis de ambiente, com um `.env.example` no repositório e sem segredos versionados.
- O README documenta como subir, parar e reiniciar o banco do zero.

**Prioridade:** Must have — Obrigatório

### US 112

Como desenvolvedor(a), quero migrations Flyway versionadas para as tabelas de empresa e de usuário, para criar o esquema de identidade de forma reproduzível e íntegra.

**Critérios de aceite (Definition of Done):**

- A migration V1 habilita a extensão necessária para a geração de UUID.
- A migration V2 cria `empresa`, com CNPJ único e CHECK de 14 dígitos.
- A migration V3 cria `usuario`, com e-mail e CPF únicos, CHECK de papel, CPF e telefone e chave estrangeira RESTRICT para a empresa.

**Prioridade:** Must have — Obrigatório

### US 113

Como desenvolvedor(a), quero migrations Flyway para unidade, documento e tarefa, para persistir o domínio do sistema com as regras de integridade da Modelagem de Dados.

**Critérios de aceite (Definition of Done):**

- A migration V4 cria `unidade`, com (empresa, código) único e CHECK de status, CEP e UF.
- A migration V5 cria `documento`, com data de validade obrigatória, CHECK de emissão não posterior à validade, dados do anexo e exclusão em cascata; não há coluna de status, que é derivado.
- A migration V6 cria `tarefa`, com prazo obrigatório, CHECK de status e data de conclusão coerente com o status.

**Prioridade:** Must have — Obrigatório

### US 114

Como desenvolvedor(a), quero uma migration para os códigos de verificação, para sustentar a recuperação de senha com segurança.

**Critérios de aceite (Definition of Done):**

- A migration V8 cria `codigo_verificacao`, com expiração, número de tentativas (nunca negativo) e marca de uso.
- O código é guardado somente como hash, nunca em texto plano.
- A chave estrangeira para o usuário usa exclusão em cascata.

**Prioridade:** Must have — Obrigatório

### US 115

Como desenvolvedor(a), quero índices e consultas preparados para as listagens e os indicadores, para que as telas respondam rápido mesmo com muitos registros.

**Critérios de aceite (Definition of Done):**

- Existem índices por empresa e por unidade, pela validade do documento e pelo status e prazo da tarefa.
- As consultas de listagem suportam busca, filtros, ordenação e paginação (página iniciada em 0).
- As consultas agregadas dos indicadores funcionam, inclusive com recálculo por uma data de referência anterior (RF 024).

**Prioridade:** Should have — Importante

### US 116

Como desenvolvedor(a), quero um seed de desenvolvimento com os dados da FrotaSync, para demonstrar e testar todos os estados do sistema com um banco real.

**Critérios de aceite (Definition of Done):**

- O seed cria a empresa FrotaSync e usuários colaborador, gestor e administrador, com senhas em hash.
- O seed cria unidades ativas e inativas, com endereço estruturado.
- O seed cria documentos nos três status e tarefas nos três status, com anexos fictícios.
- O seed inclui registros com datas do mês anterior, para que a variação dos indicadores (US 023) apareça.
- O seed roda somente em desenvolvimento e usa apenas dados fictícios.

**Prioridade:** Must have — Obrigatório

### US 117

Como desenvolvedor(a), quero garantir que o banco seja criado do zero apenas por migrations e rejeite dados inválidos, para confiar na integridade dos dados mesmo fora da API.

**Critérios de aceite (Definition of Done):**

- Um banco vazio é criado do zero somente pelas migrations, sem SQL manual.
- Testes confirmam que constraints e chaves estrangeiras rejeitam dados inválidos sem passar pela API.

**Prioridade:** Must have — Obrigatório

---

## Épico 12 — API e Backend (NestJS)

### US 121

Como desenvolvedor(a), quero uma API NestJS estruturada, configurável e documentada, para servir de base a todos os endpoints do sistema.

**Critérios de aceite (Definition of Done):**

- O projeto NestJS com TypeScript usa o prefixo `/api/v1` e é organizado em módulos, controllers e serviços.
- A conexão com o PostgreSQL é configurada por variáveis de ambiente, validadas na inicialização.
- Os DTOs são validados com schemas Zod, reaproveitando os do frontend.
- Um filtro global de exceções devolve os erros no formato padronizado do Design de API.
- CORS e a documentação Swagger/OpenAPI estão configurados.

**Prioridade:** Must have — Obrigatório

### US 122

Como usuário do sistema, quero me cadastrar com minha empresa, entrar e sair com uma sessão segura, para acessar os dados da minha empresa com segurança.

**Critérios de aceite (Definition of Done):**

- `POST /auth/cadastro` cria a empresa e o administrador na mesma transação; e-mail, CPF ou CNPJ já cadastrados resultam em 409.
- O aceite dos termos é gravado com data e hora.
- `POST /auth/login` valida a senha com bcrypt e emite accessToken (15 minutos) e refreshToken (7 dias, ou 30 dias com "Lembre-me").
- `POST /auth/refresh` renova o accessToken e `POST /auth/logout` invalida o refreshToken.
- Senhas e tokens nunca aparecem em logs.

**Prioridade:** Must have — Obrigatório

### US 123

Como administrador(a), quero que a API autorize cada requisição por perfil e isole os dados por empresa, para impedir acesso indevido mesmo quando alguém chama a API sem usar a interface.

**Critérios de aceite (Definition of Done):**

- Requisições sem token válido recebem 401, por meio do AuthGuard e da JwtStrategy.
- O RolesGuard aplica os perfis definidos no Design de API e responde 403 quando o perfil não permite a ação.
- Toda consulta é filtrada pela empresa do token; um recurso de outra empresa responde 404.
- Testes de integração tentam acessar dados de outra empresa e confirmam o bloqueio.

**Prioridade:** Must have — Obrigatório

### US 124

Como usuário(a) que esqueceu a senha, quero receber um código por e-mail e redefinir minha senha pela API, para recuperar o acesso com segurança.

**Critérios de aceite (Definition of Done):**

- `POST /auth/recuperar-senha` responde sempre 202, sem revelar se o e-mail existe.
- O código de 5 dígitos expira, tem limite de tentativas e só pode ser usado uma vez.
- `POST /auth/verificar-codigo` devolve um `resetToken` de uso único e `POST /auth/redefinir-senha` grava a nova senha (mínimo de 8 caracteres).
- O e-mail é registrado no console em desenvolvimento e enviado pelo Amazon SES no ambiente publicado.

**Prioridade:** Should have — Importante

### US 125

Como colaborador(a) e administrador(a), quero gerenciar unidades pela API, com as regras de unidade ativa e inativa aplicadas no servidor, para manter a base consistente.

**Critérios de aceite (Definition of Done):**

- A listagem tem busca, filtro de status, paginação e os totais de documentos e de tarefas de cada unidade.
- Detalhe, cadastro (somente administrador, com unidade nascendo ativa e código repetido resultando em 409), edição e `PATCH` de status estão disponíveis.
- O bloqueio de unidade inativa fica em um único ponto, reutilizado por documentos e tarefas (RF 007).
- `GET /enderecos/cep/{cep}` consulta um serviço público de CEP pelo backend e responde 404 se o CEP não for encontrado.

**Prioridade:** Must have — Obrigatório

### US 126

Como colaborador(a), quero cadastrar, editar, consultar e baixar documentos e anexos pela API, para manter o controle de validade da documentação com os arquivos guardados com segurança.

**Critérios de aceite (Definition of Done):**

- As listas global e por unidade têm busca, filtros e paginação.
- O cadastro e a edição usam multipart; o anexo só é substituído se um novo arquivo for enviado.
- O status é calculado no backend, e o cliente não consegue enviá-lo.
- São aceitos PDF, JPG e PNG de até 10 MB, com respostas 413 e 415 quando excedido ou não aceito.
- O armazenamento fica atrás de uma interface (disco ou MinIO local, S3 na nuvem) e o download é autorizado em `/documentos/{id}/anexo`.
- A exclusão (gestor) remove o registro e o arquivo.

**Prioridade:** Must have — Obrigatório

### US 127

Como colaborador(a), quero cadastrar, editar e alterar o status de tarefas pela API, para acompanhar o trabalho com datas e estados coerentes entre frontend, API e banco.

**Critérios de aceite (Definition of Done):**

- As listas global e por unidade têm busca, filtros e paginação.
- O cadastro cria a tarefa com status pendente, início igual à data do cadastro e prazo obrigatório.
- A edição altera título, descrição e prazo, e o `PATCH` de status altera o status.
- Concluir a tarefa grava a data e hora de conclusão; sair de concluída limpa a data.
- Unidade inativa bloqueia as escritas, e a exclusão (gestor) está disponível.

**Prioridade:** Must have — Obrigatório

### US 128

Como gestor(a), quero indicadores calculados pelo servidor, com a variação em relação ao período anterior, para ter uma visão confiável que não depende de totais enviados pelo navegador.

**Critérios de aceite (Definition of Done):**

- `GET /dashboard/indicadores` e `GET /unidades/{id}/indicadores` seguem o envelope definido no Design de API.
- O total de pendências é calculado no servidor.
- A variação usa o mês anterior como referência; quando o valor anterior é zero, o percentual é nulo.
- Sem dados, os indicadores retornam zero, sem erro.

**Prioridade:** Must have — Obrigatório

### US 129

Como desenvolvedor(a), quero testes automatizados da API, para garantir que regras de negócio, segurança e contratos continuem corretos após mudanças.

**Critérios de aceite (Definition of Done):**

- Há testes unitários para o status do documento, as transições da tarefa e o bloqueio de unidade inativa.
- Há testes de integração, com banco de teste, para autenticação, isolamento por empresa e CRUD de unidades, documentos e tarefas.
- Há testes para os erros de upload (413 e 415) e para a consistência entre arquivo e metadados.
- A documentação OpenAPI confere com as respostas reais.

**Prioridade:** Must have — Obrigatório

---

## Épico 13 — Integração Frontend ↔ API

### US 131

Como desenvolvedor(a), quero um cliente HTTP tipado com sessão real, para que todas as telas conversem com a API de forma consistente e segura.

**Critérios de aceite (Definition of Done):**

- O cliente tem a URL base definida por variável de ambiente.
- O token de acesso é enviado automaticamente, a sessão é renovada de forma transparente em caso de 401 e, se a renovação falhar, o usuário vai para `/login`.
- A forma de guardar os tokens está decidida e registrada, e a proteção de rotas (US 012) valida a sessão real.
- As respostas 403, 404, 409, 413, 415 e 429 têm tratamento e mensagem adequados.

**Prioridade:** Must have — Obrigatório

### US 132

Como usuário do sistema, quero entrar, me cadastrar, recuperar a senha e sair usando a API, para que meu acesso seja real e persistido.

**Critérios de aceite (Definition of Done):**

- Login (com "Lembre-me"), cadastro em 3 etapas, recuperação de senha em 3 passos e logout usam a API.
- Erros do servidor, como e-mail, CPF ou CNPJ já cadastrados, aparecem junto aos campos.

**Prioridade:** Must have — Obrigatório

### US 133

Como colaborador(a), quero que as telas de unidades usem a API, para que cadastros, edições e mudanças de status sejam persistidos.

**Critérios de aceite (Definition of Done):**

- Listagem, detalhe, cadastro, edição e ativação/inativação usam a API.
- O botão "Buscar CEP" usa o endpoint do backend.
- Listagem, cards e Dashboard são atualizados após cada alteração confirmada.

**Prioridade:** Must have — Obrigatório

### US 134

Como colaborador(a), quero que as telas de documentos usem a API, para que os documentos e seus anexos sejam persistidos e consultáveis.

**Critérios de aceite (Definition of Done):**

- As listas global e por unidade, o cadastro e a edição (multipart) usam a API.
- O download do anexo funciona para usuários autorizados.
- O status exibido é o status devolvido pela API.

**Prioridade:** Must have — Obrigatório

### US 135

Como colaborador(a), quero que as telas de tarefas usem a API, para que o andamento das tarefas seja persistido.

**Critérios de aceite (Definition of Done):**

- As listas global e por unidade, o cadastro e a edição usam a API.
- A mudança de status mantém o modal "Concluir tarefa?" e atualiza listas e Dashboard.

**Prioridade:** Must have — Obrigatório

### US 136

Como gestor(a), quero que o Dashboard use os indicadores da API, para ver a situação real da empresa.

**Critérios de aceite (Definition of Done):**

- Os indicadores globais e por unidade, com a variação, vêm da API.
- A invalidação de cache após alterações (US 022) continua atualizando o total de pendências sem recarregar a página.

**Prioridade:** Must have — Obrigatório

### US 137

Como desenvolvedor(a), quero remover a dependência dos mocks e validar os fluxos de ponta a ponta, para garantir que o sistema funciona com a API e o banco reais.

**Critérios de aceite (Definition of Done):**

- Nenhuma operação de negócio depende mais dos mocks.
- Estados de carregamento, erro com nova tentativa e lista vazia (US 071) continuam funcionando com a API real.
- Os fluxos principais foram executados de ponta a ponta com banco real, seguindo um roteiro registrado.
- O README foi atualizado com a nova arquitetura e as instruções de execução.

**Prioridade:** Must have — Obrigatório

---

## Épico 14 — Infraestrutura e Cloud (Docker, Terraform, AWS, CI/CD)

### US 141

Como desenvolvedor(a), quero executar frontend, API e banco em contêineres localmente, para desenvolver e testar sem configurações manuais inconsistentes.

**Critérios de aceite (Definition of Done):**

- Frontend e API possuem Dockerfile multi-stage.
- O docker-compose sobe frontend, API e PostgreSQL, com healthchecks e ordem de inicialização.
- As migrations Flyway são executadas na subida do ambiente.
- Existe `.dockerignore` e nenhuma credencial é incluída nas imagens.
- O README documenta como subir, ver logs, parar e reiniciar o ambiente.

**Prioridade:** Must have — Obrigatório

### US 142

Como responsável pela operação, quero uma base de Terraform organizada, para provisionar e recriar a infraestrutura de forma controlada.

**Critérios de aceite (Definition of Done):**

- A estrutura de módulos, variáveis, convenção de nomes e tags está definida.
- O estado remoto fica em S3, com bloqueio.
- `terraform fmt` e `validate` passam, e nenhum segredo é versionado.
- Como criar e destruir o ambiente está documentado.

**Prioridade:** Must have — Obrigatório

### US 143

Como responsável pela operação, quero a rede e o banco provisionados na AWS, para que a API use um PostgreSQL gerenciado e protegido.

**Critérios de aceite (Definition of Done):**

- VPC, sub-redes e security groups são criados com acesso mínimo.
- O RDS PostgreSQL fica em sub-rede privada, acessível apenas pela API.
- O backup automático está habilitado.

**Prioridade:** Must have — Obrigatório

### US 144

Como usuário autorizado, quero que os anexos dos documentos fiquem guardados com segurança, para consultá-los sem expô-los publicamente.

**Critérios de aceite (Definition of Done):**

- O bucket S3 é privado, sem acesso público e com criptografia.
- A API recebe apenas as permissões IAM mínimas para ler e gravar os anexos.
- O download de anexo só é possível para usuário autorizado.

**Prioridade:** Must have — Obrigatório

### US 145

Como responsável pela operação, quero os contêineres de frontend e API em execução na AWS com HTTPS, para disponibilizar o sistema online.

**Critérios de aceite (Definition of Done):**

- Existem repositórios ECR para as imagens de frontend e de API.
- Frontend e API rodam na plataforma de execução definida (ECS Fargate ou alternativa de menor custo), com health checks.
- O acesso externo é feito por HTTPS.
- As variáveis de ambiente são configuradas por serviço.

**Prioridade:** Must have — Obrigatório

### US 146

Como responsável pela operação, quero segredos e configurações gerenciados com segurança, para que credenciais nunca fiquem expostas.

**Critérios de aceite (Definition of Done):**

- As credenciais do banco e os segredos de token ficam no Secrets Manager ou no SSM Parameter Store.
- Os serviços acessam os segredos por permissões IAM, sem chaves fixas.
- Os logs não expõem senhas, tokens nem dados pessoais desnecessários.

**Prioridade:** Must have — Obrigatório

### US 147

Como desenvolvedor(a), quero verificações automáticas a cada alteração no GitHub Actions, para detectar erros antes de publicar.

**Critérios de aceite (Definition of Done):**

- No frontend, são executados lint, verificação de tipos e build.
- Na API, são executados lint, build e testes, com um PostgreSQL de serviço.
- As imagens Docker são construídas em cada pull request.
- `terraform fmt`, `validate` e `plan` rodam nas alterações de infraestrutura.

**Prioridade:** Must have — Obrigatório

### US 148

Como responsável pela operação, quero um deploy automatizado para a AWS, para publicar versões de forma repetível e segura.

**Critérios de aceite (Definition of Done):**

- O GitHub se autentica na AWS por OIDC, sem chaves de longa duração.
- Na branch principal, as imagens são enviadas ao ECR e o deploy é feito no ECS.
- As migrations rodam no deploy, antes da nova versão da API.
- Há aprovação manual antes de produção e o rollback está documentado.

**Prioridade:** Must have — Obrigatório

### US 149

Como responsável pela operação, quero validar o sistema publicado e acompanhar sua saúde, para ter confiança de que ele funciona e pode ser recuperado após falhas.

**Critérios de aceite (Definition of Done):**

- Um teste de fumaça é executado após o deploy.
- Login, isolamento entre empresas e envio e download de anexo são validados no ambiente remoto.
- Os logs ficam no CloudWatch e há ao menos um alarme de indisponibilidade.
- A restauração de um backup do banco foi testada uma vez.
- O README traz a URL, o diagrama de arquitetura e o passo a passo de deploy.

**Prioridade:** Must have — Obrigatório

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
| US 085 | Camada de API simulada (descartada na v1.3) | Desenvolvedor(a) | Won't have |
| US 086 | Testes automatizados | Desenvolvedor(a) | Could have |
| US 087 | Deploy com pipeline de build (substituída pelas US 141 a 149) | Desenvolvedor(a) | Won't have |
| US 111 | Ambiente local do PostgreSQL com Docker | Desenvolvedor(a) | Must have |
| US 112 | Migrations: empresa e usuário | Desenvolvedor(a) | Must have |
| US 113 | Migrations: unidade, documento e tarefa | Desenvolvedor(a) | Must have |
| US 114 | Migration dos códigos de verificação | Desenvolvedor(a) | Must have |
| US 115 | Índices e consultas para listagens e indicadores | Desenvolvedor(a) | Should have |
| US 116 | Seed de desenvolvimento FrotaSync | Desenvolvedor(a) | Must have |
| US 117 | Banco reproduzível e íntegro | Desenvolvedor(a) | Must have |
| US 121 | Estrutura base da API NestJS | Desenvolvedor(a) | Must have |
| US 122 | Cadastro, login e sessão na API | Usuário do sistema | Must have |
| US 123 | Autorização por perfil e isolamento por empresa | Administrador(a) | Must have |
| US 124 | Recuperação de senha na API | Usuário(a) | Should have |
| US 125 | API de unidades | Colaborador(a) e administrador(a) | Must have |
| US 126 | API de documentos e anexos | Colaborador(a) | Must have |
| US 127 | API de tarefas | Colaborador(a) | Must have |
| US 128 | API de indicadores do Dashboard | Gestor(a) | Must have |
| US 129 | Testes automatizados da API | Desenvolvedor(a) | Must have |
| US 131 | Cliente HTTP tipado e sessão real | Desenvolvedor(a) | Must have |
| US 132 | Integração da autenticação | Usuário do sistema | Must have |
| US 133 | Integração de unidades | Colaborador(a) | Must have |
| US 134 | Integração de documentos | Colaborador(a) | Must have |
| US 135 | Integração de tarefas | Colaborador(a) | Must have |
| US 136 | Integração do Dashboard | Gestor(a) | Must have |
| US 137 | Remoção dos mocks e validação ponta a ponta | Desenvolvedor(a) | Must have |
| US 141 | Contêineres e ambiente local | Desenvolvedor(a) | Must have |
| US 142 | Base do Terraform | Responsável pela operação | Must have |
| US 143 | Rede e banco na AWS | Responsável pela operação | Must have |
| US 144 | Armazenamento de anexos (S3) | Usuário autorizado | Must have |
| US 145 | Contêineres em execução na AWS com HTTPS | Responsável pela operação | Must have |
| US 146 | Segredos e configuração | Responsável pela operação | Must have |
| US 147 | CI no GitHub Actions | Desenvolvedor(a) | Must have |
| US 148 | CD para a AWS | Responsável pela operação | Must have |
| US 149 | Validação final e operação | Responsável pela operação | Must have |

### Como usar este backlog

- **No Scrum:** priorize as estórias "Must have" para as primeiras sprints — Épicos 1 a 3 e 6 e as estórias de qualidade do Épico 7 primeiro, seguidos dos Épicos 4 e 5 (incluindo a lista global de documentos, US 041, e os cadastros) — deixando as estórias "Could have" (Épico 8) para o fim, apenas se houver tempo. As estórias "Should have" incluídas na v1.2 (US 013, 014, 023, 024, 045, 055, 078 e 079) entram depois das "Must have" do mesmo épico.
- **No Kanban:** use as prioridades para ordenar o topo da coluna "To Do" — as estórias "Must have" sobem para o topo do backlog e são puxadas primeiro para "Em andamento"; as "Could have" ficam no fim da fila.
- **Na evolução fullstack (v1.3):** os Épicos 11 a 14 seguem esta ordem: US 111 a 113, 141 e 142 podem começar em paralelo; depois US 114, 116 e 117 e a US 121; em seguida US 122 e 123, e então US 124 a 128 e a US 129; a integração (US 131 a 137) avança por domínio, cada uma depois do endpoint correspondente; US 143 a 146 podem andar em paralelo à API; US 147 e 148 vêm depois dos testes da API e da execução na AWS (US 145); a US 149 fecha a entrega.

---

## Rastreabilidade com a Análise de Requisitos v1.3

A tabela relaciona cada estória ao(s) requisito(s) da Análise de Requisitos v1.3 e indica o que mudou em relação à versão 1.2 deste documento. Nenhum ID de estória foi renumerado.

| ID | Requisito(s) v1.3 | Situação em relação à v1.2 |
|---|---|---|
| US 011 | RF 001 | Mantida |
| US 012 | RNF 004 | Mantida |
| US 013 | RF 019, RNF 020, RNF 021 | Mantida |
| US 014 | RF 020 | Mantida |
| US 021 | RF 002 | Ajustada na v1.3 |
| US 022 | RF 003 | Mantida |
| US 023 | RF 024 | Ajustada na v1.3 |
| US 024 | RF 025 | Ajustada na v1.3 |
| US 031 | RF 004 | Mantida |
| US 032 | RF 006 | Mantida |
| US 033 | RF 007 | Mantida |
| US 034 | RF 005 | Mantida |
| US 035 | RF 021 | Mantida |
| US 041 | RF 008 | Ajustada na v1.3 |
| US 042 | RF 010 | Mantida |
| US 043 | RF 011, RNF 007, RNF 024 | Ajustada na v1.3 |
| US 044 | RF 009 | Mantida |
| US 045 | RF 022 | Mantida |
| US 051 | RF 012 | Mantida |
| US 052 | RF 015 | Mantida |
| US 053 | RF 013 | Ajustada na v1.3 |
| US 054 | RF 014 | Mantida |
| US 055 | RF 023 | Mantida |
| US 061 | RNF 008, RNF 022 | Ajustada na v1.3 |
| US 071 | RNF 009 | Mantida |
| US 072 | RNF 005, RNF 006 | Mantida |
| US 073 | RNF 013 | Mantida |
| US 074 | RNF 001, 002, 010, 011, 012 | Mantida |
| US 075 | RNF 014 | Mantida |
| US 076 | RNF 003 | Mantida |
| US 077 | RNF 015 | Mantida |
| US 078 | RNF 020 | Mantida |
| US 079 | RNF 021 | Mantida |
| US 081 | RF 016 | Mantida |
| US 082 | RF 017 | Mantida |
| US 083 | RF 018 | Mantida |
| US 084 | RNF 016 | Mantida |
| US 085 | RNF 017 | Descartada na v1.3 |
| US 086 | RNF 018 | Mantida |
| US 087 | RNF 019 | Substituída na v1.3 |
| US 111 | RNF 022 | Nova na v1.3 |
| US 112 | RNF 022 | Nova na v1.3 |
| US 113 | RNF 022 | Nova na v1.3 |
| US 114 | RNF 022, RF 020 | Nova na v1.3 |
| US 115 | RNF 022, RF 002, RF 004, RF 008, RF 013, RF 024 | Nova na v1.3 |
| US 116 | RNF 008, RNF 022, RNF 021 | Nova na v1.3 |
| US 117 | RNF 022 | Nova na v1.3 |
| US 121 | RNF 023 | Nova na v1.3 |
| US 122 | RF 001, RF 019, RF 027, RNF 021, RNF 024 | Nova na v1.3 |
| US 123 | RNF 004, RNF 025 | Nova na v1.3 |
| US 124 | RF 020 | Nova na v1.3 |
| US 125 | RF 004, RF 005, RF 006, RF 007, RF 021, RNF 024 | Nova na v1.3 |
| US 126 | RF 008, RF 009, RF 010, RF 011, RF 022, RF 026, RNF 026 | Nova na v1.3 |
| US 127 | RF 012, RF 013, RF 014, RF 015, RF 023, RNF 024 | Nova na v1.3 |
| US 128 | RF 002, RF 003, RF 024, RNF 024 | Nova na v1.3 |
| US 129 | RNF 033 | Nova na v1.3 |
| US 131 | RNF 027, RNF 004 | Nova na v1.3 |
| US 132 | RF 001, RF 019, RF 020, RF 027, RNF 027 | Nova na v1.3 |
| US 133 | RF 004, RF 005, RF 006, RF 021, RNF 027 | Nova na v1.3 |
| US 134 | RF 008, RF 009, RF 010, RF 022, RF 026, RNF 027 | Nova na v1.3 |
| US 135 | RF 012, RF 013, RF 014, RF 015, RF 023, RNF 027 | Nova na v1.3 |
| US 136 | RF 002, RF 003, RF 024, RNF 027 | Nova na v1.3 |
| US 137 | RNF 027, RNF 009, RNF 003 | Nova na v1.3 |
| US 141 | RNF 028 | Nova na v1.3 |
| US 142 | RNF 029 | Nova na v1.3 |
| US 143 | RNF 029 | Nova na v1.3 |
| US 144 | RNF 026, RNF 029 | Nova na v1.3 |
| US 145 | RNF 029 | Nova na v1.3 |
| US 146 | RNF 030 | Nova na v1.3 |
| US 147 | RNF 031 | Nova na v1.3 |
| US 148 | RNF 031 | Nova na v1.3 |
| US 149 | RNF 032, RNF 029 | Nova na v1.3 |

---

## Histórico de Alterações

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 22/09/2026 | 1.0 | Criação inicial das estórias de usuário e do backlog. | Equipe do projeto |
| 29/09/2026 | 1.1 | Alinhamento à Análise de Requisitos v1.1; novas US 034, 044, 053 e 054; novos Épicos 7 e 8. | Equipe do projeto |
| 05/10/2026 | 1.2 | Alinhamento à Análise de Requisitos v1.2 e ao protótipo de telas; novas US 013, 014, 023, 024, 035, 045, 055, 078 e 079; ajuste das US 011, 012, 021, 031 a 034, 041, 042, 044, 051 a 054, 061 e 075. | Equipe do projeto |
| 20/10/2026 | 1.3 | Alinhamento à Análise de Requisitos v1.3 (aplicação fullstack na nuvem); novos Épicos 11 a 14 com as US 111 a 117, 121 a 129, 131 a 137 e 141 a 149; ajuste das US 021, 023, 024, 041, 043, 053 e 061; US 085 descartada e US 087 substituída. | Equipe do projeto |

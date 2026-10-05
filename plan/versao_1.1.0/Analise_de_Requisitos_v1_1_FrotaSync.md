# Análise de Requisitos

**FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas**

Empresa fictícia: transportadora com filiais e pátios

Projeto da Residência — Motiron Technologies

- **Versão do documento:** 1.1
- **Data:** 29/09/2026

## Equipe de desenvolvimento

- Desenvolvedor(a): Valdir
- Desenvolvedor(a): Filipe
- Desenvolvedor(a): Gabrieli
- Desenvolvedor(a): Lucas Vinícius
- Desenvolvedor(a): Murilo
- Desenvolvedor(a): Niedson
- Desenvolvedor(a): Silas

## Tecnologias utilizadas no projeto

- **Linguagem de programação:** JavaScript, TypeScript
- **Framework / Bibliotecas:** Next.js, React, Tailwind CSS, React Hook Form, Zod, TanStack Query, TanStack Table
- **Tipo de sistema:** Aplicação frontend (web responsivo / uso também como aplicativo mobile)
- **Banco de dados:** Não há banco de dados real. Dados mockados (mock data) criados pela equipe para simular as regras de negócio do backend (ver RNF 008)
- **IDE utilizada no desenvolvimento:** Visual Studio Code (VSCode)
- **Documentação da "API":** Zod (schemas de validação utilizados como contrato/documentação dos dados, já que não há API real de backend)

---

## Introdução

### Descrição geral do sistema

O sistema é uma aplicação 100% frontend, desenvolvida em Next.js com TypeScript, que simula a gestão das unidades de uma empresa (no cenário escolhido, as filiais e pátios da FrotaSync), dos documentos vinculados a cada unidade e das tarefas relacionadas a elas. Como não há backend real, todas as regras de negócio (autenticação, status de unidades, cálculo de validade de documentos e status de tarefas) são simuladas por dados mockados. O usuário faz login, visualiza um Dashboard com indicadores gerais, consulta e cadastra unidades, acessa o detalhamento de cada uma (com seus documentos e tarefas) e acompanha listas de documentos e de tarefas, de forma global e por unidade.

### Empresa fictícia: FrotaSync (transporte)

Transportadora com filiais e pátios. Documentos: Licença Ambiental, Registro na ANTT e Seguro de Carga. Exemplo de tarefa: "renovar licença do pátio de Recife".

**Por que tem alto potencial:** uma transportadora média possui centenas de caminhões. Cada veículo possui licenciamento (CRLV), seguros, taxas da ANTT e tacógrafos. Cada motorista possui CNH, exames toxicológicos e cursos específicos (MOPP).

**A dor:** se um caminhão for parado pela Polícia Rodoviária com documento vencido, o veículo é apreendido, a carga atrasa e a empresa recebe multas pesadas. O volume de datas a controlar é massivo.

**Escopo desta versão:** os documentos são vinculados às unidades (filiais e pátios). O controle de documentos por veículo (CRLV, tacógrafo) e por motorista (CNH, exame toxicológico, MOPP) fica como evolução futura, fora do escopo atual.

**Adaptabilidade:** embora ambientado na FrotaSync, o modelo (unidade, documento com validade, tarefa vinculada) é neutro em relação ao ramo. Vocabulário e tipos de documento podem ser trocados para outras empresas, o que prepara o sistema para eventual comercialização caso a Motiron Technologies deseje (ver RNF 016).

### Público alvo

- **Equipe interna da FrotaSync (usuários administrativos):** colaboradores responsáveis por acompanhar a situação das filiais e pátios, cadastrar/consultar documentos e gerenciar tarefas vinculadas a cada unidade.
- **Gestores / Tomadores de decisão:** usuários que utilizam principalmente o Dashboard para ter visão rápida da situação geral (unidades, documentos, tarefas e pendências), apoiando decisões sobre prioridades.
- **Administradores:** responsáveis pela segurança de acesso e pela consistência dos dados (cadastro e inativação de unidades).

### Objetivo

Centralizar, em um único sistema, o acompanhamento de unidades, documentos e tarefas da FrotaSync, oferecendo indicadores rápidos e regras automáticas de status (validade de documentos e andamento de tarefas), reduzindo o controle manual e o risco de documentos vencidos ou tarefas esquecidas.

### Tipos de Requisitos

Os requisitos do sistema são divididos em duas categorias: Funcionais e Não Funcionais.

- **Requisitos funcionais (RF):** definem o que o sistema deve fazer (funcionalidades e comportamentos visíveis ao usuário).
- **Requisitos não funcionais (RNF):** definem como o sistema deve ser e funcionar (qualidade, segurança, desempenho, tecnologia, restrições e entregas). Regras de acesso, massa de dados de teste e padrões de código entram aqui.

### Níveis de Prioridade dos Requisitos

Os requisitos são classificados em três categorias:

- **Obrigatório:** o sistema não funciona sem este requisito.
- **Necessário:** o sistema funciona, mas de forma insatisfatória sem ele.
- **Opcional:** o sistema funciona bem sem ele; pode ficar para uma versão futura. Inclui as entregas extras do briefing.

Cada requisito traz o campo **Origem**, que indica se ele foi mantido da versão 1.0 ou se é novo na versão 1.1.

---

## Requisitos Funcionais

### RF 001 — Autenticação de usuário (Login)

**Descrição:** O sistema deve permitir que o usuário se autentique informando e-mail e senha. Os campos devem ser validados com Zod antes do envio (formato de e-mail válido e senha obrigatória).

**Entradas e pré-condições:** E-mail e senha informados no formulário (React Hook Form + Zod).

**Saídas e pós-condições:** Sucesso: usuário autenticado e redirecionado ao Dashboard, com feedback visual de sucesso. Erro (credenciais inválidas ou campos mal preenchidos): mensagem de erro específica próxima ao campo e/ou em destaque, sem redirecionamento.

**Prioridade:** Obrigatório

**Origem:** Antigo RF 001 (a parte de redirecionamento de rotas foi para o RNF 004).

### RF 002 — Dashboard com indicadores gerais

**Descrição:** O sistema deve exibir, na tela inicial após o login, um painel com os indicadores: total de unidades cadastradas, total de documentos cadastrados, total de tarefas pendentes e total de pendências (documentos próximos do vencimento ou expirados + tarefas pendentes ou em andamento).

**Entradas e pré-condições:** Dados mockados de unidades, documentos e tarefas, consumidos e agregados via TanStack Query.

**Saídas e pós-condições:** Cards com os totais calculados. Em caso de ausência de dados, exibir zero, sem erro.

**Prioridade:** Obrigatório

**Origem:** Antigo RF 003; card de total de pendências acrescentado (briefing: documentos + tarefas).

### RF 003 — Atualização automática do total de pendências no Dashboard

**Descrição:** O total de pendências exibido no Dashboard deve refletir automaticamente qualquer alteração feita nas telas de documentos, tarefas e unidades, sem que o usuário precise recarregar a página.

**Entradas e pré-condições:** Alterações de status ou cadastros realizados pelo usuário em outras telas.

**Saídas e pós-condições:** Indicadores do Dashboard atualizados por invalidação/refetch de cache do TanStack Query assim que a alteração for confirmada. Concluir uma tarefa no detalhamento da unidade também atualiza a lista de tarefas.

**Prioridade:** Obrigatório

**Origem:** Antigo RF 004.

### RF 004 — Listagem de Unidades

**Descrição:** O sistema deve exibir uma tela com todas as unidades (filiais e pátios) cadastradas, usando TanStack Table, com pesquisa por nome/código, filtros (ex.: status ativa/inativa) e paginação.

**Entradas e pré-condições:** Termo de pesquisa, filtros selecionados e página atual.

**Saídas e pós-condições:** Tabela atualizada conforme pesquisa/filtros/paginação. Sem resultados: mensagem de lista vazia.

**Prioridade:** Obrigatório

**Origem:** Antigo RF 005.

### RF 005 — Cadastro e edição de Unidade

**Descrição:** O sistema deve permitir cadastrar e editar unidades por meio de formulário validado com Zod: nome, código, endereço e status (Ativa/Inativa). Ao alterar o status para Inativa, aplicam-se as restrições do RF 007.

**Entradas e pré-condições:** Dados do formulário (React Hook Form + Zod).

**Saídas e pós-condições:** Unidade criada ou atualizada e refletida na listagem e no Dashboard. Erros exibidos por campo.

**Prioridade:** Obrigatório

**Origem:** Novo na v1.1 (previsto na jornada do Administrador do documento de UX).

### RF 006 — Detalhamento da Unidade

**Descrição:** Ao selecionar uma unidade na listagem, o sistema deve exibir a tela de detalhamento com as informações da unidade (nome, endereço, status, entre outros), além dos documentos e das tarefas vinculados a ela.

**Entradas e pré-condições:** Identificador da unidade selecionada na Lista de Unidades.

**Saídas e pós-condições:** Tela com dados da unidade, lista de documentos e lista de tarefas. Se a unidade estiver inativa, documentos e tarefas são exibidos em modo somente leitura.

**Prioridade:** Obrigatório

**Origem:** Antigo RF 006.

### RF 007 — Restrição de unidades inativas

**Descrição:** Unidades com status Inativa não podem receber novos documentos ou tarefas. As ações de cadastro/vinculação devem ficar desabilitadas na tela de detalhamento dessas unidades.

**Entradas e pré-condições:** Status da unidade (ativa/inativa).

**Saídas e pós-condições:** Unidade ativa: ações de inclusão habilitadas. Unidade inativa: ações bloqueadas e itens existentes exibidos apenas para leitura.

**Prioridade:** Obrigatório

**Origem:** Antigo RF 007.

### RF 008 — Lista Global de Documentos

**Descrição:** O sistema deve possuir uma tela de listagem geral de todos os documentos cadastrados (de todas as unidades), com pesquisa, filtros (por status e por unidade) e paginação, permitindo acompanhar o status de validade de cada um.

**Entradas e pré-condições:** Dados mockados dos documentos e suas unidades; filtros e pesquisa do usuário.

**Saídas e pós-condições:** Tabela com todos os documentos e o status calculado (Válido, Próximo do vencimento ou Expirado). Sem resultados: mensagem de lista vazia.

**Prioridade:** Obrigatório

**Origem:** Antigo RF 008; prioridade elevada de Necessário para Obrigatório (briefing lista a tela como parte da estrutura).

### RF 009 — Cadastro de Documento

**Descrição:** O sistema deve permitir cadastrar um documento em uma unidade ativa por formulário validado com Zod: nome/tipo (ex.: Licença Ambiental, Registro na ANTT, Seguro de Carga), unidade vinculada e data de validade. O status não é informado pelo usuário (ver RF 011).

**Entradas e pré-condições:** Dados do formulário; unidade selecionada (deve estar ativa).

**Saídas e pós-condições:** Documento criado com status calculado e refletido nas listas e no Dashboard. Erros exibidos por campo.

**Prioridade:** Obrigatório

**Origem:** Novo na v1.1.

### RF 010 — Lista de Documentos por Unidade

**Descrição:** Na tela de Detalhamento da Unidade, o sistema deve exibir uma lista contendo apenas os documentos vinculados àquela unidade, com o respectivo status de validade.

**Entradas e pré-condições:** Identificador da unidade selecionada.

**Saídas e pós-condições:** Lista filtrada de documentos da unidade, com status calculado exibido em cada item.

**Prioridade:** Obrigatório

**Origem:** Antigo RF 009.

### RF 011 — Cálculo automático do status do documento

**Descrição:** O status do documento é calculado automaticamente pelo frontend a partir da data de validade, sem digitação livre. **Válido:** validade a mais de 15 dias da data atual. **Próximo do vencimento:** faltam até 15 dias. **Expirado:** validade já passou.

**Entradas e pré-condições:** Data de validade do documento (mock) e data atual do sistema.

**Saídas e pós-condições:** Status (Válido / Próximo do vencimento / Expirado) derivado e exibido visualmente (cores/etiquetas) nas listagens.

**Prioridade:** Obrigatório

**Origem:** Antigo RF 010.

### RF 012 — Lista de Tarefas por Unidade

**Descrição:** O sistema deve exibir, para cada unidade, as tarefas vinculadas a ela, com status visual (Pendente, Em andamento, Concluída) e respectivos prazos.

**Entradas e pré-condições:** Identificador da unidade selecionada e dados mockados de tarefas.

**Saídas e pós-condições:** Lista de tarefas da unidade, com status e prazo e destaque visual conforme o status.

**Prioridade:** Obrigatório

**Origem:** Antigo RF 011.

### RF 013 — Lista Global de Tarefas

**Descrição:** O sistema deve possuir uma tela de listagem geral de todas as tarefas de todas as unidades, com pesquisa, filtros (por status e por unidade), paginação, status visual e prazos.

**Entradas e pré-condições:** Dados mockados de tarefas e unidades; filtros e pesquisa do usuário.

**Saídas e pós-condições:** Tabela com todas as tarefas, status e prazo. Sem resultados: mensagem de lista vazia. A alteração de status segue o RF 015.

**Prioridade:** Obrigatório

**Origem:** Novo na v1.1 (briefing prevê a Lista de Tarefas como tela própria).

### RF 014 — Cadastro de Tarefa

**Descrição:** O sistema deve permitir cadastrar uma tarefa em uma unidade ativa por formulário validado com Zod: título, unidade vinculada e prazo. O status inicial é Pendente.

**Entradas e pré-condições:** Dados do formulário; unidade selecionada (deve estar ativa).

**Saídas e pós-condições:** Tarefa criada e refletida nas listas e no Dashboard. Erros exibidos por campo.

**Prioridade:** Obrigatório

**Origem:** Novo na v1.1.

### RF 015 — Alteração de status da tarefa com confirmação

**Descrição:** O usuário deve poder alterar o status de uma tarefa entre Pendente, Em andamento e Concluída. A transição para Concluída exige confirmação explícita (modal) antes de ser efetivada.

**Entradas e pré-condições:** Novo status selecionado pelo usuário para a tarefa.

**Saídas e pós-condições:** Ao confirmar: status atualizado e refletido nas listagens e no Dashboard. Ao cancelar: status inalterado.

**Prioridade:** Obrigatório

**Origem:** Antigo RF 012.

### Requisitos funcionais opcionais (entregas extras do briefing)

### RF 016 — Bloqueio de exclusão de unidade com pendências

**Descrição:** O sistema deve impedir a exclusão de uma unidade que possua documentos pendentes (próximos do vencimento ou expirados) ou tarefas em andamento, exibindo mensagem que explique o motivo do bloqueio.

**Entradas e pré-condições:** Solicitação de exclusão de uma unidade.

**Saídas e pós-condições:** Unidade sem pendências: exclusão permitida (com confirmação). Unidade com pendências: exclusão bloqueada com mensagem.

**Prioridade:** Opcional

**Origem:** Novo na v1.1 (entrega extra "Regra de negócio avançada").

### RF 017 — Histórico de alterações (auditoria simples)

**Descrição:** O sistema deve registrar localmente quem alterou o quê e quando (unidade, documento, tarefa) e exibir esse histórico no detalhamento da unidade.

**Entradas e pré-condições:** Alterações confirmadas pelo usuário autenticado.

**Saídas e pós-condições:** Lista de eventos (usuário, ação, data/hora) exibida no detalhamento da unidade.

**Prioridade:** Opcional

**Origem:** Novo na v1.1 (entrega extra "Auditoria simples").

### RF 018 — Alternância de tema claro/escuro

**Descrição:** O usuário deve poder alternar entre tema claro e escuro, com a escolha persistida entre sessões, sem quebrar o contraste dos status visuais.

**Entradas e pré-condições:** Ação do usuário no seletor de tema.

**Saídas e pós-condições:** Interface exibida no tema escolhido, mantido ao reabrir o sistema.

**Prioridade:** Opcional

**Origem:** Novo na v1.1 (entrega extra "Dark mode").

---

## Requisitos Não Funcionais

### RNF 001 — Arquitetura de software

Aplicação 100% frontend em Next.js com TypeScript, com organização de pastas e componentes que favoreça reuso, manutenibilidade e separação clara entre UI, formulários, acesso a dados (mock) e lógica de negócio (cálculo de status, regras de unidades ativas/inativas).

**Prioridade:** Obrigatório

**Origem:** Antigo RNF 001.

### RNF 002 — Tecnologia utilizada

Uso obrigatório de Next.js e TypeScript. Tailwind CSS para estilização; React Hook Form com Zod para formulários; TanStack Query para estado assíncrono/cache; TanStack Table para as listagens com pesquisa, filtros e paginação.

**Prioridade:** Obrigatório

**Origem:** Antigo RNF 002.

### RNF 003 — Documentação

As regras de formato e obrigatoriedade dos dados (login, unidades, documentos e tarefas) devem estar documentadas nos schemas Zod, que servem como contrato de dados. O repositório deve ter README com descrição do projeto, tecnologias, arquitetura e instruções de execução.

**Prioridade:** Obrigatório

**Origem:** Antigo RNF 003, ampliado com o README exigido no briefing.

### RNF 004 — Segurança, controle de acesso e proteção de rotas

O acesso ao sistema é obrigatoriamente autenticado. Todas as telas (Dashboard, Unidades, Detalhamento, Documentos e Tarefas) são acessíveis apenas a usuários autenticados. O estado de autenticação (mockado) é verificado a cada navegação ou carregamento de rota protegida; sem sessão válida, o usuário é redirecionado imediatamente para /login, sem exibir conteúdo protegido, inclusive ao acessar pela URL. Usuário autenticado acessa normalmente, sem redirecionamentos indevidos.

**Prioridade:** Obrigatório

**Origem:** Reclassificado: antigo RF 002 (regra de acesso é atributo de segurança, não funcionalidade) unido ao antigo RNF 004.

### RNF 005 — Desempenho

As listagens (Unidades, Documentos e Tarefas) usam paginação via TanStack Table para evitar renderização excessiva. O cache do TanStack Query evita recomputações e requisições desnecessárias, e re-renderizações desnecessárias devem ser evitadas.

**Prioridade:** Obrigatório

**Origem:** Antigo RNF 005, ampliado com o briefing.

### RNF 006 — Usabilidade e responsividade

Interface responsiva em desktop, tablet e mobile, com Tailwind CSS, legibilidade dos status (cores/etiquetas) e boa usabilidade em qualquer dispositivo.

**Prioridade:** Obrigatório

**Origem:** Antigo RNF 006.

### RNF 007 — Consistência dos dados calculados

Status derivados (documento a partir da data de validade) nunca são campos de livre digitação ou edição manual; são sempre recalculados pelo frontend a partir dos dados-fonte.

**Prioridade:** Obrigatório

**Origem:** Antigo RNF 007.

### RNF 008 — Massa de dados mockados

A squad deve criar e manter dados mockados suficientes para demonstrar todos os estados relevantes: unidades ativas e inativas; documentos em cada status (válido, próximo do vencimento, expirado); tarefas em cada status (pendente, em andamento, concluída). Os dados devem ser ambientados na FrotaSync, ficar isolados em uma camada de dados e ser servidos via TanStack Query, para permitir a troca futura por uma API real.

**Prioridade:** Obrigatório

**Origem:** Reclassificado: antigo RF 013 (dados de teste são restrição de projeto, não funcionalidade para o usuário).

### RNF 009 — Feedback visual: loading, erro e estado vazio

Todas as telas que dependem de dados devem exibir estado de carregamento, mensagem de erro (com opção de tentar novamente) e estado vazio.

**Prioridade:** Obrigatório

**Origem:** Novo na v1.1 (briefing, requisitos técnicos).

### RNF 010 — Tipagem

Todas as entidades (Unidade, Documento, Tarefa) possuem interfaces/types próprios, sem uso de any.

**Prioridade:** Obrigatório

**Origem:** Novo na v1.1.

### RNF 011 — Componentização

Componentes reutilizáveis (Button, Input, Modal, Table, Badge etc.), sem duplicação de lógica de UI entre telas.

**Prioridade:** Obrigatório

**Origem:** Novo na v1.1.

### RNF 012 — Gerenciamento de estado

Separação clara entre estado de servidor (dados mockados, via TanStack Query) e estado de UI (filtros, modais, formulários abertos).

**Prioridade:** Obrigatório

**Origem:** Novo na v1.1.

### RNF 013 — Acessibilidade básica

Uso correto de labels nos formulários, contraste mínimo de cores, navegação por teclado e mensagens de erro que não dependam apenas de cor.

**Prioridade:** Obrigatório

**Origem:** Novo na v1.1.

### RNF 014 — Consistência visual (Design System)

Tipografia, cores e espaçamentos consistentes em toda a aplicação, seguindo o design system definido no documento de UI.

**Prioridade:** Obrigatório

**Origem:** Novo na v1.1.

### RNF 015 — Versionamento e entrega

Repositório público com código organizado, estrutura de pastas clara, histórico de commits no Git com mensagens claras e aplicação funcional executável localmente ou publicada online.

**Prioridade:** Obrigatório

**Origem:** Novo na v1.1 (entregas obrigatórias do briefing).

### RNF 016 — Adaptabilidade a diferentes empresas

Nome da empresa, vocabulário e tipos de documento devem poder ser definidos em um arquivo de configuração, sem alterar a lógica do sistema, para demonstrar que a solução serve a outros ramos e está pronta para eventual comercialização.

**Prioridade:** Opcional

**Origem:** Novo na v1.1.

### Requisitos não funcionais opcionais (entregas extras do briefing)

### RNF 017 — Camada de API simulada

Criar rotas (Next.js Route Handlers ou mock server como MSW) que simulem latência e erros de rede, preparando a troca futura dos mocks por uma API real.

**Prioridade:** Opcional

**Origem:** Novo na v1.1 (entrega extra "Camada de API própria").

### RNF 018 — Testes automatizados

Testes unitários cobrindo ao menos as regras de negócio: cálculo de status do documento e bloqueios de unidade inativa.

**Prioridade:** Opcional

**Origem:** Novo na v1.1 (entrega extra "Testes automatizados").

### RNF 019 — Deploy com pipeline de build

Aplicação publicada (Vercel ou similar) com pipeline de build automatizado.

**Prioridade:** Opcional

**Origem:** Novo na v1.1 (entrega extra "Deploy").

*A extra "Cache e revalidação" já está coberta pelo RF 003.*

---

## Resumo dos requisitos

| ID | Requisito | Prioridade |
|---|---|---|
| RF 001 | Autenticação (Login) | Obrigatório |
| RF 002 | Dashboard com indicadores | Obrigatório |
| RF 003 | Atualização automática das pendências | Obrigatório |
| RF 004 | Listagem de Unidades | Obrigatório |
| RF 005 | Cadastro e edição de Unidade | Obrigatório |
| RF 006 | Detalhamento da Unidade | Obrigatório |
| RF 007 | Restrição de unidades inativas | Obrigatório |
| RF 008 | Lista Global de Documentos | Obrigatório |
| RF 009 | Cadastro de Documento | Obrigatório |
| RF 010 | Documentos por Unidade | Obrigatório |
| RF 011 | Cálculo automático do status do documento | Obrigatório |
| RF 012 | Tarefas por Unidade | Obrigatório |
| RF 013 | Lista Global de Tarefas | Obrigatório |
| RF 014 | Cadastro de Tarefa | Obrigatório |
| RF 015 | Alteração de status da tarefa com confirmação | Obrigatório |
| RF 016 | Bloqueio de exclusão de unidade com pendências | Opcional |
| RF 017 | Histórico de alterações (auditoria) | Opcional |
| RF 018 | Tema claro/escuro | Opcional |
| RNF 001 | Arquitetura de software | Obrigatório |
| RNF 002 | Tecnologia utilizada | Obrigatório |
| RNF 003 | Documentação | Obrigatório |
| RNF 004 | Segurança e proteção de rotas | Obrigatório |
| RNF 005 | Desempenho | Obrigatório |
| RNF 006 | Usabilidade e responsividade | Obrigatório |
| RNF 007 | Consistência dos dados calculados | Obrigatório |
| RNF 008 | Massa de dados mockados | Obrigatório |
| RNF 009 | Loading, erro e estado vazio | Obrigatório |
| RNF 010 | Tipagem | Obrigatório |
| RNF 011 | Componentização | Obrigatório |
| RNF 012 | Gerenciamento de estado | Obrigatório |
| RNF 013 | Acessibilidade básica | Obrigatório |
| RNF 014 | Consistência visual | Obrigatório |
| RNF 015 | Versionamento e entrega | Obrigatório |
| RNF 016 | Adaptabilidade a diferentes empresas | Opcional |
| RNF 017 | Camada de API simulada | Opcional |
| RNF 018 | Testes automatizados | Opcional |
| RNF 019 | Deploy com pipeline | Opcional |

---

## Custos e prazos

Projeto acadêmico/de portfólio desenvolvido na Residência da Motiron Technologies (squad de estudos), sem contrato comercial associado. Os campos abaixo permanecem "A definir" e podem ser preenchidos caso o projeto venha a ser comercializado.

- **Preço total do projeto:** A definir
- **Forma de divisão do projeto:** A definir
- **Formas de pagamento:** A definir
- **Prazo de entrega máximo:** A definir

---

## Stakeholders

**Definição:** Partes interessadas que influenciam ou são afetadas pelo projeto. Inclui usuários finais, clientes, gerentes e equipes de desenvolvimento, teste e suporte.

### Stakeholders importantes

- **Equipe de desenvolvimento (squad):** Valdir, Filipe, Gabrieli, Lucas Vinícius, Murilo, Niedson e Silas — responsáveis pelo frontend, pelos mocks e pelas regras de negócio.
- **Usuários finais (equipe interna simulada da FrotaSync):** perfis administrativos e de gestão.
- **Motiron Technologies (residência/mentoria):** define o briefing, avalia o projeto e é a potencial interessada em uma eventual comercialização.
- **Product Owner / Orientador(a):** valida requisitos, prioridades e alinhamento da solução.
- **Equipe de testes/QA:** valida os cenários simulados via mocks.

---

## Histórico de Alterações

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 22/09/2026 | 1.0 | Criação inicial do documento de análise de requisitos. | Equipe do projeto |
| 29/09/2026 | 1.1 | Definição da empresa fictícia FrotaSync; inclusão dos requisitos faltantes frente ao briefing da Motiron; inclusão das entregas extras como requisitos opcionais; reclassificação de RF 002 e RF 013 como RNF; renumeração dos RFs (tabela abaixo). | Equipe do projeto |

### Correspondência de numeração (v1.0 para v1.1)

Use esta tabela para atualizar as referências de RF nas Estórias de Usuário e na Matriz de Rastreabilidade do documento de UX.

| v1.0 | v1.1 | Observação |
|---|---|---|
| RF 001 | RF 001 | Redirecionamento de rotas movido para o RNF 004 |
| RF 002 | RNF 004 | Reclassificado como não funcional (segurança) |
| RF 003 | RF 002 | Ganhou o card de total de pendências |
| RF 004 | RF 003 | Sem alteração de conteúdo |
| RF 005 | RF 004 | Sem alteração de conteúdo |
| RF 006 | RF 006 | Sem alteração |
| RF 007 | RF 007 | Sem alteração |
| RF 008 | RF 008 | Prioridade: Necessário para Obrigatório; ganhou filtros e paginação |
| RF 009 | RF 010 | Sem alteração de conteúdo |
| RF 010 | RF 011 | Sem alteração de conteúdo |
| RF 011 | RF 012 | Sem alteração de conteúdo |
| RF 012 | RF 015 | Sem alteração de conteúdo |
| RF 013 | RNF 008 | Reclassificado como não funcional (dados de teste) |
| RNF 001 a 007 | RNF 001 a 007 | RNF 003, 004 e 005 ampliados |
| Novos | RF 005, 009, 013, 014, 016, 017, 018; RNF 009 a 019 | Ver o campo Origem ("Novo na v1.1") em cada requisito |

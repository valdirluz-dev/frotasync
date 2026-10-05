# Análise de Requisitos

**Sistema de Gestão de Unidades, Documentos e Tarefas**

- **Versão do documento:** 1.0
- **Data:** 22/09/2026

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
- **Banco de dados:** Não há banco de dados real — dados mockados (mock data) criados manualmente pela equipe para simular as regras de negócio do backend
- **IDE utilizada no desenvolvimento:** Visual Studio Code (VSCode)
- **Documentação da "API":** Zod (schemas de validação utilizados como contrato/documentação dos dados, já que não há API real de backend)

---

## Introdução

### Descrição geral do sistema

O sistema é uma aplicação 100% frontend, desenvolvida em Next.js com TypeScript, que simula a gestão de unidades de uma empresa, dos documentos vinculados a cada unidade e das tarefas relacionadas a elas. Como não há backend real neste projeto, todas as regras de negócio (autenticação, status de unidades, cálculo de validade de documentos e status de tarefas) são simuladas por meio de dados mockados, criados manualmente pela equipe para representar os diferentes cenários possíveis.

O sistema permite que o usuário faça login, visualize um Dashboard com indicadores gerais da empresa, consulte a lista de unidades cadastradas, acesse o detalhamento de cada unidade (com seus documentos e tarefas) e acompanhe listas de documentos e de tarefas, tanto de forma global quanto por unidade.

### Público alvo

**Equipe interna da empresa (usuários administrativos)**
Colaboradores responsáveis por acompanhar a situação das unidades, cadastrar/consultar documentos e gerenciar tarefas vinculadas a cada unidade, utilizando o sistema autenticado para ter acesso ao Dashboard e às telas de gestão.

**Gestores / Tomadores de decisão**
Usuários que utilizam principalmente o Dashboard para ter uma visão rápida da situação geral da empresa (total de unidades, documentos e tarefas pendentes), auxiliando na tomada de decisão sobre prioridades e pendências.

### Objetivo

Centralizar, em um único sistema, o acompanhamento de unidades, documentos e tarefas de uma empresa, oferecendo indicadores rápidos de situação geral e regras automáticas de status (validade de documentos e andamento de tarefas), reduzindo o controle manual e o risco de documentos vencidos ou tarefas esquecidas.

---

## Tipos de Requisitos

Os requisitos do sistema são divididos em duas categorias: Funcionais e Não Funcionais.

- **Requisitos funcionais:** definem o que o sistema deve fazer.
- **Requisitos não funcionais (ou atributos de qualidade):** definem como o sistema deve funcionar.

## Níveis de Prioridade dos Requisitos

- **Obrigatório** → O sistema não funciona sem este requisito. É imprescindível e deve ser implementado obrigatoriamente.
- **Necessário** → O sistema funciona, mas de forma insatisfatória sem esse requisito. Deve ser implementado, mas o sistema ainda pode ser usado sem ele.
- **Opcional** → O sistema funciona bem sem este requisito. Pode ser deixado para uma versão futura se não houver tempo para implementá-lo agora.

---

## Requisitos Funcionais

### RF 001 — Autenticação de usuário (Login)

**Descrição:** O sistema deve permitir que o usuário se autentique informando e-mail e senha. Os campos devem ser validados com Zod antes do envio (formato de e-mail válido e senha obrigatória). Usuários não autenticados devem ser redirecionados automaticamente para a tela de Login ao tentar acessar qualquer rota protegida.

**Entradas e pré-condições:** E-mail e senha informados pelo usuário no formulário (React Hook Form + Zod).

**Saídas e pós-condições:** Em caso de sucesso: usuário autenticado e redirecionado para o Dashboard, com feedback visual de sucesso. Em caso de erro (credenciais inválidas ou campos mal preenchidos): exibição de mensagem de erro específica próxima ao campo e/ou em destaque na tela, sem redirecionamento.

**Prioridade:** Obrigatório

### RF 002 — Proteção de rotas / redirecionamento obrigatório

**Descrição:** Todas as telas do sistema (Dashboard, Lista de Unidades, Detalhamento da Unidade, Lista de Documentos e Lista de Tarefas) devem ser acessíveis apenas para usuários autenticados. Ao identificar que não há sessão/autenticação válida, o sistema deve redirecionar imediatamente o usuário para a tela de Login.

**Entradas e pré-condições:** Estado de autenticação do usuário (mockado) verificado a cada navegação/carregamento de rota protegida.

**Saídas e pós-condições:** Usuário autenticado: acesso liberado à rota solicitada. Usuário não autenticado: redirecionamento para `/login`, sem exibir conteúdo da rota protegida.

**Prioridade:** Obrigatório

### RF 003 — Dashboard com indicadores gerais

**Descrição:** O sistema deve exibir, na tela inicial após o login, um painel com indicadores gerais da empresa: total de unidades cadastradas, total de documentos cadastrados e total de tarefas pendentes, oferecendo uma visão rápida da situação geral da empresa.

**Entradas e pré-condições:** Dados mockados de unidades, documentos e tarefas, consumidos e agregados via TanStack Query.

**Saídas e pós-condições:** Cards/indicadores exibindo os totais calculados. Em caso de ausência de dados, exibir estado vazio (zero) sem erro.

**Prioridade:** Obrigatório

### RF 004 — Atualização em tempo real do total de pendências no Dashboard

**Descrição:** O total de pendências exibido no Dashboard (soma de documentos com status próximo do vencimento/expirado + tarefas pendentes/em andamento) deve refletir automaticamente qualquer alteração realizada nas telas de listagem de documentos e tarefas, sem que o usuário precise recarregar a página.

**Entradas e pré-condições:** Alterações de status de documentos e tarefas realizadas pelo usuário em outras telas do sistema.

**Saídas e pós-condições:** Indicadores do Dashboard atualizados automaticamente (via invalidação/refetch de cache do TanStack Query) assim que uma alteração for confirmada.

**Prioridade:** Obrigatório

### RF 005 — Listagem de Unidades

**Descrição:** O sistema deve exibir uma tela com todas as unidades cadastradas, utilizando TanStack Table, com suporte a pesquisa por nome/código, filtros (ex.: por status ativo/inativo) e paginação dos resultados.

**Entradas e pré-condições:** Termo de pesquisa, filtros selecionados pelo usuário e página atual.

**Saídas e pós-condições:** Tabela de unidades atualizada conforme pesquisa/filtros/paginação aplicados. Caso nenhum resultado seja encontrado, exibir mensagem de lista vazia.

**Prioridade:** Obrigatório

### RF 006 — Detalhamento da Unidade

**Descrição:** Ao selecionar uma unidade na listagem, o sistema deve exibir uma tela de detalhamento com as informações da unidade (nome, endereço, status, entre outros), além dos documentos e das tarefas vinculados a essa unidade.

**Entradas e pré-condições:** Identificador da unidade selecionada na Lista de Unidades.

**Saídas e pós-condições:** Tela de detalhamento exibindo dados da unidade, lista de documentos vinculados e lista de tarefas vinculadas. Caso a unidade esteja inativa, documentos e tarefas devem ser exibidos em modo somente leitura.

**Prioridade:** Obrigatório

### RF 007 — Restrição de unidades inativas

**Descrição:** Unidades com status 'Inativa' não podem receber novos documentos ou tarefas. As ações de cadastro/vinculação de novos documentos e tarefas devem ficar bloqueadas (desabilitadas) na tela de detalhamento dessas unidades.

**Entradas e pré-condições:** Status da unidade (ativa/inativa).

**Saídas e pós-condições:** Unidade ativa: ações de inclusão de documentos/tarefas habilitadas. Unidade inativa: ações de inclusão bloqueadas e documentos/tarefas existentes exibidos apenas para leitura.

**Prioridade:** Obrigatório

### RF 008 — Lista Global de Documentos

**Descrição:** O sistema deve possuir uma tela de listagem geral de todos os documentos cadastrados (independentemente da unidade), permitindo acompanhar o status de validade de cada documento.

**Entradas e pré-condições:** Dados mockados dos documentos e suas respectivas unidades.

**Saídas e pós-condições:** Tabela com todos os documentos, exibindo status calculado (Válido, Próximo do vencimento ou Expirado) para cada item.

**Prioridade:** Necessário

### RF 009 — Lista de Documentos por Unidade

**Descrição:** Na tela de Detalhamento da Unidade, o sistema deve exibir uma lista individual contendo apenas os documentos vinculados àquela unidade específica, com o respectivo status de validade.

**Entradas e pré-condições:** Identificador da unidade selecionada.

**Saídas e pós-condições:** Lista filtrada de documentos pertencentes à unidade, com status calculado exibido para cada documento.

**Prioridade:** Obrigatório

### RF 010 — Cálculo automático do status do documento

**Descrição:** O status de um documento deve ser calculado automaticamente pelo frontend a partir da sua data de validade, não podendo ser um valor de livre digitação. Regras:

- **Válido:** quando a validade estiver a mais de 15 dias da data atual;
- **Próximo do vencimento:** quando faltarem até 15 dias para o vencimento;
- **Expirado:** quando a data de validade já tiver passado.

**Entradas e pré-condições:** Data de validade cadastrada no documento (mock) e data atual do sistema.

**Saídas e pós-condições:** Status do documento (Válido / Próximo do vencimento / Expirado) derivado automaticamente e exibido de forma visual (ex.: cores/etiquetas) nas listagens.

**Prioridade:** Obrigatório

### RF 011 — Lista de Tarefas por Unidade

**Descrição:** O sistema deve exibir, para cada unidade, as tarefas vinculadas a ela, com status visual (Pendente, Em andamento, Concluída) e respectivos prazos.

**Entradas e pré-condições:** Identificador da unidade selecionada e dados mockados de tarefas.

**Saídas e pós-condições:** Lista de tarefas da unidade, exibindo status e prazo de cada uma, com destaque visual conforme o status.

**Prioridade:** Obrigatório

### RF 012 — Alteração de status da tarefa com confirmação

**Descrição:** O usuário deve poder alterar o status de uma tarefa entre Pendente, Em andamento e Concluída. A transição para o status 'Concluída' exige uma confirmação explícita do usuário (ex.: modal de confirmação) antes de ser efetivada.

**Entradas e pré-condições:** Novo status selecionado pelo usuário para a tarefa.

**Saídas e pós-condições:** Ao confirmar: status da tarefa atualizado e refletido na listagem e no Dashboard. Ao cancelar a confirmação: status da tarefa permanece inalterado.

**Prioridade:** Obrigatório

### RF 013 — Massa de dados mockados (mocks)

**Descrição:** A squad deve criar e manter um conjunto de dados mockados suficiente para demonstrar todos os estados relevantes do sistema: unidades ativas e inativas; documentos em cada um dos status (válido, próximo do vencimento e expirado); e tarefas em cada um dos status (pendente, em andamento e concluída).

**Entradas e pré-condições:** Não se aplica (dados definidos manualmente pela equipe de desenvolvimento).

**Saídas e pós-condições:** Arquivos/estruturas de mock disponíveis no projeto, cobrindo todos os cenários de estado descritos, utilizados como fonte de dados via TanStack Query.

**Prioridade:** Obrigatório

---

## Requisitos Não Funcionais

### RNF 001 — Arquitetura de software

O sistema deve ser desenvolvido como uma aplicação 100% frontend, construída em Next.js com TypeScript, seguindo uma organização de pastas e componentes que favoreça reuso, manutenibilidade e separação clara entre camadas de UI, formulários, chamadas de dados (mock) e lógica de negócio (cálculo de status de documentos/tarefas, regras de unidades ativas/inativas).

### RNF 002 — Tecnologia utilizada

O sistema deve utilizar obrigatoriamente: Next.js e TypeScript como base da aplicação; Tailwind CSS para estilização; React Hook Form em conjunto com Zod para construção e validação de formulários; TanStack Query para gerenciamento de estado assíncrono/cache dos dados mockados; e TanStack Table para renderização das listagens (unidades, documentos e tarefas) com pesquisa, filtros e paginação.

### RNF 003 — Documentação

As regras de negócio referentes ao formato e à obrigatoriedade dos dados (login, unidades, documentos e tarefas) devem estar documentadas por meio dos schemas de validação em Zod, servindo como contrato de dados do sistema, já que não há uma API real de backend neste projeto.

### RNF 004 — Segurança e controle de acesso

O acesso ao sistema deve ser obrigatoriamente autenticado. Usuários não autenticados não podem visualizar nenhuma tela além do Login, sendo redirecionados automaticamente sempre que tentarem acessar uma rota protegida diretamente pela URL ou por navegação.

### RNF 005 — Desempenho

As listagens (Unidades, Documentos e Tarefas) devem utilizar paginação via TanStack Table para evitar renderização excessiva de itens em tela, e o cache do TanStack Query deve ser utilizado para evitar recomputações e requisições desnecessárias aos dados mockados, garantindo resposta rápida da interface.

### RNF 006 — Usabilidade e responsividade

A interface deve ser responsiva, adaptando-se a diferentes tamanhos de tela (uso como aplicativo mobile ou sistema web), utilizando Tailwind CSS para garantir consistência visual, legibilidade dos status (cores/etiquetas para documentos e tarefas) e boa usabilidade em qualquer dispositivo.

### RNF 007 — Consistência dos dados calculados

Status derivados (status do documento a partir da data de validade) não devem, em nenhuma hipótese, ser campos de livre digitação ou edição manual pelo usuário; devem ser sempre recalculados pelo frontend a partir dos dados-fonte (data de validade, status da tarefa, status da unidade).

---

## Custos e prazos

Este é um projeto acadêmico/de portfólio (squad de estudos), sem contrato comercial associado. Os campos abaixo foram mantidos como "A definir" e podem ser preenchidos caso o projeto venha a ser comercializado.

- **Preço total do projeto:** A definir
- **Forma de divisão do projeto:** A definir
- **Formas de pagamento:** A definir
- **Prazo de entrega máximo:** A definir

---

## Stakeholders

**Definição:** Partes interessadas que influenciam ou são afetadas pelo projeto. Inclui usuários finais, clientes, gerentes e equipes de desenvolvimento, teste e suporte.

### Stakeholders importantes

- **Equipe de desenvolvimento (squad):** Valdir, Filipe, Gabrieli, Lucas Vinícius, Murilo, Niedson e Silas — responsáveis pelo desenvolvimento do frontend, criação dos mocks de dados e implementação das regras de negócio.
- **Usuários finais (equipe interna simulada):** Perfis administrativos e de gestão que utilizariam o sistema para acompanhar unidades, documentos e tarefas.
- **Product Owner / Orientador(a) do projeto:** Responsável por validar os requisitos, prioridades e o alinhamento da solução com as necessidades do projeto.
- **Equipe de testes/QA:** Responsável por validar os diferentes cenários simulados via mocks (unidades ativas/inativas, status de documentos e de tarefas).

---

## Histórico de Alterações

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 22/09/2026 | 1.0 | Criação inicial do documento de análise de requisitos. | Equipe do projeto |

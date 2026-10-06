# Análise de Requisitos

**FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas**

Empresa fictícia: transportadora com filiais e pátios

Projeto da Residência — Motiron Technologies

- **Versão do documento:** 1.2
- **Data:** 05/10/2026

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
- **Protótipo de interface:** Figma (arquivo SystemDesign), base das telas descritas nesta versão (ver Apêndice A)
- **Documentação da "API":** Zod (schemas de validação utilizados como contrato/documentação dos dados, já que não há API real de backend)

---

## Introdução

### Descrição geral do sistema

O sistema é uma aplicação 100% frontend, desenvolvida em Next.js com TypeScript, que simula a gestão das unidades de uma empresa (no cenário escolhido, as filiais e pátios da FrotaSync), dos documentos vinculados a cada unidade e das tarefas relacionadas a elas. Como não há backend real, todas as regras de negócio (autenticação, status de unidades, cálculo de validade de documentos e status de tarefas) são simuladas por dados mockados. O usuário pode se cadastrar (usuário e empresa, em três etapas), recuperar a senha por código enviado ao e-mail e fazer login. Após o login, visualiza o Dashboard Global (cards com gráficos de rosca por status e tabela alternável entre documentos e tarefas), consulta e cadastra unidades em uma grade de cards, ativa ou inativa unidades com confirmação, acessa o detalhamento de cada uma (com seus documentos e tarefas) e cadastra, edita e acompanha documentos e tarefas, de forma global e por unidade.

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

Cada requisito traz o campo **Origem**, que indica se ele foi mantido, alterado ou criado em cada versão (1.0, 1.1 ou 1.2).

### Novidades da versão 1.2

A versão 1.2 incorpora as telas do protótipo de interface (arquivo SystemDesign, Figma) e as decisões tomadas na revisão do fluxo de telas e das rotas do frontend. Em resumo:

- **Novos requisitos funcionais:** cadastro de usuário e empresa em 3 etapas (RF 019); recuperação de senha em 3 passos (RF 020); ativação e inativação de unidade com confirmação (RF 021); edição de documento (RF 022) e de tarefa (RF 023); indicadores de variação no Dashboard (RF 024); navegação principal e estrutura de telas (RF 025).
- **Requisitos funcionais alterados:** RF 001, 002, 004, 005, 006, 007, 008, 009, 010, 012, 013, 014 e 015 (login com "Lembre-me"; Dashboard Global com gráficos de rosca; unidades em cards; endereço estruturado com CEP; novos campos de documento e de tarefa; confirmações antes de gravar; listas globais dentro do Dashboard).
- **Novos requisitos não funcionais:** validação e máscaras de campos brasileiros (RNF 020) e proteção de dados pessoais (RNF 021); RNF 004, 011 e 014 foram ajustados.
- **Novos apêndices:** Apêndice A (mapa de telas e rotas do frontend) e Apêndice B (pontos em aberto e decisões assumidas, a validar com a squad).
- **Numeração:** todos os IDs existentes foram mantidos, para preservar a rastreabilidade. Os novos requisitos seguem a sequência (RF 019 a RF 025; RNF 020 e RNF 021).

---

## Requisitos Funcionais

### RF 001 — Autenticação de usuário (Login)

**Descrição:** O sistema deve permitir que o usuário se autentique informando e-mail corporativo e senha, com a opção "Lembre-me" e links para "Esqueceu a senha?" (RF 020) e "Cadastre-se" (RF 019). Os campos devem ser validados com Zod antes do envio (formato de e-mail válido e senha obrigatória).

**Entradas e pré-condições:** E-mail corporativo, senha e, opcionalmente, "Lembre-me" (React Hook Form + Zod).

**Saídas e pós-condições:** Sucesso: usuário autenticado e redirecionado ao Dashboard Global, com feedback visual de sucesso. Com "Lembre-me" ativo, a sessão é mantida por um período estendido (duração a definir, ver Apêndice B). Erro (credenciais inválidas ou campos mal preenchidos): mensagem de erro específica próxima ao campo e/ou em destaque, sem redirecionamento.

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (acréscimo de "Lembre-me" e dos links de cadastro e recuperação de senha). Antigo RF 001 da v1.0.

### RF 002 — Dashboard Global com indicadores gerais

**Descrição:** O sistema deve exibir, na tela inicial após o login (Dashboard Global), três cards com gráfico de rosca (donut): **Unidades** (ativas e inativas), **Documentos** (Válido, Próximo do vencimento e Expirado) e **Tarefas** (Concluída, Em andamento e Pendente). O painel deve também apresentar o total de pendências (documentos próximos do vencimento ou expirados + tarefas pendentes ou em andamento). Abaixo dos cards fica uma tabela alternável entre Documentos e Tarefas (RF 008 e RF 013).

**Entradas e pré-condições:** Dados mockados de unidades, documentos e tarefas, consumidos e agregados via TanStack Query.

**Saídas e pós-condições:** Cards com os totais e a distribuição por status calculados, usando nas legendas os mesmos rótulos de status do RF 011 e do RF 015. Em caso de ausência de dados, exibir zero, sem erro. A posição do total de pendências no layout está em aberto (Apêndice B).

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (cards com distribuição por status e alternância de tabelas; legenda padronizada). Antigo RF 003 da v1.0.

### RF 003 — Atualização automática do total de pendências no Dashboard

**Descrição:** O total de pendências exibido no Dashboard deve refletir automaticamente qualquer alteração feita nas telas de documentos, tarefas e unidades, sem que o usuário precise recarregar a página.

**Entradas e pré-condições:** Alterações de status ou cadastros realizados pelo usuário em outras telas.

**Saídas e pós-condições:** Indicadores do Dashboard atualizados por invalidação/refetch de cache do TanStack Query assim que a alteração for confirmada. Concluir uma tarefa no detalhamento da unidade também atualiza a lista de tarefas.

**Prioridade:** Obrigatório

**Origem:** Antigo RF 004.

### RF 004 — Listagem de Unidades

**Descrição:** O sistema deve exibir uma tela com todas as unidades (filiais e pátios) cadastradas, em grade de cards paginada. Cada card mostra o identificador (ID), o endereço, a quantidade de documentos e de tarefas e um selo de status (ATIVA em verde, INATIVA em vermelho, também usado na borda do card). A tela oferece pesquisa por nome/identificador, filtro de status (Ativo/Inativo), botão "Nova Unidade" (RF 005) e paginação (12 cards por página, com o texto "Mostrando 1 a 12 de N unidades"). O TanStack Table pode ser usado em modo headless para o estado de paginação e filtros. Clicar em um card abre o detalhamento (RF 006).

**Entradas e pré-condições:** Termo de pesquisa, filtros selecionados e página atual.

**Saídas e pós-condições:** Grade atualizada conforme pesquisa/filtros/paginação. Sem resultados: mensagem de lista vazia.

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (apresentação em cards no lugar de tabela). Antigo RF 005 da v1.0.

### RF 005 — Cadastro e edição de Unidade

**Descrição:** O sistema deve permitir cadastrar e editar unidades por meio de formulário validado com Zod, com os campos: nome da unidade, identificador (código único), CEP, logradouro, número, complemento (opcional), bairro, cidade, UF e descrição (opcional). O botão "Buscar CEP" preenche logradouro, bairro, cidade e UF a partir do CEP informado. Antes de gravar, o sistema exibe o modal "Deseja cadastrar a unidade?" com o nome e o identificador informados. Os botões do formulário são "Cancelar" e "Cadastrar unidade". A edição reutiliza o mesmo formulário. A unidade nasce Ativa; a mudança de status é feita pelo RF 021.

**Entradas e pré-condições:** Dados do formulário (React Hook Form + Zod); CEP com 8 dígitos (RNF 020).

**Saídas e pós-condições:** Unidade criada ou atualizada e refletida na listagem e no Dashboard. Erros exibidos por campo. CEP não encontrado: mensagem informativa, com preenchimento manual dos campos de endereço. Identificador já existente: erro no campo. Na fase atual, a busca de CEP é simulada na camada de mock (RNF 008).

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (endereço estruturado, CEP, descrição e modal de confirmação; status movido para o RF 021). Novo na v1.1.

### RF 006 — Detalhamento da Unidade

**Descrição:** Ao selecionar uma unidade na listagem, o sistema deve exibir a tela de detalhamento, com título "Unidade <nome> (ID <identificador>)", endereço e selo de status. A tela apresenta: o card **Informações da unidade** (status, data de criação, última modificação e botão "Mais detalhes"); os cards **Documentos** e **Tarefas**, com gráficos de rosca por status da unidade; e uma tabela alternável entre Documentos e Tarefas (RF 010 e RF 012), com os botões "Novo documento" e "Nova Tarefa". Nessa tela o administrador ativa ou inativa a unidade (RF 021).

**Entradas e pré-condições:** Identificador da unidade selecionada na Lista de Unidades.

**Saídas e pós-condições:** Tela com dados da unidade, cards e listas. Se a unidade estiver inativa, documentos e tarefas são exibidos em modo somente leitura (RF 007). O conteúdo de "Mais detalhes" está em aberto (Apêndice B).

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (cards, alternância de tabelas e ação de status). Antigo RF 006 da v1.0.

### RF 007 — Restrição de unidades inativas

**Descrição:** Unidades com status Inativa não podem receber novos documentos ou tarefas nem ter seus documentos e tarefas modificados. As ações de cadastro e edição devem ficar desabilitadas no detalhamento dessas unidades e, ao tentar cadastrar uma tarefa em unidade inativa, o sistema exibe o aviso "Não é possível cadastrar a tarefa", informando que a unidade está inativa e que novas tarefas não podem ser cadastradas em unidades inativas, com a ação "Voltar para unidades". Os campos de seleção de unidade dos formulários de documento e de tarefa listam apenas unidades ativas.

**Entradas e pré-condições:** Status da unidade (ativa/inativa).

**Saídas e pós-condições:** Unidade ativa: ações de inclusão e edição habilitadas. Unidade inativa: ações bloqueadas e itens existentes exibidos apenas para leitura.

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (aviso de bloqueio, bloqueio de edições e seleção apenas de unidades ativas). Antigo RF 007 da v1.0.

### RF 008 — Lista Global de Documentos

**Descrição:** O sistema deve possuir a listagem geral de todos os documentos cadastrados (de todas as unidades), exibida no Dashboard Global na aba Documentos. A listagem tem busca por nome, filtros (unidade, categoria e status), paginação (10 itens por página, com o texto "Mostrando 1 a 10 de N documentos") e o botão "Novo documento" (RF 009). As colunas são: documento, unidade, categoria, emissão, validade, status e ações ("Editar", RF 022). O cabeçalho da tabela exibe o total de documentos a vencer, com variação (RF 024).

**Entradas e pré-condições:** Dados mockados dos documentos e suas unidades; filtros e pesquisa do usuário.

**Saídas e pós-condições:** Tabela com todos os documentos e o status calculado (Válido, Próximo do vencimento ou Expirado). Sem resultados: mensagem de lista vazia.

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (lista integrada ao Dashboard, filtro e coluna de categoria, coluna de emissão e ação de edição). Antigo RF 008 da v1.0.

### RF 009 — Cadastro de Documento

**Descrição:** O sistema deve permitir cadastrar um documento em uma unidade ativa por formulário validado com Zod, com os campos: nome do documento (ex.: Licença Ambiental, Registro na ANTT, Seguro de Carga), anexo (arquivo, obrigatório), unidade vinculada, categoria, data de emissão (opcional), data de vencimento e descrição (opcional). O status não é informado pelo usuário (ver RF 011). Antes de gravar, o sistema exibe um modal de confirmação ("Deseja cadastrar o documento?"). Quando o formulário é aberto a partir do detalhamento de uma unidade, o campo de unidade já vem preenchido e bloqueado.

**Entradas e pré-condições:** Dados do formulário e arquivo anexo; unidade selecionada (deve estar ativa). Categoria e data de emissão são exibidas nas tabelas, mas não constam no formulário do protótipo (Apêndice B).

**Saídas e pós-condições:** Documento criado com status calculado e refletido nas listas e no Dashboard. Erros exibidos por campo. A data de emissão, quando informada, não pode ser posterior à data de vencimento.

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (anexo, categoria, emissão, descrição e modal de confirmação). Novo na v1.1.

### RF 010 — Lista de Documentos por Unidade

**Descrição:** Na tela de Detalhamento da Unidade (aba Documentos), o sistema deve exibir uma lista contendo apenas os documentos vinculados àquela unidade, com busca, filtros (categoria e status), paginação e as colunas documento, categoria, emissão, validade, status e ações ("Editar", RF 022). O cabeçalho exibe o total de documentos expirados, com variação (RF 024).

**Entradas e pré-condições:** Identificador da unidade selecionada.

**Saídas e pós-condições:** Lista filtrada de documentos da unidade, com status calculado exibido em cada item.

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (colunas, filtros e ação de edição). Antigo RF 009 da v1.0.

### RF 011 — Cálculo automático do status do documento

**Descrição:** O status do documento é calculado automaticamente pelo frontend a partir da data de validade, sem digitação livre. **Válido:** validade a mais de 15 dias da data atual. **Próximo do vencimento:** faltam até 15 dias. **Expirado:** validade já passou.

**Entradas e pré-condições:** Data de validade do documento (mock) e data atual do sistema.

**Saídas e pós-condições:** Status (Válido / Próximo do vencimento / Expirado) derivado e exibido visualmente (cores/etiquetas) nas listagens.

**Prioridade:** Obrigatório

**Origem:** Antigo RF 010.

### RF 012 — Lista de Tarefas por Unidade

**Descrição:** O sistema deve exibir, para cada unidade (aba Tarefas do detalhamento), as tarefas vinculadas a ela, com busca, filtro de status, paginação e as colunas: tarefa, data de início, prazo final, status visual (Pendente, Em andamento, Concluída), data de conclusão e ações. O cabeçalho exibe o total de tarefas concluídas, com variação (RF 024).

**Entradas e pré-condições:** Identificador da unidade selecionada e dados mockados de tarefas.

**Saídas e pós-condições:** Lista de tarefas da unidade, com status, datas e prazo e destaque visual conforme o status.

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (colunas de data de início e de conclusão, busca e filtro). Antigo RF 011 da v1.0.

### RF 013 — Lista Global de Tarefas

**Descrição:** O sistema deve possuir a listagem geral de todas as tarefas de todas as unidades, exibida no Dashboard Global na aba Tarefas. A listagem tem busca por título, filtros (unidade e status), paginação (10 itens por página), o botão "Nova Tarefa" (RF 014) e as colunas: tarefa, unidade, data de início, prazo final, status, data de conclusão e ações. O cabeçalho exibe o total de tarefas concluídas, com variação (RF 024).

**Entradas e pré-condições:** Dados mockados de tarefas e unidades; filtros e pesquisa do usuário.

**Saídas e pós-condições:** Tabela com todas as tarefas, status e prazo. Sem resultados: mensagem de lista vazia. A alteração de status segue o RF 015.

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (lista integrada ao Dashboard, colunas de datas e botão de cadastro). Novo na v1.1.

### RF 014 — Cadastro de Tarefa

**Descrição:** O sistema deve permitir cadastrar uma tarefa em uma unidade ativa por formulário validado com Zod, com os campos: título, unidade vinculada, prazo e descrição (opcional). O status inicial é Pendente, exibido no formulário e não editável. A data de início é registrada automaticamente com a data do cadastro (Apêndice B). Antes de gravar, o sistema exibe o modal "Deseja criar a tarefa?". Quando o formulário é aberto a partir do detalhamento de uma unidade, o campo de unidade já vem preenchido e bloqueado.

**Entradas e pré-condições:** Dados do formulário; unidade selecionada (deve estar ativa).

**Saídas e pós-condições:** Tarefa criada e refletida nas listas e no Dashboard. Erros exibidos por campo.

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (descrição, data de início automática e modal de confirmação). Novo na v1.1.

### RF 015 — Alteração de status da tarefa com confirmação

**Descrição:** O usuário deve poder alterar o status de uma tarefa entre Pendente, Em andamento e Concluída. A transição para Concluída exige confirmação explícita (modal "Concluir tarefa?", que cita o título da tarefa) antes de ser efetivada. Ao concluir, o sistema registra a data e hora de conclusão, exibida na coluna "Data de conclusão". Tarefas de unidades inativas não podem ter o status alterado (RF 007).

**Entradas e pré-condições:** Novo status selecionado pelo usuário para a tarefa.

**Saídas e pós-condições:** Ao confirmar: status atualizado e refletido nas listagens e no Dashboard. Ao cancelar: status inalterado. Se uma tarefa concluída voltar a outro status, a data de conclusão é limpa.

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (registro da data de conclusão e bloqueio em unidade inativa). Antigo RF 012 da v1.0.

### Requisitos funcionais incluídos na v1.2

### RF 019 — Cadastro de usuário e empresa em 3 etapas

**Descrição:** A partir do link "Cadastre-se" do login, o sistema deve oferecer um cadastro em três etapas, com indicador de progresso (1-2-3). **Etapa 1, Dados pessoais:** nome completo, CPF, telefone e cargo/função na empresa. **Etapa 2, Dados da empresa:** nome comercial ou marca, razão social, CNPJ, segmento, tipo de unidade (Matriz ou Filial) e endereço. **Etapa 3, Dados de login:** e-mail corporativo, senha (mínimo de 8 caracteres), confirmação de senha e aceite dos Termos de Uso e da Política de Privacidade. Cada etapa é validada com Zod antes de avançar (botão "Avançar"); a última etapa conclui o cadastro (botão "Finalizar Cadastro").

**Entradas e pré-condições:** Dados das três etapas (React Hook Form + Zod; máscaras e validações do RNF 020).

**Saídas e pós-condições:** Usuário e empresa criados (na fase atual, na camada de mock) e redirecionamento ao login com mensagem de sucesso. Erros exibidos por campo. E-mail, CPF ou CNPJ já cadastrados resultam em erro no campo correspondente. O aceite dos termos é obrigatório.

**Prioridade:** Necessário

**Origem:** Novo na v1.2 (telas de cadastro do protótipo).

### RF 020 — Recuperação de senha

**Descrição:** O sistema deve permitir redefinir a senha em três passos, a partir do link "Esqueceu a senha?". **Passo 1:** informar o e-mail cadastrado e solicitar o código ("Enviar Código"). **Passo 2:** informar o código de 5 dígitos recebido por e-mail ("Verificar código"), com a opção "Não recebeu o código? Enviar novo código". **Passo 3:** informar e confirmar a nova senha ("Confirmar").

**Entradas e pré-condições:** E-mail cadastrado, código de verificação e nova senha com confirmação (Zod).

**Saídas e pós-condições:** Senha redefinida e redirecionamento ao login. Código inválido ou expirado: mensagem de erro, sem avançar. O sistema não revela se o e-mail informado existe. Na fase atual, o envio do código é simulado na camada de mock. Validade do código e limite de tentativas estão em aberto (Apêndice B).

**Prioridade:** Necessário

**Origem:** Novo na v1.2 (telas de recuperação do protótipo).

### RF 021 — Ativação e inativação de unidade com confirmação

**Descrição:** O administrador deve poder ativar ou inativar uma unidade a partir do detalhamento. Ao inativar, o sistema exibe o modal "Deseja desativar a unidade?", informando que documentos e tarefas deixarão de poder ser modificados. Ao ativar, exibe o modal "Deseja ativar a unidade?", informando que documentos e tarefas poderão voltar a ser modificados.

**Entradas e pré-condições:** Unidade existente; usuário com perfil Administrador.

**Saídas e pós-condições:** Ao confirmar: status atualizado, selo ATIVA/INATIVA atualizado, e listagem, cards e Dashboard refletindo a mudança (RF 003); passam a valer as restrições do RF 007. Ao cancelar: status inalterado.

**Prioridade:** Obrigatório

**Origem:** Novo na v1.2 (a mudança de status estava embutida no RF 005).

### RF 022 — Edição de documento

**Descrição:** O usuário deve poder editar um documento a partir da ação "Editar" da tabela. O formulário é o mesmo do RF 009, já preenchido; o anexo só é substituído se um novo arquivo for enviado.

**Entradas e pré-condições:** Documento existente, pertencente a uma unidade ativa.

**Saídas e pós-condições:** Documento atualizado, com o status de validade recalculado (RF 011) e refletido nas listas e no Dashboard. Documentos de unidades inativas não podem ser editados (RF 007). A tela de edição não foi desenhada no protótipo (Apêndice B).

**Prioridade:** Necessário

**Origem:** Novo na v1.2 (ação "Editar" nas tabelas do protótipo).

### RF 023 — Edição de tarefa

**Descrição:** O usuário deve poder editar título, descrição e prazo de uma tarefa a partir da tabela. O status é alterado apenas pelo fluxo do RF 015.

**Entradas e pré-condições:** Tarefa existente, pertencente a uma unidade ativa.

**Saídas e pós-condições:** Tarefa atualizada e refletida nas listas e no Dashboard. Tarefas de unidades inativas não podem ser editadas (RF 007). A tela de edição não foi desenhada no protótipo (Apêndice B).

**Prioridade:** Necessário

**Origem:** Novo na v1.2.

### RF 024 — Indicadores de variação no Dashboard e no detalhamento

**Descrição:** O cabeçalho das tabelas deve exibir o total correspondente acompanhado da variação percentual em relação ao período anterior, com seta (alta ou queda) e cor. No Dashboard Global: "Total de documentos a vencer" (documentos Próximos do vencimento) e "Total de Tarefas Concluídas". No detalhamento da unidade: "Total de documentos expirados" e "Total de Tarefas Concluídas".

**Entradas e pré-condições:** Dados mockados com datas de validade, criação e conclusão, e um período de referência (sugerido: mês anterior, Apêndice B).

**Saídas e pós-condições:** Total e variação exibidos. Sem dados no período anterior, a variação não é exibida (ou é mostrada como "—").

**Prioridade:** Necessário

**Origem:** Novo na v1.2.

### RF 025 — Navegação principal e estrutura das telas

**Descrição:** As telas autenticadas devem compartilhar a mesma estrutura: menu lateral (Dashboard, Unidades e Configurações); barra superior com logotipo FrotaSync, campo de busca, ícones de notificações e de ajuda e identificação do usuário logado (nome e perfil); breadcrumbs conforme a rota (ex.: Unidades / Caruaru (ID 002) / Documentos / Novo Documento); e botão "Voltar para …" nos formulários.

**Entradas e pré-condições:** Usuário autenticado.

**Saídas e pós-condições:** Navegação consistente entre as telas, com o item de menu da seção atual destacado. O comportamento da busca global, das notificações, da ajuda e da tela de Configurações não foi definido no protótipo (Apêndice B).

**Prioridade:** Necessário

**Origem:** Novo na v1.2.

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

**Descrição:** O acesso ao sistema é obrigatoriamente autenticado. São públicas apenas as rotas /login, /cadastro e /recuperar-senha; todas as demais telas (Dashboard, Unidades, Detalhamento, Documentos, Tarefas e Configurações) são acessíveis apenas a usuários autenticados. O estado de autenticação (mockado) é verificado a cada navegação ou carregamento de rota protegida; sem sessão válida, o usuário é redirecionado imediatamente para /login, sem exibir conteúdo protegido, inclusive ao acessar pela URL. Usuário autenticado acessa normalmente, sem redirecionamentos indevidos. Ações restritas ao Administrador (como ativar e inativar unidades, RF 021) respeitam o perfil do usuário.

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (rotas públicas explícitas e controle por perfil). Reclassificado na v1.1: antigo RF 002 unido ao antigo RNF 004.

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

**Descrição:** Componentes reutilizáveis, sem duplicação de lógica de UI entre telas. Conjunto previsto: Button (variantes primária, sucesso, perigo e contorno), Input (com ícone), Select, DatePicker, Textarea, FileUpload, Switch, Checkbox, Stepper, OtpInput, Badge de status, ConfirmDialog (modal de confirmação genérico, usado em todos os fluxos de cadastro e de mudança de status), SegmentedToggle (Documentos/Tarefas), DataTable com paginação, DonutChart, StatTrend (total com variação), filtros, estados de loading/erro/vazio e os componentes de layout (AppShell, Sidebar, Topbar e Breadcrumbs). Os formulários de documento e de tarefa são únicos e servem às rotas globais e às rotas por unidade.

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (conjunto de componentes definido a partir do protótipo). Novo na v1.1.

### RNF 012 — Gerenciamento de estado

Separação clara entre estado de servidor (dados mockados, via TanStack Query) e estado de UI (filtros, modais, formulários abertos).

**Prioridade:** Obrigatório

**Origem:** Novo na v1.1.

### RNF 013 — Acessibilidade básica

Uso correto de labels nos formulários, contraste mínimo de cores, navegação por teclado e mensagens de erro que não dependam apenas de cor.

**Prioridade:** Obrigatório

**Origem:** Novo na v1.1.

### RNF 014 — Consistência visual (Design System)

**Descrição:** Tipografia, cores e espaçamentos consistentes em toda a aplicação, seguindo o design system definido no documento de UI e o protótipo (Apêndice A). Os status de documentos, tarefas e unidades usam os mesmos rótulos e cores em tabelas, cards e legendas de gráficos (Válido / Próximo do vencimento / Expirado; Pendente / Em andamento / Concluída; Ativa / Inativa).

**Prioridade:** Obrigatório

**Origem:** Alterado na v1.2 (padronização dos rótulos de status). Novo na v1.1.

### RNF 015 — Versionamento e entrega

Repositório público com código organizado, estrutura de pastas clara, histórico de commits no Git com mensagens claras e aplicação funcional executável localmente ou publicada online.

**Prioridade:** Obrigatório

**Origem:** Novo na v1.1 (entregas obrigatórias do briefing).

### RNF 016 — Adaptabilidade a diferentes empresas

Nome da empresa, vocabulário e tipos de documento devem poder ser definidos em um arquivo de configuração, sem alterar a lógica do sistema, para demonstrar que a solução serve a outros ramos e está pronta para eventual comercialização.

**Prioridade:** Opcional

**Origem:** Novo na v1.1.

### RNF 020 — Validação e máscaras de campos brasileiros

**Descrição:** Os campos CPF, CNPJ, telefone, CEP e UF devem ter máscara de digitação e validação com Zod: CPF e CNPJ com dígitos verificadores válidos; telefone com DDD e 10 ou 11 dígitos; CEP com 8 dígitos; UF com 2 letras. Os dados são normalizados (somente dígitos) antes de serem enviados ou armazenados. A senha tem no mínimo 8 caracteres, e a confirmação deve ser igual à senha.

**Prioridade:** Necessário

**Origem:** Novo na v1.2.

### RNF 021 — Proteção de dados pessoais e aceite de termos

**Descrição:** Dados pessoais (CPF, telefone, e-mail) são coletados apenas para o cadastro e tratados conforme a LGPD. O aceite dos Termos de Uso e da Política de Privacidade é obrigatório no cadastro e registrado com data e hora. Senhas nunca são armazenadas em texto plano nem registradas em logs. No ambiente de mocks, usam-se apenas dados fictícios.

**Prioridade:** Necessário

**Origem:** Novo na v1.2.

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

| ID | Requisito | Prioridade | Situação na v1.2 |
|---|---|---|---|
| RF 001 | Autenticação (Login) | Obrigatório | Alterado |
| RF 002 | Dashboard Global com indicadores | Obrigatório | Alterado |
| RF 003 | Atualização automática das pendências | Obrigatório | Mantido |
| RF 004 | Listagem de Unidades (cards) | Obrigatório | Alterado |
| RF 005 | Cadastro e edição de Unidade | Obrigatório | Alterado |
| RF 006 | Detalhamento da Unidade | Obrigatório | Alterado |
| RF 007 | Restrição de unidades inativas | Obrigatório | Alterado |
| RF 008 | Lista Global de Documentos | Obrigatório | Alterado |
| RF 009 | Cadastro de Documento | Obrigatório | Alterado |
| RF 010 | Documentos por Unidade | Obrigatório | Alterado |
| RF 011 | Cálculo automático do status do documento | Obrigatório | Mantido |
| RF 012 | Tarefas por Unidade | Obrigatório | Alterado |
| RF 013 | Lista Global de Tarefas | Obrigatório | Alterado |
| RF 014 | Cadastro de Tarefa | Obrigatório | Alterado |
| RF 015 | Alteração de status da tarefa com confirmação | Obrigatório | Alterado |
| RF 016 | Bloqueio de exclusão de unidade com pendências | Opcional | Mantido |
| RF 017 | Histórico de alterações (auditoria) | Opcional | Mantido |
| RF 018 | Tema claro/escuro | Opcional | Mantido |
| RF 019 | Cadastro de usuário e empresa em 3 etapas | Necessário | Novo |
| RF 020 | Recuperação de senha | Necessário | Novo |
| RF 021 | Ativação e inativação de unidade com confirmação | Obrigatório | Novo |
| RF 022 | Edição de documento | Necessário | Novo |
| RF 023 | Edição de tarefa | Necessário | Novo |
| RF 024 | Indicadores de variação | Necessário | Novo |
| RF 025 | Navegação principal e estrutura das telas | Necessário | Novo |
| RNF 001 | Arquitetura de software | Obrigatório | Mantido |
| RNF 002 | Tecnologia utilizada | Obrigatório | Mantido |
| RNF 003 | Documentação | Obrigatório | Mantido |
| RNF 004 | Segurança e proteção de rotas | Obrigatório | Alterado |
| RNF 005 | Desempenho | Obrigatório | Mantido |
| RNF 006 | Usabilidade e responsividade | Obrigatório | Mantido |
| RNF 007 | Consistência dos dados calculados | Obrigatório | Mantido |
| RNF 008 | Massa de dados mockados | Obrigatório | Mantido |
| RNF 009 | Loading, erro e estado vazio | Obrigatório | Mantido |
| RNF 010 | Tipagem | Obrigatório | Mantido |
| RNF 011 | Componentização | Obrigatório | Alterado |
| RNF 012 | Gerenciamento de estado | Obrigatório | Mantido |
| RNF 013 | Acessibilidade básica | Obrigatório | Mantido |
| RNF 014 | Consistência visual | Obrigatório | Alterado |
| RNF 015 | Versionamento e entrega | Obrigatório | Mantido |
| RNF 016 | Adaptabilidade a diferentes empresas | Opcional | Mantido |
| RNF 017 | Camada de API simulada | Opcional | Mantido |
| RNF 018 | Testes automatizados | Opcional | Mantido |
| RNF 019 | Deploy com pipeline | Opcional | Mantido |
| RNF 020 | Validação e máscaras de campos brasileiros | Necessário | Novo |
| RNF 021 | Proteção de dados pessoais e aceite de termos | Necessário | Novo |

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
| 05/10/2026 | 1.2 | Incorporação do protótipo de telas (SystemDesign): novos RF 019 a RF 025 e RNF 020 e RNF 021; alteração dos RF 001, 002, 004 a 010 e 012 a 015 e dos RNF 004, 011 e 014; novos Apêndices A (telas e rotas) e B (pontos em aberto). IDs existentes mantidos. | Equipe do projeto |

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

### Correspondência de numeração (v1.1 para v1.2)

Nenhum ID foi renumerado na v1.2. Os requisitos novos receberam IDs em sequência, e os existentes que mudaram de conteúdo trazem "Alterado na v1.2" no campo Origem.

| v1.1 | v1.2 | Observação |
|---|---|---|
| RF 001 a RF 018 | RF 001 a RF 018 | Mesmos IDs; alterados: 001, 002, 004 a 010, 012 a 015 |
| RNF 001 a RNF 019 | RNF 001 a RNF 019 | Mesmos IDs; alterados: 004, 011, 014 |
| Novos | RF 019 a RF 025; RNF 020 e RNF 021 | Ver o campo Origem ("Novo na v1.2") |

---

## Apêndice A — Mapa de telas e rotas do frontend

Rotas do Next.js (App Router) previstas a partir do protótipo. As rotas públicas usam o layout de autenticação (card dividido com ilustração); as demais usam o layout da aplicação (RF 025). Telas marcadas como "não desenhada" não existem no protótipo e estão previstas pelos requisitos.

| Rota | Tela | Acesso | Requisitos |
|---|---|---|---|
| /login | Login ("Bem-vindo") | Público | RF 001 |
| /cadastro | Cadastro em 3 etapas | Público | RF 019, RNF 020, RNF 021 |
| /recuperar-senha | Recuperação de senha em 3 passos | Público | RF 020 |
| /dashboard | Dashboard Global (aba Documentos ou Tarefas, por ?aba=) | Autenticado | RF 002, 008, 013, 024 |
| /documentos/novo | Novo documento (a partir do Dashboard) | Autenticado | RF 009 |
| /documentos/[id]/editar | Editar documento (não desenhada) | Autenticado | RF 022 |
| /tarefas/nova | Nova Tarefa (a partir do Dashboard) | Autenticado | RF 014 |
| /tarefas/[id]/editar | Editar tarefa (não desenhada) | Autenticado | RF 023 |
| /unidades | Lista de unidades (cards) | Autenticado | RF 004 |
| /unidades/nova | Cadastrar Unidade | Autenticado | RF 005 |
| /unidades/[id] | Detalhamento da unidade (aba Documentos ou Tarefas) | Autenticado | RF 006, 007, 010, 012, 021, 024 |
| /unidades/[id]/editar | Editar unidade (não desenhada) | Autenticado | RF 005 |
| /unidades/[id]/documentos/novo | Novo documento (unidade preenchida) | Autenticado | RF 009 |
| /unidades/[id]/documentos/[docId]/editar | Editar documento da unidade (não desenhada) | Autenticado | RF 022 |
| /unidades/[id]/tarefas/nova | Nova Tarefa (unidade preenchida) | Autenticado | RF 014 |
| /unidades/[id]/tarefas/[tarefaId]/editar | Editar tarefa da unidade (não desenhada) | Autenticado | RF 023 |
| /configuracoes | Configurações (tela em branco no protótipo) | Autenticado | RF 025 |

### Modais de confirmação e aviso

| Modal | Disparo | Requisito |
|---|---|---|
| Deseja cadastrar a unidade? | Salvar em Cadastrar Unidade | RF 005 |
| Deseja cadastrar o documento? | Salvar em Novo documento | RF 009 |
| Deseja criar a tarefa? | Salvar em Nova Tarefa | RF 014 |
| Concluir tarefa? | Marcar tarefa como Concluída | RF 015 |
| Deseja ativar a unidade? | Ativar unidade inativa | RF 021 |
| Deseja desativar a unidade? | Inativar unidade ativa | RF 021 |
| Não é possível cadastrar a tarefa | Cadastro de tarefa em unidade inativa | RF 007 |

---

## Apêndice B — Pontos em aberto e decisões assumidas

Itens que o protótipo não define ou define de forma inconsistente. A coluna "Tratamento na v1.2" registra a decisão adotada nestes documentos, que deve ser validada pela squad.

| # | Ponto | Tratamento na v1.2 |
|---|---|---|
| B1 | Complemento marcado como obrigatório no formulário de unidade | Tratado como opcional (RF 005); ajustar o protótipo |
| B2 | Tabelas exibem categoria e emissão do documento, mas o formulário não tem esses campos | Campos incluídos na especificação: categoria obrigatória e emissão opcional (RF 009); incluir no protótipo |
| B3 | Filtro "Categoria" na lista de tarefas, sem campo correspondente em tarefa | Não especificado; remover do protótipo ou definir categoria de tarefa |
| B4 | Significado de "Data de início" da tarefa | Definida como a data do cadastro, preenchida automaticamente (RF 014); confirmar |
| B5 | Total de pendências não aparece no layout do Dashboard | Mantido no RF 002; definir onde exibir |
| B6 | "Total de documentos à vencer" no cabeçalho versus total de itens no rodapé da tabela | Cabeçalho: documentos Próximos do vencimento; rodapé: itens da lista filtrada; corrigir o rótulo para "a vencer" |
| B7 | Período de referência da variação percentual | Sugerido: mês anterior (RF 024); confirmar |
| B8 | Cadastro cria empresa, mas o sistema não prevê multiempresa | Assumido: cada usuário pertence a uma empresa, e as unidades pertencem à empresa; quem cadastra a empresa recebe o perfil Administrador; confirmar |
| B9 | "Tipo de unidade (Matriz ou Filial)" no cadastro da empresa, ausente no cadastro de unidade | Guardado na empresa; decidir se o cadastro gera uma unidade automaticamente ou se o formulário de unidade ganha um campo de tipo |
| B10 | Telas e comportamentos não desenhados: Configurações, edição de unidade, documento e tarefa, "Mais detalhes", busca global, notificações, ajuda, Termos de Uso e Política de Privacidade | Rotas previstas no Apêndice A; comportamento a definir |
| B11 | Duração da sessão com "Lembre-me" | A definir; sugerido: 30 dias para o refresh token (7 dias sem "Lembre-me") |
| B12 | Validade do código de recuperação e limite de tentativas | Sugerido: 10 minutos e 5 tentativas, pois o código tem apenas 5 dígitos |
| B13 | Anexo obrigatório: tipos e tamanho aceitos | Sugerido: PDF, JPG e PNG até 10 MB; confirmar |
| B14 | Textos do protótipo a corrigir | "Voltar para documentos" em Cadastrar Unidade (deveria ser "Voltar para unidades"); placeholder "Digite o nome da tarefa..." nos formulários de unidade e de documento; modal "Deseja cadastrando o documento?" (e "Deseja criar a tarefa?" no modal de documento); legenda do card de Documentos com "Vigente" duplicado e rótulos "Vigente / A vencer" diferentes dos status do RF 011 (padronizados no RNF 014) |
| B15 | Números do protótipo (128 documentos, 400 unidades, 55 a vencer) | Ilustrativos; não são requisitos |

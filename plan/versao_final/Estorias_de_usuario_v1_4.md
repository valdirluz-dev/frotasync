# FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas

**Versão do documento:** 1.4 | **Data:** 21/11/2026\
**Documento:** Estórias de Usuário e Backlog\
*Documento complementar à Análise de Requisitos (03) e a Personas & Jornadas (02). Contém a matriz de rastreabilidade mestre do projeto.*

---

## Equipe de desenvolvimento

- **Desenvolvedor(a):** Valdir
- **Desenvolvedor(a):** Filipe
- **Desenvolvedor(a):** Gabrieli
- **Desenvolvedor(a):** Lucas Vinícius
- **Desenvolvedor(a):** Murilo
- **Desenvolvedor(a):** Niedson
- **Desenvolvedor(a):** Silas

---

## Sobre este documento

Este documento apresenta as estórias de usuário derivadas dos requisitos funcionais e não funcionais da Análise de Requisitos v1.3 (03) do FrotaSync, organizadas em épicos. Cada estória segue o formato *"Como \[persona\], quero \[ação\], para \[motivo\]"*, indica o requisito de origem e possui critérios de aceite no formato *Dado / Quando / Então* que definem quando ela pode ser considerada "pronta" (Definition of Done). Ao final, o backlog completo é apresentado já priorizado, pronto para ser distribuído em sprints (Scrum) ou em colunas de um quadro Kanban, acompanhado de uma **matriz de rastreabilidade única** que liga cada estória à tela, ao endpoint e ao teste correspondentes.

Os IDs das estórias foram mantidos (a antiga "US 011" passa a "US-011"), assim como a numeração dos épicos 1 a 8 e 11 a 14, para preservar a rastreabilidade com as versões anteriores. As US-085 e US-087 aparecem como *Won't have* (descartada e substituída na v1.3).

**Alterações da v1.4** (alinhamento ao Design de API v1.6, à Modelagem de Dados v1.6 e ao frontend): a US-013 passa a citar os limites de tamanho dos campos; a US-115 usa página iniciada em 1; a US-121 deixa de citar CORS (mesma origem); a US-122 inclui o logout com o accessToken expirado; a US-124 usa `token` no lugar de `resetToken`; a US-082 sobe de *Could have* para *Should have* e inclui o histórico global; a matriz de rastreabilidade ganha `GET /historico`, `GET /notificacoes`, `GET /auth/me`, `GET /health` e `GET /documentos/categorias`.

---

## Personas consideradas

- **P-01 — Colaborador(a) / usuário administrativo:** acompanha filiais e pátios, consulta e cadastra documentos e gerencia as tarefas de cada unidade no dia a dia.
- **P-02 — Gestor(a) / tomador de decisão:** usa o Dashboard e as listas globais para ter visão rápida da situação da empresa e apoiar decisões sobre prioridades e pendências.
- **P-03 — Administrador(a):** garante a segurança de acesso e a consistência dos dados (autenticação, cadastro e inativação de unidades, regras de unidades inativas).
- **P-04 — Novo(a) usuário(a):** ainda não tem acesso; cadastra a si e a empresa ou recupera a senha.
- **P-05 — Desenvolvedor(a):** constrói e mantém o sistema, o banco, a API, os dados de demonstração (mocks e seed) e a integração entre as camadas.
- **P-06 — Responsável pela operação:** publica versões, acompanha a disponibilidade na nuvem e recupera os dados após falhas.

Quando a estória diz "usuário do sistema", refere-se a qualquer perfil autenticado (P-01, P-02 ou P-03).

**Origem das personas:** suposição, derivadas das Estórias de Usuário e da Análise de Requisitos v1.3; o documento `02_personas_jornadas` não foi fornecido (ver Pendências).

---

## Critério de priorização — MoSCoW

Equivalência com a prioridade dos requisitos no 03:

| MoSCoW (aqui) | Prioridade do requisito (03) | Significado |
| :-- | :-- | :-- |
| **Must have** | Obrigatório | Essencial; deve estar na primeira entrega. |
| **Should have** | Necessário | Agrega muito valor; o sistema funciona sem ele no curto prazo. |
| **Could have** | Opcional | Melhora a experiência; pode ficar para uma versão futura. |
| **Won't have** | Fora do escopo agora | Não será implementado nesta fase (ver Brief 01 §4). |

---

## Estórias de Usuário por Épico

### Épico 1 — Autenticação e Acesso

#### US-011 — Como usuário do sistema, quero me autenticar com e-mail corporativo e senha, com "Lembre-me", "Esqueceu a senha?" e "Cadastre-se", para acessar com segurança as funcionalidades restritas.

- **Requisito de origem:** RF-001
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o formulário de login, **quando** envio um e-mail inválido ou a senha vazia, **então** o Zod exibe o erro junto ao campo e nada é enviado.
  - **Dado** credenciais válidas, **quando** envio o formulário, **então** sou redirecionado ao Dashboard Global com feedback visual de sucesso.
  - **Dado** credenciais inválidas, **quando** envio o formulário, **então** vejo uma mensagem de erro específica e não há redirecionamento.
  - **Dado** "Lembre-me" ativo, **quando** faço login, **então** a sessão é mantida por período estendido.
  - **Dado** a tela de login, **quando** clico em "Esqueceu a senha?" ou "Cadastre-se", **então** sou levado à recuperação de senha ou ao cadastro.
- **Prioridade:** Must have

#### US-012 — Como administrador(a), quero que todas as telas protegidas exijam autenticação válida, para impedir que usuários não autorizados acessem dados da empresa.

- **Requisito de origem:** RNF-004
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** que não tenho sessão válida, **quando** acesso qualquer rota protegida (Dashboard, Unidades, Detalhamento, Documentos, Tarefas, Configurações), inclusive pela URL, **então** sou redirecionado a `/login` sem ver conteúdo protegido.
  - **Dado** que não estou autenticado, **quando** acesso `/login`, `/cadastro` ou `/recuperar-senha`, **então** a tela abre normalmente (únicas rotas públicas).
  - **Dado** uma sessão válida, **quando** navego ou recarrego uma rota protegida, **então** a sessão é verificada a cada navegação e o acesso ocorre sem redirecionamentos indevidos.
- **Prioridade:** Must have

#### US-013 — Como novo(a) usuário(a), quero me cadastrar informando meus dados pessoais, os da empresa e os de login em etapas, para criar meu acesso ao sistema.

- **Requisito de origem:** RF-019, RNF-020, RNF-021
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o cadastro em 3 etapas com indicador de progresso (Dados Pessoais, Dados da Empresa e Dados de Login), **quando** preencho uma etapa com dados válidos e clico em "Avançar", **então** passo à etapa seguinte.
  - **Dado** CPF ou CNPJ com dígitos verificadores inválidos, telefone sem DDD, nome com menos de 3 caracteres, cargo com menos de 2, campo acima do limite de tamanho, senha com menos de 8 ou mais de 72 caracteres ou confirmação diferente, **quando** tento avançar, **então** o Zod exibe o erro no campo e a etapa não avança.
  - **Dado** que não aceitei os Termos de Uso e a Política de Privacidade, **quando** clico em "Finalizar Cadastro", **então** o cadastro é bloqueado.
  - **Dado** todos os dados válidos e o aceite, **quando** finalizo, **então** a empresa e o usuário administrador são criados e sou levado ao login com mensagem de sucesso.
  - **Dado** e-mail, CPF ou CNPJ já cadastrados, **quando** finalizo, **então** o erro aparece junto ao campo correspondente.
- **Prioridade:** Should have

#### US-014 — Como usuário(a) que esqueceu a senha, quero redefini-la por um código enviado ao meu e-mail, para recuperar o acesso sem depender de outra pessoa.

- **Requisito de origem:** RF-020
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o passo 1, **quando** informo o e-mail e clico em "Enviar Código", **então** a tela avança para o passo 2, sem informar se o e-mail existe.
  - **Dado** o passo 2, **quando** informo o código de 5 dígitos correto, **então** avanço ao passo 3; **quando** clico em "Enviar novo código", **então** um novo código é enviado.
  - **Dado** um código inválido ou expirado, **quando** clico em "Verificar código", **então** vejo mensagem de erro e não avanço.
  - **Dado** o passo 3, **quando** defino e confirmo uma nova senha de no mínimo 8 caracteres e clico em "Confirmar", **então** sou levado ao login.
- **Prioridade:** Should have

---

### Épico 2 — Dashboard, Indicadores e Navegação

#### US-021 — Como gestor(a), quero ver o Dashboard Global com a distribuição de unidades, documentos e tarefas por status e o total de pendências logo após o login, para ter uma visão rápida da situação da empresa.

- **Requisito de origem:** RF-002
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** que acabei de fazer login, **quando** a tela inicial carrega, **então** vejo o Dashboard Global com três cards de rosca: Unidades (ativas e inativas), Documentos (Válido, Próximo do vencimento e Expirado) e Tarefas (Concluída, Em andamento e Pendente), com valores vindos da API.
  - **Dado** o Dashboard, **quando** ele é exibido, **então** o total de pendências (documentos próximos do vencimento ou expirados + tarefas pendentes ou em andamento) está visível; as listas de documentos e de tarefas ficam em `/documentos` e `/tarefas`.
  - **Dado** que não há dados cadastrados, **quando** o Dashboard carrega, **então** os indicadores exibem zero, sem erro.
- **Prioridade:** Must have

#### US-022 — Como gestor(a), quero que o total de pendências se atualize automaticamente após alterações, para não precisar recarregar a página.

- **Requisito de origem:** RF-003
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** que altero o status ou cadastro de uma unidade, documento ou tarefa, **quando** a alteração é confirmada, **então** o cache do TanStack Query é invalidado e o Dashboard reflete o novo valor sem recarregar a página.
  - **Dado** que concluo uma tarefa no detalhamento da unidade, **quando** confirmo, **então** a lista de tarefas também é atualizada.
- **Prioridade:** Must have

#### US-023 — Como gestor(a), quero ver, junto aos totais de documentos a vencer e de tarefas concluídas, a variação em relação ao período anterior, para perceber se a situação está melhorando ou piorando.

- **Requisito de origem:** RF-024
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** as listas globais, **quando** abro `/documentos` ou `/tarefas`, **então** o cabeçalho mostra o total de documentos a vencer ou de tarefas concluídas com a variação percentual, seta de alta ou queda e cor.
  - **Dado** o detalhamento de uma unidade, **quando** ele carrega, **então** o mesmo padrão exibe os totais de documentos expirados e de tarefas concluídas da unidade.
  - **Dado** que o valor do período anterior é zero ou não há dados, **quando** o cabeçalho é exibido, **então** a variação não aparece.
- **Prioridade:** Should have

#### US-024 — Como usuário(a), quero um menu lateral, uma barra superior e breadcrumbs consistentes, para navegar entre as seções e saber onde estou.

- **Requisito de origem:** RF-025
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** qualquer tela autenticada, **quando** ela é exibida, **então** o menu lateral mostra Dashboard, Documentos, Tarefas, Unidades e Configurações, com a seção atual destacada.
  - **Dado** qualquer tela autenticada, **quando** ela é exibida, **então** a barra superior mostra logotipo, busca, notificações, ajuda e nome e perfil do usuário logado.
  - **Dado** uma rota aninhada (ex.: Unidades / Caruaru (ID 002) / Documentos / Novo Documento), **quando** a tela abre, **então** os breadcrumbs refletem a rota e os formulários têm o botão "Voltar para …".
- **Prioridade:** Should have

---

### Épico 3 — Gestão de Unidades

#### US-031 — Como colaborador(a), quero ver todas as unidades em uma grade de cards, com pesquisa, filtro e paginação, para localizar rapidamente a unidade que preciso consultar.

- **Requisito de origem:** RF-004
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** a listagem, **quando** ela carrega, **então** cada card mostra identificador, endereço, quantidade de documentos e de tarefas e o selo ATIVA (verde) ou INATIVA (vermelho).
  - **Dado** a listagem, **quando** pesquiso por nome/identificador ou filtro por status, **então** a grade é atualizada.
  - **Dado** mais de 12 unidades, **quando** navego, **então** a grade é paginada (12 por página), com o texto "Mostrando 1 a 12 de N unidades".
  - **Dado** uma busca sem resultados, **quando** ela é concluída, **então** vejo a mensagem de lista vazia.
  - **Dado** a listagem, **quando** clico em "Nova Unidade", **então** sou levado ao cadastro (US-034).
- **Prioridade:** Must have

#### US-032 — Como colaborador(a), quero acessar o detalhamento de uma unidade, para ver suas informações, documentos e tarefas em um só lugar.

- **Requisito de origem:** RF-006
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** a listagem de unidades, **quando** seleciono uma unidade, **então** vejo o título com nome e identificador, o endereço e o selo de status.
  - **Dado** o detalhamento, **quando** ele carrega, **então** o card "Informações da unidade" mostra status, data de criação, última modificação e "Mais detalhes"; os cards de Documentos e de Tarefas mostram gráficos de rosca por status.
  - **Dado** o detalhamento, **quando** alterno entre Documentos e Tarefas, **então** a tabela mostra apenas os itens da unidade.
  - **Dado** uma unidade inativa, **quando** o detalhamento carrega, **então** documentos e tarefas aparecem somente em leitura.
- **Prioridade:** Must have

#### US-033 — Como administrador(a), quero que unidades inativas não recebam novos documentos ou tarefas nem tenham os existentes modificados, para manter a consistência dos dados.

- **Requisito de origem:** RF-007, RNF-024
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** uma unidade inativa, **quando** abro o detalhamento, **então** as ações de cadastro e edição de documentos e tarefas estão desabilitadas.
  - **Dado** uma unidade inativa, **quando** tento cadastrar uma tarefa, **então** vejo o aviso "Não é possível cadastrar a tarefa" com a ação "Voltar para unidades".
  - **Dado** os formulários de documento e de tarefa, **quando** abro o seletor de unidade, **então** só aparecem unidades ativas.
  - **Dado** uma unidade inativa, **quando** a API recebe uma escrita em documento ou tarefa dela, **então** responde 409.
  - **Dado** uma unidade ativa, **quando** uso essas ações, **então** elas funcionam normalmente.
- **Prioridade:** Must have

#### US-034 — Como administrador(a), quero cadastrar e editar unidades por um formulário validado, para manter a base de unidades atualizada e consistente.

- **Requisito de origem:** RF-005
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o formulário (React Hook Form + Zod) com nome, identificador, CEP, logradouro, número, complemento (opcional), bairro, cidade, UF e descrição (opcional), **quando** deixo um campo obrigatório vazio ou inválido, **então** vejo o erro junto ao campo.
  - **Dado** um CEP de 8 dígitos, **quando** clico em "Buscar CEP", **então** logradouro, bairro, cidade e UF são preenchidos; se o CEP não for encontrado, preencho manualmente.
  - **Dado** um identificador já usado na empresa, **quando** salvo, **então** o cadastro é recusado (409).
  - **Dado** dados válidos, **quando** clico em salvar, **então** o modal "Deseja cadastrar a unidade?" pede confirmação e, ao confirmar, a unidade nasce ativa e aparece na listagem e no Dashboard.
- **Prioridade:** Must have

#### US-035 — Como administrador(a), quero ativar e inativar uma unidade com confirmação, para encerrar ou retomar a operação sem perder seus dados.

- **Requisito de origem:** RF-021
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** uma unidade ativa, **quando** clico em inativar, **então** o modal "Deseja desativar a unidade?" informa que documentos e tarefas deixarão de poder ser modificados.
  - **Dado** uma unidade inativa, **quando** clico em ativar, **então** o modal "Deseja ativar a unidade?" informa que poderão voltar a ser modificados.
  - **Dado** o modal, **quando** confirmo, **então** selo, listagem, cards e Dashboard são atualizados e passam a valer as restrições da US-033; **quando** cancelo, **então** nada muda.
- **Prioridade:** Must have

---

### Épico 4 — Gestão de Documentos

#### US-041 — Como gestor(a), quero uma lista global de todos os documentos, com pesquisa, filtros e paginação, para acompanhar a validade dos documentos da empresa em um único lugar.

- **Requisito de origem:** RF-008
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o menu lateral, **quando** clico em Documentos, **então** abre `/documentos` com documentos de todas as unidades e as colunas documento, unidade, categoria, emissão, validade, status e ações.
  - **Dado** a lista, **quando** ela carrega, **então** cada documento exibe o status calculado (Válido, Próximo do vencimento ou Expirado).
  - **Dado** a lista, **quando** pesquiso por nome, filtro por unidade, categoria ou status, ou troco de página (10 por página), **então** a tabela (TanStack Table) é atualizada.
  - **Dado** a lista, **quando** clico em "Novo documento" ou em "Editar", **então** sou levado ao cadastro (US-044) ou à edição (US-045).
  - **Dado** uma busca sem resultados, **quando** ela é concluída, **então** vejo a mensagem de lista vazia.
- **Prioridade:** Must have

#### US-042 — Como colaborador(a), quero ver, no detalhamento da unidade, apenas os documentos dela, para acompanhar a validade documental sem filtrar a lista global.

- **Requisito de origem:** RF-010
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** a aba Documentos do detalhamento, **quando** ela carrega, **então** a lista contém somente documentos da unidade, com busca, filtros de categoria e status e paginação.
  - **Dado** a lista, **quando** ela é exibida, **então** cada documento mostra categoria, emissão, validade e status calculado.
- **Prioridade:** Must have

#### US-043 — Como colaborador(a), quero que o status de validade de cada documento seja calculado automaticamente a partir da data de validade, para evitar erros de preenchimento manual.

- **Requisito de origem:** RF-011, RNF-007, RNF-024
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** um documento com validade a mais de 15 dias da data atual, **quando** ele é consultado, **então** o status é "Válido".
  - **Dado** um documento com até 15 dias para o vencimento, **quando** ele é consultado, **então** o status é "Próximo do vencimento".
  - **Dado** um documento com validade ultrapassada, **quando** ele é consultado, **então** o status é "Expirado".
  - **Dado** qualquer requisição de escrita, **quando** o cliente envia `statusValidade`, **então** a API responde 400; o cálculo é sempre feito pelo backend a cada consulta.
- **Prioridade:** Must have

#### US-044 — Como colaborador(a), quero cadastrar um documento em uma unidade ativa, informando os dados e anexando o arquivo, para controlar a validade da documentação (ex.: Licença Ambiental, Registro na ANTT, Seguro de Carga).

- **Requisito de origem:** RF-009
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o formulário (Zod) com nome, anexo obrigatório, unidade, categoria, emissão (opcional), vencimento e descrição (opcional), **quando** deixo um campo obrigatório vazio ou informo emissão posterior ao vencimento, **então** vejo o erro junto ao campo.
  - **Dado** o formulário, **quando** abro o seletor de unidade, **então** só aparecem unidades ativas; aberto a partir de uma unidade, o campo vem preenchido e bloqueado.
  - **Dado** dados válidos, **quando** salvo, **então** o modal "Deseja cadastrar o documento?" pede confirmação e, ao confirmar, o documento aparece nas listas e no Dashboard com status calculado (US-043).
- **Prioridade:** Must have

#### US-045 — Como colaborador(a), quero editar um documento cadastrado, para corrigir dados ou atualizar a validade e o anexo quando ele é renovado.

- **Requisito de origem:** RF-022
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** uma linha da tabela, **quando** clico em "Editar", **então** o formulário abre já preenchido.
  - **Dado** a edição, **quando** salvo sem enviar novo arquivo, **então** o anexo existente é mantido; com novo arquivo, é substituído.
  - **Dado** a edição salva, **quando** a validade mudou, **então** o status é recalculado e as listas e o Dashboard são atualizados.
  - **Dado** um documento de unidade inativa, **quando** tento editá-lo, **então** a edição é bloqueada.
- **Prioridade:** Should have

---

### Épico 5 — Gestão de Tarefas

#### US-051 — Como colaborador(a), quero ver as tarefas de cada unidade, com status, datas e prazos, para acompanhar o andamento do trabalho daquela unidade.

- **Requisito de origem:** RF-012
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** a aba Tarefas do detalhamento, **quando** ela carrega, **então** a lista mostra tarefa, data de início, prazo final, status (Pendente, Em andamento, Concluída) e data de conclusão, com busca, filtro de status e paginação.
  - **Dado** a lista, **quando** ela é exibida, **então** cada status tem destaque visual (cor ou etiqueta) que permite identificá-lo rapidamente.
- **Prioridade:** Must have

#### US-052 — Como colaborador(a), quero alterar o status de uma tarefa e confirmar explicitamente quando ela for concluída, para evitar conclusões por engano.

- **Requisito de origem:** RF-015
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** uma tarefa de unidade ativa, **quando** altero o status entre Pendente, Em andamento e Concluída, **então** a mudança é aplicada, exceto a conclusão, que exige confirmação.
  - **Dado** que seleciono "Concluída", **quando** o modal "Concluir tarefa?" aparece citando o título e confirmo, **então** status e data e hora de conclusão são atualizados na listagem e no Dashboard; **quando** cancelo, **então** o status permanece inalterado.
  - **Dado** um cliente que chama a API sem `confirmacao: true` ao concluir, **quando** a requisição chega, **então** a API responde 400.
  - **Dado** uma tarefa concluída, **quando** volta a outro status, **então** a data de conclusão é limpa.
  - **Dado** uma tarefa de unidade inativa, **quando** tento mudar o status, **então** a ação é bloqueada (409 na API).
- **Prioridade:** Must have

#### US-053 — Como gestor(a), quero uma lista global de todas as tarefas de todas as unidades, com pesquisa, filtros e paginação, para acompanhar prazos e andamento da empresa em um único lugar.

- **Requisito de origem:** RF-013
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o menu lateral, **quando** clico em Tarefas, **então** abre `/tarefas` com tarefa, unidade, data de início, prazo final, status e data de conclusão.
  - **Dado** a lista, **quando** pesquiso por título, filtro por unidade ou status, ou troco de página (10 por página), **então** a tabela (TanStack Table) é atualizada.
  - **Dado** a lista, **quando** clico em "Nova Tarefa" ou na edição de uma linha, **então** sou levado à US-054 ou à US-055.
  - **Dado** uma busca sem resultados, **quando** ela é concluída, **então** vejo a mensagem de lista vazia.
  - **Dado** a lista, **quando** altero o status de uma tarefa, **então** valem as regras da US-052.
- **Prioridade:** Must have

#### US-054 — Como colaborador(a), quero cadastrar uma tarefa em uma unidade ativa, informando título, prazo e descrição, para registrar e acompanhar o trabalho necessário (ex.: renovar licença do pátio de Recife).

- **Requisito de origem:** RF-014
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o formulário (Zod) com título, unidade, prazo e descrição (opcional), **quando** deixo título, unidade ou prazo vazios, **então** vejo o erro junto ao campo.
  - **Dado** o formulário, **quando** ele abre, **então** o status "Pendente" é exibido e não editável; o seletor lista só unidades ativas e, se aberto a partir de uma unidade, o campo vem preenchido e bloqueado.
  - **Dado** dados válidos, **quando** salvo, **então** o modal "Deseja criar a tarefa?" pede confirmação e, ao confirmar, a tarefa é criada como Pendente, com data de início igual à data do cadastro, e aparece nas listas e no Dashboard.
- **Prioridade:** Must have

#### US-055 — Como colaborador(a), quero editar título, descrição e prazo de uma tarefa, para ajustar o planejamento quando necessário.

- **Requisito de origem:** RF-023
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** uma linha da tabela, **quando** clico em editar, **então** o formulário abre preenchido, sem campo de status (que segue a US-052).
  - **Dado** a edição, **quando** salvo, **então** as listas e o Dashboard são atualizados.
  - **Dado** uma tarefa de unidade inativa, **quando** tento editá-la, **então** a edição é bloqueada.
- **Prioridade:** Should have

---

### Épico 6 — Dados de Demonstração (Mocks)

#### US-061 — Como desenvolvedor(a), quero manter uma massa de dados mockados que cubra todos os estados relevantes do sistema, para demonstrar e testar as regras de negócio sem depender de um backend real.

- **Requisito de origem:** RNF-008
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** a camada de dados mockados, **quando** a consulto, **então** há unidades ativas e inativas com endereço estruturado, documentos nos três status em categorias variadas (Legal, Ambiental, Segurança, Fiscal, Contratual, Técnica, Sanitária) com anexos fictícios, e tarefas nos três status com datas de início e de conclusão.
  - **Dado** os dados, **quando** calculo a variação dos indicadores, **então** há registros do período anterior suficientes para exibi-la (US-023).
  - **Dado** os dados, **quando** testo login, cadastro e recuperação de senha, **então** há uma empresa e usuários fictícios, com código de recuperação simulado, ambientados na FrotaSync.
  - **Dado** a integração concluída (US-137), **quando** o fluxo de negócio roda, **então** os mocks não são mais usados e passam a ser a base do seed (US-116).
- **Prioridade:** Must have

---

### Épico 7 — Qualidade Técnica e Entrega

#### US-071 — Como colaborador(a), quero ver indicação de carregamento, mensagem de erro com nova tentativa e estado vazio, para entender o que está acontecendo e não ficar diante de uma tela em branco.

- **Requisito de origem:** RNF-009
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** uma tela que depende de dados, **quando** eles estão sendo obtidos, **então** vejo um estado de carregamento.
  - **Dado** uma falha na obtenção dos dados, **quando** o erro ocorre, **então** vejo uma mensagem com a opção de tentar novamente.
  - **Dado** que não há dados a exibir, **quando** a tela carrega, **então** vejo um estado vazio.
- **Prioridade:** Must have

#### US-072 — Como colaborador(a), quero usar o sistema em desktop, tablet ou celular, com listagens rápidas, para consultar unidades, documentos e tarefas em qualquer dispositivo.

- **Requisito de origem:** RNF-005, RNF-006
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** desktop, tablet ou mobile (a partir de 360 px), **quando** uso as telas, **então** a interface (Tailwind CSS) se adapta, sem rolagem horizontal da página e com status legíveis.
  - **Dado** as listagens de Unidades, Documentos e Tarefas, **quando** carregam, **então** são paginadas via TanStack Table.
  - **Dado** dados já consultados, **quando** volto à tela, **então** o cache do TanStack Query evita requisições desnecessárias.
- **Prioridade:** Must have

#### US-073 — Como colaborador(a), quero uma interface acessível por teclado, com rótulos e contraste adequados, para usar o sistema com conforto sem depender apenas de cores.

- **Requisito de origem:** RNF-013
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** qualquer formulário, **quando** o inspeciono, **então** todos os campos têm labels associados.
  - **Dado** qualquer tela, **quando** navego só pelo teclado, **então** alcanço e aciono todos os controles.
  - **Dado** um erro de validação, **quando** ele é exibido, **então** a mensagem não depende apenas de cor e o contraste respeita o mínimo definido.
- **Prioridade:** Must have

#### US-074 — Como desenvolvedor(a), quero manter o código tipado, componentizado e com o estado de servidor separado do estado de UI, para facilitar reuso e manutenção.

- **Requisito de origem:** RNF-001, RNF-002, RNF-010, RNF-011, RNF-012
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o projeto, **quando** o reviso, **então** usa Next.js e TypeScript, Tailwind CSS, React Hook Form + Zod, TanStack Query e TanStack Table, organizados em camadas (UI, formulários, dados e regras de negócio).
  - **Dado** as entidades Unidade, Documento e Tarefa, **quando** o código é verificado, **então** cada uma tem interfaces/types próprios e não há uso de `any`.
  - **Dado** componentes como Button, Input, Modal, Table e Badge, **quando** uma tela precisa deles, **então** reutiliza o componente comum, sem duplicar lógica de UI.
  - **Dado** filtros, modais e formulários abertos, **quando** são controlados, **então** ficam no estado de UI, separados do estado de servidor (TanStack Query).
- **Prioridade:** Must have

#### US-075 — Como desenvolvedor(a), quero seguir um design system único em toda a aplicação, para garantir tipografia, cores e espaçamentos consistentes.

- **Requisito de origem:** RNF-014
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** qualquer tela, **quando** a comparo com o documento de UI, **então** tipografia, cores e espaçamentos seguem o design system.
  - **Dado** os status de documentos, tarefas e unidades, **quando** aparecem em tabelas, cards ou legendas de gráficos, **então** usam o mesmo rótulo e o mesmo padrão de cores.
- **Prioridade:** Must have

#### US-076 — Como desenvolvedor(a), quero documentar as regras de dados em schemas Zod e manter um README, para que qualquer pessoa entenda e execute o projeto.

- **Requisito de origem:** RNF-003
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o repositório, **quando** o consulto, **então** há schemas Zod para login, unidades, documentos e tarefas descrevendo formato e obrigatoriedade.
  - **Dado** o README, **quando** o leio, **então** encontro descrição, tecnologias, arquitetura e instruções de execução.
- **Prioridade:** Must have

#### US-077 — Como desenvolvedor(a), quero entregar o projeto em um repositório público e organizado, com histórico de commits claro, para que seja avaliado e executado por outras pessoas.

- **Requisito de origem:** RNF-015
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o repositório, **quando** o acesso sem autenticação, **então** ele é público, com estrutura de pastas clara e mensagens de commit claras.
  - **Dado** a aplicação, **quando** sigo as instruções, **então** ela é executável localmente ou está publicada online.
- **Prioridade:** Must have

#### US-078 — Como usuário(a), quero que CPF, CNPJ, telefone e CEP tenham máscara e validação, para evitar erros de digitação.

- **Requisito de origem:** RNF-020
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** um CPF ou CNPJ com dígitos verificadores inválidos, telefone sem DDD, CEP sem 8 dígitos ou UF sem 2 letras, **quando** envio o formulário, **então** vejo o erro junto ao campo.
  - **Dado** esses campos, **quando** digito, **então** a máscara é aplicada e o valor é normalizado (somente dígitos) antes de ser enviado.
  - **Dado** uma senha com menos de 8 caracteres ou confirmação diferente, **quando** envio, **então** o formulário é recusado.
- **Prioridade:** Should have

#### US-079 — Como usuário(a), quero que meus dados pessoais sejam tratados com cuidado e que o aceite dos termos fique registrado, para ter segurança e transparência no uso do sistema.

- **Requisito de origem:** RNF-021
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o cadastro, **quando** aceito os Termos de Uso e a Política de Privacidade, **então** o aceite é registrado com data e hora.
  - **Dado** o sistema em funcionamento, **quando** inspeciono banco e logs, **então** nenhuma senha está em texto plano ou registrada.
  - **Dado** os ambientes de desenvolvimento (mocks e seed), **quando** os examino, **então** só há dados fictícios.
- **Prioridade:** Should have

---

### Épico 8 — Entregas Extras (Opcionais)

#### US-081 — Como administrador(a), quero que o sistema impeça a exclusão de unidades com pendências, para não perder o controle de documentos e tarefas em aberto.

- **Requisito de origem:** RF-016
- **Critérios de aceite (Definition of Done):**
  - **Dado** uma unidade com documentos pendentes (próximos do vencimento ou expirados) ou tarefas em andamento, **quando** tento excluí-la, **então** a exclusão é bloqueada (409) com mensagem explicando o motivo.
  - **Dado** uma unidade sem pendências, **quando** peço a exclusão e confirmo, **então** ela é excluída.
- **Prioridade:** Could have

#### US-082 — Como gestor(a), quero consultar o histórico de alterações de uma unidade, para saber quem alterou o quê e quando.

- **Requisito de origem:** RF-017
- **Critérios de aceite (Definition of Done):**
  - **Dado** uma alteração confirmada em unidade, documento ou tarefa, **quando** ela é gravada, **então** um registro com usuário, ação e data e hora é criado.
  - **Dado** o detalhamento da unidade, **quando** consulto o histórico, **então** vejo os eventos paginados, do mais recente ao mais antigo.
  - **Dado** a tela `/historico`, **quando** pesquiso ou filtro por unidade e por entidade (Unidade, Documento ou Tarefa), **então** a lista paginada, do mais recente ao mais antigo, é atualizada.
- **Prioridade:** Should have (elevada na v1.4: o frontend usa o histórico por unidade e o global)

#### US-083 — Como colaborador(a), quero alternar entre tema claro e escuro, para usar o sistema com maior conforto visual.

- **Requisito de origem:** RF-018
- **Critérios de aceite (Definition of Done):**
  - **Dado** o seletor de tema, **quando** alterno, **então** a interface muda de tema.
  - **Dado** que escolhi um tema, **quando** reabro o sistema, **então** a escolha é mantida.
  - **Dado** os dois temas, **quando** vejo os status, **então** o contraste é preservado.
- **Prioridade:** Could have

#### US-084 — Como desenvolvedor(a), quero definir nome da empresa, vocabulário e tipos de documento em um arquivo de configuração, para adaptar o sistema a outros ramos sem alterar a lógica.

- **Requisito de origem:** RNF-016
- **Critérios de aceite (Definition of Done):**
  - **Dado** o arquivo de configuração, **quando** altero nome da empresa, vocabulário e tipos de documento, **então** a interface reflete a troca sem mudança na lógica do sistema.
- **Prioridade:** Could have

#### US-085 — Como desenvolvedor(a), quero uma camada de API simulada com latência e erros de rede, para preparar a troca dos mocks por uma API real.

- **Requisito de origem:** RNF 017 (descartado na v1.3, sem equivalente no 03)
- **Critérios de aceite (Definition of Done):**
  - Descartada: a API real do Épico 12 substitui a camada simulada.
- **Prioridade:** Won't have

#### US-086 — Como desenvolvedor(a), quero testes automatizados das regras de negócio do frontend, para garantir que o status do documento e os bloqueios continuem corretos.

- **Requisito de origem:** RNF-018
- **Critérios de aceite (Definition of Done):**
  - **Dado** documentos com validade a mais de 15 dias, até 15 dias e vencida, **quando** o teste unitário roda, **então** os status "Válido", "Próximo do vencimento" e "Expirado" exibidos estão corretos.
  - **Dado** uma unidade inativa, **quando** o teste unitário roda, **então** os bloqueios de cadastro e edição são verificados.
- **Prioridade:** Could have

#### US-087 — Como desenvolvedor(a), quero publicar a aplicação (Vercel ou similar) com pipeline de build, para disponibilizá-la online de forma repetível.

- **Requisito de origem:** RNF 019 (substituído na v1.3 pelos RNF-029 e RNF-031)
- **Critérios de aceite (Definition of Done):**
  - Substituída pelas US-141 a US-149 (deploy completo na AWS com pipeline).
- **Prioridade:** Won't have

---

### Épico 11 — Banco de Dados (PostgreSQL)

#### US-111 — Como desenvolvedor(a), quero subir o PostgreSQL localmente com Docker, configurado por variáveis de ambiente, para desenvolver e testar a API sem instalar nem configurar o banco manualmente.

- **Requisito de origem:** RNF-022, RNF-028
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o docker-compose, **quando** o executo, **então** o PostgreSQL sobe com volume persistente.
  - **Dado** o repositório, **quando** o inspeciono, **então** a conexão é configurada por variáveis de ambiente, há um `.env.example` e nenhum segredo está versionado.
  - **Dado** o README, **quando** o sigo, **então** consigo subir, parar e reiniciar o banco do zero.
- **Prioridade:** Must have

#### US-112 — Como desenvolvedor(a), quero migrations Flyway para empresa e usuário, para criar o esquema de identidade de forma reproduzível e íntegra.

- **Requisito de origem:** RNF-022
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** um banco vazio, **quando** o Flyway aplica a V1, **então** a extensão de geração de UUID é habilitada.
  - **Dado** a V2, **quando** aplicada, **então** `empresa` é criada com CNPJ único e CHECK de 14 dígitos.
  - **Dado** a V3, **quando** aplicada, **então** `usuario` é criada com e-mail e CPF únicos, CHECK de papel, CPF e telefone e chave estrangeira RESTRICT para a empresa.
- **Prioridade:** Must have

#### US-113 — Como desenvolvedor(a), quero migrations Flyway para unidade, documento e tarefa, para persistir o domínio com as regras de integridade da Modelagem de Dados.

- **Requisito de origem:** RNF-022
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** a V4, **quando** aplicada, **então** `unidade` tem (empresa, código) único e CHECK de status, CEP e UF.
  - **Dado** a V5, **quando** aplicada, **então** `documento` tem data de validade obrigatória, CHECK de emissão não posterior à validade, dados do anexo e exclusão em cascata, e não tem coluna de status (derivado).
  - **Dado** a V6, **quando** aplicada, **então** `tarefa` tem prazo obrigatório, CHECK de status e data de conclusão coerente com o status.
- **Prioridade:** Must have

#### US-114 — Como desenvolvedor(a), quero uma migration para os códigos de verificação, para sustentar a recuperação de senha com segurança.

- **Requisito de origem:** RNF-022, RF-020
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** a V8, **quando** aplicada, **então** `codigo_verificacao` tem expiração, número de tentativas (nunca negativo) e marca de uso.
  - **Dado** a tabela, **quando** a inspeciono, **então** o código é guardado somente como hash.
  - **Dado** a chave estrangeira para o usuário, **quando** um usuário é removido, **então** seus códigos são removidos em cascata.
- **Prioridade:** Must have

#### US-115 — Como desenvolvedor(a), quero índices e consultas preparados para as listagens e indicadores, para que as telas respondam rápido mesmo com muitos registros.

- **Requisito de origem:** RNF-022, RNF-005, RF-002, RF-004, RF-008, RF-013, RF-024
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o esquema, **quando** o inspeciono, **então** há índices por empresa e por unidade, pela validade do documento e pelo status e prazo da tarefa.
  - **Dado** as listagens, **quando** uso busca, filtros, ordenação e paginação (página iniciada em 1), **então** as consultas respondem corretamente.
  - **Dado** os indicadores, **quando** peço o recálculo por uma data de referência anterior, **então** a consulta agregada funciona (RF-024).
- **Prioridade:** Should have

#### US-116 — Como desenvolvedor(a), quero um seed de desenvolvimento com os dados da FrotaSync, para demonstrar e testar todos os estados do sistema com um banco real.

- **Requisito de origem:** RNF-008, RNF-022, RNF-021
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o seed, **quando** executado, **então** cria a empresa FrotaSync, usuários colaborador, gestor e administrador com senhas em hash, unidades ativas e inativas com endereço estruturado, documentos e tarefas nos três status com anexos fictícios.
  - **Dado** o seed, **quando** executado, **então** inclui registros do mês anterior, para que a variação dos indicadores (US-023) apareça.
  - **Dado** o ambiente de produção, **quando** a aplicação sobe, **então** o seed não é executado e só há dados fictícios nos demais ambientes.
- **Prioridade:** Must have

#### US-117 — Como desenvolvedor(a), quero que o banco seja criado do zero apenas por migrations e rejeite dados inválidos, para confiar na integridade dos dados mesmo fora da API.

- **Requisito de origem:** RNF-022
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** um banco vazio, **quando** aplico as migrations, **então** o esquema completo é criado sem SQL manual.
  - **Dado** dados inválidos (CPF malformado, status fora do domínio, validade anterior à emissão, chave estrangeira inexistente), **quando** os insiro direto no banco, **então** constraints e chaves estrangeiras os rejeitam, o que é confirmado por testes.
- **Prioridade:** Must have

---

### Épico 12 — API e Backend (NestJS)

#### US-121 — Como desenvolvedor(a), quero uma API NestJS estruturada, configurável e documentada, para servir de base a todos os endpoints.

- **Requisito de origem:** RNF-023, RNF-003
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o projeto, **quando** o inspeciono, **então** usa NestJS com TypeScript, prefixo `/api/v1` e módulos, controllers e serviços.
  - **Dado** variáveis de ambiente ausentes ou inválidas, **quando** a API inicia, **então** a inicialização falha com mensagem clara.
  - **Dado** uma requisição com corpo inválido, **quando** ela chega, **então** o DTO é validado por schema Zod e o filtro global devolve o erro no formato padronizado (`ApiErrorResponse`).
  - **Dado** a API no ar, **quando** acesso a documentação, **então** o Swagger/OpenAPI está configurado; não há CORS, pois o frontend e a API ficam na mesma origem, atrás do Caddy.
- **Prioridade:** Must have

#### US-122 — Como usuário do sistema, quero me cadastrar com minha empresa, entrar e sair com uma sessão segura, para acessar os dados da minha empresa com segurança.

- **Requisito de origem:** RF-001, RF-019, RF-027, RNF-021, RNF-024
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** dados válidos, **quando** chamo `POST /auth/cadastro`, **então** a empresa e o administrador são criados na mesma transação e o aceite dos termos é gravado com data e hora.
  - **Dado** e-mail, CPF ou CNPJ já cadastrados, **quando** chamo o cadastro, **então** a API responde 409 indicando o campo.
  - **Dado** credenciais válidas, **quando** chamo `POST /auth/login`, **então** a senha é validada com bcrypt e recebo accessToken (15 minutos) e refreshToken (7 dias, ou 30 com "Lembre-me").
  - **Dado** um refreshToken válido, **quando** chamo `POST /auth/refresh`, **então** recebo um novo accessToken; **quando** chamo `POST /auth/logout`, **então** o refreshToken é invalidado, inclusive com o accessToken já expirado.
  - **Dado** o funcionamento da API, **quando** examino os logs, **então** senhas e tokens nunca aparecem.
- **Prioridade:** Must have

#### US-123 — Como administrador(a), quero que a API autorize cada requisição por perfil e isole os dados por empresa, para impedir acesso indevido mesmo quando alguém chama a API sem usar a interface.

- **Requisito de origem:** RNF-004, RNF-025
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** uma requisição sem token válido a rota protegida, **quando** ela chega, **então** a API responde 401.
  - **Dado** um perfil sem permissão para o endpoint (ex.: colaborador excluindo unidade), **quando** a requisição chega, **então** o RolesGuard responde 403.
  - **Dado** um recurso de outra empresa, **quando** o consulto ou altero, **então** a API responde 404, pois toda consulta é filtrada pela empresa do token.
  - **Dado** os testes de integração, **quando** tentam acessar dados de outra empresa, **então** confirmam o bloqueio.
- **Prioridade:** Must have

#### US-124 — Como usuário(a) que esqueceu a senha, quero receber um código por e-mail e redefinir minha senha pela API, para recuperar o acesso com segurança.

- **Requisito de origem:** RF-020
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** qualquer e-mail, existente ou não, **quando** chamo `POST /auth/recuperar-senha`, **então** a API responde sempre 202 com a mesma mensagem.
  - **Dado** o código de 5 dígitos, **quando** ele é gerado, **então** expira (10 minutos), tem limite de tentativas (5) e só pode ser usado uma vez; excedido o limite, a API responde 429.
  - **Dado** o código correto, **quando** chamo `POST /auth/verificar-codigo`, **então** recebo um `token` de uso único; com ele, `POST /auth/redefinir-senha` grava a nova senha (mínimo de 8 caracteres) e responde 204.
  - **Dado** o ambiente, **quando** o código é enviado, **então** o e-mail é registrado no console em desenvolvimento e enviado pelo Amazon SES no ambiente publicado.
- **Prioridade:** Should have

#### US-125 — Como colaborador(a) e administrador(a), quero gerenciar unidades pela API, com as regras de unidade ativa e inativa aplicadas no servidor, para manter a base consistente.

- **Requisito de origem:** RF-004, RF-005, RF-006, RF-007, RF-021, RNF-024
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** `GET /unidades`, **quando** consulto, **então** recebo busca, filtro de status, paginação e os totais de documentos e de tarefas de cada unidade.
  - **Dado** um administrador, **quando** cadastro, edito ou altero o status (`PATCH`) de uma unidade, **então** a operação é feita; a unidade nasce ativa e código repetido resulta em 409.
  - **Dado** o bloqueio de unidade inativa, **quando** documentos ou tarefas são escritos, **então** a regra fica em um único ponto reutilizado por ambos (RF-007).
  - **Dado** `GET /enderecos/cep/{cep}`, **quando** consulto um CEP, **então** o backend consulta um serviço público e responde 404 se o CEP não for encontrado.
- **Prioridade:** Must have

#### US-126 — Como colaborador(a), quero cadastrar, editar, consultar e baixar documentos e anexos pela API, para manter o controle de validade com os arquivos guardados com segurança.

- **Requisito de origem:** RF-008, RF-009, RF-010, RF-011, RF-022, RF-026, RNF-026
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** as listas global e por unidade, **quando** as consulto, **então** há busca, filtros e paginação.
  - **Dado** o cadastro ou a edição em multipart, **quando** envio sem novo arquivo na edição, **então** o anexo atual é preservado.
  - **Dado** o corpo da requisição, **quando** o cliente envia o status, **então** a API o rejeita; o status é calculado no backend.
  - **Dado** um arquivo PDF, JPG ou PNG de até 10 MB, **quando** envio, **então** é aceito; se maior responde 413 e se de outro tipo, 415.
  - **Dado** `GET /documentos/{id}/anexo`, **quando** um usuário autorizado da empresa pede o arquivo, **então** o download é entregue; o armazenamento fica atrás de uma interface (disco ou MinIO local, S3 na nuvem).
  - **Dado** um gestor, **quando** exclui um documento, **então** o registro e o arquivo são removidos.
- **Prioridade:** Must have

#### US-127 — Como colaborador(a), quero cadastrar, editar e alterar o status de tarefas pela API, para acompanhar o trabalho com datas e estados coerentes entre frontend, API e banco.

- **Requisito de origem:** RF-012, RF-013, RF-014, RF-015, RF-023, RNF-024
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** as listas global e por unidade, **quando** as consulto, **então** há busca, filtros e paginação.
  - **Dado** um cadastro, **quando** envio título, descrição e prazo, **então** a tarefa nasce pendente, com início igual à data do cadastro e prazo obrigatório.
  - **Dado** a edição e o `PATCH` de status, **quando** os uso, **então** a edição altera título, descrição e prazo e o `PATCH` altera o status.
  - **Dado** que concluo a tarefa, **quando** a API a grava, **então** registra data e hora de conclusão; ao sair de concluída, a data é limpa.
  - **Dado** uma unidade inativa, **quando** tento escrever, **então** a API bloqueia (409); a exclusão (gestor) está disponível.
- **Prioridade:** Must have

#### US-128 — Como gestor(a), quero indicadores calculados pelo servidor, com a variação em relação ao período anterior, para ter uma visão confiável que não depende de totais enviados pelo navegador.

- **Requisito de origem:** RF-002, RF-003, RF-024, RNF-024
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** `GET /dashboard/indicadores` e `GET /unidades/{id}/indicadores`, **quando** consulto, **então** as respostas seguem o envelope do Design de API.
  - **Dado** os indicadores, **quando** calculados, **então** o total de pendências é calculado no servidor.
  - **Dado** a variação, **quando** calculada, **então** usa o mês anterior como referência; se o valor anterior for zero, o percentual é nulo.
  - **Dado** que não há dados, **quando** consulto, **então** os indicadores retornam zero, sem erro.
- **Prioridade:** Must have

#### US-129 — Como desenvolvedor(a), quero testes automatizados da API, para garantir que regras de negócio, segurança e contratos continuem corretos após mudanças.

- **Requisito de origem:** RNF-033, RNF-003
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** a suíte unitária, **quando** roda, **então** cobre o status do documento, as transições da tarefa e o bloqueio de unidade inativa.
  - **Dado** a suíte de integração com banco de teste, **quando** roda, **então** cobre autenticação, isolamento por empresa e CRUD de unidades, documentos e tarefas.
  - **Dado** os testes de upload, **quando** rodam, **então** verificam os erros 413 e 415 e a consistência entre arquivo e metadados.
  - **Dado** a documentação OpenAPI, **quando** comparada às respostas reais, **então** confere.
- **Prioridade:** Must have

---

### Épico 13 — Integração Frontend ↔ API

#### US-131 — Como desenvolvedor(a), quero um cliente HTTP tipado com sessão real, para que todas as telas conversem com a API de forma consistente e segura.

- **Requisito de origem:** RNF-027, RNF-004
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o cliente HTTP, **quando** faço uma requisição, **então** a URL base vem de variável de ambiente e o token de acesso é enviado automaticamente.
  - **Dado** uma resposta 401, **quando** o token expirou, **então** a sessão é renovada de forma transparente; se a renovação falhar, vou para `/login`.
  - **Dado** a decisão sobre onde guardar os tokens (Pendência 8), **quando** concluída, **então** fica registrada e a proteção de rotas (US-012) valida a sessão real.
  - **Dado** respostas 403, 404, 409, 413, 415 ou 429, **quando** chegam, **então** cada uma tem tratamento e mensagem adequados.
- **Prioridade:** Must have

#### US-132 — Como usuário do sistema, quero entrar, me cadastrar, recuperar a senha e sair usando a API, para que meu acesso seja real e persistido.

- **Requisito de origem:** RF-001, RF-019, RF-020, RF-027, RNF-027
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** as telas de login (com "Lembre-me"), cadastro em 3 etapas e recuperação em 3 passos, **quando** as uso, **então** todas chamam a API.
  - **Dado** o logout, **quando** clico em sair, **então** `POST /auth/logout` é chamado e sou levado a `/login`.
  - **Dado** erros do servidor (e-mail, CPF ou CNPJ já cadastrados), **quando** a API responde 409, **então** o erro aparece junto ao campo.
- **Prioridade:** Must have

#### US-133 — Como colaborador(a), quero que as telas de unidades usem a API, para que cadastros, edições e mudanças de status sejam persistidos.

- **Requisito de origem:** RF-004, RF-005, RF-006, RF-021, RNF-027
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** as telas de unidades, **quando** listo, detalho, cadastro, edito ou ativo/inativo, **então** todas as operações usam a API.
  - **Dado** o formulário, **quando** clico em "Buscar CEP", **então** é usado o endpoint do backend.
  - **Dado** uma alteração confirmada, **quando** ela conclui, **então** listagem, cards e Dashboard são atualizados.
- **Prioridade:** Must have

#### US-134 — Como colaborador(a), quero que as telas de documentos usem a API, para que documentos e anexos sejam persistidos e consultáveis.

- **Requisito de origem:** RF-008, RF-009, RF-010, RF-022, RF-026, RNF-027
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** as listas global e por unidade, o cadastro e a edição (multipart), **quando** as uso, **então** todas chamam a API.
  - **Dado** um documento com anexo, **quando** um usuário autorizado pede o download, **então** o arquivo é baixado.
  - **Dado** a lista, **quando** exibe o status, **então** é o status devolvido pela API.
- **Prioridade:** Must have

#### US-135 — Como colaborador(a), quero que as telas de tarefas usem a API, para que o andamento das tarefas seja persistido.

- **Requisito de origem:** RF-012, RF-013, RF-014, RF-015, RF-023, RNF-027
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** as listas global e por unidade, o cadastro e a edição, **quando** as uso, **então** todas chamam a API.
  - **Dado** a mudança de status, **quando** seleciono "Concluída", **então** o modal "Concluir tarefa?" é mantido e, ao confirmar, listas e Dashboard são atualizados.
- **Prioridade:** Must have

#### US-136 — Como gestor(a), quero que o Dashboard use os indicadores da API, para ver a situação real da empresa.

- **Requisito de origem:** RF-002, RF-003, RF-024, RNF-027
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o Dashboard e o detalhamento da unidade, **quando** carregam, **então** os indicadores globais e por unidade, com a variação, vêm da API.
  - **Dado** uma alteração em unidade, documento ou tarefa, **quando** ela é confirmada, **então** a invalidação de cache (US-022) atualiza o total de pendências sem recarregar a página.
- **Prioridade:** Must have

#### US-137 — Como desenvolvedor(a), quero remover a dependência dos mocks e validar os fluxos de ponta a ponta, para garantir que o sistema funciona com a API e o banco reais.

- **Requisito de origem:** RNF-027, RNF-009, RNF-003
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o frontend, **quando** executo qualquer operação de negócio, **então** nenhuma depende dos mocks.
  - **Dado** a API real, **quando** a consulta falha ou retorna vazio, **então** carregamento, erro com nova tentativa e lista vazia (US-071) continuam funcionando.
  - **Dado** os fluxos principais, **quando** são executados de ponta a ponta com banco real, **então** seguem um roteiro registrado e o README é atualizado com a nova arquitetura e instruções.
- **Prioridade:** Must have

---

### Épico 14 — Infraestrutura e Cloud (Docker, Terraform, AWS, CI/CD)

#### US-141 — Como desenvolvedor(a), quero executar frontend, API e banco em contêineres localmente, para desenvolver e testar sem configurações manuais inconsistentes.

- **Requisito de origem:** RNF-028
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** frontend e API, **quando** construo as imagens, **então** cada um usa Dockerfile multi-stage, há `.dockerignore` e nenhuma credencial entra nas imagens.
  - **Dado** o docker-compose, **quando** o executo, **então** sobem frontend, API e PostgreSQL com healthchecks e ordem de inicialização, e as migrations Flyway rodam na subida.
  - **Dado** o README, **quando** o sigo, **então** consigo subir, ver logs, parar e reiniciar o ambiente.
- **Prioridade:** Must have

#### US-142 — Como responsável pela operação, quero uma base de Terraform organizada, para provisionar e recriar a infraestrutura de forma controlada.

- **Requisito de origem:** RNF-029
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o código Terraform, **quando** o reviso, **então** há módulos, variáveis, convenção de nomes e tags definidos, e o estado remoto em S3 com bloqueio.
  - **Dado** o código, **quando** rodo `terraform fmt` e `validate`, **então** passam e nenhum segredo está versionado.
  - **Dado** a documentação, **quando** a sigo, **então** consigo criar e destruir o ambiente.
- **Prioridade:** Must have

#### US-143 — Como responsável pela operação, quero a rede e o banco provisionados na AWS, para que a API use um PostgreSQL gerenciado e protegido.

- **Requisito de origem:** RNF-029, RNF-032
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o provisionamento, **quando** aplicado, **então** VPC, sub-redes e security groups são criados com acesso mínimo.
  - **Dado** o RDS PostgreSQL, **quando** tento acessá-lo, **então** ele está em sub-rede privada e acessível apenas pela API.
  - **Dado** o banco, **quando** o inspeciono, **então** o backup automático está habilitado.
- **Prioridade:** Must have

#### US-144 — Como usuário autorizado, quero que os anexos dos documentos fiquem guardados com segurança, para consultá-los sem expô-los publicamente.

- **Requisito de origem:** RNF-026, RNF-029
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o bucket S3, **quando** o inspeciono, **então** é privado, sem acesso público e com criptografia.
  - **Dado** a API, **quando** acessa o bucket, **então** recebe apenas as permissões IAM mínimas para ler e gravar os anexos.
  - **Dado** um usuário não autorizado, **quando** tenta baixar um anexo, **então** o acesso é negado.
- **Prioridade:** Must have

#### US-145 — Como responsável pela operação, quero os contêineres de frontend e API em execução na AWS com HTTPS, para disponibilizar o sistema online.

- **Requisito de origem:** RNF-029
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o ECR, **quando** o consulto, **então** há repositórios para as imagens de frontend e de API.
  - **Dado** a plataforma de execução definida (ECS Fargate ou alternativa de menor custo, Pendência 6), **quando** o serviço sobe, **então** frontend e API rodam com health checks e variáveis de ambiente por serviço.
  - **Dado** o acesso externo, **quando** acesso o sistema, **então** ele é feito por HTTPS.
- **Prioridade:** Must have

#### US-146 — Como responsável pela operação, quero segredos e configurações gerenciados com segurança, para que credenciais nunca fiquem expostas.

- **Requisito de origem:** RNF-030
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** credenciais do banco e segredos de token, **quando** os procuro, **então** estão no Secrets Manager ou no SSM Parameter Store.
  - **Dado** os serviços, **quando** acessam os segredos, **então** usam permissões IAM, sem chaves fixas.
  - **Dado** os logs, **quando** os examino, **então** não há senhas, tokens nem dados pessoais desnecessários.
- **Prioridade:** Must have

#### US-147 — Como desenvolvedor(a), quero verificações automáticas a cada alteração no GitHub Actions, para detectar erros antes de publicar.

- **Requisito de origem:** RNF-031
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** um pull request no frontend, **quando** a pipeline roda, **então** executa lint, verificação de tipos e build.
  - **Dado** um pull request na API, **quando** a pipeline roda, **então** executa lint, build e testes com um PostgreSQL de serviço.
  - **Dado** um pull request, **quando** a pipeline roda, **então** constrói as imagens Docker; em alterações de infraestrutura, roda `terraform fmt`, `validate` e `plan`.
- **Prioridade:** Must have

#### US-148 — Como responsável pela operação, quero um deploy automatizado para a AWS, para publicar versões de forma repetível e segura.

- **Requisito de origem:** RNF-031
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** o GitHub, **quando** faz deploy, **então** se autentica na AWS por OIDC, sem chaves de longa duração.
  - **Dado** a branch principal, **quando** recebe um merge, **então** as imagens vão ao ECR e o deploy é feito no ECS, com as migrations rodando antes da nova versão da API.
  - **Dado** o deploy para produção, **quando** disparado, **então** exige aprovação manual e o rollback está documentado.
- **Prioridade:** Must have

#### US-149 — Como responsável pela operação, quero validar o sistema publicado e acompanhar sua saúde, para ter confiança de que ele funciona e pode ser recuperado após falhas.

- **Requisito de origem:** RNF-032, RNF-029
- **Dor/oportunidade da jornada (02):** a definir (Pendência 1)
- **Critérios de aceite (Definition of Done):**
  - **Dado** um deploy concluído, **quando** o teste de fumaça roda, **então** valida login, isolamento entre empresas e envio e download de anexo no ambiente remoto.
  - **Dado** o ambiente publicado, **quando** o examino, **então** os logs ficam no CloudWatch e há ao menos um alarme de indisponibilidade.
  - **Dado** um backup do banco, **quando** o restauro, **então** a restauração foi testada ao menos uma vez.
  - **Dado** o README, **quando** o leio, **então** traz a URL, o diagrama de arquitetura e o passo a passo de deploy.
- **Prioridade:** Must have

---

## Backlog Priorizado

A tabela abaixo consolida todas as estórias já priorizadas pelo critério MoSCoW, prontas para alimentar o Product Backlog do Scrum (sprints) ou as colunas de um quadro Kanban (ex.: "Must have" e "Should have" primeiro, seguidos de "Could have"). Dentro de cada prioridade, as estórias seguem a ordem dos IDs.

| ID | Estória | Persona | Requisito | Prioridade (MoSCoW) |
| :-- | :-- | :-- | :-- | :-- |
| **US-011** | Login com e-mail, senha e "Lembre-me" | P-01, P-02, P-03 | RF-001 | Must have |
| **US-012** | Proteção obrigatória de rotas | P-03 | RNF-004 | Must have |
| **US-021** | Dashboard Global com indicadores por status | P-02 | RF-002 | Must have |
| **US-022** | Atualização automática das pendências | P-02 | RF-003 | Must have |
| **US-031** | Listagem de unidades em cards, com busca, filtro e paginação | P-01 | RF-004 | Must have |
| **US-032** | Detalhamento da unidade | P-01 | RF-006 | Must have |
| **US-033** | Bloqueio de registros e edições em unidades inativas | P-03 | RF-007, RNF-024 | Must have |
| **US-034** | Cadastro e edição de unidade | P-03 | RF-005 | Must have |
| **US-035** | Ativação e inativação de unidade com confirmação | P-03 | RF-021 | Must have |
| **US-041** | Lista global de documentos | P-02 | RF-008 | Must have |
| **US-042** | Documentos por unidade | P-01 | RF-010 | Must have |
| **US-043** | Cálculo automático do status do documento | P-01 | RF-011, RNF-007, RNF-024 | Must have |
| **US-044** | Cadastro de documento | P-01 | RF-009 | Must have |
| **US-051** | Tarefas por unidade com status, datas e prazo | P-01 | RF-012 | Must have |
| **US-052** | Confirmação ao concluir tarefa | P-01 | RF-015 | Must have |
| **US-053** | Lista global de tarefas | P-02 | RF-013 | Must have |
| **US-054** | Cadastro de tarefa | P-01 | RF-014 | Must have |
| **US-061** | Massa de dados mockados | P-05 | RNF-008 | Must have |
| **US-071** | Loading, erro e estado vazio | P-01 | RNF-009 | Must have |
| **US-072** | Responsividade e desempenho | P-01 | RNF-005, RNF-006 | Must have |
| **US-073** | Acessibilidade básica | P-01 | RNF-013 | Must have |
| **US-074** | Código tipado e componentizado | P-05 | RNF-001, RNF-002, RNF-010, RNF-011, RNF-012 | Must have |
| **US-075** | Consistência visual (design system) | P-05 | RNF-014 | Must have |
| **US-076** | Schemas Zod e README | P-05 | RNF-003 | Must have |
| **US-077** | Repositório e entrega | P-05 | RNF-015 | Must have |
| **US-111** | Ambiente local do PostgreSQL com Docker | P-05 | RNF-022, RNF-028 | Must have |
| **US-112** | Migrations: empresa e usuário | P-05 | RNF-022 | Must have |
| **US-113** | Migrations: unidade, documento e tarefa | P-05 | RNF-022 | Must have |
| **US-114** | Migration dos códigos de verificação | P-05 | RNF-022, RF-020 | Must have |
| **US-116** | Seed de desenvolvimento FrotaSync | P-05 | RNF-008, RNF-021, RNF-022 | Must have |
| **US-117** | Banco reproduzível e íntegro | P-05 | RNF-022 | Must have |
| **US-121** | Estrutura base da API NestJS | P-05 | RNF-023, RNF-003 | Must have |
| **US-122** | Cadastro, login e sessão na API | P-01, P-02, P-03 | RF-001, RF-019, RF-027, RNF-021, RNF-024 | Must have |
| **US-123** | Autorização por perfil e isolamento por empresa | P-03 | RNF-004, RNF-025 | Must have |
| **US-125** | API de unidades | P-01, P-03 | RF-004, RF-005, RF-006, RF-007, RF-021, RNF-024 | Must have |
| **US-126** | API de documentos e anexos | P-01 | RF-008, RF-009, RF-010, RF-011, RF-022, RF-026, RNF-026 | Must have |
| **US-127** | API de tarefas | P-01 | RF-012, RF-013, RF-014, RF-015, RF-023, RNF-024 | Must have |
| **US-128** | API de indicadores do Dashboard | P-02 | RF-002, RF-003, RF-024, RNF-024 | Must have |
| **US-129** | Testes automatizados da API | P-05 | RNF-033, RNF-003 | Must have |
| **US-131** | Cliente HTTP tipado e sessão real | P-05 | RNF-027, RNF-004 | Must have |
| **US-132** | Integração da autenticação | P-01, P-02, P-03 | RF-001, RF-019, RF-020, RF-027, RNF-027 | Must have |
| **US-133** | Integração de unidades | P-01 | RF-004, RF-005, RF-006, RF-021, RNF-027 | Must have |
| **US-134** | Integração de documentos | P-01 | RF-008, RF-009, RF-010, RF-022, RF-026, RNF-027 | Must have |
| **US-135** | Integração de tarefas | P-01 | RF-012, RF-013, RF-014, RF-015, RF-023, RNF-027 | Must have |
| **US-136** | Integração do Dashboard | P-02 | RF-002, RF-003, RF-024, RNF-027 | Must have |
| **US-137** | Remoção dos mocks e validação ponta a ponta | P-05 | RNF-027, RNF-009, RNF-003 | Must have |
| **US-141** | Contêineres e ambiente local | P-05 | RNF-028 | Must have |
| **US-142** | Base do Terraform | P-06 | RNF-029 | Must have |
| **US-143** | Rede e banco na AWS | P-06 | RNF-029, RNF-032 | Must have |
| **US-144** | Armazenamento de anexos (S3) | P-01, P-02, P-03 | RNF-026, RNF-029 | Must have |
| **US-145** | Contêineres em execução na AWS com HTTPS | P-06 | RNF-029 | Must have |
| **US-146** | Segredos e configuração | P-06 | RNF-030 | Must have |
| **US-147** | CI no GitHub Actions | P-05 | RNF-031 | Must have |
| **US-148** | CD para a AWS | P-06 | RNF-031 | Must have |
| **US-149** | Validação final e operação | P-06 | RNF-032, RNF-029 | Must have |
| **US-013** | Cadastro de usuário e empresa em 3 etapas | P-04 | RF-019, RNF-020, RNF-021 | Should have |
| **US-014** | Recuperação de senha por código | P-04 | RF-020 | Should have |
| **US-023** | Variação dos indicadores | P-02 | RF-024 | Should have |
| **US-024** | Navegação principal e breadcrumbs | P-01, P-02, P-03 | RF-025 | Should have |
| **US-045** | Edição de documento | P-01 | RF-022 | Should have |
| **US-055** | Edição de tarefa | P-01 | RF-023 | Should have |
| **US-078** | Validação e máscaras de campos | P-04 | RNF-020 | Should have |
| **US-079** | Proteção de dados pessoais e aceite de termos | P-04 | RNF-021 | Should have |
| **US-082** | Histórico de alterações (unidade e global) | P-02 | RF-017 | Should have |
| **US-115** | Índices e consultas para listagens e indicadores | P-05 | RNF-022, RNF-005, RF-002, RF-004, RF-008, RF-013, RF-024 | Should have |
| **US-124** | Recuperação de senha na API | P-04 | RF-020 | Should have |
| **US-081** | Bloqueio de exclusão de unidade com pendências | P-03 | RF-016 | Could have |
| **US-083** | Tema claro/escuro | P-01 | RF-018 | Could have |
| **US-084** | Adaptabilidade a diferentes empresas | P-05 | RNF-016 | Could have |
| **US-086** | Testes automatizados do frontend | P-05 | RNF-018 | Could have |
| **US-085** | Camada de API simulada (descartada na v1.3) | P-05 | RNF 017 (descartado) | Won't have |
| **US-087** | Deploy com pipeline de build (substituída pelas US-141 a US-149) | P-05 | RNF 019 (substituído) | Won't have |

---

## Matriz de Rastreabilidade (única)

Esta é a **única** matriz do projeto. Os documentos 07, 09 e 08\_1 apenas fornecem os valores das suas colunas e não mantêm matriz própria.

Liga cada estória ao requisito de origem, à tela, ao endpoint e ao teste que a valida. É preenchida de forma progressiva:

| Coluna | Preenchida em | Como |
| :-- | :-- | :-- |
| Estória e Requisito | este documento (04) | direto |
| Endpoint (API) | Design de API (07) | cada endpoint cita a estória que o exige; aqui, já preenchido com a Design de API v1.3 |
| Tela (UX) | Especificação de UX (08\_1) | IDs `UI-NN` do inventário de telas; enquanto não existem, a coluna traz a rota do mapa de telas da Análise de Requisitos anterior (Apêndice A) |
| Teste | Estratégia de Testes (09) e implementação | no 09, os IDs dos casos de teste planejados; na implementação, o nome real do arquivo/teste |

Toda estória *Must have* deve ter todas as colunas preenchidas antes do deploy em produção. Um traço (—) indica lacuna a resolver ou coluna que não se aplica à estória (ex.: estórias de infraestrutura não têm tela nem endpoint).

| Estória | Requisito | Tela (UX) | Endpoint (API) | Teste (unitário / integração / E2E) |
| :-- | :-- | :-- | :-- | :-- |
| **US-011** | RF-001 | `/login` (UI-NN a definir) | POST /auth/login | — |
| **US-012** | RNF-004 | todas as rotas protegidas | AuthGuard JWT em todos os endpoints protegidos (401) | — |
| **US-013** | RF-019, RNF-020, RNF-021 | `/cadastro` | POST /auth/cadastro | — |
| **US-014** | RF-020 | `/recuperar-senha` | POST /auth/recuperar-senha, POST /auth/verificar-codigo, POST /auth/redefinir-senha | — |
| **US-021** | RF-002 | `/dashboard` | GET /dashboard/indicadores | — |
| **US-022** | RF-003 | `/dashboard` | GET /dashboard/indicadores (invalidação de cache após escritas) | — |
| **US-023** | RF-024 | `/documentos`, `/tarefas`, `/unidades/[id]` | GET /dashboard/indicadores, GET /unidades/{id}/indicadores | — |
| **US-024** | RF-025 | layout das telas autenticadas | GET /auth/me, GET /notificacoes | — |
| **US-031** | RF-004 | `/unidades` | GET /unidades | — |
| **US-032** | RF-006 | `/unidades/[id]` | GET /unidades/{id}, GET /unidades/{id}/indicadores | — |
| **US-033** | RF-007, RNF-024 | `/unidades/[id]`, formulários de documento e tarefa | POST/PUT em documentos e tarefas (409 em unidade inativa), PATCH /tarefas/{id}/status | — |
| **US-034** | RF-005 | `/unidades/nova`, `/unidades/[id]/editar` | POST /unidades, PUT /unidades/{id}, GET /enderecos/cep/{cep} | — |
| **US-035** | RF-021 | `/unidades/[id]` | PATCH /unidades/{id}/status | — |
| **US-041** | RF-008 | `/documentos` | GET /documentos, GET /documentos/categorias | — |
| **US-042** | RF-010 | `/unidades/[id]` (aba Documentos) | GET /unidades/{unidadeId}/documentos | — |
| **US-043** | RF-011, RNF-007, RNF-024 | listas de documentos | GET /documentos, GET /documentos/{id} | — |
| **US-044** | RF-009 | `/documentos/novo`, `/unidades/[id]/documentos/novo` | POST /unidades/{unidadeId}/documentos, GET /documentos/categorias | — |
| **US-045** | RF-022 | `/documentos/[id]/editar`, `/unidades/[id]/documentos/[docId]/editar` | PUT /documentos/{id}, GET /documentos/categorias | — |
| **US-051** | RF-012 | `/unidades/[id]` (aba Tarefas) | GET /unidades/{unidadeId}/tarefas | — |
| **US-052** | RF-015 | `/tarefas`, `/unidades/[id]` | PATCH /tarefas/{id}/status | — |
| **US-053** | RF-013 | `/tarefas` | GET /tarefas | — |
| **US-054** | RF-014 | `/tarefas/nova`, `/unidades/[id]/tarefas/nova` | POST /unidades/{unidadeId}/tarefas | — |
| **US-055** | RF-023 | `/tarefas/[id]/editar`, `/unidades/[id]/tarefas/[tarefaId]/editar` | PUT /tarefas/{id} | — |
| **US-061** | RNF-008 | — | — | — |
| **US-071** | RNF-009 | todas as telas com dados | — | — |
| **US-072** | RNF-005, RNF-006 | todas as telas | — | — |
| **US-073** | RNF-013 | todas as telas | — | — |
| **US-074** | RNF-001, RNF-002, RNF-010, RNF-011, RNF-012 | — | — | — |
| **US-075** | RNF-014 | todas as telas | — | — |
| **US-076** | RNF-003 | — | documentação Swagger/OpenAPI | — |
| **US-077** | RNF-015 | — | — | — |
| **US-078** | RNF-020 | `/cadastro`, `/unidades/nova` | POST /auth/cadastro, POST /unidades (validação) | — |
| **US-079** | RNF-021 | `/cadastro` | POST /auth/cadastro | — |
| **US-081** | RF-016 | `/unidades/[id]` | DELETE /unidades/{id} | — |
| **US-082** | RF-017 | `/unidades/[id]/historico`, `/historico` | GET /unidades/{id}/historico, GET /historico | — |
| **US-083** | RF-018 | seletor de tema | — | — |
| **US-084** | RNF-016 | — | — | — |
| **US-085** | RNF 017 (descartado) | — | — | — |
| **US-086** | RNF-018 | — | — | — |
| **US-087** | RNF 019 (substituído) | — | — | — |
| **US-111** | RNF-022, RNF-028 | — | — | — |
| **US-112** | RNF-022 | — | — | — |
| **US-113** | RNF-022 | — | — | — |
| **US-114** | RNF-022, RF-020 | — | — | — |
| **US-115** | RNF-022, RNF-005 | — | GET /unidades, GET /documentos, GET /tarefas, GET /dashboard/indicadores | — |
| **US-116** | RNF-008, RNF-021, RNF-022 | — | — | — |
| **US-117** | RNF-022 | — | — | — |
| **US-121** | RNF-023, RNF-003 | — | prefixo /api/v1, Swagger/OpenAPI | — |
| **US-122** | RF-001, RF-019, RF-027, RNF-021, RNF-024 | `/login`, `/cadastro` | POST /auth/cadastro, POST /auth/login, POST /auth/refresh, POST /auth/logout | — |
| **US-123** | RNF-004, RNF-025 | — | todos os endpoints protegidos (401, 403, 404) | — |
| **US-124** | RF-020 | `/recuperar-senha` | POST /auth/recuperar-senha, POST /auth/verificar-codigo, POST /auth/redefinir-senha | — |
| **US-125** | RF-004, RF-005, RF-006, RF-007, RF-021, RNF-024 | `/unidades`, `/unidades/nova`, `/unidades/[id]` | GET /unidades, GET /unidades/{id}, POST /unidades, PUT /unidades/{id}, PATCH /unidades/{id}/status, GET /enderecos/cep/{cep} | — |
| **US-126** | RF-008, RF-009, RF-010, RF-011, RF-022, RF-026, RNF-026 | `/documentos`, formulários de documento | GET /documentos, GET /unidades/{unidadeId}/documentos, GET /documentos/{id}, GET /documentos/{id}/anexo, POST /unidades/{unidadeId}/documentos, PUT /documentos/{id}, DELETE /documentos/{id}, GET /documentos/categorias | — |
| **US-127** | RF-012, RF-013, RF-014, RF-015, RF-023, RNF-024 | `/tarefas`, formulários de tarefa | GET /tarefas, GET /unidades/{unidadeId}/tarefas, GET /tarefas/{id}, POST /unidades/{unidadeId}/tarefas, PUT /tarefas/{id}, PATCH /tarefas/{id}/status, DELETE /tarefas/{id} | — |
| **US-128** | RF-002, RF-003, RF-024, RNF-024 | `/dashboard`, `/unidades/[id]` | GET /dashboard/indicadores, GET /unidades/{id}/indicadores | — |
| **US-129** | RNF-033, RNF-003 | — | — | — |
| **US-131** | RNF-027, RNF-004 | todas as telas | — | — |
| **US-132** | RF-001, RF-019, RF-020, RF-027, RNF-027 | `/login`, `/cadastro`, `/recuperar-senha`, ação de sair | endpoints de /auth | — |
| **US-133** | RF-004, RF-005, RF-006, RF-021, RNF-027 | `/unidades`, `/unidades/nova`, `/unidades/[id]` | endpoints de unidades e CEP | — |
| **US-134** | RF-008, RF-009, RF-010, RF-022, RF-026, RNF-027 | `/documentos` e formulários | endpoints de documentos | — |
| **US-135** | RF-012, RF-013, RF-014, RF-015, RF-023, RNF-027 | `/tarefas` e formulários | endpoints de tarefas | — |
| **US-136** | RF-002, RF-003, RF-024, RNF-027 | `/dashboard`, `/unidades/[id]` | endpoints de indicadores | — |
| **US-137** | RNF-027, RNF-009, RNF-003 | todas as telas | todos os endpoints | — |
| **US-141** | RNF-028 | — | — | — |
| **US-142** | RNF-029 | — | — | — |
| **US-143** | RNF-029, RNF-032 | — | — | — |
| **US-144** | RNF-026, RNF-029 | — | GET /documentos/{id}/anexo | — |
| **US-145** | RNF-029 | — | — | — |
| **US-146** | RNF-030 | — | — | — |
| **US-147** | RNF-031 | — | — | — |
| **US-148** | RNF-031 | — | — | — |
| **US-149** | RNF-032, RNF-029 | — | GET /health | — |

---

## Como usar este backlog

- **No Scrum:** priorize as estórias "Must have" para a(s) primeira(s) sprint(s), seguidas pelas "Should have"; as "Could have" entram conforme a capacidade do time. Sugestão: Épicos 1 a 3 e 6 e as estórias de qualidade do Épico 7 primeiro, seguidos dos Épicos 4 e 5; as "Should have" de cada épico entram depois das "Must have" do mesmo épico.
- **No Kanban:** use as prioridades para ordenar o topo da coluna "To Do"; estórias "Must have" sobem para o topo e são puxadas primeiro para "Em andamento".
- **Na evolução fullstack (Épicos 11 a 14):** US-111 a 113, 141 e 142 podem começar em paralelo; depois US-114, 116 e 117 e a US-121; em seguida US-122 e 123, e então US-124 a 128 e a US-129. A integração (US-131 a 137) avança por domínio, cada uma depois do endpoint correspondente. US-143 a 146 podem andar em paralelo à API; US-147 e 148 vêm depois dos testes da API e da execução na AWS (US-145); a US-149 fecha a entrega.
- **Nos testes:** cada critério *Dado / Quando / Então* é convertido em um caso de teste na Estratégia de Testes (09), conectando o backlog ao ciclo de TDD.

---

## Pendências

1. **Personas & Jornadas (02) e Brief (01) não fornecidos:** o campo "Dor/oportunidade da jornada (02)" está "a definir" em todas as estórias, mas é obrigatório nas *Must have*; as personas P-01 a P-06 são provisórias, derivadas da Análise de Requisitos.
2. **IDs `UI-NN` do inventário de telas (08\_1):** ainda não existem; a coluna Tela da matriz usa as rotas do mapa de telas.
3. **IDs de casos de teste (09):** a coluna Teste da matriz está vazia até a Estratégia de Testes ser escrita.
4. **Persona das estórias gerais:** onde a estória original dizia "usuário do sistema" ou "usuário autorizado" (US-011, 122, 132 e 144), foram atribuídas P-01, P-02 e P-03; confirmar.
5. **Escopo *Won't have*:** a seção de fora de escopo do Brief (01 §4) não foi fornecida; aqui constam apenas US-085 e US-087 e, por decisão da análise, o controle de documentos por veículo e por motorista.
6. **Plataforma de execução na AWS (US-145):** definir ECS Fargate ou uma instância EC2 com Docker Compose, considerando custo (balanceador, NAT Gateway e Fargate ficam fora do nível gratuito).
7. **Número de ambientes (US-142, US-148):** assumido um único ambiente (produção); confirmar.
8. **Armazenamento dos tokens no cliente (US-131):** decidir; recomendado cookie httpOnly em vez de armazenamento acessível por script.
9. **Serviço público de CEP (US-125):** definir (por exemplo, ViaCEP).
10. **Telas não desenhadas no protótipo:** edição de unidade, documento e tarefa, Configurações, "Mais detalhes" e posição das ações de download do anexo e de sair; os critérios das US-045, 055, 032, 126 e 132 dependem dessas definições.
11. **Valores sugeridos usados nos critérios:** código de recuperação com 10 minutos e 5 tentativas, anexos de até 10 MB, largura mínima de 360 px e sessão de 7 e 30 dias; confirmar junto com as metas dos RNFs na Análise de Requisitos.

## Premissas assumidas

- Os IDs das estórias, dos épicos (1 a 8 e 11 a 14) e dos requisitos foram mantidos das versões anteriores; "RF 001" passa a "RF-001" e "US 011" a "US-011".
- Os critérios de aceite foram reescritos no formato *Dado / Quando / Então* a partir dos critérios originais e dos requisitos da Análise v1.3, sem alterar o escopo; alguns critérios incorporam detalhes dos requisitos (códigos HTTP da API, metas dos RNFs).
- As prioridades seguem a equivalência do modelo: Obrigatório = Must have, Necessário = Should have, Opcional = Could have. O backlog está ordenado por prioridade e, dentro dela, por ID.
- Estórias técnicas dos Épicos 6, 7, 11, 12, 13 e 14 usam as personas Desenvolvedor(a) (P-05) e Responsável pela operação (P-06), por não terem usuário final direto.
- As estórias dos Épicos 11 a 14 passaram a depender da ordem de execução descrita em "Como usar este backlog".
- RF-018 (tema) e RF-025 (navegação) são exclusivamente de interface e, por isso, não têm endpoint na matriz.

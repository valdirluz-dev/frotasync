# Especificação de UX & Design de Interface

**Sistema de Gestão de Unidades, Documentos e Tarefas**

- **Versão:** 1.0
- **Data:** 22/09/2026
- **Autor:** Equipe de UX/UI
- **Documento:** Complementar (Requisitos, Backlog, Modelagem de Dados & API)

---

## 1. Introdução e Visão Geral de UX

Este documento estabelece a experiência do usuário (UX), arquitetura de informação, fluxos de navegação e estruturas visuais de baixa fidelidade (wireframes) do Sistema de Gestão de Unidades, Documentos e Tarefas.

O foco principal do design é garantir uma interface intuitiva e ágil, com regras de status automatizadas, atendendo perfeitamente os três perfis centrais: Colaborador(a), Gestor(a) e Administrador(a).

---

## 2. Jornadas do Usuário (User Journeys)

### Jornada 1: Acompanhamento Diário e Gestão de Tarefas (Colaborador)

**Objetivo:** Localizar rapidamente uma unidade, visualizar tarefas vinculadas e marcar uma atividade como concluída.

1. Login ➔ 2. Busca de Unidade (Lista) ➔ 3. Acessa Detalhes ➔ 4. Altera Status de Tarefa ➔ 5. Confirma Conclusão

### Jornada 2: Análise Global e Indicadores (Gestor)

**Objetivo:** Avaliar rapidamente a saúde operacional da empresa e verificar documentos com vencimento próximo no Dashboard.

1. Login ➔ 2. Visualiza Dashboard ➔ 3. Analisa Indicadores ➔ 4. Acessa Lista Global de Docs ➔ 5. Filtra Pendências

### Jornada 3: Administração e Inativação (Administrador)

**Objetivo:** Inativar uma unidade encerrada para bloquear a inserção de novos registros e manter a integridade sistêmica.

1. Login ➔ 2. Lista de Unidades ➔ 3. Edita Unidade ➔ 4. Altera p/ "Inativa" ➔ 5. Registros Bloqueados

---

## 3. Fluxos de Navegação (User Flows)

Abaixo detalham-se os fluxos de navegação contendo decisões do usuário, telas acessadas e ações do sistema.

### Fluxo 3.1: Conclusão de Tarefa (Visão Colaborador)

- **Início:** Colaborador acessa o "Detalhamento da Unidade" e navega até a listagem de tarefas.
- **Tela:** Lista de Tarefas (exibe cards com status coloridos: Pendente, Em andamento, Concluída).
- Colaborador seleciona uma tarefa pendente e altera seu status para "Concluída".
- **Decisão:** Confirmar conclusão? (Sistema exibe modal de confirmação explícita)
  - **Não:** Modal é fechado e o status retorna ao estado original.
  - **Sim:** *Ação do Sistema:* Registra a conclusão e aciona o refetch (TanStack Query) para atualizar as pendências do Dashboard.
- **Fim:** Tarefa exibida com etiqueta visual de conclusão.

### Fluxo 3.2: Bloqueio de Inclusões por Inativação (Visão Administrador)

- **Início:** Administrador altera o status da unidade XYZ para "Inativa" e salva.
- **Ação do Sistema:** O status "Inativa" propaga restrições visuais para a unidade.
- **Tela:** Detalhamento da Unidade Inativa
  - Botões `[+ Novo Documento]` e `[+ Nova Tarefa]` tornam-se inoperantes (estado *disabled*).
- **Fim:** Documentos e tarefas existentes permanecem visíveis, porém em formato **Somente Leitura**.

---

## 4. Arquitetura de Informação (Mapa do Site)

A estrutura de navegação e hierarquia de telas do sistema organiza-se rigorosamente por níveis de acesso:

- **Área de Autenticação**
  - Tela de Login (E-mail e Senha) — `PÚBLICO`
- **Área de Gestão Estratégica**
  - Dashboard de Indicadores (Totalizadores em Tempo Real) — `GESTOR` `ADMINISTRADOR`
  - Lista Global de Documentos (Todos os docs da empresa) — `GESTOR` `ADMINISTRADOR`
- **Área Operacional**
  - Lista de Unidades (Busca, Filtros de Status, Paginação) — `COLABORADOR` `GESTOR` `ADMINISTRADOR`
  - Detalhamento da Unidade — `COLABORADOR` `GESTOR` `ADMINISTRADOR`
    - Ficha Cadastral da Unidade
    - Lista de Documentos Vinculados (Cálculo automático de validade)
    - Lista de Tarefas Vinculadas (Prazos e Status)

---

## 5. Wireframes de Baixa Fidelidade (Low-Fi Wireframes)

Estrutura funcional focada exclusivamente na disposição de informações e hierarquia, sem tipografia decorativa ou paleta de cores definitivas.

### [TELA] Dashboard de Indicadores (Visão Gestor/Administrador)

```
MENU: [ Dashboard ] [ Unidades ] [ Documentos Globais ]          Usuário: Gestor | ( Sair )

+----------------------+  +----------------------+  +----------------------+
|          12          |  |          47          |  |          9           |
| Unidades Cadastradas |  | Total de Documentos  |  |  Tarefas Pendentes   |
+----------------------+  +----------------------+  +----------------------+
```

### [TELA] Detalhamento da Unidade (Visão Colaborador)

```
MENU: [ Dashboard ] [ Unidades ] [ Documentos Globais ]          Usuário: Colaborador | ( Sair )

Unidade Filial Sul [UN-002]                                      Status: Ativa
Endereço: Av. das Indústrias, 400 - Zona Sul
```

**Documentos da Unidade** — botão: `[+ Novo Documento]`

| Nome / Tipo | Validade | Status (Automático) |
|---|---|---|
| Alvará de Bombeiros | 05/10/2026 | [Amarelo] Próximo do Vencimento |
| Licença Ambiental | 20/12/2026 | [Verde] Válido |

**Tarefas da Unidade** — botão: `[+ Nova Tarefa]`

| Título | Prazo | Status | Ação |
|---|---|---|---|
| Vistoria Predial | 30/09/2026 | [Cinza] Pendente | `[ Atualizar ▾ ]` |
| Manutenção Elétrica | 22/09/2026 | [Azul] Em andamento | `[ Atualizar ▾ ]` |

---

## 6. Matriz de Rastreabilidade (UX vs Requisitos)

Relação estrutural conectando as telas e componentes visuais aos Requisitos Funcionais (RF) e Estórias de Usuário (US) mapeados no projeto.

| Elemento de UX / Funcionalidade da Tela | Requisito (RF) | Estória de Usuário (US) |
|---|---|---|
| Tela de Login & Redirecionamentos de Segurança | RF 001, RF 002 | US 011, US 012 |
| Cards de Indicadores (Dashboard) & Atualização Reativa | RF 003, RF 004 | US 021, US 022 |
| Tabela de Unidades (Busca, Paginação, Filtros) | RF 005 | US 031 |
| Interface de Detalhamento da Unidade (Docs e Tarefas) | RF 006, RF 009, RF 011 | US 032, US 042, US 051 |
| Bloqueio Visual de Inclusão em Unidades Inativas | RF 007 | US 033 |
| Listagem Global de Documentos | RF 008 | US 041 |
| Marcadores de Status Automático (Válido, Expirado, etc.) | RF 010 | US 043 |
| Modal de Confirmação para Status de Tarefa (Concluída) | RF 012 | US 052 |

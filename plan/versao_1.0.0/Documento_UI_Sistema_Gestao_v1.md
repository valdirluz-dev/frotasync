# Especificação de User Interface (UI) & Design System

**Sistema de Gestão de Unidades, Documentos e Tarefas**

- **Versão:** 1.0
- **Data:** 22/09/2026
- **Autor:** Equipe de UX/UI & Front-end
- **Documento:** Complementar (Requisitos, Backlog, Modelagem de Dados, API & UX)

---

## 1. Guia de Estilo (Style Guide)

O Guia de Estilo estabelece as diretrizes visuais da interface, priorizando um design profissional, funcional e sem excessos. A abordagem evita sombras flutuantes e prioriza o uso de linhas finas (1px) para separação de elementos, com foco na legibilidade e no tom operacional (Regra 60-30-10).

### 1.1 Paleta de Cores

| Uso | Cor | Aplicação |
|---|---|---|
| **Fundo (60%)** | `#F8FAFC` (Slate 50) | Fundos e Base |
| **Menus (60%)** | `#F1F5F9` (Slate 100) | Filtros/Sidebars |
| **Texto Principal (30%)** | `#0F172A` (Slate 900) | Tipografia & Títulos |
| **Destaque (10%)** | `#4F46E5` (Indigo 600) | Ações Principais |
| **Crítico / Erro** | `#DC2626` (Red 600) | Vencidos/Urgente |

### 1.2 Tipografia

Utilização da família tipográfica **Inter** (ou Geist Sans), mantendo estrutura limpa para dados.

| Nível / Elemento | Tamanho (px) | Peso (weight) | Uso principal no Figma |
|---|---|---|---|
| Heading 1 (H1) | 30px | Bold (700) | Títulos de Páginas Principais (ex: Dashboard) |
| Heading 2 (H2) | 20px | Semi-Bold (600) | Subtítulos / Títulos de seções (ex: Detalhes da Unidade) |
| Body Text | 16px | Regular (400) | Textos normais, dados, inputs de formulário |
| Labels / Table Headers | 12px | Medium (500) | Cabeçalhos de tabelas, Labels (TUDO EM MAIÚSCULO) |

### 1.3 Espaçamento, Grid e Bordas

- **Bordas e Formas:** Arredondamento (Border Radius) máximo de **6px a 8px** estritamente para botões e campos de input. Cartões, modais e containers utilizam cantos retos (0px). Sem uso de box-shadow flutuante; utilizar borders finas de 1px (`#E2E8F0`).
- **Grid Base (Auto Layout):** Múltiplos de 4px e 8px. Espaçamento interno de componentes (botões, células): 8px a 12px. Espaçamento entre blocos de conteúdo: 24px a 32px.
- **Ícones:** Estilo linear, traço fino. Essenciais para representar ações operacionais (Download, Check, Trash).

---

## 2. Componentes Reutilizáveis e Consistentes

### 2.1 Botões (Buttons)

- `Salvar Alterações`
- `Cancelar`
- `+ Novo Documento`
- `Inativar Unidade`

### 2.2 Badges de Status (Indicadores do Domínio)

- **Status de Unidade:** `ATIVA` · `INATIVA`
- **Status de Documentos (Cálculo Automático):** `VÁLIDO` · `PRÓXIMO DO VENCIMENTO` · `EXPIRADO`
- **Status de Tarefas:** `PENDENTE` · `EM ANDAMENTO` · `CONCLUÍDA`

### 2.3 Campos de Entrada (Form Inputs)

| Estado | Exemplo |
|---|---|
| **Estado Padrão** | `email@empresa.com.br` |
| **Estado Foco (Active)** | `Digitando...\|` |
| **Estado Erro** | `usuario@empresa` — ⚠ Informe um e-mail em formato válido. |

---

## 3. Protótipo Navegável em Alta Fidelidade

O protótipo interativo contém a biblioteca de componentes (Design System) estruturada com componentes *variants* e Auto Layout, reproduzindo as regras lógicas mockadas.

**Link do Protótipo (Figma):** https://www.figma.com/file/gestao-unidades-ui-design

### Telas Principais Prototipadas

- **UI-01 - Autenticação:** Fluxo de login com validação de campos (Zod/React Hook Form feedback).
- **UI-02 - Dashboard Analítico:** Cards de indicadores dinâmicos refletindo totais de unidades, documentos e tarefas, adotando estrutura visual 60-30-10.
- **UI-03 - Listagem de Unidades:** Tabela com paginação, filtros e tags de status (Ativa/Inativa).
- **UI-04 - Detalhamento da Unidade:** Layout subdividido para listagem paralela de documentos (com badges automáticas de validade) e tarefas. Bloqueio visual (*disabled state*) aplicado a botões de ação quando a unidade está inativa.
- **UI-05 - Modal de Conclusão:** Janela de foco para confirmação explícita de mudança de status de tarefa para "Concluída".

---

## 4. Diretrizes de Acessibilidade (WCAG 2.1 AA)

- **Contraste de Cores:** Botão primário (`#4F46E5`) sobre texto branco (`#FFFFFF`) garante proporção > 4.5:1 (Nível AA). Fundo `#F8FAFC` com texto `#0F172A` atinge > 12:1 (Nível AAA).
- **Navegação por Teclado:** Uso de anel de foco visível (Focus Ring) de 2px sólido (`#4F46E5`) em inputs e botões focados via tecla `Tab`.
- **Feedback Visual:** Estados de hover nos cartões e botões (redução de opacidade/brightness) indicam interatividade de forma imediata.
- **Mensagens de Erro:** Identificação de erros não depende unicamente da cor vermelha. Inclui ícones de alerta textuais (ex: formulário de login e cadastro de documentos).

---

## 5. Responsividade e Breakpoints

A arquitetura CSS (Tailwind CSS) emprega a abordagem **Mobile-First**:

| Dispositivo | Breakpoint | Comportamento de layout |
|---|---|---|
| **Mobile** | < 640px | Grid de 1 coluna. Tabelas convertidas em blocos de cartões. Sidebar oculta por padrão (Drawer lateral com ícone Hambúrguer). Botões ocupam largura total (100%). |
| **Tablet** | 640px a 1023px | Grid com 2 colunas para o Dashboard e Detalhamento da Unidade (lado a lado para Docs e Tarefas). Modais de cadastro ocupam 80% da tela. |
| **Desktop** | ≥ 1024px | Menu lateral fixo. Painel de indicadores distribuído horizontalmente. Listagens utilizam a largura da tabela nativa com paginação inferior e limites máximos (max-width) para não esticar exageradamente o conteúdo. |

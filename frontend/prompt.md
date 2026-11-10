## Contexto geral e regras de execução

Você está trabalhando no frontend do FROTASYNC, desenvolvido com Next.js 16, React 19, TypeScript, Tailwind CSS, TanStack Query, React Hook Form e Zod.

O projeto possui uma arquitetura organizada em:

- `app/`: páginas e rotas.
- `components/`: componentes da interface.
- `hooks/`: hooks personalizados.
- `services/`: operações e acesso aos dados.
- `schemas/`: validações Zod.
- `types/`: contratos e modelos TypeScript.
- `mocks/`: dados e operações simuladas.
- `lib/` e `utils/`: funcionalidades auxiliares.
  A arquitetura atual utiliza mocks, mas o direcionamento futuro é integrar o frontend a um backend NestJS, com PostgreSQL.

### Diretrizes obrigatórias

1. Antes de modificar qualquer arquivo, examine sua implementação atual e suas dependências.
2. Preserve a identidade visual, o Design System e os comportamentos que já funcionam.
3. Não reescreva o projeto do zero.
4. Não introduza bibliotecas desnecessárias.
5. Não duplique regras de negócio em componentes.
6. Mantenha TypeScript com `strict: true`.
7. Não utilize `any` para contornar problemas de tipagem.
8. Preserve a arquitetura existente sempre que ela estiver adequada.
9. Não crie funcionalidades fictícias para mascarar requisitos que dependem do backend.
10. Implemente alterações pequenas, coesas e verificáveis.
11. Atualize os testes relacionados às funcionalidades modificadas.
12. Não considere uma implementação concluída sem verificar seu funcionamento.
    Ao final de cada etapa, apresente:

- Arquivos modificados.
- Problemas corrigidos.
- Decisões arquiteturais tomadas.
- Testes executados e respectivos resultados.
- Problemas que ainda dependem de backend ou de decisões de produto.

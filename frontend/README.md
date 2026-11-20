# FrotaSync — frontend

Base do frontend FrotaSync com Next.js App Router, TypeScript estrito e Tailwind CSS.

Para habilitar login, defina `FROTASYNC_SESSION_SECRET` em `.env.local` com uma chave aleatória de pelo menos 32 caracteres. O arquivo `.env.example` contém o modelo.

## Comandos

- `npm run dev`: inicia o servidor local.
- `npm run build`: valida e gera a versão de produção.
- `npm run lint`: executa o ESLint.
- `npm test`: executa os testes Vitest existentes.

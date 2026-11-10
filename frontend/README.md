# FrotaSync — frontend

Base do frontend FrotaSync com Next.js App Router, TypeScript estrito e Tailwind CSS.

## Comandos

- `npm run dev`: inicia o servidor local.
- `npm run build`: valida e gera a versão de produção.
- `npm run lint`: executa o ESLint.
- `npm test`: executa os testes Vitest existentes.

## Acesso a dados

Os serviços de domínio (`services/`) dependem dos contratos de repositório em
`repositories/contracts.ts`. A implementação atualmente selecionada em
`repositories/index.ts` é a implementação demo em memória, isolada em
`repositories/demo/`; componentes e hooks consomem os serviços sem importar os
mocks.

Quando os contratos do backend NestJS estiverem definidos, uma implementação
HTTP poderá substituir a demo nesse ponto, mantendo os contratos públicos dos
serviços. Nenhum endpoint do backend é presumido nesta etapa.

Consultas de CEP são centralizadas em `services/cepService.ts`, que valida e
normaliza o CEP e consulta a API ViaCEP. CEP inexistente retorna `null`; entradas
inválidas e falhas de rede são erros tipados.

# Backend Frotasync

Base da API em NestJS com TypeScript. Os diretórios de módulos existentes na
raiz (`auth`, `usuarios`, `unidades` e demais) foram preservados para integração
gradual; regras de negócio e acesso ao banco ainda não estão implementados.

## Desenvolvimento local

Requer Node.js 20.19 ou superior e npm.

```sh
npm ci
cp .env.example .env
# Atualize DATABASE_URL com as credenciais locais do PostgreSQL.
npm run start:dev
```

A API escuta na porta definida por `PORT` (3000 por padrão). O endpoint
`GET /health` retorna `{"status":"ok"}`. Para conectar ao PostgreSQL executado
pelo Compose no host, use a porta 5433 em `DATABASE_URL`.

## Verificações

```sh
npm run lint
npm run build
npm test
```

O projeto apenas carrega as variáveis de ambiente neste estágio. A URL do banco
fica preparada para a futura configuração do Prisma, que não está instalado;
nenhuma migração é executada pela aplicação.

# FrotaSync — Sistema de Gestão de Unidades, Documentos e Tarefas

**Versão do documento:** 1.4 | **Data:** 20/11/2026\
**Documento:** Planejamento de Infraestrutura, Deploy & Observabilidade\
*Documento complementar à Análise de Requisitos (03) e às Estórias (04). Suas decisões alimentam Dados (06), API (07), Arquitetura (08\_3) e Provisionamento/CI/CD (10).*

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

## O que mudou na versão 1.4

Resultado da conferência com o frontend completo (`frontend/`) e com a Análise de Requisitos v1.3, que é a fonte única da stack.

- **Backend é NestJS (Node.js), não Spring Boot.** A v1.3 descrevia JRE 21, `-Xmx512m`, HikariCP e Spring Security, contrariando a Análise de Requisitos, a Modelagem e o Design de API. Todos esses pontos foram reescritos (contêiner Node, limite de memória do processo, pool `pg`, Passport JWT). **Resolve a Pendência 1.**
- **Frontend em modo `standalone`:** `next.config.ts` precisa de `output: "standalone"`; o repositório ainda não tem Dockerfile, compose nem healthcheck do `web`, agora especificados.
- **Sessão (ADR-006 reescrito):** a API emite os cookies httpOnly (mesma origem). O frontend deixa de assinar um cookie próprio, e o segredo `FROTASYNC_SESSION_SECRET` sai da lista de segredos. A tabela de refresh tokens existe na Modelagem v1.4 (V13). **Resolve a Pendência 6.**
- **Migrações Flyway como contêiner de execução única** (ADR-010) antes da API, com a API sem direito de DDL.
- **Rede de saída:** a API consulta o ViaCEP e o SES; o navegador não chama serviços externos (CSP `connect-src 'self'`).
- **Pendências 3 e 4 decididas:** metas de disponibilidade e escalabilidade tornam-se RNFs propostos formalmente (seção 1).
- **CI/CD:** o workflow atual só cobre o frontend; seção 3 lista o que falta.
- Ajustes de memória do compose, healthchecks e proxy de desenvolvimento local.

---

## Stack utilizada

A linguagem, o framework e o banco vêm da Análise de Requisitos v1.3 (Tecnologias): **TypeScript (Node.js) + NestJS + PostgreSQL** no backend e **Next.js** no frontend. Aqui ficam as escolhas de infraestrutura:

- **Provedor de nuvem:** AWS, região us-east-1 (N. Virginia) — ADR-001
- **Containers / hospedagem:** Docker + 1 instância EC2 t4g.small com Docker Compose (sem Kubernetes nem ECS) — ADR-002
- **Hospedagem do front-end:** mesmo host da API, em contêiner Next.js standalone atrás do Caddy (não é estático) — ADR-003
- **IaC:** Terraform, em duas pilhas (permanente e efêmera) — ADR-007
- **Migrações:** Flyway em contêiner de execução única — ADR-010
- **CI/CD:** Git + GitHub Actions (execução no 10; Git Flow no 08\_3)
- **Qualidade:** SonarQube Cloud (ex-SonarCloud), plano gratuito; definição final no 08\_3
- **Observabilidade:** somente CloudWatch e AWS Budgets — ADR-009

> **Resumo em uma linha:** 1 VM + 1 banco gerenciado, sem balanceador e sem NAT Gateway, criados e destruídos com Terraform. Custo estimado: **≈ US$ 0,014 (15 min) · US$ 1,02 (1 dia) · US$ 7,17 (1 semana) · US$ 31,17 (1 mês, 24×7)**. Detalhes na seção 8.

---

## 1. Requisitos Não Funcionais que Guiam a Infra

Linhas marcadas *(proposta)* não existem na Análise de Requisitos e ficam adotadas como padrão até a squad decidir o contrário.

| Requisito (ID no 03) | Meta (do 03) | Impacto na infra |
| --- | --- | --- |
| Segurança (RNF-004) | HTTPS obrigatório em produção; 401/403 em 100% dos endpoints protegidos; accessToken 15 min, refreshToken 7 ou 30 dias | TLS no Caddy (Let's Encrypt); só as portas 80 e 443 expostas; sem SSH (acesso por SSM Session Manager); JWT emitido pela API em cookies httpOnly (ADR-006); CSP e cabeçalhos de segurança no Caddy |
| Desempenho (RNF-005) | p95 < 500 ms com até 10 mil registros por empresa *(sugerida)* | Front e API na mesma VM (sem salto de rede); RDS na mesma região; índices da Modelagem; processo Node com `--max-old-space-size=400`; pool `pg` com no máximo 10 conexões |
| Disponibilidade *(proposta de RNF; sem RNF no 03)* | Melhor esforço, sem SLA | 1 VM em 1 AZ; `restart: unless-stopped`, healthchecks e alarme de status da VM. Multi-AZ dobraria o custo do RDS e não há requisito que o justifique |
| Escalabilidade *(proposta de RNF; sem RNF no 03)* | Até ~50 usuários simultâneos | Escala vertical (tipo da VM e do RDS por variável Terraform); sem autoscaling |
| Orçamento *(proposta de RNF-034)* | ≤ US$ 1 por demonstração de até 1 h; ≤ US$ 40/mês se ficar 24×7 | Sem ALB, sem NAT Gateway, sem WAF; ambiente efêmero (ADR-007); alertas no Budgets (seção 6) |
| LGPD (RNF-021) | Senhas só como hash; 0 senhas em logs; dados fictícios em mocks e seed | Só dados fictícios no ambiente de demonstração; logs sem payloads, cookies ou cabeçalhos de autorização; EBS, RDS e S3 criptografados |
| Persistência (RNF-022) | PostgreSQL; esquema criado só por migrations versionadas | RDS PostgreSQL; migrações Flyway V1 a V14 executadas por contêiner dedicado antes da API (ADR-010) |
| Anexos (RNF-026) | Bucket privado e criptografado; PDF, JPG e PNG até 10 MB; 0 anexos públicos | S3 com Block Public Access e SSE-S3; acesso só pela role da VM; download pela API (RF-026); limite de 10 MB também no Caddy (`request_body max_size`) |
| Contêineres (RNF-028) | Dockerfile multi-stage; compose com healthchecks; ambiente com um comando | Mesmo `docker-compose.yml` no local e na VM (muda só o arquivo de variáveis) |
| IaC e AWS (RNF-029) | `terraform apply` recria o ambiente; `fmt` e `validate` sem erro; 0 segredos versionados | VPC, RDS privado, S3, ECR e IAM por Terraform (ADR-007) |
| Segredos (RNF-030) | 0 segredos no repositório, nas imagens ou nos logs; IAM sem chaves fixas | SSM Parameter Store (SecureString) lido pela role da VM (ADR-008) |
| CI/CD (RNF-031) | 100% dos PRs verificados; OIDC; aprovação manual em produção | GitHub Actions envia imagens ao ECR; deploy por SSM Run Command (sem SSH) |
| Observabilidade e backup (RNF-032) | Logs no CloudWatch; ao menos 1 alarme; backup de 7 dias *(sugerida)* com restauração testada | Seção 6; `backup_retention_period = 7` no RDS |

---

## 2. Arquitetura de Implantação

### Diagrama

```
Usuário (navegador)
      │  HTTPS 443  (porta 80 só para o desafio do certificado)
      ▼
┌──────────────────────── VPC 10.0.0.0/16 · us-east-1 ───────────────────────────┐
│  Sub-rede pública (AZ-a)                                                       │
│  ┌────────────────────────────────────────────────┐                            │
│  │ EC2 t4g.small + Elastic IP · Docker Compose    │                            │
│  │   caddy :80/:443  (TLS Let's Encrypt)          │                            │
│  │     ├─ /api/v1/*  → api  (NestJS :3001)        │────┐ 5432                  │
│  │     └─ /*         → web  (Next.js :3000)       │    │                       │
│  │   migrate (Flyway, execução única, antes da api)│───┤                       │
│  └──────────────────┬─────────────────────────────┘    ▼                       │
│                     │ role IAM            Sub-redes privadas (AZ-a e AZ-b)       │
│                     │                     ┌───────────────────────────────┐      │
│                     │                     │ RDS PostgreSQL db.t4g.micro   │      │
│                     │                     │ Single-AZ · sem acesso público│      │
│                     │                     └───────────────────────────────┘      │
└─────────────────────┼────────────────────────────────────────────────────────────┘
                      ▼
  Serviços regionais: S3 anexos (privado) · SSM Parameter Store · ECR · SES
  Internet (saída pela API): ViaCEP (consulta de CEP)
  Observabilidade: CloudWatch Logs e Alarmes · AWS Budgets
  Entrega: GitHub Actions → (OIDC) ECR e SSM Run Command → VM
```

Não há ALB, NAT Gateway nem endpoints de interface: são os itens que mais pesariam na conta. A saída para a internet (ViaCEP, SES, S3, ECR) usa o Internet Gateway, porque a VM está em sub-rede pública.

### Decisão de hospedagem

- **Opção A — mais simples e mais barata:** 1 EC2 t4g.small com Docker Compose (Caddy + Next.js + NestJS) e RDS. Bom para MVP, portfólio e demonstração.
- **Opção B — containers gerenciados:** ECS Fargate (2 tarefas) + ALB + RDS. Mostra mais domínio de AWS, mas custa mais de 2× e exige ALB, 2 sub-redes públicas e IPs públicos extras.
- **Escolhida:** A. É a menor conta que ainda cumpre os RNFs de segurança, contêineres, IaC e persistência, e sobe e desce com um `terraform apply`/`destroy`. Origem: RNF-029, RNF-028 e a Pendência 6 do 03.

| Item | Opção A (escolhida) | Opção B |
| --- | --- | --- |
| Computação | EC2 t4g.small (2 vCPU, 2 GiB) | Fargate ARM: API 0,5 vCPU/1 GB + front 0,25 vCPU/0,5 GB |
| Entrada HTTPS | Caddy + Let's Encrypt (sem custo) | ALB + ACM (US$ 0,0225/h + LCU) |
| IPs públicos | 1 | 4 (2 do ALB + 2 das tarefas) |
| Custo por hora | ≈ US$ 0,043 | ≈ US$ 0,099 |
| Custo 24×7 (730 h) | ≈ US$ 31 | ≈ US$ 72 |
| Pontos fracos | Ponto único de falha; sem deploy sem indisponibilidade | Mais peças no Terraform; custo fixo do ALB |

### Architecture Decision Records (ADR)

#### ADR-001: AWS na região us-east-1 (N. Virginia)

- **Status:** Aceito
- **Origem:** RNF-029; orçamento (proposta de RNF-034)
- **Contexto:** É preciso escolher provedor e região para um ambiente que será criado e destruído; o preço muda bastante por região.
- **Decisão:** AWS, us-east-1, parametrizada em `aws_region`.
- **Alternativas consideradas:**
  - sa-east-1 (São Paulo) — menor latência para o Brasil, mas o RDS db.t4g.micro custa ≈ US$ 25/mês contra ≈ US$ 12/mês
  - GCP ou Azure — fora da trilha do squad e do RNF-029
- **Consequências:** Menor custo. A latência para Recife é maior, aceitável em demonstração. Os dados ficam fora do Brasil, então só podem ser fictícios (RNF-021); com dados reais, migrar para sa-east-1.

#### ADR-002: EC2 única com Docker Compose em vez de ECS Fargate + ALB

- **Status:** Aceito
- **Origem:** RNF-028, RNF-029; Pendência 6 do 03; US-145
- **Contexto:** A Pendência 6 pedia escolher entre ECS Fargate e EC2 com Compose, considerando que balanceador, NAT e Fargate ficam fora do nível gratuito.
- **Decisão:** 1 instância EC2 t4g.small (ARM, Amazon Linux 2023) em sub-rede pública com Elastic IP, executando `caddy`, `web`, `api` e, em execução única, `migrate`, por Docker Compose, com imagens do ECR, healthchecks e `restart: unless-stopped`. Créditos de CPU em modo `standard` para não gerar cobrança de burst. Limites de memória: `api` 700 MB, `web` 450 MB, `caddy` 64 MB, `migrate` 384 MB (só durante a subida).
- **Alternativas consideradas:**
  - ECS Fargate + ALB — ≈ US$ 72/mês, mais de 2× a opção escolhida
  - EKS — só o plano de controle custa US$ 0,10/h (≈ US$ 73/mês)
  - EC2 Spot — economizaria ≈ US$ 8/mês, mas pode ser interrompida durante a apresentação
  - App Runner — precisa de VPC connector para alcançar o RDS privado
- **Consequências:** Menor custo e nenhuma peça cara. Em contrapartida há ponto único de falha, sem autoscaling e com reinício curto a cada deploy. As imagens precisam ser linux/arm64 (imagens base `node:22-alpine` e `flyway/flyway` têm variante arm64) e o patch do SO fica com o squad.

#### ADR-003: Front-end Next.js em contêiner, não estático

- **Status:** Aceito
- **Origem:** RNF-004, RNF-029; código atual do front
- **Contexto:** O front usa `proxy.ts` (verificação de sessão em todas as rotas) e componentes de servidor, o que exige servidor Node; não dá para exportar como site estático em S3 com CDN.
- **Decisão:** Contêiner `web` com `output: "standalone"` em `next.config.ts` (hoje ausente: ajuste necessário), usuário não-root e healthcheck em `GET /api/health` (Route Handler simples do Next, que o Caddy encaminha ao `web` porque só `/api/v1/*` vai à API). O Caddy envia `/api/v1/*` para a API e o restante para o `web`, mantendo uma única origem, sem CORS, com cookies httpOnly funcionando. Em desenvolvimento local, sem Caddy, o `next.config.ts` usa `rewrites` de `/api/v1/*` para `API_URL` (padrão `http://localhost:3001`).
- **Alternativas consideradas:**
  - S3 + CloudFront — exigiria refazer a proteção de rotas e a criação e remoção da distribuição leva vários minutos, ruim para o `destroy` rápido
  - Vercel — descartada na v1.3 (US-087)
- **Consequências:** Sem CORS e sem custo extra. Front e API disputam os 2 GiB da VM, por isso os limites de memória do compose. O front não tem variáveis de ambiente obrigatórias em produção (a URL da API é relativa).

#### ADR-004: HTTPS com Caddy e Let's Encrypt, sem ALB nem CloudFront

- **Status:** Aceito
- **Origem:** RNF-004 (HTTPS obrigatório), RNF-029 (acesso por HTTPS)
- **Contexto:** ALB com ACM custaria ≈ US$ 0,03/h mais IPs públicos, e é preciso HTTPS que suba e desça rápido.
- **Decisão:** O Caddy obtém e renova o certificado automaticamente (desafio HTTP-01 nas portas 80 e 443). Na demonstração, o hostname é `<ip-com-hifens>.sslip.io`, um DNS gratuito que resolve para o próprio IP. Um domínio próprio entra depois pela variável `domain_name`. O Caddy também aplica cabeçalhos de segurança (`Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy` e CSP com `connect-src 'self'`, já que o navegador não chama serviços externos) e limita o corpo das requisições a 10 MB.
- **Alternativas consideradas:**
  - ALB + ACM — ≈ US$ 22/mês entre ALB e LCU, mais os IPs
  - CloudFront — certificado padrão, mas a origem seguiria em HTTP e a criação demora
  - Certificado autoassinado — alerta de segurança no navegador diante do professor
- **Consequências:** TLS sem custo. O certificado é emitido a cada subida (IP novo) e depende do Let's Encrypt e do sslip.io, cujo limite de emissão é compartilhado com outros usuários. Mitigação: ensaiar com o ambiente de staging do Let's Encrypt e, se quiser segurança extra, registrar um domínio próprio. Os cookies `Secure` exigem HTTPS, então o ambiente local usa `COOKIE_SECURE=false`.

#### ADR-005: RDS PostgreSQL db.t4g.micro, Single-AZ, em sub-rede privada

- **Status:** Aceito
- **Origem:** RNF-022, RNF-029, RNF-032
- **Contexto:** O 03 exige PostgreSQL gerenciado, privado e com backup; o ambiente é de demonstração.
- **Decisão:** RDS for PostgreSQL db.t4g.micro (2 vCPU, 1 GiB), 20 GiB gp3, Single-AZ, `publicly_accessible = false`, security group que aceita 5432 apenas do SG da VM, criptografia em repouso e backup automático com retenção de 7 dias. A extensão `pgcrypto` e a `unaccent` (migrações V1 e V10) já vêm na lista de extensões permitidas do RDS. No ambiente efêmero: `deletion_protection = false` e `skip_final_snapshot = true`. O subnet group usa 2 sub-redes privadas em AZs diferentes (exigência do RDS, sem custo).
- **Alternativas consideradas:**
  - PostgreSQL em contêiner na própria VM — custo zero de instância, mas contraria o RNF-029 e perde o backup gerenciado
  - Multi-AZ — dobraria o custo do RDS sem requisito de disponibilidade
  - Aurora — custo base maior para um volume pequeno
- **Consequências:** Atende ao RNF e entrega backup gerenciado. 1 GiB de RAM pede pool de conexões pequeno (driver `pg`, máximo de 10 conexões). A criação do RDS é o gargalo do `apply` (tipicamente 5 a 10 min). O banco tem dois usuários: `frotasync_migrator` (DDL, usado só pelo `migrate`) e `frotasync_app` (DML, usado pela API), ambos com senha no SSM.

#### ADR-006: Autenticação com JWT próprio (NestJS + Passport) em cookies httpOnly

- **Status:** Aceito (reescrito na v1.4)
- **Origem:** RF-001, RF-019, RF-020, RF-027; RNF-004, RNF-027; US-122, US-123
- **Contexto:** O Design de API (07) define login, refresh, logout, cadastro e recuperação por código. A v1.3 deste documento supunha Spring Security e dizia que o front "já" guardava tokens em cookie, mas o front atual só assina um cookie de sessão próprio (HMAC com `FROTASYNC_SESSION_SECRET`) e nunca recebe tokens da API. Ficou faltando a Modelagem do refresh token (agora na V13).
- **Decisão:** A API NestJS emite o JWT (accessToken de 15 min) e um refreshToken opaco (7 dias; 30 com "Lembre-me"), guardado como hash na tabela `refresh_token`, com rotação a cada uso. Os dois vão em cookies `HttpOnly; Secure; SameSite=Lax` definidos pela própria API, na mesma origem (ver Design de API v1.4, seção 2). Há ainda o cookie `frotasync_session`, que só informa ao `proxy.ts` do Next que há sessão. Proteção contra CSRF com o cabeçalho obrigatório `X-FrotaSync-Client` nas escritas. Senhas com bcrypt, autorização por perfil e filtro por `empresaId`. O segredo de assinatura do JWT fica no SSM (ADR-008). O envio do código de recuperação usa Amazon SES (modo sandbox basta para a demonstração, com remetente e destinatários verificados). O frontend remove os Route Handlers de autenticação, o cookie HMAC e `FROTASYNC_SESSION_SECRET`.
- **Alternativas consideradas:**
  - Manter o cookie HMAC do Next e a API só com Bearer — dois mecanismos de sessão em paralelo e o token teria de ficar legível ao JavaScript
  - Amazon Cognito — adiciona serviço, Terraform e integração, e mudaria o contrato do 07
  - Login social (OAuth2) — não há requisito; a US-011 pede só e-mail e senha
- **Consequências:** Sem custo e sem serviço extra, com o contrato do 07 mantido. A squad assume a segurança da emissão e da rotação. O refresh e o logout dependem do banco. Limitação do `sslip.io`: cookies não são compartilhados entre hostnames, o que não afeta a mesma origem usada aqui.

#### ADR-007: Terraform em duas pilhas (permanente e efêmera), estado remoto em S3

- **Status:** Aceito
- **Origem:** RNF-029, RNF-031, RNF-015; orçamento
- **Contexto:** É preciso subir, apresentar e destruir em cerca de 15 minutos sem perder as imagens do ECR nem o estado, e sem pagar por recursos ociosos.
- **Decisão:** (1) `infra/bootstrap`, permanente (≈ US$ 0,13/mês): bucket de estado S3 versionado e criptografado com lock por arquivo (`use_lockfile`, Terraform ≥ 1.10), repositórios ECR com lifecycle de 5 imagens, provedor OIDC e roles do GitHub Actions, e os budgets. (2) `infra/envs/production`, efêmera: VPC, sub-redes, security groups, EC2 e Elastic IP, RDS, S3 de anexos (`force_destroy = true`), parâmetros SSM, log groups, alarmes e dashboard. O `terraform destroy` só atinge a pilha 2.
- **Alternativas consideradas:**
  - Pilha única — o destroy apagaria o ECR e as imagens, forçando novo build e push antes de cada demonstração
  - CloudFormation ou Pulumi — fora da trilha do squad
- **Consequências:** Destroy rápido e seguro, com custo permanente de centavos. Banco e anexos da pilha efêmera somem a cada destroy; o seed `demo` recria os dados. O bootstrap é aplicado uma única vez, com credenciais pessoais temporárias (SSO).

#### ADR-008: Segredos no SSM Parameter Store

- **Status:** Aceito
- **Origem:** RNF-030, RNF-021
- **Contexto:** O RNF-030 aceita Secrets Manager ou SSM Parameter Store; Secrets Manager cobra por segredo ao mês (≈ US$ 0,40).
- **Decisão:** Parâmetros SecureString (chave gerenciada pela AWS) em `/frotasync/production/*`: `db_migrator_password` e `db_app_password` (geradas por `random_password`), `jwt_secret` e `ses_from_address`. A role da VM os lê no boot e grava um arquivo de ambiente com permissão 600 consumido pelo compose; nada vai em imagem, repositório ou log. Não há segredo de sessão do frontend (removido na v1.4).
- **Alternativas consideradas:**
  - Secrets Manager — custo por segredo sem ganho para este porte
  - Variáveis fixas no compose — viola o RNF-030
- **Consequências:** Custo zero. Sem rotação automática (rotação manual; trocar `jwt_secret` encerra as sessões ativas). As senhas do banco geradas pelo Terraform ficam no state, que está em bucket privado e criptografado.

#### ADR-009: Observabilidade somente com CloudWatch e AWS Budgets

- **Status:** Aceito
- **Origem:** RNF-032; decisão da squad
- **Contexto:** A squad definiu que a única observabilidade será a nativa da AWS.
- **Decisão:** Logs pelo driver `awslogs`, métricas padrão, alarmes e 1 dashboard no CloudWatch; custos acompanhados pelo AWS Budgets. Sem X-Ray, Prometheus, Grafana nem APM externo. A API registra logs estruturados em JSON, sem corpo de requisição, cookies nem cabeçalhos de autorização (RNF-021). O alarme de indisponibilidade usa o status da VM e a verificação de `GET /api/v1/health`.
- **Alternativas consideradas:**
  - Prometheus e Grafana — consumiriam memória da VM e exigiriam mais peças
  - X-Ray ou OpenTelemetry — esforço e custo sem requisito
- **Consequências:** Tudo cabe no free tier do CloudWatch (5 GB de logs, 10 alarmes, 3 dashboards). Não há tracing distribuído e métricas de memória da VM não são nativas (exigiriam o CloudWatch agent, opcional).

#### ADR-010: Migrações Flyway em contêiner de execução única (novo na v1.4)

- **Status:** Aceito
- **Origem:** RNF-022, RNF-028, RNF-031; Modelagem de Dados v1.4
- **Contexto:** O RNF-022 exige que o esquema nasça só de migrações Flyway e o RNF-031 que elas rodem antes da nova versão da API. Flyway é uma ferramenta Java, e a API é Node.
- **Decisão:** Serviço `migrate` no compose, com a imagem oficial `flyway/flyway` (arm64) e a pasta `db/migration/` copiada para dentro da imagem de migração `frotasync-migrate`, publicada no ECR junto com as outras duas. A API só inicia (`depends_on: migrate: condition: service_completed_successfully`). O `migrate` usa o usuário `frotasync_migrator`; a API usa `frotasync_app`, sem direito de DDL. No ambiente local, o mesmo serviço roda contra o PostgreSQL do compose. Falha de migração impede a subida da API e do `web` e aparece no CloudWatch.
- **Alternativas consideradas:**
  - Flyway dentro do contêiner da API — exigiria JRE na imagem Node
  - Migrações por ORM (TypeORM, Prisma) — contraria a premissa de Flyway como única ferramenta
  - Passo manual no deploy — viola o RNF-031
- **Consequências:** Uma terceira imagem no ECR (cabe no lifecycle de 5 imagens por repositório) e uma ordem de subida explícita. O deploy fica mais lento em alguns segundos.

---

## 3. Decisões de Provisionamento

Aqui ficam as **decisões** (o quê e por quê). A **implementação** (Dockerfile, docker-compose, módulos Terraform, workflow) está em `10_provisionamento_cicd.md`.

| Tema | Decisão | Origem |
| --- | --- | --- |
| Imagem de container | Dockerfile multi-stage e usuário não-root para `web` (Node, Next standalone), `api` (Node 22 LTS, NestJS compilado) e `migrate` (Flyway + migrações); imagens linux/arm64 no ECR com tag imutável por commit (`sha`) e, em releases, `vX.Y.Z`; lifecycle mantém as 5 mais recentes | ADR-002, ADR-010 |
| Orquestração | Docker Compose na VM (`caddy`, `web`, `api` e `migrate` de execução única) com `restart: unless-stopped`, healthchecks e limites de memória. Sem manifestos Kubernetes | ADR-002 |
| IaC | Terraform ≥ 1.10; módulos: rede, banco, compute, registry, iam, storage, monitoring; estado remoto em S3 com `use_lockfile`, um por pilha; `plan` no pull request, `apply` só após merge e aprovação; `destroy` só na pilha efêmera | ADR-007 |
| Banco de dados | RDS PostgreSQL db.t4g.micro, 20 GiB gp3, Single-AZ, sub-rede privada; backup de 7 dias; migrações Flyway V1 a V14 executadas pelo `migrate` na subida | ADR-005, ADR-010 |
| Segredos | SSM Parameter Store (SecureString) em `/frotasync/production/*`; nunca credenciais no repositório; `.env.example` sem valores reais | ADR-008 |
| Front-end | Contêiner Next.js standalone na mesma VM (`output: "standalone"`); Caddy roteia `/api/v1/*` para a API e o restante para o front | ADR-003 |
| Sessão | Cookies httpOnly emitidos pela API; `proxy.ts` do Next só verifica o cookie indicador de sessão | ADR-006 |
| HTTPS | Caddy + Let's Encrypt; hostname `<ip>.sslip.io` na demonstração; cabeçalhos de segurança e CSP no Caddy | ADR-004 |
| Anexos | Bucket S3 privado, SSE-S3 e Block Public Access; acesso só pela role da VM | RNF-026 |
| CI/CD | O workflow atual (`.github/workflows/ci.yml`) só roda lint, teste e build do frontend com Node 20. Falta: job da API (lint, build, testes com PostgreSQL de serviço), build das 3 imagens `linux/arm64` (QEMU + buildx ou runner `ubuntu-24.04-arm`), `terraform fmt/validate/plan`, deploy por OIDC + SSM Run Command com aprovação manual e rollback documentado | RNF-031 |

---

## 4. Ambientes

Nomes padronizados em todo o projeto: `local`, `staging`, `production`.

| Ambiente | Finalidade | Deploy | Dados |
| --- | --- | --- | --- |
| local | Desenvolvimento | `docker-compose up` (web, api, migrate e PostgreSQL; disco ou MinIO para anexos); o `web` encaminha `/api/v1/*` à API por `rewrites`; `COOKIE_SECURE=false` e código de recuperação no console | Fictícios (seed de desenvolvimento) |
| staging | Validação antes de produção | **Não provisionado** (custo). A validação ocorre no `local` e nos testes do pull request, com PostgreSQL de serviço no GitHub Actions | — |
| production | Demonstração e, se houver decisão futura, usuários reais | Pilha efêmera `infra/envs/production`; deploy após merge na `main` com CI verde e **aprovação manual** (GitHub Environment `production` com revisores) | Fictícios (seed `demo`) |

*Uma única conta AWS. As imagens ficam num único ECR (pilha permanente) e a `production` as usa direto, sem promoção entre registros. Se um dia for preciso um staging, basta aplicar a mesma pilha com `environment = staging`, nunca em paralelo à production, para não dobrar o custo.*

---

## 5. Pendências resolvidas na v1.4

| Pendência | Decisão |
| --- | --- |
| 1. Backend considerado em Spring Boot | **NestJS (Node.js)**, conforme a Análise de Requisitos v1.3 (fonte única da stack). |
| 3. Disponibilidade sem RNF | Melhor esforço, sem SLA; adotada como proposta de RNF. |
| 4. Escalabilidade sem RNF | Até ~50 usuários simultâneos, escala vertical; adotada como proposta de RNF. |
| 6. Tabela de refresh token ausente na Modelagem | Criada na Modelagem de Dados v1.4 (V13). |
| Local de execução das migrações | Contêiner `migrate` dedicado (ADR-010). |
| Origem da sessão do frontend | Cookies emitidos pela API (ADR-006). |

---

## Histórico de Alterações

| Data | Versão | Descrição | Autor |
| --- | --- | --- | --- |
| 20/11/2026 | 1.3 | Planejamento de infraestrutura na AWS (EC2 + Compose, RDS, Terraform em duas pilhas, SSM, CloudWatch). | Equipe do projeto |
| 20/11/2026 | 1.4 | Conferência com o frontend e a Análise de Requisitos: backend NestJS no lugar de Spring Boot; `output: "standalone"`, healthcheck e rewrites do frontend; sessão por cookies da API (ADR-006) e remoção de `FROTASYNC_SESSION_SECRET`; migrações em contêiner dedicado (ADR-010) com usuários de banco separados; CSP e limite de corpo no Caddy; metas de disponibilidade e escalabilidade; lacunas do CI/CD; pendências 1, 3, 4 e 6 resolvidas. | Equipe do projeto |

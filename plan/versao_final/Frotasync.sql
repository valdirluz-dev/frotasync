CREATE TABLE "empresa" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "nome_fantasia" varchar(150) NOT NULL,
  "razao_social" varchar(200) NOT NULL,
  "cnpj" char(14) UNIQUE NOT NULL,
  "segmento" varchar(100) NOT NULL,
  "tipo_unidade" varchar(10) NOT NULL,
  "cep" char(8) NOT NULL,
  "logradouro" varchar(150) NOT NULL,
  "numero" varchar(10) NOT NULL,
  "complemento" varchar(100),
  "bairro" varchar(100) NOT NULL,
  "cidade" varchar(100) NOT NULL,
  "uf" char(2) NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "usuario" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "empresa_id" uuid NOT NULL,
  "nome" varchar(150) NOT NULL,
  "cpf" char(11) UNIQUE NOT NULL,
  "telefone" varchar(11) NOT NULL,
  "cargo" varchar(100) NOT NULL,
  "email" varchar(180) UNIQUE NOT NULL,
  "senha_hash" varchar(255) NOT NULL,
  "papel" varchar(20) NOT NULL DEFAULT 'colaborador',
  "aceite_termos_em" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "unidade" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "empresa_id" uuid NOT NULL,
  "nome" varchar(150) NOT NULL,
  "codigo" varchar(30) NOT NULL,
  "cep" char(8) NOT NULL,
  "logradouro" varchar(150) NOT NULL,
  "numero" varchar(10) NOT NULL,
  "complemento" varchar(100),
  "bairro" varchar(100) NOT NULL,
  "cidade" varchar(100) NOT NULL,
  "uf" char(2) NOT NULL,
  "descricao" text,
  "status" varchar(10) NOT NULL DEFAULT 'ativa',
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "documento" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "unidade_id" uuid NOT NULL,
  "nome" varchar(150) NOT NULL,
  "tipo" varchar(60),
  "categoria" varchar(40) NOT NULL,
  "data_emissao" date,
  "data_validade" date NOT NULL,
  "descricao" text,
  "anexo_nome" varchar(255) NOT NULL,
  "anexo_url" varchar(500) NOT NULL,
  "anexo_tamanho_bytes" bigint NOT NULL,
  "anexo_tipo" varchar(100) NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "tarefa" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "unidade_id" uuid NOT NULL,
  "titulo" varchar(150) NOT NULL,
  "descricao" text,
  "status" varchar(20) NOT NULL DEFAULT 'pendente',
  "data_inicio" date NOT NULL DEFAULT (current_date),
  "prazo" date NOT NULL,
  "data_conclusao" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "codigo_verificacao" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "usuario_id" uuid NOT NULL,
  "codigo_hash" varchar(255) NOT NULL,
  "expira_em" timestamptz NOT NULL,
  "tentativas" smallint NOT NULL DEFAULT 0,
  "reset_token_hash" char(64),
  "reset_expira_em" timestamptz,
  "usado_em" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "refresh_token" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "usuario_id" uuid NOT NULL,
  "token_hash" char(64) UNIQUE NOT NULL,
  "lembrar" boolean NOT NULL DEFAULT false,
  "expira_em" timestamptz NOT NULL,
  "revogado_em" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "historico_alteracao" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "unidade_id" uuid NOT NULL,
  "usuario_id" uuid,
  "entidade" varchar(20) NOT NULL,
  "entidade_id" uuid NOT NULL,
  "entidade_nome" varchar(150) NOT NULL,
  "acao" varchar(20) NOT NULL,
  "descricao" text,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE INDEX ON "usuario" ("empresa_id");

CREATE UNIQUE INDEX ON "unidade" ("empresa_id", (lower(codigo)));

CREATE INDEX ON "unidade" ("status");

CREATE INDEX ON "documento" ("unidade_id");

CREATE INDEX ON "documento" ("data_validade");

CREATE INDEX ON "documento" ("categoria");

CREATE INDEX ON "tarefa" ("unidade_id");

CREATE INDEX ON "tarefa" ("status");

CREATE INDEX ON "codigo_verificacao" ("usuario_id", "created_at");

CREATE INDEX ON "refresh_token" ("usuario_id");

CREATE INDEX ON "historico_alteracao" ("unidade_id");

CREATE INDEX ON "historico_alteracao" ("created_at");

ALTER TABLE "usuario" ADD FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "unidade" ADD FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "documento" ADD FOREIGN KEY ("unidade_id") REFERENCES "unidade" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tarefa" ADD FOREIGN KEY ("unidade_id") REFERENCES "unidade" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "codigo_verificacao" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "refresh_token" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "historico_alteracao" ADD FOREIGN KEY ("unidade_id") REFERENCES "unidade" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "historico_alteracao" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id") DEFERRABLE INITIALLY IMMEDIATE;

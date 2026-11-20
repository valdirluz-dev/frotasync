CREATE EXTENSION IF NOT EXISTS "unaccent";

ALTER TABLE unidade DROP CONSTRAINT uq_unidade_empresa_codigo;
CREATE UNIQUE INDEX uq_unidade_empresa_codigo_ci ON unidade (empresa_id, lower(codigo));

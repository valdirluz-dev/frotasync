ALTER TABLE historico_alteracao
    ADD COLUMN entidade_nome VARCHAR(150) NOT NULL DEFAULT '';

ALTER TABLE historico_alteracao
    ALTER COLUMN entidade_nome DROP DEFAULT;

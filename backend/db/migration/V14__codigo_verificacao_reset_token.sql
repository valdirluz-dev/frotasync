ALTER TABLE codigo_verificacao
    ADD COLUMN reset_token_hash CHAR(64),
    ADD COLUMN reset_expira_em TIMESTAMPTZ,
    ADD CONSTRAINT ck_codigo_reset CHECK (
        (reset_token_hash IS NULL AND reset_expira_em IS NULL)
        OR (reset_token_hash IS NOT NULL AND reset_expira_em IS NOT NULL)
    );

CREATE UNIQUE INDEX uq_codigo_reset_token
    ON codigo_verificacao (reset_token_hash) WHERE reset_token_hash IS NOT NULL;

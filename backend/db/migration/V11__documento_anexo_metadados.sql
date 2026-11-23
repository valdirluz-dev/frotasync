ALTER TABLE documento
    ADD COLUMN anexo_tamanho_bytes BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN anexo_tipo VARCHAR(100) NOT NULL DEFAULT 'application/pdf';

ALTER TABLE documento
    ALTER COLUMN anexo_tamanho_bytes DROP DEFAULT,
    ALTER COLUMN anexo_tipo DROP DEFAULT,
    ADD CONSTRAINT ck_documento_anexo_tamanho CHECK (anexo_tamanho_bytes BETWEEN 0 AND 10485760),
    ADD CONSTRAINT ck_documento_anexo_tipo CHECK (anexo_tipo IN ('application/pdf', 'image/jpeg', 'image/png'));

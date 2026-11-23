CREATE TABLE documento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID NOT NULL REFERENCES unidade(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    tipo VARCHAR(60),
    categoria VARCHAR(40) NOT NULL,
    data_emissao DATE,
    data_validade DATE NOT NULL,
    descricao TEXT,
    anexo_nome VARCHAR(255) NOT NULL,
    anexo_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_documento_datas CHECK (data_emissao IS NULL OR data_emissao <= data_validade)
);

CREATE INDEX idx_documento_unidade_id ON documento (unidade_id);
CREATE INDEX idx_documento_data_validade ON documento (data_validade);
CREATE INDEX idx_documento_categoria ON documento (categoria);

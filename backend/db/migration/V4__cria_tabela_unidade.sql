CREATE TABLE unidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id) ON DELETE RESTRICT,
    nome VARCHAR(150) NOT NULL,
    codigo VARCHAR(30) NOT NULL,
    cep CHAR(8) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    descricao TEXT,
    status VARCHAR(10) NOT NULL DEFAULT 'ativa',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_unidade_empresa_codigo UNIQUE (empresa_id, codigo),
    CONSTRAINT ck_unidade_cep CHECK (cep ~ '^[0-9]{8}$'),
    CONSTRAINT ck_unidade_uf CHECK (uf ~ '^[A-Z]{2}$'),
    CONSTRAINT ck_unidade_status CHECK (status IN ('ativa', 'inativa'))
);

CREATE INDEX idx_unidade_status ON unidade (status);

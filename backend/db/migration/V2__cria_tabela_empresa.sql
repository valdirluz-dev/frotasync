CREATE TABLE empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_fantasia VARCHAR(150) NOT NULL,
    razao_social VARCHAR(200) NOT NULL,
    cnpj CHAR(14) NOT NULL,
    segmento VARCHAR(100) NOT NULL,
    tipo_unidade VARCHAR(10) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_empresa_cnpj UNIQUE (cnpj),
    CONSTRAINT ck_empresa_cnpj CHECK (cnpj ~ '^[0-9]{14}$'),
    CONSTRAINT ck_empresa_tipo_unidade CHECK (tipo_unidade IN ('matriz', 'filial'))
);

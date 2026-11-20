CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id) ON DELETE RESTRICT,
    nome VARCHAR(150) NOT NULL,
    cpf CHAR(11) NOT NULL,
    telefone VARCHAR(11) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    email VARCHAR(180) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    papel VARCHAR(20) NOT NULL DEFAULT 'colaborador',
    aceite_termos_em TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_usuario_email UNIQUE (email),
    CONSTRAINT uq_usuario_cpf UNIQUE (cpf),
    CONSTRAINT ck_usuario_cpf CHECK (cpf ~ '^[0-9]{11}$'),
    CONSTRAINT ck_usuario_telefone CHECK (telefone ~ '^[0-9]{10,11}$'),
    CONSTRAINT ck_usuario_papel CHECK (papel IN ('colaborador', 'gestor', 'administrador'))
);

CREATE INDEX idx_usuario_empresa_id ON usuario (empresa_id);

CREATE TABLE historico_alteracao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID NOT NULL REFERENCES unidade(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuario(id) ON DELETE SET NULL,
    entidade VARCHAR(20) NOT NULL,
    entidade_id UUID NOT NULL,
    acao VARCHAR(20) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_historico_entidade CHECK (entidade IN ('unidade', 'documento', 'tarefa')),
    CONSTRAINT ck_historico_acao CHECK (acao IN ('criacao', 'edicao', 'exclusao', 'ativacao', 'inativacao'))
);

CREATE INDEX idx_historico_unidade_id ON historico_alteracao (unidade_id);
CREATE INDEX idx_historico_created_at ON historico_alteracao (created_at);

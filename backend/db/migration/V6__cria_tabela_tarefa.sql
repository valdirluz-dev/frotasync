CREATE TABLE tarefa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidade_id UUID NOT NULL REFERENCES unidade(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    prazo DATE NOT NULL,
    data_conclusao TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_tarefa_status CHECK (status IN ('pendente', 'em_andamento', 'concluida')),
    CONSTRAINT ck_tarefa_conclusao CHECK (
        (status = 'concluida' AND data_conclusao IS NOT NULL)
        OR (status <> 'concluida' AND data_conclusao IS NULL)
    )
);

CREATE INDEX idx_tarefa_unidade_id ON tarefa (unidade_id);
CREATE INDEX idx_tarefa_status ON tarefa (status);

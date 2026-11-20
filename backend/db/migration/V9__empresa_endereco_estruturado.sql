-- O cadastro da empresa coleta endereço estruturado (RF-019).
-- Linhas legadas (apenas dados fictícios) recebem valores neutros.
ALTER TABLE empresa
    ADD COLUMN cep CHAR(8),
    ADD COLUMN logradouro VARCHAR(150),
    ADD COLUMN numero VARCHAR(10),
    ADD COLUMN complemento VARCHAR(100),
    ADD COLUMN bairro VARCHAR(100),
    ADD COLUMN cidade VARCHAR(100),
    ADD COLUMN uf CHAR(2);

UPDATE empresa
   SET cep = '00000000',
       logradouro = LEFT(endereco, 150),
       numero = 'S/N',
       bairro = 'Não informado',
       cidade = 'Não informada',
       uf = 'PE';

ALTER TABLE empresa
    ALTER COLUMN cep SET NOT NULL,
    ALTER COLUMN logradouro SET NOT NULL,
    ALTER COLUMN numero SET NOT NULL,
    ALTER COLUMN bairro SET NOT NULL,
    ALTER COLUMN cidade SET NOT NULL,
    ALTER COLUMN uf SET NOT NULL,
    ADD CONSTRAINT ck_empresa_cep CHECK (cep ~ '^[0-9]{8}$'),
    ADD CONSTRAINT ck_empresa_uf CHECK (uf ~ '^[A-Z]{2}$'),
    DROP COLUMN endereco;

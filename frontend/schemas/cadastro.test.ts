import { describe, expect, it } from "vitest";

import { cadastroAcessoSchema, loginSchema } from "./acesso";
import { cadastroEmpresaSchema } from "./cadastroEmpresa";
import { cadastroPessoalSchema } from "./cadastroPessoal";

describe("schemas de autenticação e cadastro", () => {
  it("valida os dados pessoais com CPF válido", () => {
    expect(
      cadastroPessoalSchema.safeParse({
        nome: "Pessoa Exemplo",
        cpf: "529.982.247-25",
        telefone: "+55 (11) 99999-9999",
        cargo: "Gestor",
      }).success,
    ).toBe(true);

    expect(
      cadastroPessoalSchema.safeParse({
        nome: "Pessoa Exemplo",
        cpf: "111.111.111-11",
        telefone: "+55 (11) 99999-9999",
        cargo: "Gestor",
      }).success,
    ).toBe(false);
  });

  it("valida os dados da empresa com CNPJ válido", () => {
    expect(
      cadastroEmpresaSchema.safeParse({
        nomeEmpresa: "Frota Sync",
        razaoSocial: "Frota Sync LTDA",
        cnpj: "04.252.011/0001-10",
        segmento: "Logística",
        tipoUnidade: "Matriz",
        cep: "50000-000",
        estado: "PE",
        cidade: "Recife",
        bairro: "Centro",
        logradouro: "Rua Exemplo",
        numero: "10",
      }).success,
    ).toBe(true);

    expect(
      cadastroEmpresaSchema.safeParse({
        nomeEmpresa: "Frota Sync",
        razaoSocial: "Frota Sync LTDA",
        cnpj: "11.111.111/1111-11",
        segmento: "Logística",
        tipoUnidade: "Matriz",
        cep: "50000-000",
        estado: "PE",
        cidade: "Recife",
        bairro: "Centro",
        logradouro: "Rua Exemplo",
        numero: "10",
      }).success,
    ).toBe(false);
  });

  it("valida e-mail, senha, confirmação e aceite no cadastro de acesso", () => {
    expect(
      cadastroAcessoSchema.safeParse({
        email: "gestor@example.com",
        senha: "SenhaForte1!",
        confirmarSenha: "SenhaForte1!",
        aceiteTermos: true,
      }).success,
    ).toBe(true);

    expect(
      cadastroAcessoSchema.safeParse({
        email: "gestor@example.com",
        senha: "senha-fraca",
        confirmarSenha: "outra-senha",
        aceiteTermos: false,
      }).success,
    ).toBe(false);
  });

  it("mantém o login limitado à validação de campos obrigatórios", () => {
    expect(loginSchema.safeParse({ email: "gestor", senha: "x" }).success).toBe(
      true,
    );
    expect(loginSchema.safeParse({ email: " ", senha: "" }).success).toBe(
      false,
    );
  });
});

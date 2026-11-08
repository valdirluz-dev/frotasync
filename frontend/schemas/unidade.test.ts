import { describe, expect, it } from "vitest";

import { unidadeSchema } from "./unidade";

const validValues = {
  nome: "  Unidade Centro  ",
  identificador: "002",
  cep: "50000-000",
  logradouro: " Avenida Exemplo ",
  numero: "123",
  complemento: "",
  cidade: " Recife ",
  bairro: " Centro ",
  uf: "PE",
  descricao: "",
};

describe("unidadeSchema", () => {
  it("aceita dados válidos, remove espaços externos e normaliza o CEP", () => {
    const result = unidadeSchema.safeParse(validValues);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nome).toBe("Unidade Centro");
      expect(result.data.cep).toBe("50000000");
    }
  });

  it("identifica campos obrigatórios ausentes", () => {
    const result = unidadeSchema.safeParse({});

    expect(result.success).toBe(false);
    if (!result.success) {
      const invalidFields = result.error.issues.map((issue) => issue.path[0]);
      expect(invalidFields).toEqual(
        expect.arrayContaining([
          "nome",
          "identificador",
          "cep",
          "logradouro",
          "numero",
          "cidade",
          "bairro",
          "uf",
        ]),
      );
    }
  });

  it("rejeita CEP inválido", () => {
    expect(
      unidadeSchema.safeParse({ ...validValues, cep: "1234-ABC" }).success,
    ).toBe(false);
  });

  it("rejeita UF fora das 27 siglas", () => {
    expect(unidadeSchema.safeParse({ ...validValues, uf: "XX" }).success).toBe(
      false,
    );
  });

  it("aceita complemento vazio por ser opcional", () => {
    expect(
      unidadeSchema.safeParse({ ...validValues, complemento: "   " }).success,
    ).toBe(true);
  });
});

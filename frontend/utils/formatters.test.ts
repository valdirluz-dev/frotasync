import { describe, expect, it } from "vitest";

import {
  formatCep,
  formatCnpj,
  formatCpf,
  formatPhone,
} from "./formatters";
import {
  isValidCnpj,
  isValidCpf,
} from "./validators";

describe("formatadores de documentos e telefone", () => {
  it("formata CPF, CNPJ, CEP e telefone", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
    expect(formatCnpj("04252011000110")).toBe("04.252.011/0001-10");
    expect(formatCep("50000000")).toBe("50000-000");
    expect(formatPhone("5511999999999")).toBe("+55 (11) 99999-9999");
  });

  it("valida os dígitos verificadores de CPF e CNPJ", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCnpj("04.252.011/0001-10")).toBe(true);
    expect(isValidCnpj("11.111.111/1111-11")).toBe(false);
  });
});

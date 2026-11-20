import { describe, expect, it } from "vitest";

import { mockNovoDocumento } from "@/mocks/documentos";
import { documentoCadastroSchema, documentoSchema } from "./documento";

describe("documentoSchema", () => {
  it("permite omitir a data de emissão e o anexo ao editar", () => {
    const result = documentoSchema.safeParse(mockNovoDocumento);

    expect(result.success).toBe(true);
  });

  it("exige anexo no cadastro", () => {
    const result = documentoCadastroSchema.safeParse(mockNovoDocumento);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "anexo")).toBe(
        true,
      );
    }
  });

  it("não permite emissão posterior ao vencimento", () => {
    const result = documentoSchema.safeParse({
      ...mockNovoDocumento,
      dataEmissao: "2028-01-01",
      dataValidade: "2027-12-31",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["dataEmissao"]);
    }
  });

  it("rejeita datas fora do formato ISO ou inexistentes", () => {
    const result = documentoSchema.safeParse({
      ...mockNovoDocumento,
      dataValidade: "2027-02-31",
    });

    expect(result.success).toBe(false);
  });

  it("exige nome, unidade, categoria e vencimento", () => {
    const result = documentoSchema.safeParse({
      ...mockNovoDocumento,
      nome: "",
      unidadeId: "",
      categoria: "",
      dataValidade: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining([
          "nome",
          "unidadeId",
          "categoria",
          "dataValidade",
        ]),
      );
    }
  });
});

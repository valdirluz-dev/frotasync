import { describe, expect, it } from "vitest";

import { mockNovaTarefa } from "@/mocks/tarefas";
import { tarefaEdicaoSchema, tarefaSchema } from "./tarefa";

describe("tarefaSchema", () => {
  it("aceita dados válidos e normaliza os espaços", () => {
    const result = tarefaSchema.safeParse({
      ...mockNovaTarefa,
      titulo: "  Manutenção preventiva  ",
      descricao: "  Conferir os veículos  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.titulo).toBe("Manutenção preventiva");
      expect(result.data.descricao).toBe("Conferir os veículos");
    }
  });

  it("exige título, unidade e prazo com data válida", () => {
    const result = tarefaSchema.safeParse({
      ...mockNovaTarefa,
      titulo: "",
      unidadeId: "",
      prazoFinal: "2027-02-31",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(["titulo", "unidadeId", "prazoFinal"]),
      );
    }
  });

  it("aceita tarefa atrasada quando o prazo não foi alterado", () => {
    const result = tarefaEdicaoSchema(
      "2020-01-01",
      new Date("2026-10-06T00:00:00Z"),
    ).safeParse({ ...mockNovaTarefa, prazoFinal: "2020-01-01" });

    expect(result.success).toBe(true);
  });

  it("recusa alteração do prazo para uma data passada", () => {
    const result = tarefaEdicaoSchema(
      "2020-01-02",
      new Date("2026-10-06T00:00:00Z"),
    ).safeParse({ ...mockNovaTarefa, prazoFinal: "2020-01-01" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "O prazo não pode ser anterior a hoje quando alterado.",
      );
    }
  });
});

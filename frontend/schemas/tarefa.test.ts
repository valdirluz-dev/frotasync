import { describe, expect, it } from "vitest";
import { tarefaEdicaoSchema } from "./tarefa";

const validTask = {
  titulo: "Manutenção preventiva",
  prazoFinal: "2020-01-01",
  descricao: "",
};

describe("prazo de tarefa", () => {
  it("aceita tarefa atrasada quando o prazo não foi alterado", () => {
    expect(
      tarefaEdicaoSchema("2020-01-01", new Date("2026-10-06T00:00:00Z"))
        .safeParse(validTask).success,
    ).toBe(true);
  });

  it("recusa alteração para o passado", () => {
    const result = tarefaEdicaoSchema(
      "2020-01-02",
      new Date("2026-10-06T00:00:00Z"),
    ).safeParse(validTask);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "O prazo não pode ser anterior a hoje quando alterado.",
      );
    }
  });
});

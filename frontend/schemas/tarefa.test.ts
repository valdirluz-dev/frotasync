import { describe, expect, it } from "vitest";
import { prazoAlteradoValido } from "./tarefa";

describe("prazo de tarefa", () => {
  it("aceita tarefa atrasada quando o prazo não foi alterado", () => {
    expect(prazoAlteradoValido("2020-01-01", "2020-01-01", new Date("2026-10-06T00:00:00Z"))).toBe(true);
  });

  it("recusa alteração para o passado", () => {
    expect(prazoAlteradoValido("2020-01-01", "2020-01-02", new Date("2026-10-06T00:00:00Z"))).toBe(false);
  });
});

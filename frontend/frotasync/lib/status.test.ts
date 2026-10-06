import { describe, expect, it } from "vitest";

import { calcularStatusDocumento } from "./status";

describe("calcularStatusDocumento", () => {
  const hoje = new Date("2026-10-06T12:00:00.000Z");

  it("marca validade acima de 15 dias como válida", () => {
    expect(calcularStatusDocumento("2026-10-22", hoje)).toBe("Válido");
  });

  it("marca validade dentro dos próximos 15 dias como próxima", () => {
    expect(calcularStatusDocumento("2026-10-21", hoje)).toBe(
      "Próximo do vencimento",
    );
    expect(calcularStatusDocumento("2026-10-06", hoje)).toBe(
      "Próximo do vencimento",
    );
  });

  it("marca data anterior a hoje como expirada", () => {
    expect(calcularStatusDocumento("2026-10-05", hoje)).toBe("Expirado");
  });
});

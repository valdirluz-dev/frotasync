import type { DocumentoStatus } from "@/types/dashboard";

const DAY_MS = 24 * 60 * 60 * 1000;

function utcDay(value: Date | string): number {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return Date.parse(`${value}T00:00:00.000Z`);
  }

  const date = value instanceof Date ? value : new Date(value);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function calcularStatusDocumento(
  dataValidade: Date | string,
  hoje: Date = new Date(),
): DocumentoStatus {
  const diasRestantes = Math.floor(
    (utcDay(dataValidade) - utcDay(hoje)) / DAY_MS,
  );

  if (diasRestantes < 0) return "Expirado";
  if (diasRestantes <= 15) return "Próximo do vencimento";
  return "Válido";
}

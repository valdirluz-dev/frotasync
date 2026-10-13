export function normalizarCep(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function formatarCep(value: string): string {
  const digits = normalizarCep(value);
  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
}

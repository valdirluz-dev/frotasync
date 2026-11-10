export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCpf(value: string) {
  return onlyDigits(value)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .slice(0, 14);
}

export function formatCnpj(value: string) {
  return onlyDigits(value)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
}

export function formatCep(value: string) {
  return onlyDigits(value).replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
}

export function formatPhone(value: string) {
  const digits = onlyDigits(value);
  if (digits.length <= 2) return digits ? `+${digits}` : "";
  if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)})`;
  if (digits.length <= 9) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;
  }
  return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
}

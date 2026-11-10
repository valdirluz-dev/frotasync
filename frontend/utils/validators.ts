import { onlyDigits } from "./formatters";

export function isValidCpf(value: string) {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const calculateDigit = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return (
    calculateDigit(9) === Number(digits[9]) &&
    calculateDigit(10) === Number(digits[10])
  );
}

export function isValidCnpj(value: string) {
  const digits = onlyDigits(value);
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;

  const calculateDigit = (length: number) => {
    let sum = 0;
    let weight = length - 7;

    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * weight;
      weight -= 1;
      if (weight < 2) weight = 9;
    }

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return (
    calculateDigit(12) === Number(digits[12]) &&
    calculateDigit(13) === Number(digits[13])
  );
}

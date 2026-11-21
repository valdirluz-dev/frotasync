export function cpfValido(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf)) return false;

  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcularDigito = (base: string, pesoInicial: number): number => {
    let soma = 0;

    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiroDigito = calcularDigito(cpf.slice(0, 9), 10);

  if (primeiroDigito !== Number(cpf[9])) return false;

  const segundoDigito = calcularDigito(cpf.slice(0, 10), 11);

  return segundoDigito === Number(cpf[10]);
}

export function cnpjValido(cnpj: string): boolean {
  if (!/^\d{14}$/.test(cnpj)) return false;

  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcularDigito = (base: string, pesos: number[]): number => {
    const soma = base
      .split('')
      .reduce((total, digito, index) => total + Number(digito) * pesos[index], 0);

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiroDigito = calcularDigito(cnpj.slice(0, 12), [
    5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
  ]);

  if (primeiroDigito !== Number(cnpj[12])) return false;

  const segundoDigito = calcularDigito(cnpj.slice(0, 13), [
    6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
  ]);

  return segundoDigito === Number(cnpj[13]);
}

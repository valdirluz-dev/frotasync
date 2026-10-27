export interface IDadosEmpresa {
  nomeEmpresa: string;
  razaoSocial: string;
  cnpj: string;
  segmento: string;
  tipoUnidade: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
}

export async function mockValidarDadosEmpresa(dados: IDadosEmpresa) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!dados.razaoSocial || !dados.cnpj || !dados.cep || !dados.endereco) {
    return { success: false, message: "Preencha todos os campos obrigatórios da empresa." };
  }

  return { success: true, message: "Dados da empresa validados com sucesso!" };
}
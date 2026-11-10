// frontend/mocks/dadosEmpresa.ts
import { rascunhoCadastro, usuarioLogadoAtual } from "./authStore";

export type DadosEmpresaSeed = {
  id?: string;
  nomeEmpresa: string;
  razaoSocial: string;
  cnpj: string;
  segmento: string;
  tipoUnidade: string;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  logradouro: string;
  numero: string;
  criadoEm?: string;
};

export function obterDadosEmpresaSalvos(): DadosEmpresaSeed[] {
  return [
    {
      id: "emp-001",
      nomeEmpresa: rascunhoCadastro.nomeEmpresa || usuarioLogadoAtual.nomeEmpresa,
      razaoSocial: rascunhoCadastro.razaoSocial || usuarioLogadoAtual.razaoSocial,
      cnpj: rascunhoCadastro.cnpj || usuarioLogadoAtual.cnpj,
      segmento: rascunhoCadastro.segmento || usuarioLogadoAtual.segmento,
      tipoUnidade: rascunhoCadastro.tipoUnidade || usuarioLogadoAtual.tipoUnidade,
      cep: rascunhoCadastro.cep || usuarioLogadoAtual.cep,
      estado: rascunhoCadastro.estado || usuarioLogadoAtual.estado,
      cidade: rascunhoCadastro.cidade || usuarioLogadoAtual.cidade,
      bairro: rascunhoCadastro.bairro || usuarioLogadoAtual.bairro,
      logradouro: rascunhoCadastro.logradouro || usuarioLogadoAtual.logradouro,
      numero: rascunhoCadastro.numero || usuarioLogadoAtual.numero,
    },
  ];
}

export async function mockValidarDadosEmpresa(novosDados: Partial<DadosEmpresaSeed>) {
  await new Promise((r) => setTimeout(r, 300));
  
  // Atualiza a memória
  Object.assign(rascunhoCadastro, novosDados);

  return {
    success: true,
    message: "Dados da empresa guardados com sucesso!",
  };
}
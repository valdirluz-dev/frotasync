// frontend/mocks/profile.ts
import { usuarioLogadoAtual } from "./authStore";

export type ProfileData = {
  nome: string;
  cpf: string;
  telefone: string;
  cargo: string;
  email: string;
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
};

export function obterPerfilConsolidado(): ProfileData {
  // Retorna diretamente o usuário em memória, sem depender de localStorage
  return {
    nome: usuarioLogadoAtual.nome,
    cpf: usuarioLogadoAtual.cpf,
    telefone: usuarioLogadoAtual.telefone,
    cargo: usuarioLogadoAtual.cargo,
    email: usuarioLogadoAtual.email,
    nomeEmpresa: usuarioLogadoAtual.nomeEmpresa,
    razaoSocial: usuarioLogadoAtual.razaoSocial,
    cnpj: usuarioLogadoAtual.cnpj,
    segmento: usuarioLogadoAtual.segmento,
    tipoUnidade: usuarioLogadoAtual.tipoUnidade,
    cep: usuarioLogadoAtual.cep,
    estado: usuarioLogadoAtual.estado,
    cidade: usuarioLogadoAtual.cidade,
    bairro: usuarioLogadoAtual.bairro,
    logradouro: usuarioLogadoAtual.logradouro,
    numero: usuarioLogadoAtual.numero,
  };
}
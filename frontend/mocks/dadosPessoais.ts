// frontend/mocks/dadosPessoais.ts
import { rascunhoCadastro, usuarioLogadoAtual } from "./authStore";

export type DadosPessoaisSeed = {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  cargo: string;
  criadoEm: string;
};

export function obterDadosPessoaisSalvos(): DadosPessoaisSeed[] {
  return [
    {
      id: usuarioLogadoAtual.id,
      nome: rascunhoCadastro.nome || usuarioLogadoAtual.nome,
      cpf: rascunhoCadastro.cpf || usuarioLogadoAtual.cpf,
      telefone: rascunhoCadastro.telefone || usuarioLogadoAtual.telefone,
      cargo: rascunhoCadastro.cargo || usuarioLogadoAtual.cargo,
      criadoEm: usuarioLogadoAtual.criadoEm,
    },
  ];
}

export async function simularEnvioDadosPessoais(novosDados: Partial<DadosPessoaisSeed>) {
  await new Promise((r) => setTimeout(r, 300));
  
  // Salva no rascunho da memória RAM
  Object.assign(rascunhoCadastro, novosDados);

  return {
    success: true,
    message: "Dados pessoais guardados na memória com sucesso!",
  };
}
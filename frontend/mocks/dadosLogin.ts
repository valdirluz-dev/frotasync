
import { loginSchema } from "@/schemas/acesso";

import { tabelaUsuarios, rascunhoCadastro, setUsuarioLogado, UsuarioRegistro } from "./authStore";

export interface IDadosLogin {
  email: string;
  senha: string;
  confirmarSenha?: string;
}

export function obterDadosLoginSalvos(): IDadosLogin[] {
  return tabelaUsuarios.map((u) => ({
    email: u.email,
    senha: u.senhaHash,
  }));
}

export async function mockValidarDadosLogin(novosDados: IDadosLogin) {
  await new Promise((r) => setTimeout(r, 400));

  if (!loginSchema.safeParse(novosDados).success) {
    return { success: false, message: "Preencha o e-mail corporativo e a senha." };
  }

  // Verifica se o e-mail já existe
  const jaExiste = tabelaUsuarios.some(
    (u) => u.email.toLowerCase() === novosDados.email.trim().toLowerCase()
  );

  if (jaExiste) {
    return { success: false, message: "Este e-mail corporativo já está em uso." };
  }

  // Consolida o novo usuário com todas as etapas do cadastro
  const novoUsuarioCompleto: UsuarioRegistro = {
    id: `usr-${Date.now()}`,
    nome: rascunhoCadastro.nome || "Novo Usuário",
    cpf: rascunhoCadastro.cpf || "",
    telefone: rascunhoCadastro.telefone || "",
    cargo: rascunhoCadastro.cargo || "Administrador",
    email: novosDados.email,
    senhaHash: novosDados.senha, // Na persistência, apenas a senha
    nomeEmpresa: rascunhoCadastro.nomeEmpresa || "",
    razaoSocial: rascunhoCadastro.razaoSocial || "",
    cnpj: rascunhoCadastro.cnpj || "",
    segmento: rascunhoCadastro.segmento || "",
    tipoUnidade: rascunhoCadastro.tipoUnidade || "Matriz",
    cep: rascunhoCadastro.cep || "",
    estado: rascunhoCadastro.estado || "",
    cidade: rascunhoCadastro.cidade || "",
    bairro: rascunhoCadastro.bairro || "",
    logradouro: rascunhoCadastro.logradouro || "",
    numero: rascunhoCadastro.numero || "",
    criadoEm: new Date().toISOString().slice(0, 10),
  };

  // Insere na lista em memória e torna-o o usuário atual
  tabelaUsuarios.push(novoUsuarioCompleto);
  setUsuarioLogado(novoUsuarioCompleto);

  return {
    success: true,
    message: "Cadastro finalizado com sucesso!",
  };
}
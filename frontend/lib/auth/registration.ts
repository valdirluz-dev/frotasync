import { randomUUID } from "node:crypto";
import { z } from "zod";

import { cadastroAcessoSchema } from "@/schemas/acesso";
import { cadastroEmpresaSchema } from "@/schemas/cadastroEmpresa";
import { cadastroPessoalSchema } from "@/schemas/cadastroPessoal";
import { adicionarUsuario, buscarUsuarioPorEmail } from "@/mocks/authStore";
import type { UsuarioRegistro } from "@/mocks/authStore";
import { hashPassword } from "@/lib/auth/password";

const registrationRequestSchema = z.object({
  ...cadastroPessoalSchema.shape,
  ...cadastroEmpresaSchema.shape,
  ...cadastroAcessoSchema.shape,
  website: z.string().optional(),
});

export async function registrarUsuario(input: unknown) {
  const result = registrationRequestSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false as const,
      status: 400,
      message: "Confira os dados preenchidos e tente novamente.",
    };
  }

  if (result.data.website?.trim()) {
    return {
      success: false as const,
      status: 400,
      message: "Não foi possível concluir o cadastro.",
    };
  }

  if (buscarUsuarioPorEmail(result.data.email)) {
    return {
      success: false as const,
      status: 409,
      message: "Este e-mail corporativo já está em uso.",
    };
  }

  const user: UsuarioRegistro = {
    id: `usr-${randomUUID()}`,
    nome: result.data.nome.trim(),
    cpf: result.data.cpf,
    telefone: result.data.telefone,
    cargo: result.data.cargo.trim(),
    email: result.data.email.trim(),
    senhaHash: await hashPassword(result.data.senha),
    nomeEmpresa: result.data.nomeEmpresa.trim(),
    razaoSocial: result.data.razaoSocial.trim(),
    cnpj: result.data.cnpj,
    segmento: result.data.segmento.trim(),
    tipoUnidade: result.data.tipoUnidade.trim(),
    cep: result.data.cep,
    estado: result.data.estado.trim(),
    cidade: result.data.cidade.trim(),
    bairro: result.data.bairro.trim(),
    logradouro: result.data.logradouro.trim(),
    numero: result.data.numero.trim(),
    criadoEm: new Date().toISOString().slice(0, 10),
  };

  if (!adicionarUsuario(user)) {
    return {
      success: false as const,
      status: 409,
      message: "Este e-mail corporativo já está em uso.",
    };
  }

  return { success: true as const };
}

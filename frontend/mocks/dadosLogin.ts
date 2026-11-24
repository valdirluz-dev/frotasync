
import { loginSchema } from "@/schemas/acesso";
import { rascunhoCadastro } from "./authStore";
import { ApiError, http } from "@/lib/http";

export interface IDadosLogin {
  email: string;
  senha: string;
  confirmarSenha?: string;
  aceiteTermos?: boolean;
  website?: string;
}

export async function mockValidarDadosLogin(novosDados: IDadosLogin) {
  if (!loginSchema.safeParse(novosDados).success) {
    return { success: false, message: "Preencha o e-mail corporativo e a senha." };
  }

  const digits = (value?: string) => value?.replace(/\D/g, "") ?? "";

  try {
    await http("/auth/cadastro", {
      method: "POST",
      body: {
        pessoais: {
          nome: rascunhoCadastro.nome,
          cpf: digits(rascunhoCadastro.cpf),
          telefone: digits(rascunhoCadastro.telefone).replace(/^55/, ""),
          cargo: rascunhoCadastro.cargo,
        },
        empresa: {
          nomeEmpresa: rascunhoCadastro.nomeEmpresa,
          razaoSocial: rascunhoCadastro.razaoSocial,
          cnpj: digits(rascunhoCadastro.cnpj),
          segmento: rascunhoCadastro.segmento,
          tipoUnidade:
            rascunhoCadastro.tipoUnidade?.toLowerCase() === "filial"
              ? "filial"
              : "matriz",
          cep: digits(rascunhoCadastro.cep),
          logradouro: rascunhoCadastro.logradouro,
          numero: rascunhoCadastro.numero,
          bairro: rascunhoCadastro.bairro,
          cidade: rascunhoCadastro.cidade,
          uf: rascunhoCadastro.estado,
        },
        login: {
          email: novosDados.email,
          senha: novosDados.senha,
          confirmarSenha: novosDados.confirmarSenha,
          aceiteTermos: novosDados.aceiteTermos,
        },
      },
    });
    return { success: true, message: "Cadastro finalizado com sucesso!" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof ApiError
          ? error.response.message
          : "Não foi possível concluir o cadastro.",
    };
  }
}
import { mockUsuarioSessao } from "@/mocks/sessao";

export { mockFazerLogin as fazerLogin } from "@/mocks/login";
export { mockValidarDadosLogin as validarDadosLogin } from "@/mocks/dadosLogin";
export { mockValidarDadosEmpresa as validarDadosEmpresa } from "@/mocks/dadosEmpresa";
export { simularEnvioDadosPessoais as salvarDadosPessoais } from "@/mocks/dadosPessoais";
export { obterPerfilConsolidado } from "@/mocks/profile";
export type { ProfileData } from "@/mocks/profile";

export function obterSessao() {
  return mockUsuarioSessao;
}

import { obterSessao } from "@/services/accountService";

export function useSessao() {
  return { usuario: obterSessao() };
}

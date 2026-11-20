// frontend/mocks/sessao.ts
import type { UsuarioSessao } from "../types/domain";
import { usuarioLogadoAtual } from "./authStore";

export const mockUsuarioSessao: UsuarioSessao = {
  nome: usuarioLogadoAtual.nome,
  perfil: "Administrador",
  email: usuarioLogadoAtual.email,
  cargo: usuarioLogadoAtual.cargo,
};
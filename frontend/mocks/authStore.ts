export interface UsuarioRegistro {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  cargo: string;
  email: string;
  senhaHash: string;
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
  criadoEm: string;
}

// 1. Usuário Padrão fixo 
const USUARIO_PADRAO: UsuarioRegistro = {
  id: "usr-001",
  nome: "Maria Luiza da Silva",
  cpf: "111.444.777-35",
  telefone: "+55 (81) 98765-4321",
  cargo: "Administradora de Frotas",
  email: "marialuiza@logisticaexpress.com.br",
  senhaHash: "#02Senha2000",
  nomeEmpresa: "Logística Express Ltda",
  razaoSocial: "Logística Express Transportes e Serviços S.A.",
  cnpj: "11.222.333/0001-81",
  segmento: "Transporte e Distribuição",
  tipoUnidade: "Matriz",
  cep: "50000-000",
  estado: "PE",
  cidade: "Recife",
  bairro: "Santo Amaro",
  logradouro: "Rua Exemplo",
  numero: "100",
  criadoEm: new Date().toISOString().slice(0, 10),
};

// "Tabelas" em memória RAM:
export const tabelaUsuarios: UsuarioRegistro[] = [USUARIO_PADRAO];

// Rascunho temporário do wizard de cadastro enquanto o usuário digita
export const rascunhoCadastro: Partial<UsuarioRegistro> = {};

export function buscarUsuarioPorEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return tabelaUsuarios.find(
    (usuario) => usuario.email.trim().toLowerCase() === normalizedEmail,
  );
}

export function adicionarUsuario(usuario: UsuarioRegistro): boolean {
  if (buscarUsuarioPorEmail(usuario.email)) return false;
  tabelaUsuarios.push(usuario);
  return true;
}

export function atualizarSenhaUsuario(userId: string, senhaHash: string): boolean {
  const usuario = tabelaUsuarios.find((item) => item.id === userId);
  if (!usuario) return false;
  usuario.senhaHash = senhaHash;
  return true;
}

// Usuário que fez login no momento
export let usuarioLogadoAtual: UsuarioRegistro = USUARIO_PADRAO;
export function setUsuarioLogado(usr: UsuarioRegistro) {
  usuarioLogadoAtual = usr;
}
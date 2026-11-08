export class UnidadeInativaError extends Error {
  readonly code = "UNIDADE_INATIVA";

  constructor() {
    super("Não é possível modificar registros de uma unidade inativa.");
    this.name = "UnidadeInativaError";
  }
}

export class RecursoNaoEncontradoError extends Error {
  constructor(resource: string) {
    super(`${resource} não encontrado.`);
    this.name = "RecursoNaoEncontradoError";
  }
}

export class PerfilSemPermissaoError extends Error {
  constructor() {
    super("Somente Administrador pode alterar o status da unidade.");
    this.name = "PerfilSemPermissaoError";
  }
}

export class IdentificadorUnidadeDuplicadoError extends Error {
  constructor() {
    super("Já existe uma unidade com este identificador");
    this.name = "IdentificadorUnidadeDuplicadoError";
  }
}

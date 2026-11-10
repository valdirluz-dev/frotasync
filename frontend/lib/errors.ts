export type AppErrorCode =
  | "UNIDADE_INATIVA"
  | "RECURSO_NAO_ENCONTRADO"
  | "RECURSO_JA_EXISTE"
  | "PERFIL_SEM_PERMISSAO"
  | "IDENTIFICADOR_DUPLICADO"
  | "CEP_INVALIDO"
  | "CEP_NAO_ENCONTRADO"
  | "CONSULTA_CEP_FALHOU";

export class AppError extends Error {
  constructor(
    message: string,
    readonly code: AppErrorCode,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AppError";
  }
}

export class UnidadeInativaError extends AppError {
  readonly code = "UNIDADE_INATIVA";

  constructor() {
    super(
      "Não é possível modificar registros de uma unidade inativa.",
      "UNIDADE_INATIVA",
    );
    this.name = "UnidadeInativaError";
  }
}

export class RecursoNaoEncontradoError extends AppError {
  constructor(resource: string) {
    super(`${resource} não encontrado.`, "RECURSO_NAO_ENCONTRADO");
    this.name = "RecursoNaoEncontradoError";
  }
}

export class RecursoJaExisteError extends AppError {
  constructor(resource: string) {
    super(`${resource} já existe.`, "RECURSO_JA_EXISTE");
    this.name = "RecursoJaExisteError";
  }
}

export class PerfilSemPermissaoError extends AppError {
  constructor() {
    super(
      "Somente Administrador pode alterar o status da unidade.",
      "PERFIL_SEM_PERMISSAO",
    );
    this.name = "PerfilSemPermissaoError";
  }
}

export class IdentificadorUnidadeDuplicadoError extends AppError {
  constructor() {
    super(
      "Já existe uma unidade com este identificador",
      "IDENTIFICADOR_DUPLICADO",
    );
    this.name = "IdentificadorUnidadeDuplicadoError";
  }
}

export class CepInvalidoError extends AppError {
  constructor() {
    super("Informe um CEP válido com 8 dígitos.", "CEP_INVALIDO");
    this.name = "CepInvalidoError";
  }
}

export class ConsultaCepError extends AppError {
  constructor(options?: ErrorOptions) {
    super("Não foi possível consultar o CEP.", "CONSULTA_CEP_FALHOU", options);
    this.name = "ConsultaCepError";
  }
}

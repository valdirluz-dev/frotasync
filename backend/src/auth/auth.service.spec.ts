import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { CadastroDto } from './schemas/cadastro.schema';
import { MailService } from '../mail/mail.service';

type FindUniqueArgs = {
  where: { email: string } | { cpf: string } | { cnpj: string };
  select?: { id: true };
};

type UsuarioLoginMock = {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  papel: string;
  empresa_id: string;
  senha_hash: string;
};

type EmpresaCreateArgs = {
  data: Record<string, unknown>;
};

type UsuarioCreateArgs = {
  data: Record<string, unknown>;
  select: Record<string, true>;
};

type TransactionMock = {
  refresh_token: {
    updateMany: jest.Mock<(args: unknown) => Promise<{ count: number }>>;
    create: jest.Mock<(args: unknown) => Promise<{ id: string }>>;
  };
  empresa: {
    create: jest.Mock<(args: EmpresaCreateArgs) => Promise<{ id: string }>>;
  };
  usuario: {
    create: jest.Mock<
      (args: UsuarioCreateArgs) => Promise<{
        id: string;
        nome: string;
        email: string;
        papel: string;
      }>
    >;
    update: jest.Mock<(args: unknown) => Promise<unknown>>;
  };
  codigo_verificacao: {
    updateMany: jest.Mock<
      (args: unknown) => Promise<{ count: number }>
    >;
  };
};

const dadosCadastro = {
  pessoais: {
    nome: 'Pessoa Exemplo',
    cpf: '12345678901',
    telefone: '11999999999',
    cargo: 'Gestor',
  },
  empresa: {
    nomeEmpresa: 'Empresa Exemplo',
    razaoSocial: 'Empresa Exemplo LTDA',
    cnpj: '12345678000199',
    segmento: 'Transporte',
    tipoUnidade: 'matriz',
    cep: '01001000',
    logradouro: 'Rua Exemplo',
    numero: '100',
    complemento: 'Sala 1',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
  },
  login: {
    email: ' pessoa@example.com ',
    senha: 'SenhaForte1!',
    confirmarSenha: 'SenhaForte1!',
    aceiteTermos: true,
  },
} satisfies CadastroDto;

const usuarioLoginMock: UsuarioLoginMock = {
  id: 'usuario-1',
  nome: 'Pessoa Exemplo',
  email: 'pessoa@example.com',
  cargo: 'Gestor',
  papel: 'administrador',
  empresa_id: 'empresa-1',
  senha_hash: 'hash-bcrypt-ficticio',
};

function createPrismaMock() {
  const tx: TransactionMock = {
    refresh_token: {
      updateMany: jest
        .fn<(args: unknown) => Promise<{ count: number }>>()
        .mockResolvedValue({ count: 1 }),
      create: jest
        .fn<(args: unknown) => Promise<{ id: string }>>()
        .mockResolvedValue({ id: 'refresh-2' }),
    },
    empresa: {
      create: jest
        .fn<(args: EmpresaCreateArgs) => Promise<{ id: string }>>()
        .mockResolvedValue({ id: 'empresa-1' }),
    },
    usuario: {
      create: jest
        .fn<
          (args: UsuarioCreateArgs) => Promise<{
            id: string;
            nome: string;
            email: string;
            papel: string;
          }>
        >()
        .mockResolvedValue({
          id: 'usuario-1',
          nome: dadosCadastro.pessoais.nome,
          email: 'pessoa@example.com',
          papel: 'administrador',
        }),
      update: jest
        .fn<(args: unknown) => Promise<unknown>>()
        .mockResolvedValue({}),
    },
    codigo_verificacao: {
      updateMany: jest
        .fn<(args: unknown) => Promise<{ count: number }>>()
        .mockResolvedValue({ count: 1 }),
    },
  };

  const prisma = {
    refresh_token: {
      create: jest
        .fn<(args: unknown) => Promise<{ id: string }>>()
        .mockResolvedValue({ id: 'refresh-1' }),
      findUnique: jest.fn<(args: unknown) => Promise<unknown>>(),
      updateMany: jest.fn<(args: unknown) => Promise<{ count: number }>>(),
    },
    usuario: {
      findUnique: jest
        .fn<
          (
            args: FindUniqueArgs,
          ) => Promise<UsuarioLoginMock | { id: string } | null>
        >()
        .mockResolvedValue(null),
    },
    codigo_verificacao: {
      findFirst: jest.fn<(args: unknown) => Promise<any>>(),
      create: jest.fn<(args: unknown) => Promise<any>>(),
      update: jest.fn<(args: unknown) => Promise<any>>(),
      updateMany: jest
        .fn<(args: unknown) => Promise<{ count: number }>>()
        .mockResolvedValue({ count: 1 }),
    },

    empresa: {
      findUnique: jest
        .fn<(args: FindUniqueArgs) => Promise<{ id: string } | null>>()
        .mockResolvedValue(null),
    },
    $transaction: jest
      .fn<
        (
          callback: (transaction: TransactionMock) => Promise<unknown>,
        ) => Promise<unknown>
      >()
      .mockImplementation(async (callback) => callback(tx)),
  };

  return { prisma: prisma as unknown as PrismaService, tx, mocks: prisma };
}

function createP2002Error(target: string | string[]) {
  return new Prisma.PrismaClientKnownRequestError(
    'Unique constraint failed on confidential_constraint',
    {
      code: 'P2002',
      clientVersion: '7.10.1',
      meta: { target },
    },
  );
}

async function expectConflict(
  promise: Promise<unknown>,
  codigo: string,
  campo: string,
  mensagem: string,
): Promise<void> {
  const error = await promise.then(
    () => {
      throw new Error('Era esperado um ConflictException.');
    },
    (caught: unknown) => caught,
  );

  expect(error).toBeInstanceOf(ConflictException);
  if (!(error instanceof ConflictException)) {
    return;
  }

  expect(error.getResponse()).toEqual({
    codigo,
    message: mensagem,
    errors: [{ field: campo, message: mensagem }],
  });
}

describe('AuthService.cadastrar', () => {
  let service: AuthService;
  let tx: TransactionMock;
  let mocks: ReturnType<typeof createPrismaMock>['mocks'];

  beforeEach(() => {
    const setup = createPrismaMock();

    service = new AuthService(setup.prisma, {
      signAsync: jest
        .fn<() => Promise<string>>()
        .mockResolvedValue('mock-access-token'),
    } as unknown as JwtService, {
      enviarCodigoRecuperacao: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    } as unknown as MailService);

    tx = setup.tx;
    mocks = setup.mocks;
    jest
      .spyOn(bcrypt, 'hash')
      .mockImplementation(() => Promise.resolve('senha-hash'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('cadastra empresa e usuário com dados normalizados e retorno público', async () => {
    const resultado = await service.cadastrar(dadosCadastro);

    expect(mocks.usuario.findUnique).toHaveBeenNthCalledWith(1, {
      where: { email: 'pessoa@example.com' },
      select: { id: true },
    });
    expect(mocks.usuario.findUnique).toHaveBeenNthCalledWith(2, {
      where: { cpf: dadosCadastro.pessoais.cpf },
      select: { id: true },
    });
    expect(mocks.empresa.findUnique).toHaveBeenCalledWith({
      where: { cnpj: dadosCadastro.empresa.cnpj },
      select: { id: true },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith(dadosCadastro.login.senha, 10);
    expect(mocks.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.empresa.create).toHaveBeenCalledWith({
      data: {
        nome_fantasia: dadosCadastro.empresa.nomeEmpresa,
        razao_social: dadosCadastro.empresa.razaoSocial,
        cnpj: dadosCadastro.empresa.cnpj,
        segmento: dadosCadastro.empresa.segmento,
        tipo_unidade: dadosCadastro.empresa.tipoUnidade,
        cep: dadosCadastro.empresa.cep,
        logradouro: dadosCadastro.empresa.logradouro,
        numero: dadosCadastro.empresa.numero,
        complemento: dadosCadastro.empresa.complemento,
        bairro: dadosCadastro.empresa.bairro,
        cidade: dadosCadastro.empresa.cidade,
        uf: dadosCadastro.empresa.uf,
      },
    });

    const usuarioArgs = tx.usuario.create.mock.calls[0]?.[0];
    expect(usuarioArgs).toEqual({
      data: {
        empresa_id: 'empresa-1',
        nome: dadosCadastro.pessoais.nome,
        cpf: dadosCadastro.pessoais.cpf,
        telefone: dadosCadastro.pessoais.telefone,
        cargo: dadosCadastro.pessoais.cargo,
        email: 'pessoa@example.com',
        senha_hash: 'senha-hash',
        papel: 'administrador',
        aceite_termos_em: expect.any(Date),
      },
      select: { id: true, nome: true, email: true, papel: true },
    });
    expect(resultado).toEqual({
      empresaId: 'empresa-1',
      usuario: {
        id: 'usuario-1',
        nome: dadosCadastro.pessoais.nome,
        email: 'pessoa@example.com',
        perfil: 'administrador',
      },
    });
    expect(resultado.usuario).not.toHaveProperty('senha');
    expect(resultado.usuario).not.toHaveProperty('senha_hash');
  });

  it('rejeita e-mail duplicado antes de abrir a transação', async () => {
    mocks.usuario.findUnique.mockResolvedValueOnce({ id: 'usuario-existente' });

    await expectConflict(
      service.cadastrar(dadosCadastro),
      'EMAIL_DUPLICADO',
      'login.email',
      'Este e-mail já está cadastrado.',
    );

    expect(mocks.$transaction).not.toHaveBeenCalled();
    expect(mocks.usuario.findUnique).toHaveBeenCalledTimes(1);
  });

  it('rejeita CPF duplicado antes de abrir a transação', async () => {
    mocks.usuario.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'usuario-existente' });

    await expectConflict(
      service.cadastrar(dadosCadastro),
      'CPF_DUPLICADO',
      'pessoais.cpf',
      'Este CPF já está cadastrado.',
    );

    expect(mocks.$transaction).not.toHaveBeenCalled();
    expect(mocks.empresa.findUnique).not.toHaveBeenCalled();
  });

  it('rejeita CNPJ duplicado antes de abrir a transação', async () => {
    mocks.empresa.findUnique.mockResolvedValueOnce({
      id: 'empresa-existente',
    });

    await expectConflict(
      service.cadastrar(dadosCadastro),
      'CNPJ_DUPLICADO',
      'empresa.cnpj',
      'Este CNPJ já está cadastrado.',
    );

    expect(mocks.$transaction).not.toHaveBeenCalled();
    expect(mocks.usuario.findUnique).toHaveBeenCalledTimes(2);
  });

  it('converte P2002 de e-mail em conflito de cadastro', async () => {
    mocks.$transaction.mockRejectedValue(createP2002Error(['email']));

    await expectConflict(
      service.cadastrar(dadosCadastro),
      'EMAIL_DUPLICADO',
      'login.email',
      'Este e-mail já está cadastrado.',
    );
  });

  it('converte P2002 de CPF em conflito de cadastro', async () => {
    mocks.$transaction.mockRejectedValue(createP2002Error(['cpf']));

    await expectConflict(
      service.cadastrar(dadosCadastro),
      'CPF_DUPLICADO',
      'pessoais.cpf',
      'Este CPF já está cadastrado.',
    );
  });

  it('converte P2002 de CNPJ em conflito de cadastro', async () => {
    mocks.$transaction.mockRejectedValue(createP2002Error(['cnpj']));

    await expectConflict(
      service.cadastrar(dadosCadastro),
      'CNPJ_DUPLICADO',
      'empresa.cnpj',
      'Este CNPJ já está cadastrado.',
    );
  });

  it('oculta detalhes para P2002 com constraint não identificada', async () => {
    const detalhePrivado = 'secret_constraint';
    mocks.$transaction.mockRejectedValue(createP2002Error([detalhePrivado]));

    const error = await service.cadastrar(dadosCadastro).then(
      () => {
        throw new Error('Era esperado um InternalServerErrorException.');
      },
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(InternalServerErrorException);
    if (!(error instanceof InternalServerErrorException)) {
      return;
    }

    const response = error.getResponse();
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 500,
        message: 'Erro interno ao cadastrar usuário.',
      }),
    );
    expect(JSON.stringify(response)).not.toContain(detalhePrivado);
  });

  it('relança erro diferente de P2002 sem convertê-lo em conflito', async () => {
    const erroOriginal = new Error('Falha inesperada na transação.');
    mocks.$transaction.mockRejectedValue(erroOriginal);

    const error = await service.cadastrar(dadosCadastro).then(
      () => {
        throw new Error('Era esperado o erro original.');
      },
      (caught: unknown) => caught,
    );

    expect(error).toBe(erroOriginal);
    expect(error).not.toBeInstanceOf(ConflictException);
  });

  // O mock valida a rejeição lógica; rollback real exige integração com PostgreSQL.
  it('rejeita a transação quando a criação do usuário falha após criar a empresa', async () => {
    const erroUsuario = new Error('Falha ao criar usuário.');
    tx.usuario.create.mockRejectedValue(erroUsuario);

    const error = await service.cadastrar(dadosCadastro).then(
      () => {
        throw new Error('Era esperado que a transação rejeitasse.');
      },
      (caught: unknown) => caught,
    );

    expect(error).toBe(erroUsuario);
    expect(mocks.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.empresa.create).toHaveBeenCalledTimes(1);
    expect(tx.usuario.create).toHaveBeenCalledTimes(1);
  });
});

describe('AuthService.login', () => {
  let service: AuthService;
  let mocks: ReturnType<typeof createPrismaMock>['mocks'];
  let signAsyncMock: jest.Mock<
    (payload: Record<string, unknown>) => Promise<string>
  >;
  let comparePasswordMock: jest.Mock<
    (data: string, encrypted: string) => Promise<boolean>
  >;

  beforeEach(() => {
    const setup = createPrismaMock();

    mocks = setup.mocks;

    signAsyncMock = jest
      .fn<(payload: Record<string, unknown>) => Promise<string>>()
      .mockResolvedValue('mock-access-token');

    service = new AuthService(setup.prisma, {
      signAsync: signAsyncMock,
    } as unknown as JwtService, {
      enviarCodigoRecuperacao: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    } as unknown as MailService);

    comparePasswordMock = jest.spyOn(
      bcrypt,
      'compare',
    ) as unknown as jest.Mock<
      (data: string, encrypted: string) => Promise<boolean>
    >;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('autentica usuário com e-mail normalizado e retorna dados públicos', async () => {
    mocks.usuario.findUnique.mockResolvedValue(usuarioLoginMock);
    comparePasswordMock.mockResolvedValue(true);

    const resultado = await service.login({
      email: '  PESSOA@EXAMPLE.COM  ',
      senha: 'SenhaForte1!',
      lembreMe: false,
    });

    expect(mocks.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: 'pessoa@example.com' },
    });
    expect(comparePasswordMock).toHaveBeenCalledWith(
      'SenhaForte1!',
      usuarioLoginMock.senha_hash,
    );
    expect(signAsyncMock).toHaveBeenCalledWith({
      sub: 'usuario-1',
      email: 'pessoa@example.com',
      papel: 'administrador',
      empresaId: 'empresa-1',
    });
    expect(resultado).toEqual({
      accessToken: 'mock-access-token',
      refreshToken: expect.any(String),
      expiresAt: expect.any(Date),
      remember: false,
      expiresIn: 900,
      usuario: {
        id: 'usuario-1',
        nome: 'Pessoa Exemplo',
        email: 'pessoa@example.com',
        cargo: 'Gestor',
        perfil: 'administrador',
      },
    });
    expect(resultado.usuario).not.toHaveProperty('senha_hash');
  });

  it('rejeita e-mail inexistente sem comparar senha ou gerar token', async () => {
    mocks.usuario.findUnique.mockResolvedValue(null);

    const error = await service
      .login({
        email: '  AUSENTE@EXAMPLE.COM  ',
        senha: 'SenhaForte1!',
        lembreMe: false,
      })
      .then(
        () => {
          throw new Error('Era esperado um UnauthorizedException.');
        },
        (caught: unknown) => caught,
      );

    expect(mocks.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: 'ausente@example.com' },
    });
    expect(error).toBeInstanceOf(UnauthorizedException);
    if (!(error instanceof UnauthorizedException)) {
      return;
    }
    expect(error.getResponse()).toEqual(
      expect.objectContaining({
        statusCode: 401,
        message: 'E-mail ou senha incorretos.',
      }),
    );
    expect(comparePasswordMock).not.toHaveBeenCalled();
    expect(signAsyncMock).not.toHaveBeenCalled();
  });

  it('rejeita senha incorreta com mensagem genérica e sem gerar token', async () => {
    mocks.usuario.findUnique.mockResolvedValue(usuarioLoginMock);
    comparePasswordMock.mockResolvedValue(false);

    const error = await service
      .login({
        email: ' pessoa@example.com ',
        senha: 'SenhaIncorreta!',
        lembreMe: false,
      })
      .then(
        () => {
          throw new Error('Era esperado um UnauthorizedException.');
        },
        (caught: unknown) => caught,
      );

    expect(mocks.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: 'pessoa@example.com' },
    });
    expect(comparePasswordMock).toHaveBeenCalledWith(
      'SenhaIncorreta!',
      usuarioLoginMock.senha_hash,
    );
    expect(error).toBeInstanceOf(UnauthorizedException);
    if (!(error instanceof UnauthorizedException)) {
      return;
    }
    expect(error.getResponse()).toEqual(
      expect.objectContaining({
        statusCode: 401,
        message: 'E-mail ou senha incorretos.',
      }),
    );
    expect(signAsyncMock).not.toHaveBeenCalled();
  });
});

describe('AuthService refresh e logout', () => {
  let service: AuthService;
  let setup: ReturnType<typeof createPrismaMock>;
  let signAsyncMock: jest.Mock<
    (payload: Record<string, unknown>) => Promise<string>
  >;

  beforeEach(() => {
    setup = createPrismaMock();
    signAsyncMock = jest
      .fn<(payload: Record<string, unknown>) => Promise<string>>()
      .mockResolvedValue('novo-access-token');
    service = new AuthService(setup.prisma, {
      signAsync: signAsyncMock,
    } as unknown as JwtService, {
      enviarCodigoRecuperacao: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    } as unknown as MailService);
  });

  it('rotaciona um refresh válido e emitindo novo access token', async () => {
    setup.mocks.refresh_token.findUnique.mockResolvedValue({
      id: 'refresh-1',
      usuario_id: 'usuario-1',
      token_hash: 'hash',
      lembrar: false,
      expira_em: new Date(Date.now() + 60_000),
      revogado_em: null,
      usuario: usuarioLoginMock,
    });

    const resultado = await service.refresh('refresh-opaco');

    expect(resultado.accessToken).toBe('novo-access-token');
    expect(resultado.refreshToken).not.toBe('refresh-opaco');
    expect(setup.tx.refresh_token.updateMany).toHaveBeenCalled();
    expect(setup.tx.refresh_token.create).toHaveBeenCalled();
  });

  it('rejeita refresh expirado', async () => {
    setup.mocks.refresh_token.findUnique.mockResolvedValue({
      usuario_id: 'usuario-1',
      lembrar: false,
      expira_em: new Date(Date.now() - 60_000),
      revogado_em: null,
      usuario: usuarioLoginMock,
    });

    await expect(service.refresh('expirado')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejeita refresh revogado', async () => {
    setup.mocks.refresh_token.findUnique.mockResolvedValue({
      usuario_id: 'usuario-1',
      lembrar: false,
      expira_em: new Date(Date.now() + 60_000),
      revogado_em: new Date(),
      usuario: usuarioLoginMock,
    });

    await expect(service.refresh('revogado')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('logout sem cookie é idempotente', async () => {
    await expect(service.logout(null)).resolves.toBeUndefined();
  });

  it('logout revoga o refresh existente', async () => {
    await service.logout('refresh-opaco');
    expect(setup.mocks.refresh_token.updateMany).toHaveBeenCalled();
  });
});


describe('AuthService recuperação de senha', () => {
  let setup: ReturnType<typeof createPrismaMock>;
  let service: AuthService;
  let enviarEmail: jest.Mock<(email: string, codigo: string) => Promise<void>>;

  beforeEach(() => {
    setup = createPrismaMock();

    enviarEmail = jest
      .fn<(email: string, codigo: string) => Promise<void>>()
      .mockResolvedValue(undefined);

    service = new AuthService(
      setup.prisma,
      { signAsync: jest.fn<() => Promise<string>>().mockResolvedValue('token') } as unknown as JwtService,
      { enviarCodigoRecuperacao: enviarEmail } as unknown as MailService,
    );

    setup.mocks.usuario.findUnique.mockResolvedValue(usuarioLoginMock);
    setup.mocks.codigo_verificacao.findFirst.mockResolvedValue(null);
    setup.mocks.codigo_verificacao.create.mockResolvedValue({ id: 'codigo-1' });
    setup.mocks.codigo_verificacao.update.mockResolvedValue({});
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hash-gerado' as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('responde genericamente quando o e-mail não está cadastrado', async () => {
    setup.mocks.usuario.findUnique.mockResolvedValue(null);

    const resultado = await service.solicitarRecuperacaoSenha({
      email: 'desconhecido@example.com',
    });

    expect(resultado.mensagem).toContain('Se o e-mail estiver cadastrado');
    expect(setup.mocks.codigo_verificacao.create).not.toHaveBeenCalled();
    expect(enviarEmail).not.toHaveBeenCalled();
  });

  it('cria código e envia e-mail para usuário cadastrado', async () => {
    const resultado = await service.solicitarRecuperacaoSenha({
      email: ' PESSOA@EXAMPLE.COM ',
    });

    expect(resultado.mensagem).toContain('Se o e-mail estiver cadastrado');
    expect(setup.mocks.codigo_verificacao.create).toHaveBeenCalled();
    expect(setup.mocks.codigo_verificacao.updateMany).toHaveBeenCalled();
    expect(enviarEmail).toHaveBeenCalledTimes(1);
    expect(enviarEmail.mock.calls[0][0]).toBe('pessoa@example.com');
    expect(enviarEmail.mock.calls[0][1]).toMatch(/^\d{5}$/);
  });

  it('bloqueia nova solicitação antes de 60 segundos', async () => {
    setup.mocks.codigo_verificacao.findFirst.mockResolvedValue({
      created_at: new Date(),
    });

    await expect(
      service.solicitarRecuperacaoSenha({ email: 'pessoa@example.com' }),
    ).rejects.toMatchObject({ status: HttpStatus.TOO_MANY_REQUESTS });

    expect(enviarEmail).not.toHaveBeenCalled();
  });

  it('valida código correto e retorna token temporário', async () => {
    setup.mocks.codigo_verificacao.findFirst.mockResolvedValue({
      id: 'codigo-1',
      tentativas: 0,
      codigo_hash: 'hash-codigo',
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const resultado = await service.verificarCodigoRecuperacao({
      email: 'pessoa@example.com',
      codigo: '01234',
    });

    expect(resultado.token).toEqual(expect.any(String));
    expect(resultado.token.length).toBeGreaterThan(20);
    expect(setup.mocks.codigo_verificacao.updateMany).toHaveBeenCalledTimes(2);
  });

  it('rejeita código incorreto', async () => {
    setup.mocks.codigo_verificacao.findFirst.mockResolvedValue({
      id: 'codigo-1',
      tentativas: 0,
      codigo_hash: 'hash-codigo',
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    await expect(
      service.verificarCodigoRecuperacao({
        email: 'pessoa@example.com',
        codigo: '99999',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(setup.mocks.codigo_verificacao.updateMany).toHaveBeenCalledTimes(1);
  });

  it('redefine senha, consome token e revoga sessões ativas', async () => {
    setup.mocks.codigo_verificacao.findFirst.mockResolvedValue({
      id: 'codigo-1',
      usuario_id: 'usuario-1',
    });

    await expect(
      service.redefinirSenha({
        token: 'token-temporario',
        senha: 'NovaSenhaForte1!',
        confirmarSenha: 'NovaSenhaForte1!',
      }),
    ).resolves.toBeUndefined();

    expect(setup.tx.codigo_verificacao.updateMany).toHaveBeenCalled();
    expect(setup.tx.usuario.update).toHaveBeenCalledWith({
      where: { id: 'usuario-1' },
      data: { senha_hash: 'hash-gerado' },
    });
    expect(setup.tx.refresh_token.updateMany).toHaveBeenCalled();
  });
});

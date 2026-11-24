import {
  BadRequestException,
  ConflictException,
  Injectable,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { createHash, randomBytes, randomInt } from 'crypto';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CadastroDto } from './schemas/cadastro.schema';
import { LoginDto } from './schemas/login.schema';
import { MailService } from '../mail/mail.service';
import {
  RedefinirSenhaDto,
  SolicitarRecuperacaoSenhaDto,
  VerificarCodigoRecuperacaoDto,
} from './schemas/recuperacao-senha.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private createRefreshTokenValue(): string {
    return randomBytes(32).toString('base64url');
  }

  private refreshDuration(remember: boolean): number {
    return (remember ? 30 : 7) * 24 * 60 * 60 * 1000;
  }

  private async createAccessToken(usuario: {
    id: string;
    email: string;
    papel: string;
    empresa_id: string;
  }): Promise<string> {
    return this.jwtService.signAsync({
      sub: usuario.id,
      email: usuario.email,
      papel: usuario.papel,
      empresaId: usuario.empresa_id,
    });
  }

  async login(dados: LoginDto) {
    const email = dados.email.trim().toLowerCase();

    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const senhaValida = await bcrypt.compare(dados.senha, usuario.senha_hash);

    if (!senhaValida) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const accessToken = await this.createAccessToken(usuario);
    const refreshToken = this.createRefreshTokenValue();
    const expiresAt = new Date(
      Date.now() + this.refreshDuration(dados.lembreMe),
    );

    await this.prisma.refresh_token.create({
      data: {
        usuario_id: usuario.id,
        token_hash: this.hashRefreshToken(refreshToken),
        lembrar: dados.lembreMe,
        expira_em: expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresAt,
      remember: dados.lembreMe,
      expiresIn: 900,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        perfil: usuario.papel,
      },
    };
  }

  async refresh(refreshToken: string | null) {
    if (!refreshToken) {
      throw new UnauthorizedException('Sessão expirada ou inválida.');
    }

    const tokenHash = this.hashRefreshToken(refreshToken);
    const existing = await this.prisma.refresh_token.findUnique({
      where: { token_hash: tokenHash },
      include: { usuario: true },
    });

    if (
      !existing ||
      existing.revogado_em ||
      existing.expira_em.getTime() <= Date.now()
    ) {
      if (existing?.revogado_em) {
        await this.prisma.refresh_token.updateMany({
          where: {
            usuario_id: existing.usuario_id,
            revogado_em: null,
          },
          data: { revogado_em: new Date() },
        });
      }
      throw new UnauthorizedException('Sessão expirada ou inválida.');
    }

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + this.refreshDuration(existing.lembrar),
    );
    const nextRefreshToken = this.createRefreshTokenValue();

    await this.prisma.$transaction(async (transaction) => {
      const revoked = await transaction.refresh_token.updateMany({
        where: {
          token_hash: tokenHash,
          revogado_em: null,
          expira_em: { gt: now },
        },
        data: { revogado_em: now },
      });

      if (revoked.count !== 1) {
        throw new UnauthorizedException('Sessão expirada ou inválida.');
      }

      await transaction.refresh_token.create({
        data: {
          usuario_id: existing.usuario_id,
          token_hash: this.hashRefreshToken(nextRefreshToken),
          lembrar: existing.lembrar,
          expira_em: expiresAt,
        },
      });
    });

    const accessToken = await this.createAccessToken(existing.usuario);

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      expiresAt,
      remember: existing.lembrar,
    };
  }

  async logout(refreshToken: string | null): Promise<void> {
    if (!refreshToken) {
      return;
    }

    await this.prisma.refresh_token.updateMany({
      where: {
        token_hash: this.hashRefreshToken(refreshToken),
        revogado_em: null,
      },
      data: { revogado_em: new Date() },
    });
  }

  async getMe(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { empresa: true },
    });

    if (!usuario || !usuario.empresa) {
      throw new UnauthorizedException('Sessão expirada ou inválida.');
    }

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        cpf: usuario.cpf,
        telefone: usuario.telefone,
        cargo: usuario.cargo,
        email: usuario.email,
        perfil: usuario.papel,
        empresaId: usuario.empresa_id,
        criadoEm: usuario.created_at.toISOString(),
      },
      empresa: {
        id: usuario.empresa.id,
        nomeEmpresa: usuario.empresa.nome_fantasia,
        razaoSocial: usuario.empresa.razao_social,
        cnpj: usuario.empresa.cnpj,
        segmento: usuario.empresa.segmento,
        tipoUnidade: usuario.empresa.tipo_unidade,
        endereco: {
          cep: usuario.empresa.cep,
          logradouro: usuario.empresa.logradouro,
          numero: usuario.empresa.numero,
          complemento: usuario.empresa.complemento,
          bairro: usuario.empresa.bairro,
          cidade: usuario.empresa.cidade,
          uf: usuario.empresa.uf,
        },
        criadoEm: usuario.empresa.created_at.toISOString(),
      },
    };
  }

  private conflitoCadastro(
    codigo: string,
    campo: string,
    mensagem: string,
  ): ConflictException {
    return new ConflictException({
      codigo,
      message: mensagem,
      errors: [{ field: campo, message: mensagem }],
    });
  }

  private async verificarDuplicidades(
    email: string,
    cpf: string,
    cnpj: string,
  ): Promise<void> {
    const emailNormalizado = email.trim().toLowerCase();

    const usuarioPorEmail = await this.prisma.usuario.findUnique({
      where: { email: emailNormalizado },
      select: { id: true },
    });

    if (usuarioPorEmail) {
      throw this.conflitoCadastro(
        'EMAIL_DUPLICADO',
        'login.email',
        'Este e-mail já está cadastrado.',
      );
    }

    const usuarioPorCpf = await this.prisma.usuario.findUnique({
      where: { cpf },
      select: { id: true },
    });

    if (usuarioPorCpf) {
      throw this.conflitoCadastro(
        'CPF_DUPLICADO',
        'pessoais.cpf',
        'Este CPF já está cadastrado.',
      );
    }

    const empresaPorCnpj = await this.prisma.empresa.findUnique({
      where: { cnpj },
      select: { id: true },
    });

    if (empresaPorCnpj) {
      throw this.conflitoCadastro(
        'CNPJ_DUPLICADO',
        'empresa.cnpj',
        'Este CNPJ já está cadastrado.',
      );
    }
  }

  async cadastrar(dados: CadastroDto) {
    const email = dados.login.email.trim().toLowerCase();

    await this.verificarDuplicidades(
      email,
      dados.pessoais.cpf,
      dados.empresa.cnpj,
    );

    const senhaHash = await bcrypt.hash(dados.login.senha, 10);

    let cadastro;

    try {
      cadastro = await this.prisma.$transaction(async (tx) => {
        const empresa = await tx.empresa.create({
          data: {
            nome_fantasia: dados.empresa.nomeEmpresa,
            razao_social: dados.empresa.razaoSocial,
            cnpj: dados.empresa.cnpj,
            segmento: dados.empresa.segmento,
            tipo_unidade: dados.empresa.tipoUnidade,
            cep: dados.empresa.cep,
            logradouro: dados.empresa.logradouro,
            numero: dados.empresa.numero,
            complemento: dados.empresa.complemento,
            bairro: dados.empresa.bairro,
            cidade: dados.empresa.cidade,
            uf: dados.empresa.uf,
          },
        });

        const usuario = await tx.usuario.create({
          data: {
            empresa_id: empresa.id,
            nome: dados.pessoais.nome,
            cpf: dados.pessoais.cpf,
            telefone: dados.pessoais.telefone,
            cargo: dados.pessoais.cargo,
            email,
            senha_hash: senhaHash,
            papel: 'administrador',
            aceite_termos_em: new Date(),
          },
          select: {
            id: true,
            nome: true,
            email: true,
            papel: true,
          },
        });

        return {
          empresaId: empresa.id,
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.papel,
          },
        };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const alvo = error.meta?.target;
        const campos =
          typeof alvo === 'string'
            ? [alvo]
            : Array.isArray(alvo)
              ? alvo.filter((item): item is string => typeof item === 'string')
              : [];
        const identificador = campos.join(',').toLowerCase();

        if (identificador.includes('email')) {
          throw this.conflitoCadastro(
            'EMAIL_DUPLICADO',
            'login.email',
            'Este e-mail já está cadastrado.',
          );
        }

        if (identificador.includes('cpf')) {
          throw this.conflitoCadastro(
            'CPF_DUPLICADO',
            'pessoais.cpf',
            'Este CPF já está cadastrado.',
          );
        }

        if (identificador.includes('cnpj')) {
          throw this.conflitoCadastro(
            'CNPJ_DUPLICADO',
            'empresa.cnpj',
            'Este CNPJ já está cadastrado.',
          );
        }

        throw new InternalServerErrorException(
          'Erro interno ao cadastrar usuário.',
        );
      }

      throw error;
    }

    return cadastro;
  }

  async solicitarRecuperacaoSenha(dados: SolicitarRecuperacaoSenhaDto) {
    const email = dados.email.trim().toLowerCase();
    const resposta = {
      mensagem: 'Se o e-mail estiver cadastrado, você receberá um código de recuperação.',
    };

    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!usuario) {
      return resposta;
    }

    const agora = new Date();
    const ultimaSolicitacao = await this.prisma.codigo_verificacao.findFirst({
      where: { usuario_id: usuario.id },
      orderBy: { created_at: 'desc' },
      select: { created_at: true },
    });

    if (
      ultimaSolicitacao &&
      agora.getTime() - ultimaSolicitacao.created_at.getTime() < 60_000
    ) {
      throw new HttpException(
        'Aguarde 60 segundos antes de solicitar outro código.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const codigo = randomInt(0, 100_000).toString().padStart(5, '0');
    const codigoHash = await bcrypt.hash(codigo, 10);
    const registro = await this.prisma.codigo_verificacao.create({
      data: {
        usuario_id: usuario.id,
        codigo_hash: codigoHash,
        expira_em: new Date(agora.getTime() + 10 * 60_000),
      },
    });

    await this.prisma.codigo_verificacao.updateMany({
      where: {
        usuario_id: usuario.id,
        usado_em: null,
        id: { not: registro.id },
      },
      data: { usado_em: agora },
    });

    try {
      await this.mailService.enviarCodigoRecuperacao(usuario.email, codigo);
    } catch (error) {
      await this.prisma.codigo_verificacao.update({
        where: { id: registro.id },
        data: { usado_em: new Date() },
      });
      throw error;
    }

    return resposta;
  }


  async verificarCodigoRecuperacao(dados: VerificarCodigoRecuperacaoDto) {
    const email = dados.email.trim().toLowerCase();
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!usuario) {
      throw new BadRequestException('Código inválido ou expirado.');
    }

    const agora = new Date();
    const registro = await this.prisma.codigo_verificacao.findFirst({
      where: {
        usuario_id: usuario.id,
        usado_em: null,
        expira_em: { gt: agora },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!registro) {
      throw new BadRequestException('Código inválido ou expirado.');
    }

    if (registro.tentativas >= 5) {
      throw new HttpException(
        'Limite de tentativas excedido. Solicite um novo código.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const incremento = await this.prisma.codigo_verificacao.updateMany({
      where: {
        id: registro.id,
        tentativas: registro.tentativas,
        usado_em: null,
        expira_em: { gt: agora },
      },
      data: { tentativas: { increment: 1 } },
    });

    if (incremento.count !== 1) {
      throw new BadRequestException('Código inválido ou expirado.');
    }

    const tentativasAtualizadas = registro.tentativas + 1;
    const codigoCorreto = await bcrypt.compare(
      dados.codigo,
      registro.codigo_hash,
    );

    if (!codigoCorreto) {
      if (tentativasAtualizadas >= 5) {
        throw new HttpException(
          'Limite de tentativas excedido. Solicite um novo código.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new BadRequestException('Código inválido ou expirado.');
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.hashRefreshToken(token);
    const expiracaoToken = new Date(agora.getTime() + 10 * 60_000);

    const atualizado = await this.prisma.codigo_verificacao.updateMany({
      where: {
        id: registro.id,
        tentativas: tentativasAtualizadas,
        usado_em: null,
        expira_em: { gt: new Date() },
      },
      data: {
        usado_em: new Date(),
        reset_token_hash: tokenHash,
        reset_expira_em: expiracaoToken,
      },
    });

    if (atualizado.count !== 1) {
      throw new BadRequestException('Código inválido ou expirado.');
    }

    return { token };
  }


  async redefinirSenha(dados: RedefinirSenhaDto): Promise<void> {
    const agora = new Date();
    const tokenHash = this.hashRefreshToken(dados.token);

    const registro = await this.prisma.codigo_verificacao.findFirst({
      where: {
        reset_token_hash: tokenHash,
        reset_expira_em: { gt: agora },
      },
      select: {
        id: true,
        usuario_id: true,
      },
    });

    if (!registro) {
      throw new BadRequestException('Token inválido ou expirado.');
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    await this.prisma.$transaction(async (tx) => {
      const consumo = await tx.codigo_verificacao.updateMany({
        where: {
          id: registro.id,
          reset_token_hash: tokenHash,
          reset_expira_em: { gt: new Date() },
        },
        data: {
          reset_token_hash: null,
          reset_expira_em: null,
        },
      });

      if (consumo.count !== 1) {
        throw new BadRequestException('Token inválido ou expirado.');
      }

      await tx.usuario.update({
        where: { id: registro.usuario_id },
        data: { senha_hash: senhaHash },
      });

      await tx.refresh_token.updateMany({
        where: {
          usuario_id: registro.usuario_id,
          revogado_em: null,
        },
        data: { revogado_em: new Date() },
      });
    });
  }

}

import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CadastroDto } from './schemas/cadastro.schema';
import { LoginDto } from './schemas/login.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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
}

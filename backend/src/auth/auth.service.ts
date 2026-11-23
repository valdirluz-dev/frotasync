import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
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

  async login(dados: LoginDto) {
    const email = dados.email.trim().toLowerCase();

    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const senhaValida = await bcrypt.compare(dados.senha, usuario.senha_hash);

    if (!senhaValida) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      papel: usuario.papel,
      empresaId: usuario.empresa_id,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 900,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        empresaId: usuario.empresa_id,
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

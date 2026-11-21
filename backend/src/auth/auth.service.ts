import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CadastroDto } from './schemas/cadastro.schema';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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

    const cadastro = await this.prisma.$transaction(async (tx) => {
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

    return cadastro;
  }
}

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

    const usuarioExistente = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ email: emailNormalizado }, { cpf }],
      },
      select: {
        email: true,
        cpf: true,
      },
    });

    if (usuarioExistente?.email === emailNormalizado) {
      throw this.conflitoCadastro(
        'EMAIL_DUPLICADO',
        'login.email',
        'Este e-mail já está cadastrado.',
      );
    }

    if (usuarioExistente?.cpf === cpf) {
      throw this.conflitoCadastro(
        'CPF_DUPLICADO',
        'pessoais.cpf',
        'Este CPF já está cadastrado.',
      );
    }

    const empresaExistente = await this.prisma.empresa.findUnique({
      where: { cnpj },
      select: { id: true },
    });

    if (empresaExistente) {
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

    // Próxima etapa: persistência transacional
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CadastroSchema, CadastroDto } from './schemas/cadastro.schema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('cadastro')
  cadastrar(@Body(new ZodValidationPipe(CadastroSchema)) body: CadastroDto) {
    return this.authService.cadastrar(body);
  }
}

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CadastroSchema, CadastroDto } from './schemas/cadastro.schema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { LoginSchema, LoginDto } from './schemas/login.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('cadastro')
  cadastrar(@Body(new ZodValidationPipe(CadastroSchema)) body: CadastroDto) {
    return this.authService.cadastrar(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body(new ZodValidationPipe(LoginSchema)) body: LoginDto) {
    return this.authService.login(body);
  }
}

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Req as ExpressReq, Res as ExpressRes } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CadastroSchema, CadastroDto } from './schemas/cadastro.schema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { LoginSchema, LoginDto } from './schemas/login.schema';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import { CsrfGuard } from './guards/csrf.guard';
import {
  clearAuthCookies,
  getCookieHeader,
  REFRESH_COOKIE_NAME,
  setAuthCookies,
} from './cookies';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('cadastro')
  cadastrar(@Body(new ZodValidationPipe(CadastroSchema)) body: CadastroDto) {
    return this.authService.cadastrar(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body(new ZodValidationPipe(LoginSchema)) body: LoginDto,
    @ExpressRes({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(body).then((resultado) => {
      setAuthCookies(response, {
        accessToken: resultado.accessToken,
        refreshToken: resultado.refreshToken,
        expiresAt: resultado.expiresAt,
        remember: resultado.remember,
      });

      return {
        expiresIn: resultado.expiresIn,
        usuario: resultado.usuario,
      };
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CsrfGuard)
  async refresh(
    @ExpressReq() request: Request,
    @ExpressRes({ passthrough: true }) response: Response,
  ) {
    const refreshToken = getCookieHeader(request, REFRESH_COOKIE_NAME);
    const resultado = await this.authService.refresh(refreshToken);

    setAuthCookies(response, {
      accessToken: resultado.accessToken,
      refreshToken: resultado.refreshToken,
      expiresAt: resultado.expiresAt,
      remember: resultado.remember,
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CsrfGuard)
  async logout(
    @ExpressReq() request: Request,
    @ExpressRes({ passthrough: true }) response: Response,
  ) {
    const refreshToken = getCookieHeader(request, REFRESH_COOKIE_NAME);
    await this.authService.logout(refreshToken);
    clearAuthCookies(response);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthenticatedRequest) {
    return this.authService.getMe(req.user.id);
  }
}

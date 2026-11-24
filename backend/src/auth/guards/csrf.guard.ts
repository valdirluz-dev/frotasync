import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      return true;
    }

    if (request.headers['x-frotasync-client'] !== 'web') {
      throw new ForbiddenException('Cabeçalho CSRF ausente.');
    }

    const origin = request.headers.origin;
    const trustedOrigins = (
      this.configService.get<string>('CSRF_TRUSTED_ORIGINS') ?? ''
    )
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (!origin || !trustedOrigins.includes(origin)) {
      throw new ForbiddenException('Origem da requisição não autorizada.');
    }

    return true;
  }
}

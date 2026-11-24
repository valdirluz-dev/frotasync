import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      if (request.headers['x-frotasync-client'] !== 'web') {
        throw new ForbiddenException('Cabeçalho CSRF ausente.');
      }
    }
    return true;
  }
}

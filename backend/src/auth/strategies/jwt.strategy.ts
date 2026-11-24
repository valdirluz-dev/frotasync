import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  papel: string;
  empresaId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          const cookieHeader = request?.headers?.cookie;
          if (!cookieHeader) {
            return null;
          }
          const match = cookieHeader
            .split(';')
            .map((part: string) => part.trim())
            .find((part: string) =>
              part.startsWith('frotasync_access='),
            );
          if (!match) {
            return null;
          }
          return decodeURIComponent(match.slice(match.indexOf('=') + 1));
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
      papel: payload.papel,
      empresaId: payload.empresaId,
    };
  }
}

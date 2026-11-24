import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AuthController } from './auth.controller';
import { CsrfGuard } from './guards/csrf.guard';

describe('AuthController - proteção CSRF', () => {
  it('mantém login e cadastro públicos sem guard de CSRF', () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, AuthController.prototype.login),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(GUARDS_METADATA, AuthController.prototype.cadastrar),
    ).toBeUndefined();
  });

  it('exige CSRF em refresh e logout', () => {
    expect(
      Reflect.getMetadata(GUARDS_METADATA, AuthController.prototype.refresh),
    ).toEqual([CsrfGuard]);
    expect(
      Reflect.getMetadata(GUARDS_METADATA, AuthController.prototype.logout),
    ).toEqual([CsrfGuard]);
  });
});

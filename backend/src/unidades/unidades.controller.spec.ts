import { describe, expect, it, jest } from '@jest/globals';
import { UnidadesController } from './unidades.controller';
import { UnidadesService } from './unidades.service';

describe('UnidadesController', () => {
  const unidadesService = {
    listar: jest.fn(),
  };

  const controller = new UnidadesController(
    unidadesService as unknown as UnidadesService,
  );

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve repassar filtros e empresaId autenticado ao service', () => {
    const filtros = {
      page: 1,
      pageSize: 20,
    };

    const req = {
      user: {
        empresaId: 'empresa-123',
      },
    };

    controller.listar(filtros, req as any);

    expect(unidadesService.listar).toHaveBeenCalledWith(
      filtros,
      'empresa-123',
    );
  });
});

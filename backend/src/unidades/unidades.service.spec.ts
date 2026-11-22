import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnidadesService } from './unidades.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UnidadesService', () => {
  const prismaMock = {
    unidade: {
      findMany: jest.fn<() => Promise<unknown[]>>(),
      count: jest.fn<() => Promise<number>>(),
    },
  };

  let service: UnidadesService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new UnidadesService(prismaMock as unknown as PrismaService);
  });

  it('deve filtrar unidades pelo empresa_id do usuário autenticado', async () => {
    prismaMock.unidade.findMany.mockResolvedValue([]);
    prismaMock.unidade.count.mockResolvedValue(0);

    await service.listar(
      {
        page: 1,
        pageSize: 20,
      },
      'empresa-123',
    );

    expect(prismaMock.unidade.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          empresa_id: 'empresa-123',
        }),
      }),
    );

    expect(prismaMock.unidade.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          empresa_id: 'empresa-123',
        }),
      }),
    );
  });
});

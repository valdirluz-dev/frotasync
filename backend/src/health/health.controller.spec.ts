import { describe, expect, it, jest } from '@jest/globals';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  it('returns an ok status', () => {
    const prisma = {
      $queryRaw: jest.fn(),
    } as unknown as PrismaService;

    const controller = new HealthController(prisma);

    expect(controller.check()).toEqual({ status: 'ok' });
  });

  it('returns ready when database is connected', async () => {
    const prisma = {
      $queryRaw: jest
        .fn<() => Promise<unknown>>()
        .mockResolvedValue([{ result: 1 }]),
    } as unknown as PrismaService;

    const controller = new HealthController(prisma);

    await expect(controller.readiness()).resolves.toEqual({
      status: 'ok',
      database: 'connected',
    });

    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it('throws 503 when database is unavailable', async () => {
    const prisma = {
      $queryRaw: jest
        .fn<() => Promise<unknown>>()
        .mockRejectedValue(new Error('Database connection failed')),
    } as unknown as PrismaService;

    const controller = new HealthController(prisma);

    await expect(controller.readiness()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});

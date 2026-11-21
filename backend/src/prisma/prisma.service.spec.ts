import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const databaseUrl = 'postgresql://user:password@localhost:5432/frotasync';

  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      getOrThrow: jest.fn().mockReturnValue(databaseUrl),
    } as unknown as ConfigService;
  });

  it('should retrieve DATABASE_URL from ConfigService', () => {
    new PrismaService(configService);

    expect(configService.getOrThrow).toHaveBeenCalledWith('DATABASE_URL');
  });

  it('should throw when DATABASE_URL is empty', () => {
    configService = {
      getOrThrow: jest.fn().mockReturnValue('   '),
    } as unknown as ConfigService;

    expect(() => new PrismaService(configService)).toThrow(
      'DATABASE_URL must be configured.',
    );
  });

  it('should connect when the module initializes', async () => {
    const service = new PrismaService(configService);
    const connectSpy = jest
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  it('should disconnect when the module is destroyed', async () => {
    const service = new PrismaService(configService);
    const disconnectSpy = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});

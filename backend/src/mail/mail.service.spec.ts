import { jest } from '@jest/globals';
import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { MailService } from './mail.service';

describe('MailService', () => {
  let sendMail: ReturnType<typeof jest.fn>;
  let createTransportSpy: ReturnType<typeof jest.spyOn>;

  const criarServico = (config: Record<string, string>) =>
    new MailService(new ConfigService(config));

  beforeEach(() => {
    sendMail = jest.fn(async () => ({}));
    createTransportSpy = jest
      .spyOn(nodemailer, 'createTransport')
      .mockReturnValue({
        sendMail,
      } as unknown as ReturnType<typeof nodemailer.createTransport>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('envia e-mail em desenvolvimento sem autenticação (Mailpit)', async () => {
    const service = criarServico({
      NODE_ENV: 'development',
      SMTP_HOST: '127.0.0.1',
      SMTP_PORT: '1025',
      SMTP_SECURE: 'false',
      SMTP_FROM: 'FROTASYNC <no-reply@frotasync.local>',
    });

    await expect(
      service.enviarCodigoRecuperacao('destinatario@example.com', '12345'),
    ).resolves.toBeUndefined();

    expect(createTransportSpy).toHaveBeenCalledWith({
      host: '127.0.0.1',
      port: 1025,
      secure: false,
    });
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'destinatario@example.com',
        from: 'FROTASYNC <no-reply@frotasync.local>',
        subject: 'Código para redefinição de senha - FROTASYNC',
      }),
    );
  });

  it('exige autenticação SMTP fora de development', async () => {
    const service = criarServico({
      NODE_ENV: 'production',
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_FROM: 'no-reply@example.com',
    });

    await expect(
      service.enviarCodigoRecuperacao('destinatario@example.com', '12345'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(createTransportSpy).not.toHaveBeenCalled();
  });

  it('rejeita autenticação SMTP parcialmente configurada em development', async () => {
    const service = criarServico({
      NODE_ENV: 'development',
      SMTP_HOST: '127.0.0.1',
      SMTP_PORT: '1025',
      SMTP_USER: 'usuario',
      SMTP_FROM: 'no-reply@example.com',
    });

    await expect(
      service.enviarCodigoRecuperacao('destinatario@example.com', '12345'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(createTransportSpy).not.toHaveBeenCalled();
  });

  it('usa autenticação quando usuário e senha estão configurados', async () => {
    const service = criarServico({
      NODE_ENV: 'production',
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_USER: 'usuario',
      SMTP_PASS: 'senha',
      SMTP_FROM: 'no-reply@example.com',
    });

    await service.enviarCodigoRecuperacao(
      'destinatario@example.com',
      '12345',
    );

    expect(createTransportSpy).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: { user: 'usuario', pass: 'senha' },
    });
  });

  it('converte falha do provedor em indisponibilidade do serviço', async () => {
    sendMail.mockImplementationOnce(async () => {
      throw new Error('Falha SMTP');
    });

    const service = criarServico({
      NODE_ENV: 'development',
      SMTP_HOST: '127.0.0.1',
      SMTP_PORT: '1025',
      SMTP_FROM: 'no-reply@example.com',
    });

    await expect(
      service.enviarCodigoRecuperacao('destinatario@example.com', '12345'),
    ).rejects.toThrow('Não foi possível enviar o e-mail de recuperação.');
  });

  it('rejeita porta SMTP inválida', async () => {
    const service = criarServico({
      NODE_ENV: 'development',
      SMTP_HOST: '127.0.0.1',
      SMTP_PORT: '70000',
      SMTP_FROM: 'no-reply@example.com',
    });

    await expect(
      service.enviarCodigoRecuperacao('destinatario@example.com', '12345'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(createTransportSpy).not.toHaveBeenCalled();
  });
});

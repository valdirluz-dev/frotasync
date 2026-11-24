import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {}

  async enviarCodigoRecuperacao(
    destinatario: string,
    codigo: string,
  ): Promise<void> {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT', '587'));
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>('SMTP_FROM');
    const secureConfig = this.configService.get<string>('SMTP_SECURE');
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    const authConfigured = Boolean(user || pass);
    const authComplete = Boolean(user && pass);
    const authValid =
      nodeEnv === 'development'
        ? !authConfigured || authComplete
        : authComplete;

    if (
      !host ||
      !Number.isInteger(port) ||
      port < 1 ||
      port > 65535 ||
      !from ||
      !authValid
    ) {
      throw new ServiceUnavailableException(
        'Serviço de envio de e-mail indisponível.',
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: secureConfig
        ? secureConfig.toLowerCase() === 'true'
        : port === 465,
      ...(authComplete ? { auth: { user, pass } } : {}),
    });

    try {
      await transporter.sendMail({
        from,
        to: destinatario,
        subject: 'Código para redefinição de senha - FROTASYNC',
        text: [
          'Recebemos uma solicitação para redefinir sua senha no FROTASYNC.',
          '',
          `Seu código de verificação é: ${codigo}`,
          '',
          'O código expira em 10 minutos.',
          'Se você não solicitou a redefinição, ignore este e-mail.',
        ].join('\\n'),
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
            <h2>Redefinição de senha</h2>
            <p>Recebemos uma solicitação para redefinir sua senha no FROTASYNC.</p>
            <p>Seu código de verificação:</p>
            <p style="font-size: 28px; font-weight: bold; letter-spacing: 8px;">${codigo}</p>
            <p>O código expira em 10 minutos.</p>
            <p>Se você não solicitou a redefinição, ignore este e-mail.</p>
          </div>
        `,
      });
    } catch {
      throw new ServiceUnavailableException(
        'Não foi possível enviar o e-mail de recuperação.',
      );
    }
  }
}

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

export interface EnderecoCep {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

interface CacheEntry {
  endereco: EnderecoCep;
  expiresAt: number;
}

interface RateLimitEntry {
  count: number;
  windowStartedAt: number;
}

@Injectable()
export class CepService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly rateLimits = new Map<string, RateLimitEntry>();

  private readonly cacheTtlMs = 24 * 60 * 60 * 1000;
  private readonly rateLimitWindowMs = 60 * 1000;
  private readonly rateLimitMax = 30;

  async buscar(cep: string, clientIp: string): Promise<EnderecoCep> {
    const normalizedCep = cep.replace(/\D/g, '');

    if (!/^\d{8}$/.test(normalizedCep)) {
      throw new BadRequestException('CEP deve conter exatamente 8 dígitos.');
    }

    const cached = this.cache.get(normalizedCep);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.endereco;
    }
    if (cached) {
      this.cache.delete(normalizedCep);
    }

    this.checkRateLimit(clientIp);

    let response: Response;
    try {
      response = await fetch(
        `https://viacep.com.br/ws/${normalizedCep}/json/`,
        { signal: AbortSignal.timeout(5000) },
      );
    } catch {
      throw new ServiceUnavailableException(
        'Serviço de consulta de CEP indisponível.',
      );
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(
        'Serviço de consulta de CEP indisponível.',
      );
    }

    let data: ViaCepResponse;
    try {
      data = (await response.json()) as ViaCepResponse;
    } catch {
      throw new ServiceUnavailableException(
        'Resposta inválida do serviço de CEP.',
      );
    }

    if (data.erro) {
      throw new HttpException('CEP não encontrado.', HttpStatus.NOT_FOUND);
    }

    if (
      typeof data.logradouro !== 'string' ||
      typeof data.bairro !== 'string' ||
      typeof data.localidade !== 'string' ||
      typeof data.uf !== 'string'
    ) {
      throw new ServiceUnavailableException(
        'Resposta inválida do serviço de CEP.',
      );
    }

    const endereco: EnderecoCep = {
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf,
    };

    this.cache.set(normalizedCep, {
      endereco,
      expiresAt: Date.now() + this.cacheTtlMs,
    });

    return endereco;
  }

  private checkRateLimit(clientIp: string): void {
    const now = Date.now();
    const entry = this.rateLimits.get(clientIp);

    if (!entry || now - entry.windowStartedAt >= this.rateLimitWindowMs) {
      this.rateLimits.set(clientIp, {
        count: 1,
        windowStartedAt: now,
      });
      return;
    }

    if (entry.count >= this.rateLimitMax) {
      throw new HttpException(
        'Limite de consultas de CEP excedido. Tente novamente em instantes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.count += 1;
  }
}

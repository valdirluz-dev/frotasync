import { Controller, Get, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { CepService } from './cep.service';

@Controller('enderecos/cep')
export class CepController {
  constructor(private readonly cepService: CepService) {}

  @Get(':cep')
  buscar(@Param('cep') cep: string, @Req() req: Request) {
    return this.cepService.buscar(cep, req.ip ?? 'unknown');
  }
}

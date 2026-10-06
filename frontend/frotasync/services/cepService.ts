import { normalizarCep } from "../lib/cep";
import type { EnderecoCep } from "../types/dashboard";

const SIMULATED_LATENCY_MS = 100;

const cepAddresses: Record<string, EnderecoCep> = {
  "50030230": {
    logradouro: "Avenida Conde da Boa Vista",
    bairro: "Boa Vista",
    cidade: "Recife",
    uf: "PE",
  },
  "51020010": {
    logradouro: "Rua Ribeiro de Brito",
    bairro: "Boa Viagem",
    cidade: "Recife",
    uf: "PE",
  },
  "53020000": {
    logradouro: "Rua do Sol",
    bairro: "Carmo",
    cidade: "Olinda",
    uf: "PE",
  },
  "54310000": {
    logradouro: "Avenida Barreto de Menezes",
    bairro: "Prazeres",
    cidade: "Jaboatão dos Guararapes",
    uf: "PE",
  },
  "55012040": {
    logradouro: "Rua Capitão João Velho",
    bairro: "Nossa Senhora das Dores",
    cidade: "Caruaru",
    uf: "PE",
  },
  "53401440": {
    logradouro: "Avenida Senador Salgado Filho",
    bairro: "Centro",
    cidade: "Paulista",
    uf: "PE",
  },
  "56302000": {
    logradouro: "Avenida Monsenhor Ângelo Sampaio",
    bairro: "Centro",
    cidade: "Petrolina",
    uf: "PE",
  },
  "55293000": {
    logradouro: "Avenida Rui Barbosa",
    bairro: "Heliópolis",
    cidade: "Garanhuns",
    uf: "PE",
  },
};

export async function buscarCep(cep: string): Promise<EnderecoCep | null> {
  await new Promise<void>((resolve) =>
    setTimeout(resolve, SIMULATED_LATENCY_MS),
  );
  return cepAddresses[normalizarCep(cep)] ?? null;
}

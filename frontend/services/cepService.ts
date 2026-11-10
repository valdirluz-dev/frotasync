import { CepInvalidoError, ConsultaCepError } from "@/lib/errors";
import { normalizarCep } from "@/lib/cep";
import { UF_SIGLAS, type EnderecoCep, type Uf } from "@/types/domain";

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

function isViaCepResponse(value: unknown): value is ViaCepResponse {
  return typeof value === "object" && value !== null;
}

function isUf(value: string | undefined): value is Uf {
  return UF_SIGLAS.some((uf) => uf === value);
}

export async function buscarCep(cep: string): Promise<EnderecoCep | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) throw new CepInvalidoError();

  let response: Response;
  try {
    response = await fetch(
      `https://viacep.com.br/ws/${normalizarCep(digits)}/json/`,
    );
  } catch (error) {
    throw new ConsultaCepError({ cause: error });
  }
  if (!response.ok) throw new ConsultaCepError();

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    throw new ConsultaCepError({ cause: error });
  }
  if (!isViaCepResponse(data)) throw new ConsultaCepError();
  if (data.erro === true) return null;
  if (
    typeof data.logradouro !== "string" ||
    typeof data.bairro !== "string" ||
    typeof data.localidade !== "string" ||
    !isUf(data.uf)
  ) {
    throw new ConsultaCepError();
  }

  return {
    logradouro: data.logradouro,
    bairro: data.bairro,
    cidade: data.localidade,
    uf: data.uf,
  };
}

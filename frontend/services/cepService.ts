import { normalizarCep } from "@/lib/cep";
import { ApiError, http } from "@/lib/http";
import type { EnderecoCep } from "@/types/domain";

export async function buscarCep(cep: string): Promise<EnderecoCep | null> {
  const normalizedCep = normalizarCep(cep);

  try {
    return await http<EnderecoCep>(`/enderecos/cep/${normalizedCep}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

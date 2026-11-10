import { afterEach, describe, expect, it, vi } from "vitest";

import { CepInvalidoError, ConsultaCepError } from "@/lib/errors";
import { buscarCep } from "./cepService";

describe("buscarCep", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("consulta ViaCEP com o CEP normalizado e mapeia o endereço", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        logradouro: "Avenida Conde da Boa Vista",
        bairro: "Boa Vista",
        localidade: "Recife",
        uf: "PE",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(buscarCep("50030-230")).resolves.toEqual({
      logradouro: "Avenida Conde da Boa Vista",
      bairro: "Boa Vista",
      cidade: "Recife",
      uf: "PE",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://viacep.com.br/ws/50030230/json/",
    );
  });

  it("retorna null quando ViaCEP não encontra o CEP", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ erro: true })));

    await expect(buscarCep("99999-999")).resolves.toBeNull();
  });

  it("rejeita CEP com quantidade de dígitos diferente de oito sem requisitar a API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(buscarCep("50000-0001")).rejects.toBeInstanceOf(
      CepInvalidoError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("converte falha de rede em erro padronizado", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));

    await expect(buscarCep("50030230")).rejects.toBeInstanceOf(ConsultaCepError);
  });

  it("converte respostas HTTP malsucedidas em erro padronizado", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

    await expect(buscarCep("50030230")).rejects.toBeInstanceOf(ConsultaCepError);
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApiError, http } from "@/lib/http";
import { buscarCep } from "./cepService";

vi.mock("@/lib/http", () => ({
  http: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(
      public readonly status: number,
      public readonly response: {
        timestamp: string;
        status: number;
        error: string;
        message: string;
        path: string;
        erros: Array<{ campo: string; mensagem: string }>;
      },
    ) {
      super(response.message);
      this.name = "ApiError";
    }
  },
}));

const httpMock = vi.mocked(http);

describe("buscarCep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("consulta CEP válido normalizando a máscara", async () => {
    httpMock.mockResolvedValue({
      logradouro: "Avenida Conde da Boa Vista",
      bairro: "Boa Vista",
      cidade: "Recife",
      uf: "PE",
    });

    await expect(buscarCep("50030-230")).resolves.toEqual({
      logradouro: "Avenida Conde da Boa Vista",
      bairro: "Boa Vista",
      cidade: "Recife",
      uf: "PE",
    });

    expect(httpMock).toHaveBeenCalledWith("/enderecos/cep/50030230");
  });

  it("consulta CEP sem máscara", async () => {
    httpMock.mockResolvedValue({
      logradouro: "Rua Ribeiro de Brito",
      bairro: "Boa Viagem",
      cidade: "Recife",
      uf: "PE",
    });

    await expect(buscarCep("51020010")).resolves.toMatchObject({
      bairro: "Boa Viagem",
      cidade: "Recife",
    });

    expect(httpMock).toHaveBeenCalledWith("/enderecos/cep/51020010");
  });

  it("retorna null quando API responde 404", async () => {
    const response = {
      timestamp: new Date().toISOString(),
      status: 404,
      error: "Not Found",
      message: "CEP não encontrado.",
      path: "/enderecos/cep/99999999",
      erros: [],
    };

    httpMock.mockRejectedValue(new ApiError(404, response));

    await expect(buscarCep("99999-999")).resolves.toBeNull();
  });

  it("propaga erros diferentes de 404", async () => {
    const response = {
      timestamp: new Date().toISOString(),
      status: 503,
      error: "Service Unavailable",
      message: "Serviço de consulta de CEP indisponível.",
      path: "/enderecos/cep/50030230",
      erros: [],
    };

    const error = new ApiError(503, response);
    httpMock.mockRejectedValue(error);

    await expect(buscarCep("50030-230")).rejects.toBe(error);
  });
});

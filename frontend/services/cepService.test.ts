import { describe, expect, it } from "vitest";

import { buscarCep } from "./cepService";

describe("buscarCep", () => {
  it("retorna endereço conhecido usando CEP com ou sem máscara", async () => {
    await expect(buscarCep("50030-230")).resolves.toMatchObject({
      cidade: "Recife",
      uf: "PE",
    });
    await expect(buscarCep("51020010")).resolves.toMatchObject({
      bairro: "Boa Viagem",
    });
  });

  it("retorna null para CEP não cadastrado no mock", async () => {
    await expect(buscarCep("99999-999")).resolves.toBeNull();
  });
});

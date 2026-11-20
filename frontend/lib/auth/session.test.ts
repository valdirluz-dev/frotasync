import { afterEach, describe, expect, it } from "vitest";

import { createSessionToken, verifySessionToken } from "./session";

const originalSecret = process.env.FROTASYNC_SESSION_SECRET;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.FROTASYNC_SESSION_SECRET;
  } else {
    process.env.FROTASYNC_SESSION_SECRET = originalSecret;
  }
});

describe("sessão autenticada", () => {
  it("verifica token assinado e rejeita token adulterado", async () => {
    process.env.FROTASYNC_SESSION_SECRET =
      "chave-de-teste-com-mais-de-trinta-e-dois-caracteres";
    const token = await createSessionToken("usr-001", 60);

    expect(await verifySessionToken(token)).toBe(true);
    expect(await verifySessionToken(`${token}forjado`)).toBe(false);
  });

  it("rejeita token quando a chave de sessão não está configurada", async () => {
    delete process.env.FROTASYNC_SESSION_SECRET;

    expect(await verifySessionToken("qualquer-valor")).toBe(false);
  });

  it("rejeita o valor literal usado pelo cookie antigo", async () => {
    process.env.FROTASYNC_SESSION_SECRET =
      "chave-de-teste-com-mais-de-trinta-e-dois-caracteres";

    expect(await verifySessionToken("true")).toBe(false);
  });

  it("rejeita token expirado", async () => {
    process.env.FROTASYNC_SESSION_SECRET =
      "chave-de-teste-com-mais-de-trinta-e-dois-caracteres";
    const token = await createSessionToken("usr-001", -1);

    expect(await verifySessionToken(token)).toBe(false);
  });
});

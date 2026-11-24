import { afterEach, describe, expect, it, vi } from "vitest";

import { http } from "./http";

describe("cliente HTTP tipado", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("envia cookies, JSON e cabeçalho de escrita", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(
      http<{ ok: boolean }>("/unidades", {
        method: "POST",
        body: { nome: "Pátio" },
      }),
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/unidades",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
      }),
    );
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get("X-FrotaSync-Client")).toBe("web");
  });

  it("trata respostas 204", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    await expect(http<void>("/auth/logout", { method: "POST" })).resolves.toBeUndefined();
  });

  it("renova uma vez e repete a requisição original", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

    await expect(http<{ items: unknown[] }>("/unidades")).resolves.toEqual({
      items: [],
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe("/api/v1/auth/refresh");
  });

  it("não tenta renovar a sessão quando o login recebe 401", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ status: 401, message: "E-mail ou senha incorretos." }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    await expect(
      http("/auth/login", {
        method: "POST",
        body: { email: "teste@example.com", senha: "Errada1!", lembreMe: false },
      }),
    ).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("não tenta renovar a sessão no cadastro público com 401", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 }),
    );

    await expect(
      http("/auth/cadastro", { method: "POST", body: {} }),
    ).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("invalida a sessão e redireciona quando o refresh falha", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 401, message: "Sessão expirada." }), {
          status: 401,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(http("/unidades")).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][0]).toBe("/api/v1/auth/logout");
  });

  it("invalida a sessão quando a repetição continua retornando 401", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(http("/unidades")).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[3][0]).toBe("/api/v1/auth/logout");
  });

  it("compartilha uma renovação entre requisições simultâneas", async () => {
    let refreshCalls = 0;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(
      async (_input, init) => {
        const url = String(_input);
        if (url.endsWith("/auth/refresh")) {
          refreshCalls++;
          await Promise.resolve();
          return new Response(null, { status: 204 });
        }
        if (init?.method === "GET" && refreshCalls === 0) {
          return new Response(null, { status: 401 });
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    );

    await Promise.all([
      http<{ ok: boolean }>("/unidades"),
      http<{ ok: boolean }>("/documentos"),
    ]);

    expect(refreshCalls).toBe(1);
    expect(fetchMock).toHaveBeenCalled();
  });

  it("preserva códigos e detalhes do contrato em erros", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          timestamp: "2026-11-23T00:00:00Z",
          status: 409,
          error: "CONFLICT",
          codigo: "UNIDADE_INATIVA",
          message: "Unidade inativa.",
          path: "/api/v1/unidades",
          erros: [],
        }),
        {
          status: 409,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    await expect(http("/unidades")).rejects.toMatchObject({
      status: 409,
      response: expect.objectContaining({ codigo: "UNIDADE_INATIVA" }),
    });
  });
});

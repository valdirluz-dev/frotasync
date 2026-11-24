import { afterEach, describe, expect, it, vi } from "vitest";

import type { Documento, Paginated } from "@/types/domain";
import type { DocumentoFormValues } from "@/schemas/documento";
import {
  atualizarDocumento,
  criarDocumento,
  listarCategoriasDocumentos,
  listarDocumentos,
  obterDocumento,
} from "./documentosService";

afterEach(() => {
  vi.restoreAllMocks();
});

const documento: Documento = {
  id: "doc-123",
  unidadeId: "unidade-123",
  unidadeNome: "Unidade Central",
  nome: "Licença de operação",
  categoria: "Licenças",
  tipo: null,
  dataEmissao: "2026-01-10",
  dataValidade: "2027-01-10",
  descricao: "Documento de teste",
  statusValidade: "valido",
  anexo: {
    nome: "licenca.pdf",
    tamanhoBytes: 120_000,
    tipo: "application/pdf",
    url: "/api/v1/documentos/doc-123/anexo",
  },
};

const filtrosPadrao = {
  page: 1,
  pageSize: 20,
  search: "",
  unidadeId: "todas",
  categoria: "todas",
  status: "Todos",
} as const;

const dadosFormulario: DocumentoFormValues = {
  nome: "Licença de operação",
  unidadeId: "unidade-123",
  categoria: "Licenças",
  dataEmissao: "2026-01-10",
  dataValidade: "2027-01-10",
  descricao: "  Documento de teste  ",
};

function respostaJson(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function interceptarFetch(payload: unknown, status = 200) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(respostaJson(payload, status));
}

function obterFormData(init: RequestInit | undefined): FormData {
  expect(init?.body).toBeInstanceOf(FormData);
  return init!.body as FormData;
}

describe("listarDocumentos", () => {
  it("consulta a listagem e omite filtros sem valor", async () => {
    const resultado: Paginated<Documento> = {
      items: [documento],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    };
    const fetchMock = interceptarFetch(resultado);

    await expect(listarDocumentos({ ...filtrosPadrao })).resolves.toEqual(
      resultado,
    );

    const [url, init] = fetchMock.mock.calls[0]!;
    const requisicao = new URL(String(url), "http://localhost");

    expect(requisicao.pathname).toBe("/api/v1/documentos");
    expect(requisicao.searchParams.get("page")).toBe("1");
    expect(requisicao.searchParams.get("pageSize")).toBe("20");
    expect(requisicao.searchParams.has("q")).toBe(false);
    expect(requisicao.searchParams.has("unidadeId")).toBe(false);
    expect(requisicao.searchParams.has("categoria")).toBe(false);
    expect(requisicao.searchParams.has("statusValidade")).toBe(false);
    expect(init?.method).toBe("GET");
  });

  it("converte busca, unidade, categoria e status para os parâmetros da API", async () => {
    const fetchMock = interceptarFetch({
      items: [documento],
      page: 2,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });

    await listarDocumentos({
      ...filtrosPadrao,
      page: 2,
      pageSize: 10,
      search: "  licença  ",
      unidadeId: "unidade-123",
      categoria: "Licenças",
      status: "Próximo do vencimento",
    });

    const requisicao = new URL(
      String(fetchMock.mock.calls[0]![0]),
      "http://localhost",
    );

    expect(requisicao.searchParams.get("q")).toBe("licença");
    expect(requisicao.searchParams.get("unidadeId")).toBe("unidade-123");
    expect(requisicao.searchParams.get("categoria")).toBe("Licenças");
    expect(requisicao.searchParams.get("statusValidade")).toBe(
      "proximo_vencimento",
    );
  });

  it.each([
    ["Válido", "valido"],
    ["Próximo do vencimento", "proximo_vencimento"],
    ["Expirado", "expirado"],
  ] as const)("converte o status %s para %s", async (status, esperado) => {
    const fetchMock = interceptarFetch({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    });

    await listarDocumentos({ ...filtrosPadrao, status });

    const requisicao = new URL(
      String(fetchMock.mock.calls[0]![0]),
      "http://localhost",
    );
    expect(requisicao.searchParams.get("statusValidade")).toBe(esperado);
  });
});

describe("listarCategoriasDocumentos", () => {
  it("consulta as categorias disponíveis na API", async () => {
    const categorias = ["Licenças", "Seguros", "Certificados"];
    const fetchMock = interceptarFetch(categorias);

    await expect(listarCategoriasDocumentos()).resolves.toEqual(categorias);
    expect(fetchMock.mock.calls[0]![0]).toBe(
      "/api/v1/documentos/categorias",
    );
  });
});

describe("obterDocumento", () => {
  it("consulta o documento pelo identificador", async () => {
    const fetchMock = interceptarFetch(documento);

    await expect(obterDocumento("doc-123")).resolves.toEqual(documento);
    expect(fetchMock.mock.calls[0]![0]).toBe("/api/v1/documentos/doc-123");
  });

  it("codifica identificadores na URL", async () => {
    const fetchMock = interceptarFetch(documento);

    await obterDocumento("doc/123");

    expect(fetchMock.mock.calls[0]![0]).toBe(
      "/api/v1/documentos/doc%2F123",
    );
  });
});

describe("criarDocumento", () => {
  it("envia os dados e o anexo em multipart para a unidade", async () => {
    const fetchMock = interceptarFetch(documento);
    const anexo = new File(["conteúdo PDF"], "licenca.pdf", {
      type: "application/pdf",
    });

    await expect(criarDocumento(dadosFormulario, anexo)).resolves.toEqual(
      documento,
    );

    const [url, init] = fetchMock.mock.calls[0]!;
    const formData = obterFormData(init);
    const headers = new Headers(init?.headers);

    expect(url).toBe(
      "/api/v1/unidades/unidade-123/documentos",
    );
    expect(init?.method).toBe("POST");
    expect(headers.get("X-FrotaSync-Client")).toBe("web");
    expect(headers.has("Content-Type")).toBe(false);
    expect(formData.get("nome")).toBe("Licença de operação");
    expect(formData.get("categoria")).toBe("Licenças");
    expect(formData.get("dataEmissao")).toBe("2026-01-10");
    expect(formData.get("dataValidade")).toBe("2027-01-10");
    expect(formData.get("descricao")).toBe("Documento de teste");
    expect(formData.get("anexo")).toBeInstanceOf(File);
    expect((formData.get("anexo") as File).name).toBe("licenca.pdf");
    expect(formData.has("unidadeId")).toBe(false);
  });

  it("omite campos opcionais vazios", async () => {
    const fetchMock = interceptarFetch(documento);
    const anexo = new File(["arquivo"], "licenca.pdf", {
      type: "application/pdf",
    });

    await criarDocumento(
      {
        ...dadosFormulario,
        dataEmissao: "",
        descricao: "   ",
      },
      anexo,
    );

    const formData = obterFormData(fetchMock.mock.calls[0]![1]);

    expect(formData.has("dataEmissao")).toBe(false);
    expect(formData.has("descricao")).toBe(false);
  });

  it("codifica o identificador da unidade no caminho", async () => {
    const fetchMock = interceptarFetch(documento);
    const anexo = new File(["arquivo"], "licenca.pdf", {
      type: "application/pdf",
    });

    await criarDocumento(
      { ...dadosFormulario, unidadeId: "unidade/123" },
      anexo,
    );

    expect(fetchMock.mock.calls[0]![0]).toBe(
      "/api/v1/unidades/unidade%2F123/documentos",
    );
  });
});

describe("atualizarDocumento", () => {
  it("envia atualização multipart com anexo opcional", async () => {
    const fetchMock = interceptarFetch(documento);

    await expect(
      atualizarDocumento("doc-123", dadosFormulario),
    ).resolves.toEqual(documento);

    const [url, init] = fetchMock.mock.calls[0]!;
    const formData = obterFormData(init);
    const headers = new Headers(init?.headers);

    expect(url).toBe("/api/v1/documentos/doc-123");
    expect(init?.method).toBe("PUT");
    expect(headers.get("X-FrotaSync-Client")).toBe("web");
    expect(headers.has("Content-Type")).toBe(false);
    expect(formData.get("nome")).toBe("Licença de operação");
    expect(formData.get("categoria")).toBe("Licenças");
    expect(formData.has("anexo")).toBe(false);
    expect(formData.has("unidadeId")).toBe(false);
  });

  it("inclui o novo anexo quando informado", async () => {
    const fetchMock = interceptarFetch(documento);
    const anexo = new File(["novo arquivo"], "licenca-atualizada.pdf", {
      type: "application/pdf",
    });

    await atualizarDocumento("doc-123", dadosFormulario, anexo);

    const formData = obterFormData(fetchMock.mock.calls[0]![1]);
    expect(formData.get("anexo")).toBeInstanceOf(File);
    expect((formData.get("anexo") as File).name).toBe(
      "licenca-atualizada.pdf",
    );
  });

  it("codifica o identificador do documento na URL", async () => {
    const fetchMock = interceptarFetch(documento);

    await atualizarDocumento("doc/123", dadosFormulario);

    expect(fetchMock.mock.calls[0]![0]).toBe(
      "/api/v1/documentos/doc%2F123",
    );
  });
});

describe("erros da API", () => {
  it("propaga erros HTTP como ApiError", async () => {
    const erro = {
      timestamp: "2026-11-23T23:00:00.000Z",
      status: 409,
      error: "CONFLICT",
      message: "A unidade está inativa.",
      path: "/api/v1/unidades/unidade-123/documentos",
      erros: [],
    };
    interceptarFetch(erro, 409);

    await expect(
      criarDocumento(
        dadosFormulario,
        new File(["arquivo"], "licenca.pdf", {
          type: "application/pdf",
        }),
      ),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 409,
      message: "A unidade está inativa.",
    });

  });

  it("propaga conflito 409 ao atualizar documento de unidade inativa", async () => {
    const erro = {
      timestamp: "2026-11-23T23:00:00.000Z",
      status: 409,
      error: "CONFLICT",
      message: "A unidade está inativa.",
      path: "/api/v1/documentos/doc-123",
      erros: [],
    };
    interceptarFetch(erro, 409);

    await expect(
      atualizarDocumento("doc-123", dadosFormulario),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 409,
      message: "A unidade está inativa.",
    });
  });
});

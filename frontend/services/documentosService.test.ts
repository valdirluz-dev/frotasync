import { afterEach, describe, expect, it } from "vitest";

import { mockDocumentos, mockUnidades } from "@/mocks/dashboard";
import { mockHistoricoUnidades } from "@/mocks/historicoUnidades";
import { mockNovoDocumento } from "@/mocks/documentos";
import {
  RecursoNaoEncontradoError,
  UnidadeInativaError,
} from "@/lib/errors";
import { criarDocumento, atualizarDocumento, obterDocumento } from "./documentosService";

const anexoMock = {
  nome: "licenca.pdf",
  tamanhoBytes: 120_000,
  tipo: "application/pdf",
};
const createdIds: string[] = [];

afterEach(() => {
  const ids = createdIds.splice(0);
  for (const id of ids) {
    const index = mockDocumentos.findIndex((documento) => documento.id === id);
    if (index >= 0) mockDocumentos.splice(index, 1);
  }
  for (let index = mockHistoricoUnidades.length - 1; index >= 0; index -= 1) {
    if (ids.includes(mockHistoricoUnidades[index]!.entidadeId)) {
      mockHistoricoUnidades.splice(index, 1);
    }
  }
});

describe("obterDocumento", () => {
  it("retorna o documento pelo identificador ou null quando não existe", async () => {
    const existing = mockDocumentos[0];
    expect(existing).toBeDefined();
    await expect(obterDocumento(existing!.id)).resolves.toEqual(existing);
    await expect(obterDocumento("documento-inexistente")).resolves.toBeNull();
  });
});

describe("criarDocumento", () => {
  it("cria e armazena documento com emissão opcional e anexo", async () => {
    const unidadeAtiva = mockUnidades.find((unidade) => unidade.status === "Ativa");
    expect(unidadeAtiva).toBeDefined();
    const created = await criarDocumento(
      { ...mockNovoDocumento, unidadeId: unidadeAtiva!.id },
      anexoMock,
    );
    createdIds.push(created.id);

    expect(created).toMatchObject({
      nome: mockNovoDocumento.nome,
      unidadeId: unidadeAtiva!.id,
      categoria: mockNovoDocumento.categoria,
      dataEmissao: null,
      anexo: anexoMock,
    });
    expect(mockDocumentos).toContain(created);
    expect(mockHistoricoUnidades).toContainEqual(
      expect.objectContaining({
        unidadeId: created.unidadeId,
        entidade: "Documento",
        entidadeId: created.id,
        entidadeNome: created.nome,
      }),
    );
  });

  it("não cria documentos em unidades inativas", async () => {
    const unidadeInativa = mockUnidades.find(
      (unidade) => unidade.status === "Inativa",
    );
    expect(unidadeInativa).toBeDefined();

    await expect(
      criarDocumento(
        { ...mockNovoDocumento, unidadeId: unidadeInativa!.id },
        anexoMock,
      ),
    ).rejects.toBeInstanceOf(UnidadeInativaError);
  });

  it("retorna erro se a unidade não existe ou o anexo não foi informado", async () => {
    await expect(
      criarDocumento({ ...mockNovoDocumento, unidadeId: "unidade-inexistente" }, anexoMock),
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
    await expect(criarDocumento(mockNovoDocumento)).rejects.toThrow(
      "O anexo do documento é obrigatório.",
    );
  });
});

describe("atualizarDocumento", () => {
  it("lança erro de recurso não encontrado para documento inexistente", async () => {
    await expect(
      atualizarDocumento("documento-inexistente", mockNovoDocumento),
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });
});

import { mockDocumentos, mockUnidades } from "@/mocks/dashboard";
import type { Documento, DocumentoAnexo } from "@/types/domain";
import {
  UnidadeInativaError,
  RecursoNaoEncontradoError,
} from "@/lib/errors";
import { wait } from "@/lib/mockApi";
import type { DocumentoFormValues } from "@/schemas/documento";
import { registrarEventoHistoricoUnidade } from "@/services/historicoUnidadesService";

export async function obterDocumento(id: string): Promise<Documento | null> {
  await wait(120);
  return mockDocumentos.find((item) => item.id === id) ?? null;
}

export async function atualizarDocumento(
  id: string,
  data: DocumentoFormValues,
  anexo?: DocumentoAnexo,
): Promise<Documento> {
  await wait();
  const index = mockDocumentos.findIndex((item) => item.id === id);
  if (index < 0) throw new RecursoNaoEncontradoError("Documento");
  const current = mockDocumentos[index];
  const unidade = mockUnidades.find((item) => item.id === current.unidadeId);
  if (!unidade) throw new RecursoNaoEncontradoError("Unidade");
  if (unidade.status === "Inativa") throw new UnidadeInativaError();

  const updated: Documento = {
    ...current,
    nome: data.nome.trim(),
    categoria: data.categoria.trim(),
    dataEmissao: data.dataEmissao?.trim() || null,
    dataValidade: data.dataValidade,
    descricao: data.descricao?.trim() || undefined,
    anexo: anexo ?? current.anexo,
  };
  mockDocumentos[index] = updated;
  registrarEventoHistoricoUnidade({
    unidadeId: updated.unidadeId,
    acao: "Atualizou o documento",
    entidade: "Documento",
    entidadeId: updated.id,
    entidadeNome: updated.nome,
  });
  return updated;
}

export async function criarDocumento(
  data: DocumentoFormValues,
  anexo?: DocumentoAnexo,
): Promise<Documento> {
  await wait();

  const unidade = mockUnidades.find((item) => item.id === data.unidadeId);
  if (!unidade) throw new RecursoNaoEncontradoError("Unidade");
  if (unidade.status === "Inativa") throw new UnidadeInativaError();
  if (!anexo) throw new Error("O anexo do documento é obrigatório.");

  const nextSequence =
    mockDocumentos.reduce((maximum, documento) => {
      const matched = /^doc-(\d+)$/.exec(documento.id);
      return Math.max(maximum, matched ? Number(matched[1]) : 0);
    }, 0) + 1;

  const documento: Documento = {
    id: `doc-${String(nextSequence).padStart(3, "0")}`,
    nome: data.nome.trim(),
    unidadeId: unidade.id,
    categoria: data.categoria.trim(),
    dataEmissao: data.dataEmissao?.trim() || null,
    dataValidade: data.dataValidade,
    descricao: data.descricao?.trim() || undefined,
    anexo,
  };
  mockDocumentos.push(documento);
  registrarEventoHistoricoUnidade({
    unidadeId: documento.unidadeId,
    acao: "Cadastrou o documento",
    entidade: "Documento",
    entidadeId: documento.id,
    entidadeNome: documento.nome,
  });
  return documento;
}

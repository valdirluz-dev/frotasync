import { calcularStatusDocumento } from "@/lib/status";
import { mockDocumentos, mockUnidades } from "@/mocks/dashboard";
import type { Documento, DocumentoAnexo } from "@/types/dashboard";
import { UnidadeInativaError, RecursoNaoEncontradoError } from "@/services/dashboardService";
import type { DocumentoFormValues } from "@/schemas/documento";

const wait = (ms = 140) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function obterDocumento(id: string): Promise<Documento | null> {
  await wait(120);
  return mockDocumentos.find((item) => item.id === id) ?? null;
}

export async function atualizarDocumento(id: string, data: DocumentoFormValues, anexo?: DocumentoAnexo): Promise<Documento> {
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
    dataEmissao: data.dataEmissao,
    dataValidade: data.dataValidade,
    descricao: data.descricao?.trim() || undefined,
    anexo: anexo ?? current.anexo,
  };
  mockDocumentos[index] = updated;
  void calcularStatusDocumento(updated.dataValidade);
  return updated;
}

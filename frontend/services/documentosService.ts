import { RecursoNaoEncontradoError } from "@/lib/errors";
import { repositories } from "@/repositories";
import type { DocumentoFormValues } from "@/schemas/documento";
import type { Documento, DocumentoAnexo } from "@/types/domain";

import { obterUnidadeAtiva } from "./serviceRules";

export type CriarDocumentoInput = DocumentoFormValues & { unidadeId: string };

function mapearAnexo(file?: File): DocumentoAnexo | undefined {
  return file
    ? { nome: file.name, tamanhoBytes: file.size, tipo: file.type }
    : undefined;
}

export async function listarDocumentos(): Promise<Documento[]> {
  return repositories.documentos.list();
}

export async function obterDocumento(id: string): Promise<Documento | null> {
  return repositories.documentos.findById(id);
}

export async function criarDocumento(
  data: CriarDocumentoInput,
): Promise<Documento> {
  await obterUnidadeAtiva(data.unidadeId);
  const documento = {
    unidadeId: data.unidadeId,
    nome: data.nome.trim(),
    categoria: data.categoria.trim(),
    dataEmissao: data.dataEmissao,
    dataValidade: data.dataValidade,
    descricao: data.descricao?.trim() || undefined,
    anexo: mapearAnexo(data.anexo),
  };
  return repositories.documentos.insert(documento);
}

export async function atualizarDocumento(
  id: string,
  data: DocumentoFormValues,
  anexo?: DocumentoAnexo,
): Promise<Documento> {
  const current = await repositories.documentos.findById(id);
  if (!current) throw new RecursoNaoEncontradoError("Documento");
  await obterUnidadeAtiva(current.unidadeId);

  const updated: Documento = {
    ...current,
    nome: data.nome.trim(),
    categoria: data.categoria.trim(),
    dataEmissao: data.dataEmissao,
    dataValidade: data.dataValidade,
    descricao: data.descricao?.trim() || undefined,
    anexo: anexo ?? mapearAnexo(data.anexo) ?? current.anexo,
  };
  return repositories.documentos.update(updated);
}

export async function excluirDocumento(id: string): Promise<void> {
  const current = await repositories.documentos.findById(id);
  if (!current) throw new RecursoNaoEncontradoError("Documento");
  await obterUnidadeAtiva(current.unidadeId);
  const removed = await repositories.documentos.remove(id);
  if (!removed) throw new RecursoNaoEncontradoError("Documento");
}

export async function listarCategoriasDocumento(): Promise<string[]> {
  return repositories.documentos.listCategories();
}

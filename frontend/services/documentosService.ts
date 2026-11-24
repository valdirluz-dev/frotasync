import { http } from "@/lib/http";
import type { DocumentoFormValues } from "@/schemas/documento";
import type {
  Documento,
  DocumentoStatus,
  DocumentoStatusApi,
  DocumentFilters,
  Paginated,
} from "@/types/domain";

type DocumentoApiFilters = {
  page: number;
  pageSize: number;
  q?: string;
  unidadeId?: string;
  categoria?: string;
  statusValidade?: DocumentoStatusApi;
};

const statusParaApi: Record<DocumentoStatus, DocumentoStatusApi> = {
  "Válido": "valido",
  "Próximo do vencimento": "proximo_vencimento",
  "Expirado": "expirado",
};

function montarFiltrosApi(filters: DocumentFilters): DocumentoApiFilters {
  return {
    page: filters.page,
    pageSize: filters.pageSize,
    q: filters.search.trim() || undefined,
    unidadeId:
      filters.unidadeId && filters.unidadeId !== "todas"
        ? filters.unidadeId
        : undefined,
    categoria:
      filters.categoria && filters.categoria !== "todas"
        ? filters.categoria
        : undefined,
    statusValidade:
      filters.status !== "Todos"
        ? statusParaApi[filters.status]
        : undefined,
  };
}

function montarFormData(
  data: DocumentoFormValues,
  anexo?: File,
): FormData {
  const formData = new FormData();

  formData.append("nome", data.nome);
  formData.append("categoria", data.categoria);
  formData.append("dataValidade", data.dataValidade);

  if (data.dataEmissao) {
    formData.append("dataEmissao", data.dataEmissao);
  }

  if (data.descricao?.trim()) {
    formData.append("descricao", data.descricao.trim());
  }

  if (anexo) {
    formData.append("anexo", anexo);
  }

  return formData;
}

export async function listarDocumentos(
  filters: DocumentFilters,
): Promise<Paginated<Documento>> {
  return http<Paginated<Documento>>("/documentos", {
    params: montarFiltrosApi(filters),
  });
}

export async function listarCategoriasDocumentos(): Promise<string[]> {
  return http<string[]>("/documentos/categorias");
}

export async function obterDocumento(id: string): Promise<Documento> {
  return http<Documento>(`/documentos/${encodeURIComponent(id)}`);
}

export async function criarDocumento(
  data: DocumentoFormValues,
  anexo: File,
): Promise<Documento> {
  const { unidadeId } = data;

  return http<Documento>(
    `/unidades/${encodeURIComponent(unidadeId)}/documentos`,
    {
      method: "POST",
      body: montarFormData(data, anexo),
    },
  );
}

export async function atualizarDocumento(
  id: string,
  data: DocumentoFormValues,
  anexo?: File,
): Promise<Documento> {
  return http<Documento>(`/documentos/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: montarFormData(data, anexo),
  });
}

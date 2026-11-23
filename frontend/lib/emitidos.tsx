import { mockDocumentos, mockTarefas } from "@/mocks/dashboard";

// Representa os valores calculados de Documentos Válidos e Tarefas Concluídas em cada mês
export type ItemEmitidoMensal = {
  id: string;
  label: string;
  documentosCount: number;
  tarefasCount: number;
  documentosPercentage: number;
  tarefasPercentage: number;
};

// Todos os 12 meses do ano em português para o eixo horizontal
const MESES_ANO = [
  { chave: "01", label: "Jan" },
  { chave: "02", label: "Fev" },
  { chave: "03", label: "Mar" },
  { chave: "04", label: "Abr" },
  { chave: "05", label: "Mai" },
  { chave: "06", label: "Jun" },
  { chave: "07", label: "Jul" },
  { chave: "08", label: "Ago" },
  { chave: "09", label: "Set" },
  { chave: "10", label: "Out" },
  { chave: "11", label: "Nov" },
  { chave: "12", label: "Dez" },
];

// Estrutura esperada para filtrar e agrupar documentos válidos
export interface RegistroDocumentoEmissao {
  id?: string | number;
  status?: string | null;
  situacao?: string | null;
  valido?: boolean;
  dataEmissao?: string | null;
  dataValidade?: string | null;
  [key: string]: unknown;
}

// Estrutura esperada para filtrar e agrupar tarefas concluídas
export interface RegistroTarefaEmissao {
  id?: string | number;
  status?: string | null;
  concluida?: boolean;
  dataInicio?: string | null;
  prazoFinal?: string | null;
  dataConclusao?: string | null;
  [key: string]: unknown;
}

// Extrai o mês ("01" a "12") sem variação de fuso horário
function extrairMesChave(valorData?: string | null): string | null {
  if (!valorData) return null;
  const texto = valorData.trim();
  if (!texto) return null;

  const isoMatch = texto.match(/^\d{4}[-/](\d{2})[-/]\d{2}/);
  if (isoMatch) return isoMatch[1];

  const brMatch = texto.match(/^\d{2}[-/](\d{2})[-/]\d{4}/);
  if (brMatch) return brMatch[1];

  const dataRef = new Date(texto);
  if (Number.isNaN(dataRef.getTime())) return null;

  return String(dataRef.getUTCMonth() + 1).padStart(2, "0");
}

// Converte uma string de data para timestamp (ms) quando possível
function parseDataMs(valorData?: string | null): number | null {
  if (!valorData || !valorData.trim()) return null;
  const brMatch = valorData.trim().match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (brMatch) {
    const [, dia, mes, ano] = brMatch;
    const ms = Date.parse(`${ano}-${mes}-${dia}T00:00:00Z`);
    return Number.isNaN(ms) ? null : ms;
  }
  const ms = Date.parse(valorData.trim());
  return Number.isNaN(ms) ? null : ms;
}

// Verifica se o documento é válido (não está vencido e não tem status inválido/vencido)
function isDocumentoValido(doc: RegistroDocumentoEmissao): boolean {
  if (doc.valido === false) return false;

  const textoStatus = `${doc.status ?? ""} ${doc.situacao ?? ""}`.toLowerCase();
  if (
    textoStatus.includes("vencid") ||
    textoStatus.includes("expirad") ||
    textoStatus.includes("invalid") ||
    textoStatus.includes("cancelad")
  ) {
    return false;
  }

  // Se houver dataValidade, verifica se ainda não venceu em relação à data atual
  const validadeMs = parseDataMs(doc.dataValidade);
  if (validadeMs !== null) {
    const hojeFimDoDia = new Date();
    hojeFimDoDia.setHours(23, 59, 59, 999);
    if (validadeMs < hojeFimDoDia.getTime()) {
      return false;
    }
  }

  return true;
}

// Verifica se a tarefa foi concluída
function isTarefaConcluida(tarefa: RegistroTarefaEmissao): boolean {
  if (tarefa.concluida === true) return true;
  if (typeof tarefa.dataConclusao === "string" && tarefa.dataConclusao.trim()) {
    return true;
  }

  const statusNormalizado = (tarefa.status ?? "").toLowerCase();
  return (
    statusNormalizado.includes("conclu") ||
    statusNormalizado.includes("finaliz") ||
    statusNormalizado.includes("done") ||
    statusNormalizado.includes("completed")
  );
}

// Agrupa uma lista de registros já filtrados pelos meses de Jan a Dez
function contarPorMes(
  registros: Record<string, unknown>[],
  camposData: string[],
): Map<string, number> {
  const mapa = new Map<string, number>();

  for (const mes of MESES_ANO) {
    mapa.set(mes.chave, 0);
  }

  for (const registro of registros) {
    let dataEscolhida: string | null = null;

    for (const campo of camposData) {
      const valor = registro[campo];
      if (typeof valor === "string" && valor.trim()) {
        dataEscolhida = valor;
        break;
      }
    }

    const mesChave = extrairMesChave(dataEscolhida);
    if (mesChave && mapa.has(mesChave)) {
      mapa.set(mesChave, (mapa.get(mesChave) ?? 0) + 1);
    }
  }

  return mapa;
}

// Calcula os totais anuais de Documentos Válidos e Tarefas Concluídas por mês
export function calcularDocumentosETarefasAnuais(
  documentos: RegistroDocumentoEmissao[] = mockDocumentos as RegistroDocumentoEmissao[],
  tarefas: RegistroTarefaEmissao[] = mockTarefas as RegistroTarefaEmissao[],
  tetoEscala = 50,
): {
  totalDocumentos: number;
  totalTarefas: number;
  maxEscala: number;
  itens: ItemEmitidoMensal[];
} {
  const baseDocumentos =
    documentos && documentos.length > 0
      ? documentos
      : (mockDocumentos as RegistroDocumentoEmissao[]);

  const baseTarefas =
    tarefas && tarefas.length > 0
      ? tarefas
      : (mockTarefas as RegistroTarefaEmissao[]);

  // Filtra apenas os documentos válidos e agrupa por mês
  const documentosValidos = baseDocumentos.filter(isDocumentoValido);
  const mapaDocumentos = contarPorMes(
    documentosValidos as Record<string, unknown>[],
    ["dataEmissao", "dataValidade"],
  );

  // Filtra apenas as tarefas concluídas e agrupa por mês (priorizando dataConclusao)
  const tarefasConcluidas = baseTarefas.filter(isTarefaConcluida);
  const mapaTarefas = contarPorMes(
    tarefasConcluidas as Record<string, unknown>[],
    ["dataConclusao", "dataInicio", "prazoFinal"],
  );

  const valoresDocumentos = Array.from(mapaDocumentos.values());
  const valoresTarefas = Array.from(mapaTarefas.values());
  const maiorValor = Math.max(...valoresDocumentos, ...valoresTarefas, 0);
  const maxEscala = Math.max(tetoEscala, maiorValor);

  const itens: ItemEmitidoMensal[] = MESES_ANO.map((mes) => {
    const documentosCount = mapaDocumentos.get(mes.chave) ?? 0;
    const tarefasCount = mapaTarefas.get(mes.chave) ?? 0;

    const documentosPercentage =
      maxEscala > 0
        ? Math.min(100, Math.round((documentosCount / maxEscala) * 100))
        : 0;

    const tarefasPercentage =
      maxEscala > 0
        ? Math.min(100, Math.round((tarefasCount / maxEscala) * 100))
        : 0;

    return {
      id: mes.chave,
      label: mes.label,
      documentosCount,
      tarefasCount,
      documentosPercentage,
      tarefasPercentage,
    };
  });

  return {
    totalDocumentos: documentosValidos.length,
    totalTarefas: tarefasConcluidas.length,
    maxEscala,
    itens,
  };
}
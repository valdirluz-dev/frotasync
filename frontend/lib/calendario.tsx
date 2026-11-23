// Importa apenas o tipo Documento sem gerar código em tempo de execução
import type { Documento } from "@/types/domain";

// Importa a função de cálculo e os tipos de vencimento de lib/vencimentos.tsx
import { calcularControleVencimentos, type DadosControleVencimentos, type MarcacaoDiaCalendario, type NivelVencimento, type RegistroVencimentoBase,} from "@/lib/vencimentos";

// Reexporta MarcacaoDiaCalendario para facilitar importações externas
export type { MarcacaoDiaCalendario };

// Representa cada opção exibida no seletor de meses
export interface OpcaoMesCalendario {
  label: string; // Texto exibido no <select>, ex.: "Novembro 2026"
  ano: number; // Ano completo, ex.: 2026
  mesIndex: number; // Índice do mês em JS (0 = Janeiro ... 11 = Dezembro)
  totalDias: number; // Quantidade real de dias do mês (28, 29, 30 ou 31)
}

// Estrutura final devolvida para desenhar os dias e as cores no calendário
export interface DadosCalendarioMes {
  mes: string; // Rótulo do mês selecionado
  ano: number; // Ano selecionado
  mesIndex: number; // Índice do mês (0 a 11)
  totalDias: number; // Total real de dias do mês
  marcacoes: MarcacaoDiaCalendario[]; // Dias com status ("critico", "proximo" ou "renovado")
}

// Ano e mês iniciais usados para gerar os meses em sequência
const ANO_INICIAL = 2026;
const MES_INICIAL = 10; // 10 equivale a Novembro (Janeiro = 0)

// Calcula quantos dias tem o mês em UTC para evitar erros por fuso horário
export function obterTotalDiasDoMes(ano: number, mesIndex: number): number {
  return new Date(Date.UTC(ano, mesIndex + 1, 0)).getUTCDate();
}

// Formata o rótulo do mês em pt-BR com a primeira letra maiúscula (ex.: "Dezembro 2026")
function formatarLabelMesUtc(ano: number, mesIndex: number): string {
  const nomeMes = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(ano, mesIndex, 1)));

  return `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} ${ano}`;
}

// Gera automaticamente a sequência de meses e calcula o total de dias de cada um
export function gerarMesesDisponiveis(
  quantidadeMeses = 3,
  anoBase = ANO_INICIAL,
  mesBase = MES_INICIAL,
): OpcaoMesCalendario[] {
  return Array.from({ length: quantidadeMeses }, (_, offset) => {
    const dataUtc = new Date(Date.UTC(anoBase, mesBase + offset, 1));
    const ano = dataUtc.getUTCFullYear();
    const mesIndex = dataUtc.getUTCMonth();

    return {
      label: formatarLabelMesUtc(ano, mesIndex),
      ano,
      mesIndex,
      totalDias: obterTotalDiasDoMes(ano, mesIndex),
    };
  });
}

// Normaliza os documentos convertendo dataEmissao de null para undefined
function normalizarDocumentosParaVencimentos(
  documentos?: Documento[],
): RegistroVencimentoBase[] | undefined {
  if (!documentos) return undefined;

  return documentos.map((doc) => ({
    ...doc,
    dataEmissao: doc.dataEmissao ?? undefined,
  }));
}

// Monta os dados do calendário para o mês selecionado, sincronizado com vencimentos.tsx
export function obterDadosCalendario(
  mesLabel = "Novembro 2026",
  documentos?: Documento[],
  dadosVencimentos?: DadosControleVencimentos,
): DadosCalendarioMes {
  const meses = gerarMesesDisponiveis(12);
  const mesEncontrado = meses.find((m) => m.label === mesLabel) ?? meses[0];

  const documentosNormalizados = normalizarDocumentosParaVencimentos(documentos);

  // Reaproveita dadosVencimentos apenas se o mesReferencia corresponder ao mês selecionado
  const dadosMesCorresponde =
    dadosVencimentos && dadosVencimentos.mesReferencia === mesEncontrado.label;

  const baseVencimentos = dadosMesCorresponde
    ? dadosVencimentos
    : calcularControleVencimentos(documentosNormalizados, mesEncontrado.label);

  // Filtra apenas os dias válidos dentro do total real de dias do mês (1 até totalDias)
  const mapaDias = new Map<number, NivelVencimento>();
  baseVencimentos.marcacoesCalendario.forEach((item) => {
    if (item.dia >= 1 && item.dia <= mesEncontrado.totalDias) {
      mapaDias.set(item.dia, item.status);
    }
  });

  // Ordena as marcações em ordem crescente do dia
  const marcacoes: MarcacaoDiaCalendario[] = Array.from(mapaDias.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([dia, status]) => ({ dia, status }));

  return {
    mes: mesEncontrado.label,
    ano: mesEncontrado.ano,
    mesIndex: mesEncontrado.mesIndex,
    totalDias: mesEncontrado.totalDias,
    marcacoes,
  };
}
// Representa cada ponto exibido no gráfico de progresso anual (mês e quantidade)
export type PontoProgressoMensal = {
  month: string;
  value: number;
};

export type PontoProgressoSemanal = PontoProgressoMensal;

// Estrutura flexível para os registros (tarefas, documentos ou itens simulados)
export interface RegistroData {
  id?: string | number;
  status?: string;
  dataConclusao?: string | Date | null;
  dataValidade?: string | Date | null;
  prazoFinal?: string | Date | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  [key: string]: unknown;
}

// Ordem padrão dos meses usada no eixo X do gráfico (0 = Jan até 11 = Dez)
export const MESES_ANO = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

// Dados simulados anuais (mês a mês) caso não haja registros reais disponíveis
export const PROGRESSO_ANUAL_SIMULADO: PontoProgressoMensal[] = [
  { month: "Jan", value: 18 },
  { month: "Fev", value: 24 },
  { month: "Mar", value: 50 },
  { month: "Abr", value: 28 },
  { month: "Mai", value: 80 },
  { month: "Jun", value: 38 },
  { month: "Jul", value: 20 },
  { month: "Ago", value: 49 },
  { month: "Set", value: 64 },
  { month: "Out", value: 58 },
  { month: "Nov", value: 71 },
  { month: "Dez", value: 80 },
];

export const PROGRESSO_MENSAL_SIMULADO = PROGRESSO_ANUAL_SIMULADO;
export const PROGRESSO_SEMANAL_SIMULADO = PROGRESSO_ANUAL_SIMULADO;

// Extrai o array de registros de respostas diretas ou encapsuladas em objeto
export function extrairItensLista(resposta: unknown): RegistroData[] {
  if (!resposta) return [];

  if (Array.isArray(resposta)) {
    return resposta as RegistroData[];
  }

  if (typeof resposta === "object") {
    const obj = resposta as Record<string, unknown>;

    if (Array.isArray(obj.items)) {
      return obj.items as RegistroData[];
    }

    if (Array.isArray(obj.data)) {
      return obj.data as RegistroData[];
    }

    if (obj.data && typeof obj.data === "object") {
      const nested = obj.data as Record<string, unknown>;
      if (Array.isArray(nested.items)) {
        return nested.items as RegistroData[];
      }
    }
  }

  return [];
}

// Converte o campo de data disponível no registro em um objeto Date válido
function obterDataValida(registro: RegistroData): Date | null {
  const candidato =
    registro.dataConclusao ??
    registro.updatedAt ??
    registro.prazoFinal ??
    registro.dataValidade ??
    registro.createdAt;

  if (!candidato) return null;

  const data =
    candidato instanceof Date ? candidato : new Date(String(candidato));

  return Number.isNaN(data.getTime()) ? null : data;
}

// Agrupa os registros por mês (Jan a Dez); se vazio, usa dados simulados ou zeros
export function calcularProgressoAnual(
  registros: RegistroData[],
  usarSimuladoSeVazio = true,
  anoFiltro?: number,
): PontoProgressoMensal[] {
  if (!registros || registros.length === 0) {
    return usarSimuladoSeVazio
      ? PROGRESSO_ANUAL_SIMULADO
      : MESES_ANO.map((month) => ({ month, value: 0 }));
  }

  // Inicializa os 12 meses com zero
  const contagemPorMes = new Array<number>(12).fill(0);
  let totalComDataValida = 0;

  for (const registro of registros) {
    const data = obterDataValida(registro);
    if (!data) continue;

    // Se um ano específico for pedido, filtra por ele; senão soma pelo mês do registro
    if (typeof anoFiltro === "number" && data.getFullYear() !== anoFiltro) {
      continue;
    }

    const indiceMes = data.getMonth();
    contagemPorMes[indiceMes] += 1;
    totalComDataValida += 1;
  }

  // Se existirem registros mas nenhum tiver data válida, cai no simulado (ou zeros)
  if (totalComDataValida === 0) {
    return usarSimuladoSeVazio
      ? PROGRESSO_ANUAL_SIMULADO
      : MESES_ANO.map((month) => ({ month, value: 0 }));
  }

  return MESES_ANO.map((month, index) => ({
    month,
    value: contagemPorMes[index],
  }));
}

export const calcularProgressoMensal = calcularProgressoAnual;
export const calcularProgressoSemanal = calcularProgressoAnual;
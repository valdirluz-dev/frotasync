// Representa cada ponto exibido no gráfico de progresso semanal (dia da semana e quantidade)
export type PontoProgressoSemanal = {
  day: string;
  value: number;
};

// Estrutura flexível para os registros/tarefas vindos  de dados simulados
export interface RegistroData {
  id?: string | number;
  status?: string;
  dataConclusao?: string | Date | null;
  prazoFinal?: string | Date | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  [key: string]: unknown;
}

// Ordem padrão dos dias da semana usada no eixo X do gráfico (0 = Dom até 6 = Sáb)
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Dados simulados 
export const PROGRESSO_SEMANAL_SIMULADO: PontoProgressoSemanal[] = [
  { day: "Dom", value: 12 },
  { day: "Seg", value: 90 },
  { day: "Ter", value: 50 },
  { day: "Qua", value: 20 },
  { day: "Qui", value: 70 },
  { day: "Sex", value: 35 },
  { day: "Sáb", value: 120 },
];

// Extrai o array de registros 
export function extrairItensLista(resposta: unknown): RegistroData[] {
  if (!resposta) return [];

  // Caso a resposta já seja diretamente uma lista (array)
  if (Array.isArray(resposta)) {
    return resposta as RegistroData[];
  }

  // Caso a resposta venha encapsulada em um objeto 
  if (typeof resposta === "object") {
    const obj = resposta as Record<string, unknown>;

    if (Array.isArray(obj.items)) {
      return obj.items as RegistroData[];
    }

    if (Array.isArray(obj.data)) {
      return obj.data as RegistroData[];
    }

    // Caso exista um nível extra dentro de data
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
  // Prioriza a data de conclusão, depois atualização, prazo final ou data de criação
  const candidato =
    registro.dataConclusao ??
    registro.updatedAt ??
    registro.prazoFinal ??
    registro.createdAt;

  if (!candidato) return null;

  const data =
    candidato instanceof Date ? candidato : new Date(String(candidato));

  // Retorna null caso a string não represente uma data válida
  return Number.isNaN(data.getTime()) ? null : data;
}

// Agrupa os registros por dia da semana; se a lista estiver vazia, retorna a simulação por padrão
export function calcularProgressoSemanal(
  registros: RegistroData[],
  usarSimuladoSeVazio = true
): PontoProgressoSemanal[] {
  // Fallback para dados simulados (ou zerados) quando não há registros vindos do backend
  if (!registros || registros.length === 0) {
    return usarSimuladoSeVazio
      ? PROGRESSO_SEMANAL_SIMULADO
      : DIAS_SEMANA.map((day) => ({ day, value: 0 }));
  }

  // Inicializa o contador com zero para os 7 dias da semana (Dom a Sáb)
  const contagemPorDia = [0, 0, 0, 0, 0, 0, 0];

  // Incrementa a contagem no índice correspondente ao dia da semana de cada registro
  for (const registro of registros) {
    const data = obterDataValida(registro);
    if (data) {
      const diaSemana = data.getDay();
      contagemPorDia[diaSemana] += 1;
    }
  }

  // Monta o array final no formato esperado pelo componente ProcessFlow
  return DIAS_SEMANA.map((day, index) => ({
    day,
    value: contagemPorDia[index],
  }));
}
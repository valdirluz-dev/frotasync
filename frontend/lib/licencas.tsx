import { mockDocumentos } from "@/mocks/dashboard";

// Define o formato de cada item que será exibido no gráfico de rosca
export type ItemStatusLicenca = {
  id: "vigentes" | "em_renovacao" | "pendentes"; 
  label: string; 
  percentage: number;
  count?: number; 
  color: string; 
};

// Define os campos aceitos em cada registro de licença (mock ou API)
export interface LicencaRegistro {
  id?: string | number;
  status?: string; 
  situacao?: string; 
  dataValidade?: string;
  [key: string]: unknown; 
}

// Valores usados apenas se não houver dados válidos no mock ou na API
export const STATUS_LICENCAS_SIMULADO: ItemStatusLicenca[] = [
  {
    id: "vigentes",
    label: "Vigentes",
    percentage: 60,
    color: "#2563eb",
  },
  {
    id: "em_renovacao",
    label: "Em Renovação",
    percentage: 75,
    color: "#16a34a",
  },
  {
    id: "pendentes",
    label: "Pendentes",
    percentage: 20,
    color: "#e11d48",
  },
];

// Extrai o array de registros caso venha direto ou dentro de items / data
export function extrairItensLicencas(resposta: unknown): LicencaRegistro[] {
  if (!resposta) return [];

  if (Array.isArray(resposta)) {
    return resposta as LicencaRegistro[];
  }

  if (typeof resposta === "object") {
    const obj = resposta as Record<string, unknown>;

    if (Array.isArray(obj.items)) {
      return obj.items as LicencaRegistro[];
    }

    if (Array.isArray(obj.data)) {
      return obj.data as LicencaRegistro[];
    }

    if (obj.data && typeof obj.data === "object") {
      const nested = obj.data as Record<string, unknown>;
      if (Array.isArray(nested.items)) {
        return nested.items as LicencaRegistro[];
      }
    }
  }

  return [];
}

//Calcula quantos dias faltam até dataValidade (número negativo = vencido)
function calcularDiasParaVencer(dataValidade?: string): number | null {
  if (!dataValidade) return null;

  const alvo = new Date(dataValidade);
  if (Number.isNaN(alvo.getTime())) return null;

  const agora = new Date();
  const inicioHoje = Date.UTC(
    agora.getUTCFullYear(),
    agora.getUTCMonth(),
    agora.getUTCDate(),
  );
  const inicioValidade = Date.UTC(
    alvo.getUTCFullYear(),
    alvo.getUTCMonth(),
    alvo.getUTCDate(),
  );

  return Math.round((inicioValidade - inicioHoje) / (1000 * 60 * 60 * 24));
}

// Classifica cada documento em vigentes, em_renovacao ou pendentes
function normalizarStatusLicenca(
  registro: LicencaRegistro,
): "vigentes" | "em_renovacao" | "pendentes" | null {
  // Se vier texto em status ou situacao (como numa API), tenta classificar por ele primeiro
  const bruto = String(registro.status ?? registro.situacao ?? "")
    .trim()
    .toLowerCase();

  if (bruto) {
    //Palavras que representam "Vigentes" caso venham em texto
    if (
      bruto.includes("vigente") ||
      bruto.includes("ativa") ||
      bruto.includes("valida") ||
      bruto.includes("válida")
    ) {
      return "vigentes";
    }

    //Plavras que representam "Em Renovação" caso venham em texto
    if (
      bruto.includes("renova") ||
      bruto.includes("vencer") ||
      bruto.includes("andamento")
    ) {
      return "em_renovacao";
    }

    //Palavras que representam "Pendentes" caso venham em texto
    if (
      bruto.includes("pend") ||
      bruto.includes("venc") ||
      bruto.includes("expir")
    ) {
      return "pendentes";
    }
  }

  //No mockDocumentos, lê dataValidade para descobrir o status
  const diasRestantes = calcularDiasParaVencer(registro.dataValidade);
  if (diasRestantes === null) return null;

  //Quantidade de dias antes do vencimento para entrar em "Em Renovação"
  const limiteRenovacaoDias = 15;

  //Regra de dias para definir cada categoria no mock
  if (diasRestantes < 0) {
    return "pendentes"; // Já venceu
  }

  if (diasRestantes <= limiteRenovacaoDias) {
    return "em_renovacao"; // Perto de vencer
  }

  return "vigentes"; // Ainda dentro do prazo
}

// Calcula os percentuais e totais de cada categoria de licença
export function calcularStatusLicencas(
  // MODIFIQUE AQUI: por padrão usa mockDocumentos; passe outra lista quando vier da API
  registros: LicencaRegistro[] = mockDocumentos as LicencaRegistro[],
  usarSimuladoSeVazio = true,
): ItemStatusLicenca[] {
  // MODIFIQUE AQUI: se registros vier vazio, usa mockDocumentos como base
  const baseDados =
    registros && registros.length > 0
      ? registros
      : (mockDocumentos as LicencaRegistro[]);

  // Se não houver nenhum dado, retorna o simulado (ou zeros se usarSimuladoSeVazio for false)
  if (!baseDados || baseDados.length === 0) {
    if (usarSimuladoSeVazio) {
      return STATUS_LICENCAS_SIMULADO;
    }

    return STATUS_LICENCAS_SIMULADO.map((item) => ({
      ...item,
      percentage: 0,
      count: 0,
    }));
  }

  // Contadores de cada status
  let vigentes = 0;
  let emRenovacao = 0;
  let pendentes = 0;
  let totalContabilizado = 0;

  // Percorre os registros e soma cada categoria válida
  for (const registro of baseDados) {
    const categoria = normalizarStatusLicenca(registro);
    if (!categoria) continue;

    totalContabilizado += 1;
    if (categoria === "vigentes") vigentes += 1;
    if (categoria === "em_renovacao") emRenovacao += 1;
    if (categoria === "pendentes") pendentes += 1;
  }

  // Evita divisão por zero caso nenhum item tenha sido contabilizado
  if (totalContabilizado === 0) {
    return usarSimuladoSeVazio ? STATUS_LICENCAS_SIMULADO : [];
  }

  // Calcula a porcentagem arredondada de cada categoria
  const calcPct = (qtd: number) => Math.round((qtd / totalContabilizado) * 100);

  // Retorna os 3 itens prontos para o componente LicenceStatus.tsx
  return [
    {
      id: "vigentes",
      label: "Vigentes",
      percentage: calcPct(vigentes),
      count: vigentes,
      color: "#2563eb",
    },
    {
      id: "em_renovacao",
      label: "Em Renovação",
      percentage: calcPct(emRenovacao),
      count: emRenovacao,
      color: "#16a34a",
    },
    {
      id: "pendentes",
      label: "Pendentes",
      percentage: calcPct(pendentes),
      count: pendentes,
      color: "#e11d48",
    },
  ];
}
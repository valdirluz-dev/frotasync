import { mockDocumentos } from "@/mocks/dashboard";

// Formato de cada coluna do gráfico de licenças emitidas
export type ItemLicencaEmitida = {
  id: string;
  label: string;
  count: number;
  percentage: number;
};

// Meses exibidos no eixo horizontal do gráfico
const MESES_PADRAO_GRAFICO = [
  { chave: "01", label: "Jan" },
  { chave: "02", label: "Fev" },
  { chave: "03", label: "Mar" },
  { chave: "04", label: "Apr" },
  { chave: "05", label: "Mai" },
  { chave: "06", label: "Jun" },
  { chave: "09", label: "Set" },
  { chave: "10", label: "Oct" },
  { chave: "11", label: "Nov" },
  { chave: "12", label: "Dez" },
];

// Estrutura aceita nos registros de licenças
export interface RegistroEmissaoLicenca {
  id?: string | number;
  dataEmissao?: string;
  dataValidade?: string;
  [key: string]: unknown;
}

// Extrai o mês ("01" a "12") de forma previsível sem variação de fuso horário
function extrairMesChave(valorData: string): string | null {
  const texto = valorData.trim();
  if (!texto) return null;

  // Formato ISO ou YYYY-MM-DD / YYYY/MM/DD
  const isoMatch = texto.match(/^\d{4}[-/](\d{2})[-/]\d{2}/);
  if (isoMatch) return isoMatch[1];

  // Formato brasileiro DD/MM/YYYY ou DD-MM-YYYY
  const brMatch = texto.match(/^\d{2}[-/](\d{2})[-/]\d{4}/);
  if (brMatch) return brMatch[1];

  const dataRef = new Date(texto);
  if (Number.isNaN(dataRef.getTime())) return null;

  return String(dataRef.getUTCMonth() + 1).padStart(2, "0");
}

// Calcula a quantidade de licenças emitidas por mês
export function calcularLicencasEmitidas(
  registros: RegistroEmissaoLicenca[] = mockDocumentos as RegistroEmissaoLicenca[],
  tetoEscala = 50,
): {
  totalEmitidas: number;
  maxEscala: number;
  itens: ItemLicencaEmitida[];
} {
  const baseDados =
    registros && registros.length > 0
      ? registros
      : (mockDocumentos as RegistroEmissaoLicenca[]);

  // Inicia os contadores zerados por mês
  const contagensPorMes = new Map<string, number>();
  for (const mes of MESES_PADRAO_GRAFICO) {
    contagensPorMes.set(mes.chave, 0);
  }

  // Agrupa os registros pelo mês da data de emissão (ou validade, se não houver emissão)
  for (const registro of baseDados) {
    const dataRefRaw =
      typeof registro.dataEmissao === "string" && registro.dataEmissao
        ? registro.dataEmissao
        : typeof registro.dataValidade === "string"
          ? registro.dataValidade
          : "";

    if (!dataRefRaw) continue;

    const mesChave = extrairMesChave(dataRefRaw);
    if (mesChave && contagensPorMes.has(mesChave)) {
      contagensPorMes.set(mesChave, (contagensPorMes.get(mesChave) ?? 0) + 1);
    }
  }

  // Ajusta o topo do eixo caso algum mês ultrapasse o valor inicial
  const maiorValor = Math.max(...Array.from(contagensPorMes.values()), 0);
  const maxEscala = Math.max(tetoEscala, maiorValor);

  // Monta os dados prontos para o componente do gráfico
  const itens: ItemLicencaEmitida[] = MESES_PADRAO_GRAFICO.map((mes) => {
    const count = contagensPorMes.get(mes.chave) ?? 0;
    const percentage =
      maxEscala > 0 ? Math.min(100, Math.round((count / maxEscala) * 100)) : 0;

    return {
      id: mes.chave,
      label: mes.label,
      count,
      percentage,
    };
  });

  return {
    totalEmitidas: baseDados.length,
    maxEscala,
    itens,
  };
}
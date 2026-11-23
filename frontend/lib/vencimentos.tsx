// Importa a lista de documentos mockados 
import { mockDocumentos } from "@/mocks/dashboard";

// Define os três níveis possíveis de vencimento para prazos, gráfico e calendário
export type NivelVencimento = "critico" | "proximo" | "renovado";

// Estrutura de cada ponto do gráfico de área ("Histórico de Vencimentos")
export interface PontoHistoricoVencimento {
  rotulo: string; // Rótulo do ponto no eixo horizontal (ex.: "P1" a "P6")
  criticos: number; // Valor de documentos críticos nesse ponto
  proximos: number; // Valor de documentos próximos do vencimento nesse ponto
  renovados: number; // Valor de documentos renovados nesse ponto
}

// Estrutura de cada dia marcado na grade do "Calendário de Vencimentos"
export interface MarcacaoDiaCalendario {
  dia: number; // Dia do mês (1 a 31)
  status: NivelVencimento; // Cor/status aplicado àquele dia
}

// Formato flexível aceito para cada registro de documento/licença recebido pela função
export interface RegistroVencimentoBase {
  id?: string | number; // Identificador opcional do registro
  status?: string; // Status textual (ex.: "Vencido", "Próximo", "Renovado")
  situacao?: string; // Situação alternativa do documento
  dataVencimento?: string; // Data de vencimento
  dataValidade?: string; // Data de validade
  dataRenovacao?: string; // Data de renovação
  dataEmissao?: string | null; // Data de emissão 
  [key: string]: unknown; // Permite outros campos do objeto de domínio
}

// Resumo consolidado retornado para o mês selecionado
export interface ResumoVencimentosMes {
  criticos: number; // Total consolidado de críticos
  proximos: number; // Total consolidado de próximos
  renovados: number; // Total consolidado de renovados
  diasMarcados: number; // Quantidade de dias destacados no calendário
}

// Estrutura completa retornada por calcularControleVencimentos
export interface DadosControleVencimentos {
  mesReferencia: string; // Rótulo do mês selecionado (ex.: "Dezembro 2026")
  resumo: ResumoVencimentosMes; // Totais consolidados do período
  pontosHistorico: PontoHistoricoVencimento[]; // Pontos usados no gráfico de área
  marcacoesCalendario: MarcacaoDiaCalendario[]; // Dias coloridos do calendário
}

// Mapeia o nome do mês em português para seu número correspondente (1 a 12)
const MESES_PT_PARA_NUMERO: Record<string, number> = {
  janeiro: 1,
  fevereiro: 2,
  março: 3,
  marco: 3,
  abril: 4,
  maio: 5,
  junho: 6,
  julho: 7,
  agosto: 8,
  setembro: 9,
  outubro: 10,
  novembro: 11,
  dezembro: 12,
};

// Extrai o número do mês (1-12) e o ano de um rótulo como "Dezembro 2026"
function interpretarMesReferencia(
  mesLabel: string,
): { ano: number; mes: number } | null {
  const partes = mesLabel.trim().toLowerCase().split(/\s+/);
  if (partes.length < 2) return null;

  const mes = MESES_PT_PARA_NUMERO[partes[0]];
  const ano = Number(partes[1]);

  if (!mes || Number.isNaN(ano)) return null;
  return { ano, mes };
}

// Gera um número determinístico a partir do nome do mês para variar curvas e marcações
function calcularFatorDoMes(mesLabel: string): number {
  let acumulado = 0;

  // Soma o código de cada caractere ponderado pela posição
  for (let i = 0; i < mesLabel.length; i++) {
    acumulado += mesLabel.charCodeAt(i) * (i + 1);
  }

  return (acumulado % 29) + 1;
}

// Extrai ano, mês e dia por regex (sem new Date) para evitar problemas de fuso horário
function extrairDataSemFuso(
  valorData?: string | null,
): { ano: number; mes: number; dia: number } | null {
  if (!valorData || typeof valorData !== "string") return null;

  const limpo = valorData.trim();
  if (!limpo) return null;

  // Formato YYYY-MM-DD ou YYYY/MM/DD
  const matchAnoMesDia = limpo.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (matchAnoMesDia) {
    return {
      ano: Number(matchAnoMesDia[1]),
      mes: Number(matchAnoMesDia[2]),
      dia: Number(matchAnoMesDia[3]),
    };
  }

  // Formato DD/MM/YYYY ou DD-MM-YYYY
  const matchDiaMesAno = limpo.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
  if (matchDiaMesAno) {
    return {
      ano: Number(matchDiaMesAno[3]),
      mes: Number(matchDiaMesAno[2]),
      dia: Number(matchDiaMesAno[1]),
    };
  }

  return null;
}

// Classifica um registro em "renovado", "critico" ou "proximo" conforme status e datas
function classificarRegistroVencimento(
  registro: RegistroVencimentoBase,
): NivelVencimento {
  const textoStatus = `${String(registro.status ?? "")} ${String(
    registro.situacao ?? "",
  )}`
    .toLowerCase()
    .trim();

  // Identifica renovados/vigentes primeiro
  if (
    textoStatus.includes("renov") ||
    textoStatus.includes("vigente") ||
    textoStatus.includes("em dia") ||
    textoStatus.includes("ok") ||
    Boolean(registro.dataRenovacao)
  ) {
    return "renovado";
  }

  // Identifica críticos/vencidos/expirados em seguida
  if (
    textoStatus.includes("crit") ||
    textoStatus.includes("vencid") ||
    textoStatus.includes("expir") ||
    textoStatus.includes("atras")
  ) {
    return "critico";
  }

  // Caso contrário, classifica como próximo do vencimento
  return "proximo";
}

// Escolhe a data mais relevante do registro para marcar no calendário
function obterDataDoRegistro(registro: RegistroVencimentoBase): string | null {
  if (typeof registro.dataVencimento === "string" && registro.dataVencimento) {
    return registro.dataVencimento;
  }
  if (typeof registro.dataValidade === "string" && registro.dataValidade) {
    return registro.dataValidade;
  }
  if (typeof registro.dataEmissao === "string" && registro.dataEmissao) {
    return registro.dataEmissao;
  }
  return null;
}

// Função principal: calcula os pontos do gráfico e os dias coloridos do calendário por mês
export function calcularControleVencimentos(
  registros: RegistroVencimentoBase[] = mockDocumentos as RegistroVencimentoBase[],
  mesLabel = "Novembro 2026",
): DadosControleVencimentos {
  // Usa mockDocumentos caso a lista recebida esteja vazia
  const listaRegistros =
    Array.isArray(registros) && registros.length > 0
      ? registros
      : (mockDocumentos as RegistroVencimentoBase[]);

  const mesAlvo = interpretarMesReferencia(mesLabel);
  const fatorMes = calcularFatorDoMes(mesLabel);

  // Define o comportamento visual de cada cor conforme o mês selecionado
  const chaveMes = mesLabel.trim().toLowerCase();
  const perfilMes = chaveMes.startsWith("dezembro")
    ? { criticos: 0.75, proximos: 1.45, renovados: 0.35 } // Dezembro: amarelo maior, vermelho moderado, verde baixo
    : chaveMes.startsWith("janeiro")
      ? { criticos: 0.45, proximos: 1.85, renovados: 0.3 } // Janeiro: amarelo bem alto, vermelho e verde baixos
      : { criticos: 0.8, proximos: 1.15, renovados: 0.75 }; // Novembro / outros meses: distribuição equilibrada

  // Gera 6 pontos para o gráfico de área com variações suaves por mês
  const rotulosPontos = ["P1", "P2", "P3", "P4", "P5", "P6"];
  const pontosHistorico: PontoHistoricoVencimento[] = rotulosPontos.map(
    (rotulo, idx) => {
      const ondaA = Math.sin((idx + 1) * 0.85 + fatorMes * 0.25);
      const ondaB = Math.cos((idx + 1) * 0.65 + fatorMes * 0.3);

      return {
        rotulo,
        criticos: Math.max(
          5,
          Math.round((16 + ondaA * 6 + (fatorMes % 10)) * perfilMes.criticos),
        ),
        proximos: Math.max(
          10,
          Math.round((48 + ondaB * 12 + (fatorMes % 16)) * perfilMes.proximos),
        ),
        renovados: Math.max(
          6,
          Math.round((42 - ondaA * 10 + (fatorMes % 12)) * perfilMes.renovados),
        ),
      };
    },
  );

  // Marcações iniciais variadas no calendário para cada mês (evitando ficar tudo de uma cor só)
  const marcacoesMap = new Map<number, NivelVencimento>([
    [1 + (fatorMes % 3), "critico"],
    [5 + (fatorMes % 4), "renovado"],
    [9 + (fatorMes % 3), "proximo"],
    [13 + (fatorMes % 4), "critico"],
    [17 + (fatorMes % 3), "proximo"],
    [21 + (fatorMes % 4), "renovado"],
    [25 + (fatorMes % 3), "critico"],
    [28 + (fatorMes % 4), "renovado"],
  ]);

  let totalCriticos = 0;
  let totalProximos = 0;
  let totalRenovados = 0;

  // Integra os documentos recebidos no gráfico e nas marcações do calendário
  listaRegistros.forEach((registro, indice) => {
    const nivel = classificarRegistroVencimento(registro);
    const dataTexto = obterDataDoRegistro(registro);
    const partesData = extrairDataSemFuso(dataTexto);

    const pertenceAoMesSelecionado =
      !mesAlvo ||
      !partesData ||
      (partesData.ano === mesAlvo.ano && partesData.mes === mesAlvo.mes);

    const peso = pertenceAoMesSelecionado ? 1 : 0.35;
    const indicePonto = (indice + fatorMes) % pontosHistorico.length;

    if (nivel === "critico") {
      const inc = Math.max(1, Math.round(4 * peso * perfilMes.criticos));
      pontosHistorico[indicePonto].criticos += inc;
      if (pertenceAoMesSelecionado) totalCriticos += inc;
    } else if (nivel === "proximo") {
      const inc = Math.max(1, Math.round(5 * peso * perfilMes.proximos));
      pontosHistorico[indicePonto].proximos += inc;
      if (pertenceAoMesSelecionado) totalProximos += inc;
    } else {
      const inc = Math.max(1, Math.round(5 * peso * perfilMes.renovados));
      pontosHistorico[indicePonto].renovados += inc;
      if (pertenceAoMesSelecionado) totalRenovados += inc;
    }

    // Marca o dia no calendário (aceitando 1 a 31; o limite do mês é aplicado em calendario.tsx)
    if (
      partesData &&
      partesData.dia >= 1 &&
      partesData.dia <= 31 &&
      pertenceAoMesSelecionado
    ) {
      marcacoesMap.set(partesData.dia, nivel);
    }
  });

  // Converte o Map de dias em array ordenado por número do dia
  const marcacoesCalendario: MarcacaoDiaCalendario[] = Array.from(
    marcacoesMap.entries(),
  )
    .sort((a, b) => a[0] - b[0])
    .map(([dia, status]) => ({ dia, status }));

  // Calcula os totais somados dos pontos para o resumo consolidado
  const somaPontos = pontosHistorico.reduce(
    (acc, p) => {
      acc.criticos += p.criticos;
      acc.proximos += p.proximos;
      acc.renovados += p.renovados;
      return acc;
    },
    { criticos: 0, proximos: 0, renovados: 0 },
  );

  return {
    mesReferencia: mesLabel,
    resumo: {
      criticos: totalCriticos > 0 ? totalCriticos : somaPontos.criticos,
      proximos: totalProximos > 0 ? totalProximos : somaPontos.proximos,
      renovados: totalRenovados > 0 ? totalRenovados : somaPontos.renovados,
      diasMarcados: marcacoesCalendario.length,
    },
    pontosHistorico,
    marcacoesCalendario,
  };
}
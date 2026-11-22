"use client";

import { useMemo, useState } from "react";
import type { Documento } from "@/types/domain";

// Funções de geração de meses e montagem dos dados do calendário em UTC
import { gerarMesesDisponiveis, obterDadosCalendario} from "@/lib/calendario";

// Função principal de cálculo de vencimentos e tipos do gráfico/calendário
import { calcularControleVencimentos, type NivelVencimento, type PontoHistoricoVencimento } from "@/lib/vencimentos";

// Propriedades do componente ExpirationControl
type ExpirationControlProps = {
  title?: string; // Título exibido no cabeçalho do card
  documentos?: Documento[]; // Lista de documentos (pode vir filtrada do DashboardClient)
};

// Cabeçalho dos dias da semana na grade do calendário
const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];

// Gera o caminho SVG (<path>) fechado e suavizado para cada parte do gráfico
function criarCaminhoArea(
  pontos: PontoHistoricoVencimento[],
  pegarValor: (p: PontoHistoricoVencimento) => number,
  maxEscala: number,
): string {
  if (pontos.length === 0) return "";

  // Converte cada ponto em coordenadas X e Y 
  const coords = pontos.map((ponto, idx) => {
    const x = pontos.length === 1 ? 50 : (idx / (pontos.length - 1)) * 100;
    const valor = Math.max(0, pegarValor(ponto));
    const pct = Math.min(95, Math.max(4, (valor / maxEscala) * 100));
    const y = 100 - pct;
    return { x, y };
  });

  // Inicia o caminho no primeiro ponto
  let d = `M ${coords[0].x.toFixed(2)} ${coords[0].y.toFixed(2)}`;

  // Liga os pontos com curvas cúbicas suaves
  for (let i = 0; i < coords.length - 1; i++) {
    const atual = coords[i];
    const proximo = coords[i + 1];
    const meioX = ((atual.x + proximo.x) / 2).toFixed(2);
    d += ` C ${meioX} ${atual.y.toFixed(2)}, ${meioX} ${proximo.y.toFixed(2)}, ${proximo.x.toFixed(2)} ${proximo.y.toFixed(2)}`;
  }

  // Fecha até a base inferior (y = 100) para preencher a área
  const ultimoX = coords[coords.length - 1].x.toFixed(2);
  const primeiroX = coords[0].x.toFixed(2);
  return `${d} L ${ultimoX} 100 L ${primeiroX} 100 Z`;
}

// Define a classe de cor de cada dia do calendário conforme seu status
function classeDia(status?: NivelVencimento): string {
  if (status === "critico") return "bg-red-500 text-white font-semibold";
  if (status === "proximo") return "bg-amber-400 text-slate-900 font-semibold";
  if (status === "renovado") return "bg-emerald-500 text-white font-semibold";
  return "text-slate-600 hover:bg-slate-100";
}

// Componente principal: seletor de mês + gráfico de vencimentos + calendário mensal
export function ExpirationControl({
  title = "Controle de Vencimentos & Prazos de Documentos",
  documentos,
}: ExpirationControlProps) {
  // Gera automaticamente os meses disponíveis para seleção
  const opcoesMeses = useMemo(() => gerarMesesDisponiveis(4), []);

  // Estado do mês atualmente selecionado no <select>
  const [mesSelecionado, setMesSelecionado] = useState(
    opcoesMeses[0]?.label ?? "Novembro 2026",
  );

  // Calcula os dados de vencimentos para o mês e os documentos atuais
  const dadosCalculados = useMemo(
    () => calcularControleVencimentos(documentos, mesSelecionado),
    [documentos, mesSelecionado],
  );

  // Obtém os dias reais do mês e as marcações sincronizadas
  const dadosCalendario = useMemo(
    () => obterDadosCalendario(mesSelecionado, documentos, dadosCalculados),
    [mesSelecionado, documentos, dadosCalculados],
  );

  // Mapa rápido (dia -> status) para colorir cada célula do calendário
  const mapaDias = useMemo(() => {
    const mapa = new Map<number, NivelVencimento>();
    dadosCalendario.marcacoes.forEach((item) => {
      mapa.set(item.dia, item.status);
    });
    return mapa;
  }, [dadosCalendario.marcacoes]);

  // Calcula escala do eixo Y e caminhos individuais de cada cor 
  const { maxEscala, meioEscala, areaRenovados, areaProximos, areaCriticos } =
    useMemo(() => {
      const maiorValor = dadosCalculados.pontosHistorico.reduce(
        (maior, item) =>
          Math.max(maior, item.criticos, item.proximos, item.renovados),
        100,
      );

      // Arredonda para cima em múltiplos de 50 para manter o eixo Y limpo
      const escala = Math.max(100, Math.ceil(maiorValor / 50) * 50);

      return {
        maxEscala: escala,
        meioEscala: Math.round(escala / 2),
        areaRenovados: criarCaminhoArea(
          dadosCalculados.pontosHistorico,
          (p) => p.renovados,
          escala,
        ),
        areaProximos: criarCaminhoArea(
          dadosCalculados.pontosHistorico,
          (p) => p.proximos,
          escala,
        ),
        areaCriticos: criarCaminhoArea(
          dadosCalculados.pontosHistorico,
          (p) => p.criticos,
          escala,
        ),
      };
    }, [dadosCalculados.pontosHistorico]);

  // Array de 1 até totalDias do mês selecionado (ex.: 1..30 em nov, 1..31 em dez/jan)
  const diasDoMes = useMemo(
    () => Array.from({ length: dadosCalendario.totalDias }, (_, i) => i + 1),
    [dadosCalendario.totalDias],
  );

  return (
    <section className="flex w-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Cabeçalho com título e seletor de mês */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

        <select
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado(e.target.value)}
          aria-label="Selecionar mês"
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
        >
          {opcoesMeses.map((opcao) => (
            <option key={opcao.label} value={opcao.label}>
              {opcao.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grade principal: gráfico à esquerda e calendário à direita */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Coluna esquerda: Gráfico de área */}
        <div className="flex flex-col justify-between">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            Histórico de Vencimentos
          </h3>

          <div className="flex flex-1 gap-3">
            {/* Eixo vertical */}
            <div className="flex h-44 flex-col justify-between text-right text-xs font-medium text-slate-500">
              <span>{maxEscala}</span>
              <span>{meioEscala}</span>
              <span>0</span>
            </div>

            {/* Área de desenho SVG */}
            <div className="relative h-44 flex-1 overflow-hidden rounded-md border-b border-l border-slate-200 bg-slate-50/40">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="h-full w-full"
                aria-hidden="true"
              >
                {/* Área verde: renovados */}
                <path
                  d={areaRenovados}
                  fill="rgba(16, 185, 129, 0.28)"
                  stroke="#10b981"
                  strokeWidth="1.75"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Área amarela: próximos */}
                <path
                  d={areaProximos}
                  fill="rgba(251, 191, 36, 0.45)"
                  stroke="#f59e0b"
                  strokeWidth="1.75"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Área vermelha: críticos */}
                <path
                  d={areaCriticos}
                  fill="rgba(239, 68, 68, 0.55)"
                  stroke="#ef4444"
                  strokeWidth="1.75"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>

          {/* Legenda do gráfico */}
          <div className="mt-4 flex flex-wrap items-center gap-5 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Críticos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              Próximos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Renovados
            </span>
          </div>
        </div>

        {/* Coluna direita: Calendário mensal */}
        <div className="flex flex-col justify-between">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              Calendário de Vencimentos
            </h3>
            <span className="text-xs font-medium text-slate-500">
              {dadosCalendario.mes}
            </span>
          </div>

          {/* Dias da semana e dias do mês */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {DIAS_SEMANA.map((diaSemana, idx) => (
              <span
                key={`${diaSemana}-${idx}`}
                className="py-1 font-semibold text-slate-400"
              >
                {diaSemana}
              </span>
            ))}

            {diasDoMes.map((dia) => (
              <div
                key={dia}
                className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors ${classeDia(mapaDias.get(dia))}`}
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Legenda do calendário */}
          <div className="mt-4 flex flex-wrap items-center gap-5 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Vencimento crítico
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              Vencimento próximo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Renovado
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
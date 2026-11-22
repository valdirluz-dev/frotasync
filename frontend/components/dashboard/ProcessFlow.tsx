"use client";

// Hook do dashboard que busca as tarefas reais 
import { useDashboardTasks } from "@/hooks/useDashboard";
// Funções e tipos do progresso semanal criados 
import { calcularProgressoSemanal, extrairItensLista, type PontoProgressoSemanal,} from "@/lib/progresso";

export type { PontoProgressoSemanal };

// Propriedades aceitas pelo componente ProcessFlow
type ProcessFlowProps = {
  // Título exibido no topo do card
  title?: string;
  // Lista opcional de pontos já calculados por um componente pai
  data?: PontoProgressoSemanal[];
  // Valor máximo do eixo vertical (Y)
  maxValue?: number;
};

export function ProcessFlow({
  title = "Fluxo de Progresso Semanal",
  data,
  maxValue = 200,
}: ProcessFlowProps) {
  // Busca os dados de tarefas do dashboard
  const { data: respostaTarefas } = useDashboardTasks({
    page: 1,
    pageSize: 200,
    search: "",
    unidadeId: "",
    status: "Todos",
  });

  // Extrai o array de registros de forma segura
  const registros = extrairItensLista(respostaTarefas);

  // Usa os dados recebidos por prop se existirem; senão, calcula pela semana
  const series =
    data && data.length > 0 ? data : calcularProgressoSemanal(registros);

  // Largura e altura internas do SVG
  const width = 960;
  const height = 200;

  // Margens internas para acomodar os números do eixo Y e os dias no eixo X
  const paddingLeft = 38;
  const paddingRight = 16;
  const paddingTop = 14;
  const paddingBottom = 28;

  // Área útil de desenho descontando as margens
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // Converte cada ponto ({ day, value }) nas coordenadas (x, y) do SVG
  const points = series.map((item, index) => {
    // Limita o valor entre 0 e maxValue para não sair da escala do gráfico
    const clampedValue = Math.max(0, Math.min(item.value, maxValue));

    // Calcula a posição horizontal (X) ao longo dos dias da semana
    const x =
      series.length === 1
        ? paddingLeft + plotWidth / 2
        : paddingLeft + (index / (series.length - 1)) * plotWidth;

    // Calcula a posição vertical (Y), invertendo porque y=0 fica no topo
    const y = paddingTop + plotHeight - (clampedValue / maxValue) * plotHeight;

    return {
      ...item,
      x,
      y,
    };
  });

  // Monta o caminho da linha conectando os pontos (M = mover, L = linha)
  const linePath = points
    .map((pt, idx) => `${idx === 0 ? "M" : "L"} ${pt.x} ${pt.y}`)
    .join(" ");

  // Fecha o caminho até a base do gráfico para preencher a área sombreada
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`: "";

  // Valores das linhas horizontais de referência no eixo Y
  const yTicks = [0, 50, 100, 150, 200].filter((tick) => tick <= maxValue);

  return (
    // Card branco com borda suave e sombra discreta
    <section
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(15,23,42,0.05)]"
      aria-label={title}
    >
      {/* Cabeçalho com o título do gráfico */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
          {title}
        </h2>
      </div>

      {/* Área responsiva caso a tela seja estreita */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-52 w-full min-w-[320px]"
          role="img"
          aria-label={`Gráfico de ${title} de 0 a ${maxValue}`}
        >
          {/* Gradiente azul vertical usado no preenchimento sob a linha */}
          <defs>
            <linearGradient id="processFlowArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Desenha as linhas tracejadas e os rótulos numéricos do eixo Y */}
          {yTicks.map((tick) => {
            const y = paddingTop + plotHeight - (tick / maxValue) * plotHeight;

            return (
              <g key={tick}>
                {/* Linha horizontal de referência */}
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                {/* Número do eixo Y à esquerda */}
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[11px]"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Área sombreada abaixo da linha */}
          {areaPath && <path d={areaPath} fill="url(#processFlowArea)" />}

          {/* Linha principal do fluxo semanal */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Bolinhas de cada dia e rótulos (Dom a Sáb) na parte inferior */}
          {points.map((pt) => (
            <g key={pt.day}>
              {/* Ponto destacado sobre a linha */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="#FFFFFF"
                stroke="#2563EB"
                strokeWidth="2"
              />
              {/* Nome abreviado do dia da semana */}
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-slate-500 text-[11px] font-medium"
              >
                {pt.day}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

// Exportação padrão para facilitar importações existentes
export default ProcessFlow;
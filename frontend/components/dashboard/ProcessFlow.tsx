"use client";

import { useMemo } from "react";
import { calcularProgressoAnual, extrairItensLista, type PontoProgressoMensal, type RegistroData } from "../../lib/progresso";

// Propriedades aceitas pelo componente de fluxo anual
type ProcessFlowProps = {
  title?: string; 
  ano?: number; 
  filtrarPorAno?: boolean; 
  data?: PontoProgressoMensal[] | RegistroData[] | Record<string, unknown> | null;
  usarSimuladoSeVazio?: boolean;
  className?: string;
};

// Renderiza o card "Fluxo de Progresso Anual"
export function ProcessFlow({
  title = "Fluxo de Progresso Anual",
  ano = 2026,
  filtrarPorAno = false,
  data,
  usarSimuladoSeVazio = true,
  className = "",
}: ProcessFlowProps) {
  // Calcula a série mensal (Jan a Dez) a partir de pontos prontos ou registros brutos
  const pontos = useMemo<PontoProgressoMensal[]>(() => {
    if (
      Array.isArray(data) &&
      data.length > 0 &&
      typeof data[0] === "object" &&
      data[0] !== null &&
      "month" in data[0] &&
      "value" in data[0]
    ) {
      return data as PontoProgressoMensal[];
    }

    const registros = extrairItensLista(data);
    return calcularProgressoAnual(
      registros,
      usarSimuladoSeVazio,
      filtrarPorAno ? ano : undefined,
    );
  }, [data, usarSimuladoSeVazio, filtrarPorAno, ano]);

  // Define um teto múltiplo de 100 (ou 50) para dividir perfeitamente em 5 intervalos (6 marcas)
  const valorMaximoEixo = useMemo(() => {
    const maiorDado = Math.max(0, ...pontos.map((p) => p.value));
    if (maiorDado <= 100) return 100;
    return Math.ceil(maiorDado / 50) * 50;
  }, [pontos]);

  // 6 números no eixo vertical (ex.: 100, 80, 60, 40, 20, 0) gerando 6 linhas horizontais
  const ticksY = useMemo(() => {
    const passos = 5; // 5 intervalos = 6 linhas horizontais
    const lista: number[] = [];
    for (let i = passos; i >= 0; i--) {
      lista.push(Math.round((valorMaximoEixo / passos) * i));
    }
    return lista;
  }, [valorMaximoEixo]);

  // Dimensões amplas para ocupar todo o espaço interno do card 
  const larguraSvg = 900;
  const alturaSvg = 230;
  const margemEsquerda = 36; 
  const margemDireita = 12; 
  const margemTopo = 12;
  const margemBase = 24;

  const larguraPlot = larguraSvg - margemEsquerda - margemDireita;
  const alturaPlot = alturaSvg - margemTopo - margemBase;
  const baseY = margemTopo + alturaPlot;

  const coordenadas = pontos.map((ponto, idx) => {
    const x =
      margemEsquerda +
      (idx / Math.max(1, pontos.length - 1)) * larguraPlot;
    const proporcao = Math.max(0, Math.min(1, ponto.value / valorMaximoEixo));
    const y = margemTopo + alturaPlot - proporcao * alturaPlot;
    return { x, y, ...ponto };
  });

  // Caminho da linha principal
  const linhaPath = coordenadas
    .map(
      (pt, idx) =>
        `${idx === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`,
    )
    .join(" ");

  // Preenchimento sutil sob a linha até a base do gráfico
  const primeiroPt = coordenadas[0];
  const ultimoPt = coordenadas[coordenadas.length - 1];
  const areaPath =
    coordenadas.length > 0
      ? `${linhaPath} L ${ultimoPt.x.toFixed(1)} ${baseY.toFixed(1)} L ${primeiroPt.x.toFixed(1)} ${baseY.toFixed(1)} Z`
      : "";

  const totalAnual = useMemo(
    () => pontos.reduce((acc, item) => acc + item.value, 0),
    [pontos],
  );

  return (
    <section
      className={`flex h-full w-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {/* Cabeçalho com título do fluxo anual e o ano em destaque */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-[17px] font-bold tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhamento mensal de entregas concluídas e documentos regularizados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800">
            {ano}
          </span>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            Total no ano: {totalAnual}
          </span>
        </div>
      </div>

      {/* Área do gráfico */}
      <div className="flex w-full flex-1 items-center">
        <svg
          viewBox={`0 0 ${larguraSvg} ${alturaSvg}`}
          className="h-full min-h-[220px] w-full overflow-visible"
          role="img"
          aria-label={`${title} de ${ano}`}
        >
          <defs>
            <linearGradient
              id="gradienteProgressoAnual"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Eixo vertical (linha esquerda) */}
          <line
            x1={margemEsquerda}
            x2={margemEsquerda}
            y1={margemTopo}
            y2={baseY}
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />

          {/* 6 números no eixo Y + 6 linhas horizontais */}
          {ticksY.map((valorTick, idx) => {
            const proporcao = valorTick / valorMaximoEixo;
            const yTick = margemTopo + alturaPlot - proporcao * alturaPlot;

            return (
              <g key={`${valorTick}-${idx}`}>
                <text
                  x={margemEsquerda - 8}
                  y={yTick + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[11px] font-semibold"
                >
                  {valorTick}
                </text>
                <line
                  x1={margemEsquerda}
                  x2={larguraSvg - margemDireita}
                  y1={yTick}
                  y2={yTick}
                  stroke={valorTick === 0 ? "#CBD5E1" : "#E2E8F0"}
                  strokeDasharray={valorTick === 0 ? undefined : "4 4"}
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Preenchimento sob a curva */}
          {areaPath && (
            <path d={areaPath} fill="url(#gradienteProgressoAnual)" />
          )}

          {/* Linha principal do fluxo anual */}
          {linhaPath && (
            <path
              d={linhaPath}
              fill="none"
              stroke="#1E3A8A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Pontos mensais e rótulos dos meses alinhados no eixo X */}
          {coordenadas.map((pt) => (
            <g key={pt.month}>
              <title>{`${pt.month}/${ano}: ${pt.value}`}</title>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="#FFFFFF"
                stroke="#1E3A8A"
                strokeWidth="2.5"
              />
              <text
                x={pt.x}
                y={baseY + 17}
                textAnchor="middle"
                className="fill-slate-600 text-[11px] font-semibold"
              >
                {pt.month}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
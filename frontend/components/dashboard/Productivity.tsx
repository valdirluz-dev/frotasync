// Marca o componente como Client Component para permitir hooks no navegador
"use client";

import { useMemo } from "react";
import type { Documento, Tarefa } from "../../types/domain";
import { calcularProdutividadeSemanal } from "../../lib/produtividade";

// Propriedades aceitas pelo card de produtividade
type ProductivityProps = {
  title?: string; // Título exibido no topo do card
  tarefas?: Tarefa[]; // Lista opcional de tarefas
  documentos?: Documento[]; // Lista opcional de documentos
  unidadeId?: string; // Filtro opcional por unidade
  className?: string; // Classes adicionais de estilo
};

// Define a paleta de destaque do círculo e do texto conforme o percentual concluído aumenta
function obterTemaPorProgresso(percentual: number) {
  if (percentual >= 75) {
    return {
      arco: "#059669", // Verde esmeralda quando o progresso está alto / concluído
      trilha: "#D1FAE5", // Trilha verde suave
      textoPercentual: "#065F46", // Percentual em verde escuro
      badgeBg: "#ECFDF5", // Fundo suave para o selo "Concluído"
      badgeTexto: "#047857", // Texto do selo combinando com o verde
    };
  }

  if (percentual >= 40) {
    return {
      arco: "#D97706", // Amarelo/âmbar para progresso intermediário
      trilha: "#FEF3C7", // Trilha amarela clara
      textoPercentual: "#92400E", // Percentual em tom âmbar escuro
      badgeBg: "#FFFBEB", // Fundo suave amarelo para o selo
      badgeTexto: "#B45309", // Texto do selo combinando com o amarelo
    };
  }

  // Abaixo de 40%: vermelho para indicar percentual muito baixo
  return {
    arco: "#DC2626",
    trilha: "#FEE2E2",
    textoPercentual: "#991B1B",
    badgeBg: "#FEF2F2",
    badgeTexto: "#B91C1C",
  };
}

// Retorna o estilo da barrinha e da trilha para cada item da lista de baixo
function obterEstiloBarraItem(percentual: number) {
  if (percentual >= 75) {
    return {
      corPreenchimento: "#059669", // Verde: alto / concluído
      corTrilha: "#D1FAE5",
    };
  }

  if (percentual >= 40) {
    return {
      corPreenchimento: "#D97706", // Amarelo: intermediário
      corTrilha: "#FEF3C7",
    };
  }

  return {
    corPreenchimento: "#DC2626", // Vermelho: muito baixo
    corTrilha: "#FEE2E2",
  };
}

// Renderiza o card "Progresso das Metas da Semana" com legenda de cores e 2 indicadores
export function Productivity({
  title = "Progresso das Metas da Semana",
  tarefas,
  documentos,
  unidadeId,
  className = "",
}: ProductivityProps) {
  // Calcula e memoriza o resumo semanal com base nos filtros e dados recebidos
  const resumo = useMemo(
    () =>
      calcularProdutividadeSemanal({
        tarefas,
        documentos,
        unidadeId,
      }),
    [tarefas, documentos, unidadeId],
  );

  // Seleciona as cores do gráfico principal de acordo com o percentual concluído
  const temaProgresso = useMemo(
    () => obterTemaPorProgresso(resumo.percentualConcluido),
    [resumo.percentualConcluido],
  );

  // Dimensões do gráfico de anel ampliado para maior destaque visual
  const tamanhoSvg = 144;
  const centro = tamanhoSvg / 2;
  const raio = 56;
  const circunferencia = 2 * Math.PI * raio;
  const deslocamentoTraco =
    circunferencia - (resumo.percentualConcluido / 100) * circunferencia;

  return (
    <section
      className={`flex h-full w-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {/* Título principal do card */}
      <h2 className="text-[17px] font-bold tracking-tight text-slate-900">
        {title}
      </h2>

      {/* Bloco central: círculo grande com percentual em destaque e "Concluído" destacado embaixo */}
      <div className="my-2 flex flex-col items-center justify-center">
        <div
          className="relative flex shrink-0 items-center justify-center"
          style={{ width: tamanhoSvg, height: tamanhoSvg }}
        >
          <svg
            viewBox={`0 0 ${tamanhoSvg} ${tamanhoSvg}`}
            width={tamanhoSvg}
            height={tamanhoSvg}
            className="-rotate-90 overflow-visible"
            role="img"
            aria-label={`Progresso concluído: ${resumo.percentualConcluido}%`}
          >
            {/* Trilha de fundo do anel */}
            <circle
              cx={centro}
              cy={centro}
              r={raio}
              fill="none"
              stroke={temaProgresso.trilha}
              strokeWidth="13"
            />
            {/* Arco de progresso que cresce e muda de cor conforme o percentual sobe */}
            <circle
              cx={centro}
              cy={centro}
              r={raio}
              fill="none"
              stroke={temaProgresso.arco}
              strokeWidth="13"
              strokeDasharray={circunferencia}
              strokeDashoffset={deslocamentoTraco}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>

          {/* Percentual grande e centralizado bem no meio do círculo */}
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-[30px] font-extrabold leading-none transition-colors duration-300"
            style={{ color: temaProgresso.textoPercentual }}
          >
            {resumo.percentualConcluido}%
          </span>
        </div>

        {/* Rótulo "Concluído" maior e destacado com cor combinando com o círculo */}
        <span
          className="mt-2 rounded-full px-3.5 py-1 text-[16px] font-bold leading-none transition-colors duration-300"
          style={{
            backgroundColor: temaProgresso.badgeBg,
            color: temaProgresso.badgeTexto,
          }}
        >
          {resumo.rotuloPrincipal}
        </span>
      </div>

      {/* Área inferior: legenda das cores acima dos dois indicadores */}
      <div className="space-y-3">
        {/* Legenda explicando vermelho (baixo), amarelo (parcial) e verde (concluído/alto) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-[11px] font-medium text-slate-600">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-600" />
            Baixo
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            Em andamento
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            Concluído
          </span>
        </div>

        {/* Lista enxuta com apenas dois itens: Tarefas concluídas e Documentos válidos */}
        <ul className="space-y-3 text-[13px] text-slate-800">
          {resumo.itens.map((item) => {
            // Garante largura mínima visível mesmo quando o percentual é baixo
            const larguraBarra = Math.min(100, Math.max(12, item.percentual));
            const estiloBarra = obterEstiloBarraItem(item.percentual);

            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2"
              >
                {/* Esquerda: check verde + percentual + nome completo sem truncar */}
                <div className="flex items-center gap-1.5">
                  <span className="shrink-0 text-sm font-bold leading-none text-emerald-600">
                    ✓
                  </span>
                  <span className="shrink-0 font-bold text-slate-900">
                    {item.percentual}%
                  </span>
                  <span className="whitespace-nowrap font-medium leading-snug text-slate-700">
                    {item.rotulo}
                  </span>
                </div>

                {/* Direita: barrinha de progresso que muda entre vermelho, amarelo e verde */}
                <div
                  className="h-2.5 w-14 shrink-0 overflow-hidden rounded-full transition-colors duration-300"
                  style={{ backgroundColor: estiloBarra.corTrilha }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${larguraBarra}%`,
                      backgroundColor: estiloBarra.corPreenchimento,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
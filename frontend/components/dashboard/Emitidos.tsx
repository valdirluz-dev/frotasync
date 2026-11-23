"use client";

import { calcularDocumentosETarefasAnuais, type ItemEmitidoMensal, type RegistroDocumentoEmissao, type RegistroTarefaEmissao } from "@/lib/emitidos";

// Propriedades do componente anual de documentos válidos e tarefas concluídas
type DocumentosETarefasProps = {
  title?: string;
  items?: ItemEmitidoMensal[];
  documentos?: RegistroDocumentoEmissao[];
  tarefas?: RegistroTarefaEmissao[];
  maxAxisValue?: number;
};

export function DocumentosETarefas({
  // Título padrão alinhado à visão anual de documentos válidos e tarefas concluídas
  title = "Documentos válidos e tarefas concluídas durante o ano",
  items,
  documentos,
  tarefas,
  maxAxisValue = 50,
}: DocumentosETarefasProps) {
  // Calcula os valores mensais (Jan a Dez) a partir dos mocks
  const dadosCalculados = calcularDocumentosETarefasAnuais(
    documentos,
    tarefas,
    maxAxisValue,
  );

  const itensExibidos =
    items && items.length > 0 ? items : dadosCalculados.itens;
  const escalaMaxima = dadosCalculados.maxEscala;

  // Valores do eixo vertical do topo (50) até a base (0)
  const passosEixoY = [50, 40, 30, 20, 10, 0].map((valor) =>
    Math.round((valor / 50) * escalaMaxima),
  );

  // Quantidade de intervalos entre as linhas (6 marcas = 5 intervalos)
  const totalIntervalos = passosEixoY.length - 1;

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      {/* Cabeçalho com o título anual e a legenda de cores */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

        <div className="flex flex-col shrink-0 items-start gap-1.5 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-900" />
            Documentos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-300" />
            Tarefas
          </span>
        </div>
      </div>

      {/* Área principal do gráfico*/}
      <div className="flex min-h-60 flex-1 gap-3">
        {/* Coluna do eixo Y */}
        <div className="flex h-full flex-col pb-[26px] text-right text-xs font-medium text-slate-500">
          <div className="relative flex h-full flex-col justify-between">
            {passosEixoY.map((tick, idx) => {
              const isPrimeiro = idx === 0;
              const isUltimo = idx === passosEixoY.length - 1;

              // Cada número fica encaixado na altura exata da sua linha horizontal:
              // - Primeiro (50): alinha pelo topo
              // - Intermediários (40..10): centraliza exatamente na linha
              // - Último (0): alinha pela base encostada na linha inferior
              const alinhamentoClasse = isPrimeiro
                ? "items-start"
                : isUltimo
                  ? "items-end"
                  : "items-center";

              return (
                <div
                  key={idx}
                  className={`flex h-0 items-center justify-end ${alinhamentoClasse}`}
                >
                  <span className="leading-none tabular-nums">{tick}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade, colunas duplas e eixo X anual de Jan a Dez */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="relative h-full min-h-52 px-1">
            {/* Linhas horizontais de referência distribuídas nos mesmos intervalos */}
            <div
              className="pointer-events-none absolute inset-0 flex flex-col justify-between"
              aria-hidden="true"
            >
              {Array.from({ length: totalIntervalos + 1 }).map((_, idx) => {
                const isBase = idx === totalIntervalos;
                return (
                  <div
                    key={idx}
                    className={
                      isBase
                        ? "h-0 w-full border-b border-slate-300"
                        : "h-0 w-full border-b border-dashed border-slate-200"
                    }
                  />
                );
              })}
            </div>

            {/* Colunas duplas por mês: azul escuro = Documentos válidos, azul claro = Tarefas concluídas */}
            <div className="relative z-10 grid h-full grid-cols-12 items-end gap-1 sm:gap-1.5">
              {itensExibidos.map((item) => {
                // Altura mínima visível quando houver valor maior que zero
                const alturaDocPct =
                  item.documentosCount > 0
                    ? Math.max(6, Math.min(item.documentosPercentage, 100))
                    : 0;

                const alturaTarPct =
                  item.tarefasCount > 0
                    ? Math.max(6, Math.min(item.tarefasPercentage, 100))
                    : 0;

                return (
                  <div
                    key={item.id}
                    className="flex h-full w-full items-end justify-center gap-0.5"
                  >
                    {/* Barra azul escura: Documentos válidos no mês */}
                    <div
                      style={{ height: `${alturaDocPct}%` }}
                      className="w-full max-w-3 rounded-t-[3px] bg-blue-900 transition-all"
                      title={`${item.label} - Documentos válidos: ${item.documentosCount}`}
                    />
                    {/* Barra azul clara: Tarefas concluídas no mês */}
                    <div
                      style={{ height: `${alturaTarPct}%` }}
                      className="w-full max-w-3 rounded-t-[3px] bg-sky-300 transition-all"
                      title={`${item.label} - Tarefas concluídas: ${item.tarefasCount}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Faixa de rótulos mensais (altura fixa de 16px + 10px de margem = 26px, igual ao pb-[26px] do eixo Y) */}
          <div className="mt-2.5 grid h-4 grid-cols-12 items-center gap-1 px-1 text-center sm:gap-1.5">
            {itensExibidos.map((item) => (
              <span
                key={item.id}
                className="truncate text-[10px] font-medium leading-none text-slate-600 sm:text-[11px]"
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
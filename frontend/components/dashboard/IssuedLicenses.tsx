"use client";

import {
  calcularLicencasEmitidas,
  type ItemLicencaEmitida,
} from "@/lib/licencasEmi";

type IssuedLicensesProps = {
  title?: string;
  items?: ItemLicencaEmitida[];
  maxAxisValue?: number;
};

export function IssuedLicenses({
  title = "Licenças Emitidas",
  items,
  maxAxisValue = 50,
}: IssuedLicensesProps) {
  // Obtém os dados calculados a partir dos documentos
  const dadosCalculados = calcularLicencasEmitidas(undefined, maxAxisValue);
  const itensExibidos =
    items && items.length > 0 ? items : dadosCalculados.itens;
  const escalaMaxima = dadosCalculados.maxEscala;

  // Gera os marcadores do eixo vertical (50 até 0)
  const passosEixoY = [50, 40, 30, 20, 10, 0].map((valor) =>
    Math.round((valor / 50) * escalaMaxima),
  );

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="flex flex-1 gap-3">
        {/* Escala numérica no eixo vertical */}
        <div className="flex h-44 flex-col justify-between text-right text-xs font-medium text-slate-500">
          {passosEixoY.map((tick, idx) => (
            <span key={idx} className="leading-none">
              {tick}
            </span>
          ))}
        </div>

        {/* Colunas do gráfico de barras, linhas pontilhadas e rótulos dos meses */}
        <div className="flex flex-1 flex-col">
          <div className="relative h-44 px-1">
            {/* Linhas pontilhadas horizontais alinhadas com o eixo Y */}
            <div
              className="pointer-events-none absolute inset-0 flex flex-col justify-between"
              aria-hidden="true"
            >
              {passosEixoY.map((_, idx) => (
                <div
                  key={idx}
                  className={
                    idx === passosEixoY.length - 1
                      ? "w-full border-b border-slate-200"
                      : "w-full border-b border-dashed border-slate-200"
                  }
                />
              ))}
            </div>

            {/* Barras verticais sobrepostas às linhas de grade */}
            <div className="relative z-10 grid h-full grid-cols-10 items-end gap-1.5 sm:gap-2">
              {itensExibidos.map((item) => {
                const alturaPct =
                  item.count > 0
                    ? Math.max(6, Math.min(item.percentage, 100))
                    : 0;

                return (
                  <div
                    key={item.id}
                    className="flex h-full w-full items-end justify-center"
                  >
                    <div
                      style={{ height: `${alturaPct}%` }}
                      className="w-full max-w-6 rounded-t-[3px] bg-blue-600 transition-all"
                      title={`${item.label}: ${item.count} licenças emitidas`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-10 gap-1.5 px-1 text-center sm:gap-2">
            {itensExibidos.map((item) => (
              <span
                key={item.id}
                className="truncate text-[11px] font-medium text-slate-600"
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
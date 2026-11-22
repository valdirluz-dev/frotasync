"use client";

import {calcularStatusLicencas,type ItemStatusLicenca,} from "@/lib/licencas";

type LicenceStatusProps = {
  // Título exibido no topo do card
  title?: string;
  // Lista opcional de itens já prontos passada por prop
  items?: ItemStatusLicenca[];
};

export function LicenceStatus({
  title = "Status das Licenças",
  items,
}: LicenceStatusProps) {
  // Busca e calcula direto do lib/licencas.tsx (que já puxa do mockDocumentos por padrão)
  const statusItems =
    items && items.length > 0 ? items : calcularStatusLicencas();

  //Medidas do gráfico de rosca
  const TAMANHO_ROSCA = 140;
  const RAIO_ROSCA = 50;
  const ESPESSURA_TRACO = 12;

  const centro = TAMANHO_ROSCA / 2;
  const circunferencia = 2 * Math.PI * RAIO_ROSCA;

  return (

    // Tamanho da borda ou espaçamento geral do card 
   
    <div className="w-full rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>

      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {statusItems.map((item) => {
          const pctLimitada = Math.max(0, Math.min(item.percentage, 100));
          const dashOffset =
            circunferencia - (pctLimitada / 100) * circunferencia;

          return (
            <div
              key={item.id}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="relative flex items-center justify-center">
                <svg
                  viewBox={`0 0 ${TAMANHO_ROSCA} ${TAMANHO_ROSCA}`}
                  className="h-32 w-32 -rotate-90 sm:h-36 sm:w-36"
                  role="img"
                  aria-label={`${item.label}: ${pctLimitada}%`}
                >
                  {/* Trilha cinza de fundo (100%) */}
                  <circle
                    cx={centro}
                    cy={centro}
                    r={RAIO_ROSCA}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={ESPESSURA_TRACO}
                  />

                  {/* Arco colorido correspondente à percentagem */}
                  <circle
                    cx={centro}
                    cy={centro}
                    r={RAIO_ROSCA}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={ESPESSURA_TRACO}
                    strokeLinecap="round"
                    strokeDasharray={circunferencia}
                    strokeDashoffset={dashOffset}
                  />
                </svg>

                {/* Percentagem centralizada dentro do anel */}
                <span className="absolute text-xl font-bold text-slate-800 sm:text-2xl">
                  {pctLimitada}%
                </span>
              </div>

              {/* Nome do status abaixo da rosca */}
              <p className="mt-3 text-sm font-medium text-slate-600">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
import type { DashboardDistribution } from "@/types/dashboard";

type StatusDonutCardProps = {
  title: string;
  data: DashboardDistribution[];
  muted?: boolean;
};

export function StatusDonutCard({
  title,
  data,
  muted = false,
}: StatusDonutCardProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 68;
  const circumference = 2 * Math.PI * radius;

  return (
    <section
      className={`flex min-h-[390px] flex-col items-center rounded-[30px] px-5 py-6 text-white shadow-[0_5px_8px_rgba(15,23,42,0.20)] sm:min-h-[430px] lg:min-h-[510px] ${muted ? "bg-[#A5A0F0]" : "bg-[#4F46E5]"}`}
      aria-label={`Indicadores de ${title}`}>
      <h2 className="text-center text-2xl font-bold tracking-tight drop-shadow-sm sm:text-[30px]">
        {title}
      </h2>
      <div className="relative mt-4 flex h-[180px] w-[180px] shrink-0 items-center justify-center sm:mt-5 sm:h-[200px] sm:w-[200px]">
        <svg
          viewBox="0 0 180 180"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label={`${total} ${title.toLocaleLowerCase("pt-BR")} no total`}>
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="15"
          />
          {data.map((item, index) => {
            const priorValue = data
              .slice(0, index)
              .reduce((sum, segment) => sum + segment.value, 0);
            const dashLength =
              total === 0 ? 0 : (item.value / total) * circumference;
            const dashOffset =
              total === 0 ? 0 : -(priorValue / total) * circumference;
            return total > 0 ? (
              <circle
                key={item.label}
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="15"
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                opacity={muted ? 0.48 : 1}
              />
            ) : null;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[27px] font-bold leading-none">{total}</span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white/80">
            Total
          </span>
        </div>
      </div>
      <ul
        className="mt-5 w-full max-w-[235px] space-y-2.5 sm:mt-6"
        aria-label={`Legenda de ${title}`}>
        {data.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-2.5 text-[15px] font-medium sm:text-base">
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color, opacity: muted ? 0.55 : 1 }}
            />
            <span className="min-w-0 flex-1 leading-tight">{item.label}</span>
            <span className="tabular-nums">{item.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

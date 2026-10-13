type StatTrendProps = {
  label: string;
  value?: number;
  variation?: number | null;
  inverse?: boolean;
};

export function StatTrend({
  label,
  value,
  variation,
  inverse = false,
}: StatTrendProps) {
  const hasVariation = typeof variation === "number";
  const isUp = (variation ?? 0) > 0;
  const isDown = (variation ?? 0) < 0;
  const isBad = inverse ? isUp : isDown;
  const color = !hasVariation
    ? "text-slate-400"
    : isBad
      ? "text-red-600"
      : isUp || isDown
        ? "text-emerald-600"
        : "text-slate-400";
  const arrow = !hasVariation || variation === 0 ? "—" : isUp ? "↑" : "↓";

  return (
    <div>
      <p className="text-xs font-bold text-slate-900">
        {label}: {value ?? "—"}
      </p>
      <p className={`mt-0.5 text-[9px] font-medium ${color}`}>
        {arrow}
        {hasVariation ? ` ${Math.abs(variation)}%` : ""} em relação ao mês
        anterior
      </p>
    </div>
  );
}

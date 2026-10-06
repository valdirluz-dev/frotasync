import { Button } from "@/components/ui/Button";
import type { Unidade } from "@/types/dashboard";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(value?: string) {
  if (!value) return "—";
  return dateFormatter.format(new Date(value));
}

export function UnidadeInfoCard({ unidade }: { unidade: Unidade }) {
  return (
    <section className="flex min-h-[320px] flex-col rounded-[30px] bg-[#4F46E5] p-6 text-white shadow-[0_5px_8px_rgba(15,23,42,0.20)] sm:min-h-[390px] sm:p-7">
      <h2 className="text-center text-2xl font-bold tracking-tight drop-shadow-sm sm:text-[27px]">
        Informações da unidade
      </h2>
      <dl className="mt-7 space-y-4 text-sm font-semibold sm:text-base">
        <div className="flex flex-wrap gap-x-2">
          <dt>Status:</dt>
          <dd>{unidade.status.toLocaleLowerCase("pt-BR")}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt>Data de criação:</dt>
          <dd>{formatDate(unidade.criadoEm)}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt>Última modificação:</dt>
          <dd>{formatDate(unidade.atualizadoEm)}</dd>
        </div>
      </dl>
      <div className="mt-auto pt-6">
        <Button
          type="button"
          variant="outline"
          disabled
          title="Em breve"
          className="w-full border-white/80 bg-transparent text-white shadow-none hover:bg-white/10 disabled:opacity-70">
          Mais detalhes
        </Button>
      </div>
    </section>
  );
}

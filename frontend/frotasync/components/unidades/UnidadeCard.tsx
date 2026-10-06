import Link from "next/link";

import { UnidadeStatusPill } from "@/components/unidades/UnidadeStatusPill";
import type { UnidadeListItem } from "@/types/dashboard";

export function UnidadeCard({ unidade }: { unidade: UnidadeListItem }) {
  const activeBorder =
    unidade.status === "Ativa" ? "border-green-500" : "border-red-500";

  return (
    <Link
      href={`/unidades/${unidade.id}`}
      aria-label={`Abrir Unidade ${unidade.nome}, ID ${unidade.codigo}`}
      className={`group flex min-h-[250px] flex-col rounded-xl border-4 ${activeBorder} bg-[#4F46E5] p-4 text-white shadow-[0_3px_7px_rgba(15,23,42,0.22)] transition duration-150 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 focus-visible:ring-offset-2`}>
      <div className="min-w-0 text-center">
        <h2 className="line-clamp-2 text-[18px] font-bold leading-tight sm:text-xl">
          Unidade {unidade.nome} (ID {unidade.codigo})
        </h2>
        <p className="mt-2 line-clamp-2 min-h-9 text-xs font-semibold leading-snug text-white/95">
          {unidade.endereco.logradouro}, {unidade.endereco.numero} -{" "}
          {unidade.endereco.cidade}/{unidade.endereco.uf}
        </p>
      </div>

      <div className="mt-3 space-y-1 text-left text-xs font-bold">
        <p>Documentos: {unidade.totalDocumentos}</p>
        <p>Tarefas: {unidade.totalTarefas}</p>
      </div>

      <div className="mt-auto pt-4">
        <UnidadeStatusPill status={unidade.status} />
      </div>
    </Link>
  );
}

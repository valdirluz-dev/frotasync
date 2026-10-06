import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/dashboard/AppShell";
import { mockUnidades } from "@/mocks/dashboard";

export default async function UnidadeDetailPlaceholder({
  params,
}: PageProps<"/unidades/[id]">) {
  const { id } = await params;
  const unidade = mockUnidades.find((item) => item.id === id);

  if (!unidade) notFound();

  return (
    <AppShell activeTab="unidades">
      <section className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">
          Detalhamento da unidade em construção
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Unidade {unidade.nome} (ID {unidade.codigo})
        </p>
        <Link
          href="/unidades"
          className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
          Voltar para unidades
        </Link>
      </section>
    </AppShell>
  );
}

"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import type { Unidade, UnidadeIndicadores } from "@/types/domain";

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

function total(values: UnidadeIndicadores["documentos"] | UnidadeIndicadores["tarefas"]) {
  return values.reduce((sum, item) => sum + item.value, 0);
}

function valueFor(
  values: UnidadeIndicadores["documentos"] | UnidadeIndicadores["tarefas"],
  label: string,
) {
  return values.find((item) => item.label === label)?.value ?? 0;
}

export function UnidadeInfoCard({
  unidade,
  indicadores,
  indicadoresLoading = false,
}: {
  unidade: Unidade;
  indicadores?: UnidadeIndicadores;
  indicadoresLoading?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const unavailable = indicadoresLoading
    ? "Carregando..."
    : indicadores
      ? "0"
      : "Indisponível";
  const documentCount = indicadores
    ? String(total(indicadores.documentos))
    : unavailable;
  const taskCount = indicadores
    ? String(total(indicadores.tarefas))
    : unavailable;
  const pendingCount = indicadores
    ? String(
        valueFor(indicadores.documentos, "Próximo do vencimento") +
          valueFor(indicadores.documentos, "Expirado") +
          valueFor(indicadores.tarefas, "Pendente") +
          valueFor(indicadores.tarefas, "Em andamento"),
      )
    : unavailable;

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
      {expanded ? (
        <div className="mt-5 space-y-4 border-t border-white/30 pt-4 text-sm">
          <section aria-label="Dados cadastrais">
            <h3 className="font-bold">Dados cadastrais</h3>
            <dl className="mt-2 grid gap-x-3 gap-y-1 sm:grid-cols-2">
              <div>
                <dt className="inline font-semibold">Código: </dt>
                <dd className="inline">{unidade.codigo}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">CEP: </dt>
                <dd className="inline">{unidade.endereco.cep || "—"}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Logradouro: </dt>
                <dd className="inline">
                  {unidade.endereco.logradouro}, {unidade.endereco.numero}
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold">Complemento: </dt>
                <dd className="inline">
                  {unidade.endereco.complemento || "—"}
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold">Bairro: </dt>
                <dd className="inline">{unidade.endereco.bairro}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Cidade/UF: </dt>
                <dd className="inline">
                  {unidade.endereco.cidade}/{unidade.endereco.uf}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="inline font-semibold">Descrição: </dt>
                <dd className="inline">{unidade.descricao || "—"}</dd>
              </div>
            </dl>
          </section>
          <section aria-label="Resumo de documentos e tarefas">
            <h3 className="font-bold">Resumo</h3>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white/10 p-2">
                <dt className="text-xs font-semibold">Documentos</dt>
                <dd className="mt-1 text-lg font-bold">{documentCount}</dd>
              </div>
              <div className="rounded-lg bg-white/10 p-2">
                <dt className="text-xs font-semibold">Tarefas</dt>
                <dd className="mt-1 text-lg font-bold">{taskCount}</dd>
              </div>
              <div className="rounded-lg bg-white/10 p-2">
                <dt className="text-xs font-semibold">Pendências</dt>
                <dd className="mt-1 text-lg font-bold">{pendingCount}</dd>
              </div>
            </dl>
          </section>
        </div>
      ) : null}
      <div className="mt-auto pt-6">
        <Button
          type="button"
          variant="outline"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          className="w-full border-white bg-white font-bold text-indigo-700 shadow-none hover:bg-indigo-50">
          {expanded ? "Menos detalhes" : "Mais detalhes"}
        </Button>
      </div>
    </section>
  );
}

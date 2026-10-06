"use client";

import type { ReactNode } from "react";

import { AppShell } from "@/components/dashboard/AppShell";
import { Icon } from "@/components/dashboard/Icons";
import { Button } from "@/components/ui";

export function EditPageShell({
  activeTab,
  breadcrumb,
  title,
  backLabel,
  onBack,
  children,
}: {
  activeTab: "documentos" | "tarefas" | "unidades";
  breadcrumb: ReactNode;
  title: string;
  backLabel: string;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <AppShell activeTab={activeTab} breadcrumb={{ custom: breadcrumb }}>
      <section className="mx-auto max-w-[1280px]">
        <Button type="button" variant="primary" leadingIcon={<Icon name="left" className="h-4 w-4" />} onClick={onBack} className="rounded-lg px-3.5 py-2 text-xs">
          {backLabel}
        </Button>
        <h1 className="mb-7 mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">{title}</h1>
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7 lg:p-9">{children}</div>
      </section>
    </AppShell>
  );
}

export function EditLoading() {
  return <div className="grid grid-cols-1 gap-7 lg:grid-cols-2" role="status" aria-label="Carregando formulário de edição">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-2xl bg-slate-200" />)}</div>;
}

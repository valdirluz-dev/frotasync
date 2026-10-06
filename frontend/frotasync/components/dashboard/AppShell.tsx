"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Icon } from "@/components/dashboard/Icons";

export function AppShell({
  activeTab,
  breadcrumb = "section",
  children,
}: {
  activeTab: "documentos" | "tarefas" | "unidades";
  breadcrumb?: "section" | "newUnit";
  children: ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isUnitsSection = activeTab === "unidades";

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-[Inter,ui-sans-serif,system-ui,sans-serif] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[300px] border-r border-slate-200 bg-white px-6 pt-5 lg:block">
        <Brand />
        <nav aria-label="Menu principal" className="mt-10 space-y-2">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${isUnitsSection ? "text-slate-600 hover:bg-slate-50" : "bg-indigo-50 font-semibold text-indigo-700"}`}>
            <Icon name="dashboard" />
            Dashboard
          </Link>
          <Link
            href="/unidades"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${isUnitsSection ? "bg-indigo-50 font-semibold text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}>
            <Icon name="units" />
            Unidades
          </Link>
          <a
            href="#"
            onClick={(event) => event.preventDefault()}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50">
            <Icon name="settings" />
            Configurações
          </a>
        </nav>
      </aside>

      {mobileMenuOpen ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="h-full w-[min(300px,85vw)] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fechar menu"
                className="p-2 text-slate-500">
                ×
              </button>
            </div>
            <nav aria-label="Menu principal" className="mt-10 space-y-2">
              <Link
                onClick={() => setMobileMenuOpen(false)}
                href="/dashboard"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${isUnitsSection ? "text-slate-600" : "bg-indigo-50 font-semibold text-indigo-700"}`}>
                <Icon name="dashboard" />
                Dashboard
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                href="/unidades"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${isUnitsSection ? "bg-indigo-50 font-semibold text-indigo-700" : "text-slate-600"}`}>
                <Icon name="units" />
                Unidades
              </Link>
              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600">
                <Icon name="settings" />
                Configurações
              </a>
            </nav>
          </aside>
        </div>
      ) : null}

      <div className="min-h-screen lg:ml-[300px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7 xl:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
              <Icon name="menu" />
            </button>
            {isUnitsSection ? (
              breadcrumb === "newUnit" ? (
                <div className="hidden items-center gap-2 text-xs sm:flex">
                  <Link
                    href="/unidades"
                    className="text-slate-500 hover:text-indigo-700">
                    Unidades
                  </Link>
                  <span className="text-slate-300">/</span>
                  <span className="font-semibold text-slate-800">
                    Cadastrar Unidade
                  </span>
                </div>
              ) : (
                <span className="hidden text-xs font-semibold text-slate-800 sm:block">
                  Unidades
                </span>
              )
            ) : (
              <div className="hidden items-center gap-2 text-xs sm:flex">
                <span className="text-slate-500">Dashboard Global</span>
                <span className="text-slate-300">/</span>
                <span className="font-semibold capitalize text-slate-800">
                  {activeTab}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <label className="hidden h-10 w-[220px] items-center gap-2 rounded-xl border border-slate-200 bg-[#F8F9FC] px-3 text-slate-400 md:flex xl:w-[270px]">
              <Icon name="search" className="h-4 w-4" />
              <input
                aria-label="Buscar no sistema"
                placeholder="Buscar no sistema..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
            </label>
            <button
              type="button"
              aria-label="Notificações"
              className="relative text-slate-500">
              <Icon name="bell" className="h-[18px] w-[18px]" />
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <button type="button" aria-label="Ajuda" className="text-slate-500">
              <Icon name="help" className="h-[18px] w-[18px]" />
            </button>
            <span className="hidden h-8 border-l border-slate-200 sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
                JS
              </div>
              <div className="hidden leading-tight sm:block">
                <div className="text-xs font-semibold text-slate-800">
                  Murilo Pussa
                </div>
                <div className="mt-0.5 text-[10px] text-slate-400">
                  Administrador
                </div>
              </div>
              <Icon
                name="chevron"
                className="hidden h-4 w-4 text-slate-400 sm:block"
              />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1680px] px-4 pb-10 pt-7 sm:px-7 lg:px-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
        <Icon name="truck" className="h-6 w-6" />
      </div>
      <div>
        <div className="text-[15px] font-bold tracking-tight text-slate-900">
          FrotaSync
        </div>
        <div className="text-[8px] font-semibold tracking-[0.14em] text-slate-400">
          GESTÃO INTELIGENTE
        </div>
      </div>
    </div>
  );
}

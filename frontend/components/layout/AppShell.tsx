"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { obterPerfilConsolidado } from "@/mocks/profile";
import { mockNotificacoes } from "@/mocks/notificacoes";
import {
  getAppPreferencesSnapshot,
  getServerPreferencesSnapshot,
  parseAppPreferences,
  subscribeToPreferences,
} from "@/lib/preferences";

import { Icon } from "@/components/ui/Icons";

export function AppShell({
  activeTab,
  breadcrumb = "section",
  children,
}: {
  activeTab: "dashboard" | "documentos" | "tarefas" | "unidades" | "configuracoes";
  breadcrumb?:
    | "section"
    | "newUnit"
    | { unitName: string; unitCode: string; tab: "documentos" | "tarefas" }
    | { custom: ReactNode };
  children: ReactNode;
}) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const preferenceSnapshot = useSyncExternalStore(
    subscribeToPreferences,
    getAppPreferencesSnapshot,
    getServerPreferencesSnapshot,
  );
  const preferences = parseAppPreferences(preferenceSnapshot);
  const visibleNotifications = mockNotificacoes.filter(
    (notification) => preferences.notifications[notification.categoria],
  );
  const unreadNotifications = visibleNotifications.filter(
    (notification) => !notification.lida,
  ).length;

  // ESTADO DO PERFIL: Atualizado para consumir o perfil consolidado do profile.ts
  const [userProfile] = useState(() => {
    const profile = obterPerfilConsolidado();
    const nome = profile.nome || "Maria Luiza da Silva";
    return {
      nome,
      cargo: profile.cargo || "Administradora de Frotas",
      inicial: nome.substring(0, 2).toUpperCase(),
    };
  });

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
  }, [preferences.theme]);

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("A solicitação de logout falhou.");
      }

      router.replace("/login");
    } catch {
      setLogoutError("Não foi possível sair da conta. Tente novamente.");
      setLoggingOut(false);
    }
  }
  
  // Variáveis isoladas e estritas para controlar exatamente qual aba está ativa
  const isDashboardSection = activeTab === "dashboard";
  const isUnitsSection = activeTab === "unidades";
  const isDocumentsSection = activeTab === "documentos";
  const isTasksSection = activeTab === "tarefas";
  const isConfigSection = activeTab === "configuracoes";

  return (
    <div className="min-h-screen bg-surface font-[Inter,ui-sans-serif,system-ui,sans-serif] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[300px] border-r border-slate-200 bg-white px-6 pt-5 lg:block">
        <Brand />
        <nav aria-label="Menu principal" className="mt-10 space-y-2">
          
          {/* Botão do Dashboard */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
              isDashboardSection
                ? "bg-indigo-50 font-semibold text-indigo-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}>
            <Icon name="dashboard" />
            Dashboard
          </Link>

          {/* Botão Unidades */}
          <Link
            href="/unidades"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
              isUnitsSection
                ? "bg-indigo-50 font-semibold text-indigo-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}>
            <Icon name="units" />
            Unidades
          </Link>
        
          {/* Botão Documentos */}
          <Link
            href="/documentos"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
              isDocumentsSection
                ? "bg-indigo-50 font-semibold text-indigo-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}>
            <Icon name="document" />
            Documentos
          </Link>

          {/* Botão Tarefas */}
          <Link
            href="/tarefas"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
              isTasksSection
                ? "bg-indigo-50 font-semibold text-indigo-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}>
            <Icon name="tasks" />
            Tarefas
          </Link>

          {/* Botão Configurações */}
          <Link
            href="/configuracoes"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
              isConfigSection
                ? "bg-indigo-50 font-semibold text-indigo-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}>
            <Icon name="settings" />
            Configurações
          </Link>
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
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                  isDashboardSection
                    ? "bg-indigo-50 font-semibold text-indigo-700"
                    : "text-slate-600"
                }`}>
                <Icon name="dashboard" />
                Dashboard
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                href="/unidades"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                  isUnitsSection
                    ? "bg-indigo-50 font-semibold text-indigo-700"
                    : "text-slate-600"
                }`}>
                <Icon name="units" />
                Unidades
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                href="/documentos"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                  isDocumentsSection
                    ? "bg-indigo-50 font-semibold text-indigo-700"
                    : "text-slate-600"
                }`}>
                <Icon name="document" />
                Documentos
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                href="/tarefas"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                  isTasksSection
                    ? "bg-indigo-50 font-semibold text-indigo-700"
                    : "text-slate-600"
                }`}>
                <Icon name="tasks" />
                Tarefas
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                href="/configuracoes"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                  isConfigSection
                    ? "bg-indigo-50 font-semibold text-indigo-700"
                    : "text-slate-600"
                }`}>
                <Icon name="settings" />
                Configurações
              </Link>
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
            {typeof breadcrumb === "object" && "custom" in breadcrumb ? (
              breadcrumb.custom
            ) : isUnitsSection ? (
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
              ) : typeof breadcrumb === "object" ? (
                <div className="hidden min-w-0 items-center gap-2 text-xs sm:flex">
                  <Link
                    href="/unidades"
                    className="shrink-0 text-slate-500 hover:text-indigo-700">
                    Unidades
                  </Link>
                  <span className="text-slate-300">/</span>
                  <span className="max-w-[220px] truncate text-slate-500">
                    {breadcrumb.unitName} (ID {breadcrumb.unitCode})
                  </span>
                  <span className="text-slate-300">/</span>
                  <span className="font-semibold capitalize text-slate-800">
                    {breadcrumb.tab}
                  </span>
                </div>
              ) : (
                <span className="hidden text-xs font-semibold text-slate-800 sm:block">
                  Unidades
                </span>
              )
            ) : (
              <div className="hidden items-center gap-2 text-xs sm:flex">
                <span className="font-semibold capitalize text-slate-800">
                  {isDashboardSection
                    ? "Dashboard Global"
                    : isDocumentsSection
                      ? "Documentos"
                      : isTasksSection
                        ? "Tarefas"
                        : "Configurações"}
                </span>
              </div>
            )}
          </div>
          <div className="relative flex items-center gap-3 sm:gap-5">
            <label className="hidden h-10 w-[220px] items-center gap-2 rounded-xl border border-slate-200 bg-surface px-3 text-slate-400 md:flex xl:w-[270px]">
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
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
              className="group relative text-slate-500"
            >
              <Icon name="bell" className="h-[18px] w-[18px] group-hover:animate-wiggle" />
              {unreadNotifications > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white ring-2 ring-white">
                  {unreadNotifications}
                </span>
              ) : null}
            </button>

            {notificationsOpen ? (
              <section
                aria-label="Central de notificações"
                className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Notificações
                  </h2>
                  <Link
                    href="/configuracoes"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Preferências
                  </Link>
                </div>
                {visibleNotifications.length ? (
                  <ul className="max-h-[min(60vh,420px)] overflow-y-auto">
                    {visibleNotifications.map((notification) => (
                      <li key={notification.id} className="border-b border-slate-100 last:border-0">
                        {notification.destino ? (
                          <Link
                            href={notification.destino}
                            onClick={() => setNotificationsOpen(false)}
                            className="block px-4 py-3 transition hover:bg-slate-50"
                          >
                            <NotificationText notification={notification} />
                          </Link>
                        ) : (
                          <div className="px-4 py-3">
                            <NotificationText notification={notification} />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-6 text-center text-sm text-slate-500">
                    Nenhuma notificação habilitada.
                  </p>
                )}
              </section>
            ) : null}

            

            <button type="button" aria-label="Ajuda" className="text-slate-500">
              <Icon name="help" className="h-[18px] w-[18px]" />
            </button>
            <span className="hidden h-8 border-l border-slate-200 sm:block" />
            
            {/* Bloco do perfil dinâmico que puxa os dados do localStorage */}
            <div className="relative">
              <button
                type="button"
                aria-label="Menu da conta"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                onClick={() => {
                  setProfileMenuOpen((open) => !open);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg p-1 text-left transition hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white">
                  {userProfile.inicial}
                </div>
                <div className="hidden leading-tight sm:block">
                  <div className="text-xs font-semibold text-slate-800">
                    {userProfile.nome}
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-400">
                    {userProfile.cargo}
                  </div>
                </div>
                <Icon
                  name="chevron"
                  className="hidden h-4 w-4 text-slate-400 sm:block"
                />
              </button>
              {profileMenuOpen ? (
                <div
                  role="menu"
                  aria-label="Opções da conta"
                  className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                >
                  <Link
                    role="menuitem"
                    href="/perfil"
                    onClick={() => setProfileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Meu perfil
                  </Link>
                  <Link
                    role="menuitem"
                    href="/configuracoes"
                    onClick={() => setProfileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Configurações
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    role="menuitem"
                    type="button"
                    disabled={loggingOut}
                    onClick={handleLogout}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                  >
                    {loggingOut ? "Saindo..." : "Sair da conta"}
                  </button>
                  {logoutError ? (
                    <p role="alert" className="px-3 pb-2 text-xs text-red-600">
                      {logoutError}
                    </p>
                  ) : null}
                </div>
              ) : null}
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

function NotificationText({
  notification,
}: {
  notification: (typeof mockNotificacoes)[number];
}) {
  return (
    <>
      <p className="text-sm font-semibold text-slate-800">
        {notification.titulo}
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        {notification.descricao}
      </p>
      <p className="mt-2 text-[10px] text-slate-400">
        {new Date(notification.criadaEm).toLocaleString("pt-BR")}
      </p>
    </>
  );
}
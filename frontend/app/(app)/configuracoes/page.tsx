"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/ui/Icons";
import { obterPerfilConsolidado } from "@/mocks/profile";
import {
  getAppPreferencesSnapshot,
  getServerPreferencesSnapshot,
  parseAppPreferences,
  saveAppPreferences,
  subscribeToPreferences,
  type NotificationPreferences,
} from "@/lib/preferences";

const notificationOptions: {
  key: keyof NotificationPreferences;
  title: string;
  description: string;
}[] = [
  {
    key: "documento_proximo_vencimento",
    title: "Documentos próximos do vencimento",
    description: "Avisos para documentos que precisam de renovação.",
  },
  {
    key: "documento_vencido",
    title: "Documentos vencidos",
    description: "Avisos sobre documentos fora do prazo de validade.",
  },
  {
    key: "tarefa_pendente",
    title: "Tarefas pendentes",
    description: "Avisos sobre tarefas que ainda precisam ser concluídas.",
  },
  {
    key: "prazo_tarefa_proximo",
    title: "Prazos de tarefas próximos",
    description: "Avisos para tarefas com prazo se aproximando.",
  },
];

export default function Page() {
  const preferenceSnapshot = useSyncExternalStore(
    subscribeToPreferences,
    getAppPreferencesSnapshot,
    getServerPreferencesSnapshot,
  );
  const preferences = parseAppPreferences(preferenceSnapshot);
  const profile = obterPerfilConsolidado();

  function setTheme(theme: "light" | "dark") {
    saveAppPreferences({ ...preferences, theme });
  }

  function setNotificationPreference(
    key: keyof NotificationPreferences,
    enabled: boolean,
  ) {
    saveAppPreferences({
      ...preferences,
      notifications: { ...preferences.notifications, [key]: enabled },
    });
  }

  return (
    <AppShell activeTab="configuracoes">
      <div className="space-y-7">
        <div>
          <p className="text-sm font-medium text-indigo-600">Preferências</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Configurações
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Gerencie a aparência do sistema, seus alertas e informações da conta.
          </p>
        </div>

        <section
          aria-labelledby="appearance-heading"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-700">
              <Icon name="settings" className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="appearance-heading" className="font-semibold text-slate-900">
                Aparência
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Escolha o tema usado nas telas do FrotaSync. Sua preferência fica
                salva neste navegador.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {(["light", "dark"] as const).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    aria-pressed={preferences.theme === theme}
                    onClick={() => setTheme(theme)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                      preferences.theme === theme
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {theme === "light" ? "Tema claro" : "Tema escuro"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="notifications-heading"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5">
            <h2 id="notifications-heading" className="font-semibold text-slate-900">
              Notificações
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Escolha quais alertas aparecem no menu de notificações.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {notificationOptions.map(({ key, title, description }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between gap-5 py-4 first:pt-0 last:pb-0"
              >
                <span>
                  <span className="block text-sm font-medium text-slate-800">
                    {title}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {description}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={preferences.notifications[key]}
                  onChange={(event) =>
                    setNotificationPreference(key, event.target.checked)
                  }
                  className="h-4 w-4 shrink-0 accent-indigo-600"
                />
              </label>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="account-heading"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 id="account-heading" className="font-semibold text-slate-900">
                Conta e empresa
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Dados cadastrais vinculados à sua conta.
              </p>
            </div>
            <Link
              href="/perfil"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Ver perfil
              <Icon name="chevron" className="h-4 w-4" />
            </Link>
          </div>
          <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <AccountDetail label="Usuário" value={profile.nome} />
            <AccountDetail label="E-mail" value={profile.email} />
            <AccountDetail label="Empresa" value={profile.nomeEmpresa} />
            <AccountDetail label="CNPJ" value={profile.cnpj} />
            <AccountDetail label="Cargo" value={profile.cargo} />
            <AccountDetail
              label="Localidade"
              value={`${profile.cidade} - ${profile.estado}`}
            />
          </dl>
        </section>

        <section
          aria-labelledby="security-heading"
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 id="security-heading" className="font-semibold text-slate-900">
              Segurança
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Para redefinir sua senha, acesse a recuperação de acesso.
            </p>
          </div>
          <Link
            href="/recuperar-senha/passo1-email"
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Recuperar senha
          </Link>
        </section>
      </div>
    </AppShell>
  );
}

function AccountDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-800">{value || "—"}</dd>
    </div>
  );
}

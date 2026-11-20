export type NotificationPreferences = Record<
  | "documento_proximo_vencimento"
  | "documento_vencido"
  | "tarefa_pendente"
  | "prazo_tarefa_proximo",
  boolean
>;

export type AppPreferences = {
  theme: "light" | "dark";
  notifications: NotificationPreferences;
};

const STORAGE_KEY = "frotasync.preferences";
const CHANGE_EVENT = "frotasync:preferences-change";

export const DEFAULT_PREFERENCES: AppPreferences = {
  theme: "light",
  notifications: {
    documento_proximo_vencimento: true,
    documento_vencido: true,
    tarefa_pendente: true,
    prazo_tarefa_proximo: true,
  },
};

export function parseAppPreferences(value: string | null): AppPreferences {
  if (!value) return DEFAULT_PREFERENCES;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return DEFAULT_PREFERENCES;

    const preferences = parsed as Partial<AppPreferences>;
    const notificationPreferences = preferences.notifications;

    return {
      theme: preferences.theme === "dark" ? "dark" : "light",
      notifications: {
        documento_proximo_vencimento:
          notificationPreferences?.documento_proximo_vencimento !== false,
        documento_vencido:
          notificationPreferences?.documento_vencido !== false,
        tarefa_pendente: notificationPreferences?.tarefa_pendente !== false,
        prazo_tarefa_proximo:
          notificationPreferences?.prazo_tarefa_proximo !== false,
      },
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function getAppPreferencesSnapshot(): string {
  if (typeof window === "undefined") return JSON.stringify(DEFAULT_PREFERENCES);
  return JSON.stringify(parseAppPreferences(window.localStorage.getItem(STORAGE_KEY)));
}

export function getServerPreferencesSnapshot(): string {
  return JSON.stringify(DEFAULT_PREFERENCES);
}

export function subscribeToPreferences(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function saveAppPreferences(preferences: AppPreferences): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

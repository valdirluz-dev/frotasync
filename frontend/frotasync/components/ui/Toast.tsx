"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error" | "info";
type ToastMessage = { id: number; message: string; kind: ToastKind };
type ToastContextValue = {
  showToast: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback(
    (message: string, kind: ToastKind = "success") => {
      setToast({ id: Date.now(), message, kind });
    },
    [],
  );

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4_000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const styles: Record<ToastKind, string> = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
    info: "border-indigo-200 bg-indigo-50 text-indigo-900",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <div className="fixed right-4 top-4 z-[120] w-[min(420px,calc(100vw-2rem))]">
          <div
            key={toast.id}
            role={toast.kind === "error" ? "alert" : "status"}
            aria-live={toast.kind === "error" ? "assertive" : "polite"}
            className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${styles[toast.kind]}`}>
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Fechar notificação"
              className="rounded p-0.5 text-current/70 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current">
              ×
            </button>
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast deve ser usado dentro de ToastProvider.");
  return context;
}

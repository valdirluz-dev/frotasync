"use client";

import { Icon } from "@/components/dashboard/Icons";

export function LoadingState({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="flex min-h-44 items-center justify-center gap-3 text-sm text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      {label}
    </div>
  );
}

export function ErrorState({
  label,
  onRetry,
}: {
  label: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex min-h-44 flex-col items-center justify-center gap-3 text-center text-sm text-slate-600">
      <p>{label}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
        Tentar novamente
      </button>
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-sm text-slate-500">
      <Icon name="search" className="h-6 w-6 text-slate-300" />
      {label}
    </div>
  );
}

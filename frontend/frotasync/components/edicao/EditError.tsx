"use client";

export function EditError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
      <p className="font-semibold text-red-900">Não foi possível carregar os dados para edição.</p>
      <button type="button" onClick={onRetry} className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">Tentar novamente</button>
    </div>
  );
}

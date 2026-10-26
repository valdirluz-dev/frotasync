// CRIAÇÃO DE VISUALIZAÇÃO DE DOCUMENTOS EM MODAL NA PROPRIA JANELA DO SISTEMA 

"use client";

import { useEffect } from "react";

import type { Documento } from "@/types/domain";

export function DocumentoViewerDialog({
  documento,
  onClose,
}: {
  documento: Documento | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!documento) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [documento, onClose]);

  if (!documento) return null;

  const url = documento.anexo?.url;
  const isImage = documento.anexo?.tipo?.startsWith("image/");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Visualizar ${documento.nome}`}
        className="flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3">
          <h2 className="truncate text-sm font-bold text-slate-900">
            {documento.nome}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar visualização"
            className="rounded p-1 text-xl leading-none text-slate-500 hover:text-slate-900">
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 bg-slate-100">
          {!url ? (
            <p className="p-8 text-center text-sm text-slate-500">
              Este documento não possui arquivo anexado.
            </p>
          ) : isImage ? (
            <img src={url} alt={documento.nome} className="mx-auto h-full object-contain" />
          ) : (
            <iframe src={url} title={documento.nome} className="h-full w-full" />
          )}
        </div>
      </div>
    </div>
  );
}
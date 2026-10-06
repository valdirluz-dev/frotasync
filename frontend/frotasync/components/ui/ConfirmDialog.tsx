"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  showCancel?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open,
  title,
  description,
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  isLoading = false,
  showCancel = true,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement;
    if (isLoading) dialogRef.current?.focus();
    else if (showCancel) cancelButtonRef.current?.focus();
    else dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!isLoading) onCancel();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (document.activeElement === dialogRef.current) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [isLoading, onCancel, open, showCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) onCancel();
      }}>
      <div
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <h2
          id="confirm-dialog-title"
          className="text-xl font-bold text-slate-900">
          {title}
        </h2>
        <div
          id="confirm-dialog-description"
          className="mt-3 text-sm leading-6 text-slate-600">
          {description}
        </div>
        <div className="mt-7 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          {showCancel ? (
            <Button
              ref={cancelButtonRef}
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onCancel}
              className="min-w-32 shadow-md">
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            isLoading={isLoading}
            onClick={() => void onConfirm()}
            className="min-w-40 border-indigo-200 text-indigo-700 shadow-md hover:bg-indigo-50 focus-visible:ring-indigo-500">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

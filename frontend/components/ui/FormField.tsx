import type { ReactNode } from "react";

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function FormField({
  id,
  label,
  required = false,
  error,
  action,
  children,
}: FormFieldProps) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex min-h-6 items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
          {label}
          {required ? <span className="ml-1 text-red-600">*</span> : null}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

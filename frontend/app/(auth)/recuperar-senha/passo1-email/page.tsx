"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Icon } from "@/components/ui/Icons";
import { PasswordRecoveryLayout, RecoveryNotice } from "@/components/auth/PasswordRecoveryLayout";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/password-recovery/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(result.message ?? "Não foi possível solicitar um código.");
        return;
      }

      const params = new URLSearchParams({ email: email.trim() });
      router.push(`/recuperar-senha/passo2-cod?${params.toString()}`);
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PasswordRecoveryLayout
      illustration="/img/email.png"
      illustrationAlt="Pessoa usando um computador para recuperar o acesso"
      step={1}
    >
      <p className="mb-7 text-center text-base font-semibold leading-6 text-slate-800">
        Digite seu e-mail cadastrado.
        <br />
        Enviaremos um código de verificação para você redefinir a sua senha.
      </p>
      <form onSubmit={handleSubmit} className="space-y-7">
        <label className="sr-only" htmlFor="recovery-email">
          E-mail cadastrado
        </label>
        <div className="relative">
          <Icon
            name="email"
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-700"
          />
          <input
            id="recovery-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Digite seu e-mail cadastrado"
            aria-invalid={Boolean(error)}
            className="h-12 w-full rounded-sm border border-slate-300 bg-slate-100 pl-11 pr-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        {error ? <RecoveryNotice>{error}</RecoveryNotice> : null}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-lg font-medium text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Enviando..." : "Enviar Código"}
          </button>
        </div>
      </form>
      <p className="mt-7 text-center text-sm text-slate-600">
        Lembrou sua senha?{" "}
        <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
          Voltar ao login
        </Link>
      </p>
    </PasswordRecoveryLayout>
  );
}

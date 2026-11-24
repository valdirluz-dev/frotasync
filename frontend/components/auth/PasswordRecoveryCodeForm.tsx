"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import {
  PasswordRecoveryLayout,
  RecoveryNotice,
} from "@/components/auth/PasswordRecoveryLayout";
import { ApiError, http } from "@/lib/http";

const CODE_LENGTH = 5;
const RESET_TOKEN_KEY = "frotasync.password-reset-token";

export function PasswordRecoveryCodeForm({ email }: { email: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(
      () => setResendSeconds((seconds) => seconds - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await http<{ token: string }>("/auth/verificar-codigo", {
        method: "POST",
        body: { email: email.trim(), codigo: code },
      });
      if (!result.token) {
        setError("Não foi possível verificar o código.");
        return;
      }

      window.sessionStorage.setItem(RESET_TOKEN_KEY, result.token);
      router.push("/recuperar-senha/passo3-senha");
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível conectar ao servidor. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    try {
      await http<void>("/auth/recuperar-senha", {
        method: "POST",
        body: { email: email.trim() },
      });
      setResendSeconds(60);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
        if (error.status === 429) setResendSeconds(60);
      } else {
        setError("Não foi possível conectar ao servidor. Tente novamente.");
      }
    }
  }

  return (
    <PasswordRecoveryLayout
      illustration="/img/cod.png"
      illustrationAlt="Verificação do código de segurança recebido"
      step={2}
    >
      <p className="text-center text-base font-semibold text-slate-800">
        Verifique seu e-mail.
      </p>
      <p className="mt-5 text-center text-base font-semibold leading-6 text-slate-800">
        Insira o código de 5 dígitos enviado para{" "}
        <span className="break-all">{email || "seu e-mail"}</span> para continuar.
      </p>
      <RecoveryNotice tone="info">
        O envio de e-mail está simulado. Em desenvolvimento, o código aparece no
        terminal do servidor.
      </RecoveryNotice>

      <form onSubmit={handleVerify} className="mt-7 space-y-6">
        <label className="sr-only" htmlFor="recovery-code">
          Código de 5 dígitos
        </label>
        <input
          id="recovery-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{5}"
          maxLength={CODE_LENGTH}
          required
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
          }
          aria-invalid={Boolean(error)}
          placeholder="00000"
          className="h-16 w-full rounded-sm border border-slate-300 bg-slate-100 text-center font-mono text-3xl tracking-[0.8em] text-slate-900 placeholder:text-slate-400 placeholder:tracking-[0.8em] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        {error ? <RecoveryNotice>{error}</RecoveryNotice> : null}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting || code.length !== CODE_LENGTH}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-lg font-medium text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Verificando..." : "Verificar código"}
          </button>
        </div>
      </form>

      <p className="mt-7 text-center text-sm text-slate-700">
        Não recebeu o código?{" "}
        <button
          type="button"
          disabled={!email || resendSeconds > 0}
          onClick={() => void handleResend()}
          className="font-medium text-indigo-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {resendSeconds > 0
            ? `Enviar novo código em ${resendSeconds}s`
            : "Enviar novo código"}
        </button>
      </p>
      {!email ? (
        <p className="mt-4 text-center text-sm">
          <Link
            href="/recuperar-senha/passo1-email"
            className="font-semibold text-indigo-600 hover:underline"
          >
            Informe seu e-mail novamente
          </Link>
        </p>
      ) : null}
    </PasswordRecoveryLayout>
  );
}

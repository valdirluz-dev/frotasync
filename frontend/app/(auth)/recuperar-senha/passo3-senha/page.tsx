"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Icon } from "@/components/ui/Icons";
import {
  PasswordRecoveryLayout,
  RecoveryNotice,
} from "@/components/auth/PasswordRecoveryLayout";
import { redefinirSenhaSchema } from "@/schemas/acesso";
import { zodErrorsByField } from "@/utils/zodErrors";

const RESET_TOKEN_KEY = "frotasync.password-reset-token";

export default function Page() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestError("");
    const token = window.sessionStorage.getItem(RESET_TOKEN_KEY) ?? "";
    const result = redefinirSenhaSchema.safeParse({
      token,
      senha: password,
      confirmarSenha: confirmation,
    });
    if (!result.success) {
      setErrors(zodErrorsByField(result.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/password-recovery/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const responseBody = (await response.json()) as { message?: string };
      if (!response.ok) {
        setRequestError(
          responseBody.message ?? "Não foi possível redefinir a senha.",
        );
        if (response.status === 400 && !token) {
          router.push("/recuperar-senha/passo1-email");
        }
        return;
      }

      window.sessionStorage.removeItem(RESET_TOKEN_KEY);
      router.push("/recuperar-senha/passo4-sucesso");
    } catch {
      setRequestError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PasswordRecoveryLayout
      illustration="/img/senha.png"
      illustrationAlt="Pessoa criando uma nova senha"
      step={3}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordField
          id="new-password"
          label="Nova senha"
          placeholder="Digite sua nova senha"
          value={password}
          visible={showPassword}
          onChange={setPassword}
          onToggle={() => setShowPassword((visible) => !visible)}
          error={errors.senha}
        />
        <PasswordField
          id="confirm-new-password"
          label="Confirme sua nova senha"
          placeholder="Digite novamente sua nova senha"
          value={confirmation}
          visible={showConfirmation}
          onChange={setConfirmation}
          onToggle={() => setShowConfirmation((visible) => !visible)}
          error={errors.confirmarSenha}
        />
        <p className="text-xs leading-5 text-slate-500">
          Use no mínimo 8 caracteres, com letras maiúsculas e minúsculas, número
          e símbolo.
        </p>
        {errors.token ? <RecoveryNotice>{errors.token}</RecoveryNotice> : null}
        {requestError ? <RecoveryNotice>{requestError}</RecoveryNotice> : null}
        <div className="flex justify-center pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-lg font-medium text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </form>
    </PasswordRecoveryLayout>
  );
}

function PasswordField({
  id,
  label,
  placeholder,
  value,
  visible,
  onChange,
  onToggle,
  error,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-900">
        {label}
      </label>
      <div className="relative">
        <Icon
          name="lock"
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-700"
        />
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={`h-12 w-full rounded-sm border bg-slate-100 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
              : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200"
          }`}
        />
        <button
          type="button"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
        >
          <Icon name={visible ? "eye-off" : "eye"} className="h-5 w-5" />
        </button>
      </div>
      {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

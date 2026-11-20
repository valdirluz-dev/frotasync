import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type PasswordRecoveryLayoutProps = {
  children: ReactNode;
  illustration: string;
  illustrationAlt: string;
  step: 1 | 2 | 3;
};

export function PasswordRecoveryLayout({
  children,
  illustration,
  illustrationAlt,
  step,
}: PasswordRecoveryLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4">
      <div
        aria-hidden="true"
        className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-indigo-600 sm:h-72 sm:w-72"
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-600 sm:h-72 sm:w-72"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-28 left-10 h-48 w-48 rounded-full bg-indigo-600 sm:left-20 sm:h-56 sm:w-56"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-28 right-[-4rem] h-48 w-48 rounded-full bg-indigo-600 sm:right-16 sm:h-56 sm:w-56"
      />

      <div className="relative z-10 grid w-full max-w-[1080px] overflow-hidden rounded-sm bg-white shadow-[0_8px_18px_rgba(15,23,42,0.35)] md:min-h-[560px] md:grid-cols-2">
        <section className="flex min-h-[480px] flex-col items-center px-6 py-9 sm:px-10 md:min-h-[560px] md:px-12 md:py-10">
          <div className="w-full max-w-[420px]">
            <h1 className="text-center text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Recuperação de Senha
            </h1>
            <div className="mt-8">{children}</div>
          </div>
          <div
            aria-label={`Etapa ${step} de 3`}
            className="mt-auto flex items-center gap-2 pt-8"
          >
            {[1, 2, 3].map((item) => (
              <span
                key={item}
                aria-current={item === step ? "step" : undefined}
                className={`h-2.5 w-2.5 rounded-full ${
                  item === step ? "bg-indigo-600" : "bg-slate-300"
                }`}
              />
            ))}
          </div>
        </section>

        <aside className="hidden items-center justify-center bg-[#d9d9d9] p-8 md:flex">
          <Image
            src={illustration}
            alt={illustrationAlt}
            width={540}
            height={460}
            priority
            className="max-h-[460px] w-full object-contain"
          />
        </aside>
      </div>

      <Link
        href="/login"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-indigo-700"
      >
        Voltar ao login
      </Link>
    </main>
  );
}

export function RecoveryNotice({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: "error" | "success" | "info";
}) {
  const classes = {
    error: "bg-red-50 text-red-700",
    success: "bg-emerald-50 text-emerald-700",
    info: "bg-indigo-50 text-indigo-700",
  }[tone];

  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-lg px-3 py-2 text-sm ${classes}`}>
      {children}
    </p>
  );
}

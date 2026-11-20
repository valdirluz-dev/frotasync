import Image from "next/image";
import Link from "next/link";

export default function Page() {
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
      <div className="relative z-10 grid w-full max-w-[1080px] overflow-hidden rounded-sm bg-white shadow-[0_8px_18px_rgba(15,23,42,0.35)] md:min-h-[560px] md:grid-cols-2">
        <section className="flex min-h-[480px] flex-col items-center justify-center px-6 py-10 text-center sm:px-10 md:min-h-[560px]">
          <div className="max-w-[420px]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl font-bold text-emerald-700">
              ✓
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
              Senha alterada!
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Sua senha foi redefinida com sucesso. Agora você já pode entrar
              usando a nova senha.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex rounded-lg bg-indigo-600 px-6 py-2.5 text-lg font-medium text-white transition hover:bg-indigo-700"
            >
              Ir para o login
            </Link>
          </div>
        </section>
        <aside className="hidden items-center justify-center bg-[#d9d9d9] p-8 md:flex">
          <Image
            src="/img/sucesso.png"
            alt="Confirmação de sucesso"
            width={540}
            height={460}
            priority
            className="max-h-[460px] w-full object-contain"
          />
        </aside>
      </div>
    </main>
  );
}

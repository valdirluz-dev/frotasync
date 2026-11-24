import type { ReactNode } from "react";

import { CadastroProvider } from "@/components/auth/CadastroProvider";

export default function CadastroLayout({ children }: { children: ReactNode }) {
  return <CadastroProvider>{children}</CadastroProvider>;
}

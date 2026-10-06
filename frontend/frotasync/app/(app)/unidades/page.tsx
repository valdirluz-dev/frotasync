import { Suspense } from "react";

import { UnidadesClient } from "@/components/unidades/UnidadesClient";

export default function UnidadesPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-[#F8F9FC]"
          aria-label="Carregando unidades"
        />
      }>
      <UnidadesClient />
    </Suspense>
  );
}

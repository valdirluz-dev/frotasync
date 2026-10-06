import { Suspense } from "react";

import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-[#F8F9FC]"
          aria-label="Carregando Dashboard Global"
        />
      }>
      <DashboardClient />
    </Suspense>
  );
}

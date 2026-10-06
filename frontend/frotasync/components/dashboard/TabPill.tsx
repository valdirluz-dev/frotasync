import { Icon } from "@/components/dashboard/Icons";

type Tab = "documentos" | "tarefas";

export function TabPill({
  activeTab,
  onChange,
}: {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}) {
  const documentTabIsActive = activeTab === "documentos";

  return (
    <div
      role="tablist"
      aria-label="Visão do Dashboard"
      className="inline-flex w-fit shrink-0 items-center overflow-hidden rounded-full border border-slate-900 p-[2px]">
      <button
        type="button"
        role="tab"
        aria-selected={documentTabIsActive}
        onClick={() => onChange("documentos")}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs sm:px-4 ${documentTabIsActive ? "font-bold text-slate-900" : "bg-indigo-600 font-semibold text-white"}`}>
        {documentTabIsActive ? (
          "Documentos"
        ) : (
          <>
            <span>ver Docs</span>
            <Icon name="right" className="h-3.5 w-3.5" />
          </>
        )}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={!documentTabIsActive}
        onClick={() => onChange("tarefas")}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs sm:px-4 ${documentTabIsActive ? "bg-indigo-600 font-semibold text-white" : "font-bold text-slate-900"}`}>
        {documentTabIsActive ? (
          <>
            <Icon name="left" className="h-3.5 w-3.5" />
            <span>ver tarefas</span>
          </>
        ) : (
          "Tarefas"
        )}
      </button>
    </div>
  );
}

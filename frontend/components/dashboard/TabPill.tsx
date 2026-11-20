type Tab = "documentos" | "tarefas";

export function TabPill({
  activeTab,
  onChange,
}: {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}) {
  const documentTabIsActive = activeTab === "documentos";
  const activeClasses =
    "bg-indigo-700 font-bold text-white shadow-[0_0_10px_rgba(79,70,229,0.35)]";
  const inactiveClasses =
    "font-medium text-slate-500 hover:bg-indigo-50 hover:text-indigo-700";

  return (
    <div
      role="tablist"
      aria-label="Visão do Dashboard"
      className="inline-flex w-fit shrink-0 items-center overflow-hidden rounded-full border border-slate-900 p-[2px]">
      <button
        type="button"
        role="tab"
        aria-selected={documentTabIsActive}
        aria-label={
          documentTabIsActive ? "Documentos" : "Ver documentos"
        }
        onClick={() => onChange("documentos")}
        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs transition-colors sm:px-4 ${documentTabIsActive ? activeClasses : inactiveClasses}`}>
        {documentTabIsActive ? "Documentos" : "Ver documentos"}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={!documentTabIsActive}
        aria-label={!documentTabIsActive ? "Tarefas" : "Ver tarefas"}
        onClick={() => onChange("tarefas")}
        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs transition-colors sm:px-4 ${documentTabIsActive ? inactiveClasses : activeClasses}`}>
        {documentTabIsActive ? "Ver tarefas" : "Tarefas"}
      </button>
    </div>
  );
}

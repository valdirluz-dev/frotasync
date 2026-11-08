"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DocumentoForm } from "@/components/documentos/DocumentoForm";

/**
 * Rota: /documentos/novo
 * 
 * Página responsável por renderizar o formulário para o registo
 * e criação de um novo documento no sistema.
 */
export default function NovoDocumentoPage() {
  return (
    <AppShell activeTab="documentos">
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        
        {/* Cabeçalho da página */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Novo Documento</h1>
          <p className="text-xs text-slate-500">
            Preencha as informações abaixo para cadastrar um novo documento.
          </p>
        </div>

        {/* Bloco do formulário de criação */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <DocumentoForm
            documento={{
              id: "",
              nome: "",
              categoria: "",
              unidadeId: "",
              dataEmissao: "",
              dataValidade: "",
            }}
            unidadeNome=""
            categorias={[]}
            isSaving={false}
            onSubmit={(data) => {
              console.log("Submeter novo documento:", data);
            }}
            onCancel={() => {
              window.history.back();
            }}
          />
        </div>

      </div>
    </AppShell>
  );
}
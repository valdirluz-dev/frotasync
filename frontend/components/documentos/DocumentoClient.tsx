"use client";

import { useMemo, useState } from "react";
// Componentes de Layout e Interface
import Link from "next/link"
import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/ui/Icons";
import { StatTrend } from "@/components/dashboard/StatTrend";
import { DocumentosTable } from "@/components/documentos/DocumentosTable";

// Hooks customizados para buscar dados no backend/API
import {
  useDashboardDocuments,
  useDashboardIndicators,
} from "@/hooks/useDashboard";

// Mocks (dados estáticos) de unidades e categorias
import { mockCategorias, mockUnidades } from "@/mocks/dashboard";
import type { DocumentoStatus } from "@/types/domain";

// Opções de status disponíveis para filtragem na tabela
const documentStatuses: Array<DocumentoStatus | "Todos"> = [
  "Todos",
  "Válido",
  "Próximo do vencimento",
  "Expirado",
];

/**
 * Componente cliente responsável por gerir o estado global,
 * os filtros e a listagem da página principal de Documentos.
 */
export function DocumentosClient() {
  // --- ESTADOS LOCAIS DOS FILTROS E PAGINAÇÃO ---
  const [unitId, setUnitId] = useState("todas");
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentStatus, setDocumentStatus] = useState<DocumentoStatus | "Todos">("Todos");
  const [category, setCategory] = useState("todas");
  const [documentPage, setDocumentPage] = useState(1);

  // --- CONSULTAS DE DADOS (HOOKS SWR/REACT QUERY) ---
  // Busca indicadores gerais para o cartão de estatísticas
  const indicatorQuery = useDashboardIndicators();

  // Busca a lista paginada e filtrada de documentos reais do backend
  const documentQuery = useDashboardDocuments({
    page: documentPage,
    pageSize: 10,
    search: documentSearch,
    unidadeId: unitId,
    categoria: category,
    status: documentStatus,
  });

  // Mapeamentos otimizados de nomes e status de unidades para passagem direta à tabela
  const unitNames = useMemo(
    () => new Map(mockUnidades.map((unit) => [unit.id, unit.nome])),
    []
  );
  const unitStatuses = useMemo(
    () => new Map(mockUnidades.map((unit) => [unit.id, unit.status])),
    []
  );

  const indicators = indicatorQuery.data;

  return (
    // Estrutura principal da aplicação mantendo a aba 'documentos' ativa no menu lateral
    <AppShell activeTab="documentos">
      
      {/* 1. CABEÇALHO DA PÁGINA */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.04em] text-slate-900 sm:text-[40px]">
          Documentos
        </h1>
      </div>

      <section aria-label="Lista de documentos">
        
        {/* 2. BLOCO DE DESTAQUE E BOTÃO DE AÇÃO */}
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="min-w-0 flex-1">
            {/* Exibe o indicador/tendência de documentos a vencer */}
            <StatTrend
              label="Total de documentos a vencer"
              value={indicators?.documentosAVencer}
              variation={indicators?.variacaoDocumentosAVencer}
              inverse
            />
          </div>

          {/* Botão de navegação/ação para registar um novo documento */}
         <Link href="/documentos/novo" className="inline-flex h-10 strink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700">
         <Icon name="plus" className="h-4 w-4" />
         Novo documento
         </Link>
        </div>

        {/* 3. BARRA DE FILTROS E PESQUISA */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          
          {/* Campo de Pesquisa por Texto */}
          <label className="block min-w-0">
            <span className="mb-1.5 block text-[10px] font-bold text-slate-700">Buscar documento</span>
            <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <Icon name="search" className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={documentSearch}
                onChange={(event) => {
                  setDocumentSearch(event.target.value);
                  setDocumentPage(1); // Reseta para a 1ª página ao pesquisar
                }}
                placeholder="Digite o nome do documento..."
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
            </div>
          </label>

          {/* Filtro por Unidade */}
          <label className="block min-w-0">
            <span className="mb-1.5 block text-[10px] font-bold text-slate-700">Unidade</span>
            <select
              value={unitId}
              onChange={(event) => {
                setUnitId(event.target.value);
                setDocumentPage(1); // Reseta para a 1ª página ao alterar filtro
              }}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="todas">Todas as unidades</option>
              {mockUnidades.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.nome}</option>
              ))}
            </select>
          </label>

          {/* Filtro por Categoria */}
          <label className="block min-w-0">
            <span className="mb-1.5 block text-[10px] font-bold text-slate-700">Categoria</span>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setDocumentPage(1); // Reseta para a 1ª página ao alterar filtro
              }}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="todas">Todas as categorias</option>
              {mockCategorias.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          {/* Filtro por Status do Documento */}
          <label className="block min-w-0">
            <span className="mb-1.5 block text-[10px] font-bold text-slate-700">Status</span>
            <select
              value={documentStatus}
              onChange={(event) => {
                setDocumentStatus(event.target.value as DocumentoStatus | "Todos");
                setDocumentPage(1); // Reseta para a 1ª página ao alterar filtro
              }}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="Todos">Todos os status</option>
              {documentStatuses
                .filter((status) => status !== "Todos")
                .map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
            </select>
          </label>
        </div>

        {/* 4. TABELA PRINCIPAL DE DOCUMENTOS */}
        <div className="mt-7">
          <DocumentosTable
            items={documentQuery.data?.items ?? []}
            mode="global"
            unidadeNames={unitNames}
            unidadeStatuses={unitStatuses}
            isLoading={documentQuery.isPending}
            isError={documentQuery.isError}
            onRetry={() => void documentQuery.refetch()}
            page={documentQuery.data?.page ?? documentPage}
            totalPages={documentQuery.data?.totalPages ?? 1}
            total={documentQuery.data?.total ?? 0}
            pageSize={documentQuery.data?.pageSize ?? 10}
            onPageChange={setDocumentPage}
          />
        </div>

      </section>
    </AppShell>
  );
}
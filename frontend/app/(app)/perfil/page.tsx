"use client";

import React, { useState, useEffect } from "react";
// Importa o layout padrão do sistema (barra lateral e cabeçalho)
import { AppShell } from "@/components/layout/AppShell"; 
// Importa a função consolidada e o tipo do nosso mock (profile.ts)
import { obterPerfilConsolidado, ProfileData } from "@/mocks/profile"; 

export default function PerfilPage() {
  // Estado local tipado que armazena os dados do perfil obtidos do mock ou localStorage
  const [dadosUsuario, setDadosUsuario] = useState<ProfileData>({
    nome: "Carregando...",
    cpf: "",
    telefone: "",
    cargo: "",
    email: "",
    nomeEmpresa: "",
    razaoSocial: "",
    cnpj: "",
    segmento: "",
    tipoUnidade: "",
    cep: "",
    estado: "",
    cidade: "",
    bairro: "",
    logradouro: "",
    numero: "",
  });

  // useEffect executado no carregamento da página (client-side) para puxar os dados consolidados
  useEffect(() => {
    const perfilCompleto = obterPerfilConsolidado();
    setDadosUsuario(perfilCompleto);
  }, []);

  return (
    // activeTab={"perfil" as any} evita que abas indevidas do menu lateral fiquem acesas
    <AppShell activeTab={"perfil" as any}>
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Título e descrição da página de perfil */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Meu Perfil
          </h1>
          <p className="text-sm text-slate-500">
            Consulte abaixo todas as informações consolidadas da conta e da unidade.
          </p>
        </div>

        {/* Cartão principal do perfil */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-8">
          
          {/* Cabeçalho: Iniciais dinâmicas geradas a partir do nome + Nome Completo e Cargo */}
          <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-slate-100 pb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white shadow-md">
              {dadosUsuario.nome ? dadosUsuario.nome.substring(0, 2).toUpperCase() : "ML"}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-extrabold text-slate-900">
                {dadosUsuario.nome}
              </h2>
              <span className="inline-block mt-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {dadosUsuario.cargo}
              </span>
            </div>
          </div>

          {/* ========================================== */}
          {/* 1. SEÇÃO: Dados Pessoais                    */}
          {/* ========================================== */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600">
              1. Dados Pessoais
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">Nome Completo</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.nome}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">CPF</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.cpf}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">Telefone</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.telefone}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">Cargo</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.cargo}</span>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* 2. SEÇÃO: Dados de Login                    */}
          {/* ========================================== */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600">
              2. Dados de Login
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">E-mail de Acesso</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.email}</span>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* 3. SEÇÃO: Dados da Empresa e Unidade        */}
          {/* ========================================== */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600">
              3. Dados da Empresa e Unidade
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">Nome da Empresa</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.nomeEmpresa}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">Razão Social</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.razaoSocial}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">CNPJ</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.cnpj}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">Segmento</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.segmento}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">Tipo de Unidade</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.tipoUnidade}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">CEP</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.cep}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">Estado</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.estado}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">Cidade</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.cidade}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">Bairro</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.bairro}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">Logradouro</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.logradouro}</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <span className="block text-xs font-bold uppercase text-slate-400">Número</span>
                <span className="mt-1 block text-sm font-semibold text-slate-800">{dadosUsuario.numero}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
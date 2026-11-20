"use client";

import React from "react";
import { Button } from "@/components/ui";

interface CookieBannerProps {
  onOpenModal: () => void; // Função para abrir o modal de preferências detalhadas
  onAcceptAll: () => void; // Função para aceitar todos via store em memória
  isVisible: boolean;      // Estado de visibilidade gerido pelo authStore
}

export function CookieBanner({ onOpenModal, onAcceptAll, isVisible }: CookieBannerProps) {
  // Se já existe consentimento registado na memória, o banner não é exibido
  if (!isVisible) return null;

  return (
    // Barra horizontal fixa no rodapé (bottom bar) com identidade visual corporativa
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-2xl md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Texto informativo focado em conformidade e segurança de dados */}
        <div className="text-sm text-gray-700 text-center md:text-left">
          <p className="font-semibold text-gray-900 mb-1">Gerenciamento de Privacidade e Cookies</p>
          Utilizamos cookies essenciais para garantir a segurança do sistema, autenticar seu login e viabilizar o cadastro de dados pessoais e corporativos. Não utilizamos cookies de rastreamento para fins publicitários. Ao continuar, você concorda com nossos termos.{" "}
          <span className="text-blue-600 underline font-medium cursor-pointer">Política de Privacidade</span>.
        </div>

        {/* Botões de ação do banner */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onOpenModal}
            className="text-sm px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Opções / Configurar
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={onAcceptAll}
            className="text-sm px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            Aceitar Todos
          </Button>
        </div>

      </div>
    </div>
  );
}
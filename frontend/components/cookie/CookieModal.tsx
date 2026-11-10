"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";

interface CookieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (optionalAccepted: boolean) => void; // Callback para guardar as preferências na memória RAM
}

export function CookieModal({ isOpen, onClose, onSave }: CookieModalProps) {
  // Estado local para o checkbox dos cookies opcionais de desempenho
  const [optionalAccepted, setOptionalAccepted] = useState(false);

  // Se o modal estiver fechado, não renderiza nada
  if (!isOpen) return null;

  // Executa o salvamento e fecha o modal
  const handleSavePreferences = () => {
    onSave(optionalAccepted);
    onClose();
  };

  return (
    // Fundo escurecido com efeito de desfoque (backdrop)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      
      {/* Janela centralizada do modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 md:p-8 flex flex-col space-y-6">
        
        {/* Cabeçalho */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Painel de Preferências de Privacidade</h3>
          <p className="text-sm text-gray-600">
            Personalize as suas preferências de consentimento para a gestão de dados do sistema.
          </p>
        </div>

        {/* Lista de categorias */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          
          {/* Categoria 1: Obrigatórios */}
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">🔒 Cookies Estritamente Necessários (Obrigatórios)</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Estes cookies são indispensáveis para o funcionamento do sistema. Eles permitem que você navegue pelas etapas de cadastro, mantenham sua sessão de login ativa com segurança e protejam os dados informados (como CPF, CNPJ e senhas) contra fraudes.
              </p>
            </div>
            <input
              type="checkbox"
              checked={true}
              disabled={true}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-not-allowed mt-1 shrink-0"
            />
          </div>

          {/* Categoria 2: Opcionais */}
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">📊 Cookies de Desempenho / Estatísticas (Opcional)</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Coletam informações anônimas sobre como os usuários interagem com as telas de cadastro e o dashboard (ex: se alguma etapa de cadastro está demorando para carregar). Isso nos ajuda a melhorar a usabilidade do sistema de licenças.
              </p>
            </div>
            <input
              type="checkbox"
              checked={optionalAccepted}
              onChange={(e) => setOptionalAccepted(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer mt-1 shrink-0"
            />
          </div>

        </div>

        {/* Rodapé com botões */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-sm px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleSavePreferences}
            className="text-sm px-5 py-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            Salvar Preferências
          </Button>
        </div>

      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icons";
import { AuthInput } from "@/components/ui/Authinput";
import { Button } from "@/components/ui";
import { mockValidarDadosLogin } from "@/mocks/dadosLogin";
import { CookieModal } from "@/components/cookie/CookieModal"; 
import { cadastroAcessoSchema } from "@/schemas/acesso";
import { zodErrorsByField } from "@/utils/zodErrors";

export default function DadosLogin() {
  const router = useRouter();

  // Estado inicial do formulário para recolha de dados de acesso e termos
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    confirmarSenha: "",
    aceiteTermos: false,
  });

  // Estados para controlo de erros, carregamento e visibilidade dos campos de senha
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  // Estado para controlar a abertura do modal de cookies/privacidade 
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  // Manipulador de alterações nos inputs e checkboxes do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validação dos dados digitados e envio final para concluir o cadastro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = cadastroAcessoSchema.safeParse(formData);
    if (!result.success) {
      setErrors(zodErrorsByField(result.error));
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const resposta = await mockValidarDadosLogin({
        email: result.data.email,
        senha: result.data.senha,
      });

      if (resposta.success) {
        router.push("/cadastro/Sucesso");
      } else {
        alert(resposta.message);
      }
    } catch (error) {
      console.error("Erro ao validar login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Estrutura da página centralizada com fundo decorativo
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 p-4 overflow-hidden">
      
      {/* Elementos visuais decorativos posicionados no fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-700" />
        <div className="absolute -top-10 right-2 h-64 w-64 rounded-full bg-blue-700" />
        <div className="absolute left-10 -bottom-20 h-64 w-64 rounded-full bg-blue-700" />
        <div className="absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-blue-700" />
      </div>

      {/* Estrutura principal do formulário responsivo */}
      <form
        onSubmit={handleSubmit}
        className="relative z-20 flex flex-col md:flex-row w-full max-w-[1100px] my-auto h-[92vh] shrink-0 overflow-y-auto md:overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {/* Coluna esquerda contendo os campos de preenchimento */}
        <div className="w-full md:w-1/2 p-8 md:p-10 bg-white flex flex-col justify-start space-y-4 order-2 md:order-1 overflow-y-auto max-h-[92vh]">
          
          {/* Campo: E-mail Corporativo */}
          <AuthInput
            label="E-mail Corporativo"
            icon="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="*Seu-email@empresa.com"
            error={errors.email}
          />

          {/* Campo Criar Senha com o botão do olhinho para mostrar ou esconder a senha */}
          <div className="relative">
            <AuthInput
              label="Criar Senha"
              icon="lock"
              type={showSenha ? "text" : "password"}
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              placeholder="*Mín. 8 caracteres (letras, números e símbolos)"
              error={errors.senha}
            />
            {/* Botão do olhinho para alternar a visão da senha */}
            <button
              type="button"
              onClick={() => setShowSenha(!showSenha)}
              className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Icon name={showSenha ? "eye-off" : "eye"} className="w-5 h-5" />
            </button>
          </div>

          {/* Campo Confirmar Senha com o botão do olhinho para mostrar ou esconder a senha */}
          <div className="relative">
            <AuthInput
              label="Confirmar Senha"
              icon="lock"
              type={showConfirmarSenha ? "text" : "password"}
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              placeholder="*Confirme sua senha"
              error={errors.confirmarSenha}
            />
            {/* Botão do olhinho para alternar a visão da senha */}
            <button
              type="button"
              onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
              className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Icon name={showConfirmarSenha ? "eye-off" : "eye"} className="w-5 h-5" />
            </button>
          </div>

          {/* Caixa de seleção para Aceite dos Termos de Uso e Política de Privacidade */}
          <div className="flex flex-col pt-2">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="aceiteTermos"
                checked={formData.aceiteTermos}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 shrink-0"
              />
              <span className="text-sm text-gray-700 leading-snug">
                Li e aceito os{" "}
                <span className="text-blue-600 hover:underline font-medium">Termos de Uso</span> e a{" "}
                <button
                  type="button"
                  onClick={() => setIsCookieModalOpen(true)}
                  className="text-blue-600 hover:underline font-medium focus:outline-none inline"
                >
                  Política de Privacidade
                </button>{" "}
                (incluindo o uso de cookies necessários para o gerenciamento das minhas licenças).
              </span>
            </label>
            {errors.aceiteTermos && (
              <span className="text-xs text-red-500 mt-1">{errors.aceiteTermos}</span>
            )}
          </div>

          {/* Botão de finalizar cadastro visível apenas em dispositivos móveis */}
          <div className="pt-6 block md:hidden flex justify-center w-full">
            <Button type="submit" variant="primary" className="!w-55 !text-2xl" disabled={loading}>
              {loading ? "A guardar..." : "Finalizar Cadastro"}
            </Button>
          </div>
        </div>

        {/* Coluna direita contendo o painel lateral e o Stepper de progresso */}
        <div className="contents md:flex md:w-1/2 md:bg-[#ECEFF4] md:p-8 md:flex-col md:items-center md:justify-between md:order-2">
          <div className="w-full bg-[#ECEFF4] md:bg-transparent p-6 md:p-0 flex flex-col items-start md:items-center order-1 border-b md:border-b-0 border-gray-200">
            
            {/* Imagem de ilustração da tela de cadastro de login */}
            <img
              src="/img/dados-login.png"
              alt="Ilustração de Cadastro"
              className="h-[140px] md:h-[280px] w-auto object-contain mx-auto mb-4"
            />

            {/* Indicadores numéricos do passo atual do cadastro (Passo 3 ativo) */}
            <div className="flex items-center justify-center space-x-3 mx-auto mb-4">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gray-400 text-gray-500 flex items-center justify-center font-bold text-xl md:text-2xl shadow">
                1
              </div>
              <div className="w-12 h-0.5 bg-gray-400" />
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gray-400 text-gray-500 flex items-center justify-center font-bold text-xl md:text-2xl shadow">
                2
              </div>
              <div className="w-12 h-0.5 bg-gray-400" />
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-3xl md:text-4xl shadow">
                3
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 mx-auto mb-4">
              <h2 className="text-4xl font-bold text-gray-800">Dados de Login</h2>
            </div>

            {/* Botão de finalizar cadastro principal para ecrãs de computador */}
            <div className="pt-2 hidden md:block flex justify-center">
              <Button type="submit" variant="primary" className="!w-55 !text-2xl" disabled={loading}>
                {loading ? "A guardar..." : "Finalizar Cadastro"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de Detalhes dos Cookies  */}
      <CookieModal
        isOpen={isCookieModalOpen}
        onClose={() => setIsCookieModalOpen(false)}
        onSave={(optionalAccepted) => {
        }}
      />
    </div>
  );
}

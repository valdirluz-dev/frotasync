"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; 
import { AuthInput } from "@/components/ui/Authinput";
import { Button } from "@/components/ui";
import { Icon } from "@/components/ui/Icons";
import { mockFazerLogin } from "@/mocks/login";
import { CookieModal } from "@/components/cookie/CookieModal"; 

export default function Login() {
  const router = useRouter();

  // Estado que armazena os campos do formulário em memória RAM (sem localStorage)
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    lembreMe: false,
  });

  //Controle de visibilidade da senha (olhinho aberto/fechado)
  const [showPassword, setShowPassword] = useState(false);

  //Armazena mensagens de erro individuais por campo
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  //Estado de carregamento para desabilitar o botão durante a requisição
  const [isLoading, setIsLoading] = useState(false);

  // Estado para controlar a abertura do modal de cookies/privacidade
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  //Atualiza o estado dos inputs e limpa o erro assim que o usuário começa a digitar
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

  //Submissão do login com validação e criação do Cookie de Sessão
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    // 1. Validação básica de campos obrigatórios
    if (!formData.email.trim()) {
      newErrors.email = "Digite seu e-mail corporativo";
    }

    if (!formData.senha.trim()) {
      newErrors.senha = "Digite sua senha";
    }

    setErrors(newErrors);

    // 2. Se não houver erros de preenchimento, processa o login
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      try {
        //Chama o mock em memória para verificar credenciais
        const resposta = await mockFazerLogin(formData);

        if (resposta.success) {
          //CRUCIAL - Grava o cookie exigido pelo proxy.ts para desbloquear as rotas privadas
          // Se 'Lembre-me' estiver ativo, o cookie dura 30 dias; senão dura 7 dias.
          const dias = formData.lembreMe ? 30 : 7;
          const maxAge = dias * 24 * 60 * 60;

           document.cookie = `frotasync_session=true; path=/; max-age=${maxAge}; SameSite=Lax`;

          //Redireciona com sucesso para o Dashboard
          router.push("/dashboard");
        } else {
          //Se o mock retornar credenciais inválidas, alerta o usuário
          alert(resposta.message);
        }
      } catch (error) {
        console.error("Erro inesperado no login:", error);
        alert("Ocorreu um erro ao tentar entrar. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 p-4 overflow-hidden">
      {/*Círculos azuis decorativos de fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-700" />
        <div className="absolute -top-10 right-2 h-64 w-64 rounded-full bg-blue-700" />
        <div className="absolute left-10 -bottom-20 h-64 w-64 rounded-full bg-blue-700" />
        <div className="absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-blue-700" />
      </div>

      {/*Caixa Principal do Formulário */}
      <form
        onSubmit={handleSubmit}
        className="relative z-20 flex flex-col md:flex-row w-full max-w-[1100px] my-auto h-[90vh] shrink-0 overflow-y-auto md:overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {/* Lado Esquerdo: Campos de Entrada */}
        <div className="w-full md:w-1/2 p-8 md:px-12 md:py-20 bg-white flex flex-col justify-start space-y-8 order-2 md:order-1 overflow-y-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-wider text-center mb-6">
            BEM-VINDO
          </h1>

          {/* E-mail Corporativo */}
          <AuthInput
            label=""
            icon="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Digite seu e-mail corporativo"
            error={errors.email}
          />

          {/* Senha com Olhinho Centralizado */}
          <div className="relative w-full ">
            <div className="w-full">
              <AuthInput
                label=""
                icon="lock"
                type={showPassword ? "text" : "password"}
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Digite sua senha"
                error={errors.senha}
              />
            </div>
            
           {/*Botão do olhinho */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-6 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none z-20 p-1 flex items-center justify-center"
              tabIndex={-1}
            >
              <Icon name={showPassword ? "eye" : "eye-off"} className="w-5 h-5" />
            </button>
          </div>

          {/* Lembre-me & Esqueceu a Senha */}
          <div className="flex items-center justify-between text-xs py-0.5">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="lembreMe"
                checked={formData.lembreMe}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-2 text-sm text-gray-700 font-medium">Lembre-me</span>
            </label>

            {/*Aponta diretamente para o primeiro passo da recuperação */}
            <Link
              href="/recuperar-senha/passo1-email"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Esqueceu a senha?
            </Link>
          </div>

          {/* Botão de Entrar */}
          <div className="w-full mb-4 flex flex-col items-center">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="!w-auto !py-3 !text-base md:w-2/3 uppercase tracking-wider"
            >
              {isLoading ? "Entrando..." : "ENTRAR"}
            </Button>

            {/* Aviso Discreto de Transparência e Cookies  */}
            <p className="mt-4 text-center text-xs text-gray-500 leading-relaxed max-w-sm">
              Ao entrar, você concorda com o uso de cookies essenciais para a segurança e autenticação do sistema.{" "}
              <button
                type="button"
                onClick={() => setIsCookieModalOpen(true)}
                className="text-blue-600 underline font-medium hover:text-blue-800 focus:outline-none"
              >
                Saiba mais
              </button>
            </p>
          </div>
          

          {/* Link para o Cadastro */}
          <p className="text-left text-base text-gray-600 pt-1">
            Ainda não tem uma conta?{" "}
            <Link
              href="/cadastro/Dados-Pessoais"
              onClick={() => {
                //Grava um cookie temporário que autoriza o usuário a avançar no fluxo de cadastro.
                document.cookie = "pode_cadastrar=true; path=/; max-age=600; SameSite=Lax"
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </div>

        {/* Lado Direito: Ilustração */}
        <div className="w-full md:w-1/2 bg-[#ECEFF4] p-8 flex flex-col items-center justify-center order-1 md:order-2">
          <img
            src="/img/login.png"
            alt="Ilustração de Login"
            className="h-[200px] md:h-[300px] w-auto object-contain mx-auto"
          />
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
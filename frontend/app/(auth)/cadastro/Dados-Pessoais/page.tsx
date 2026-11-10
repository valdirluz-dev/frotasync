"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthInput } from "@/components/ui/Authinput";
import { Button } from "@/components/ui";
import { salvarDadosPessoais } from "@/services/accountService";
import { cadastroPessoalSchema } from "@/schemas/cadastroPessoal";
import { formatCpf, formatPhone } from "@/utils/formatters";
import { zodErrorsByField } from "@/utils/zodErrors";

export default function DadosPessoais() {
  const router = useRouter();

  // Estado inicial do formulário limpo, sem carregar dados de teste (mocks)
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    cargo: "",
  });

  // Estado para armazenar e gerir as mensagens de erro de validação por campo
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Manipulador de alterações nos inputs aplicando máscaras e limpando erros
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cpf") formattedValue = formatCpf(value);
    else if (name === "telefone") formattedValue = formatPhone(value);

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validação geral do formulário e submissão para a próxima etapa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = cadastroPessoalSchema.safeParse(formData);
    if (!result.success) {
      setErrors(zodErrorsByField(result.error));
      return;
    }

    setErrors({});
    const resposta = await salvarDadosPessoais({
      id: "perfil-001",
      ...result.data,
    });

    if (resposta.success) {
      router.push("/cadastro/Dados-da-Empresa");
    } else {
      alert(resposta.message);
    }
  };

  return (
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
          
          {/* Campo: Nome Completo */}
          <AuthInput
            label="Nome"
            icon="user"
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="*Digite seu nome completo"
            error={errors.nome}
          />

          {/* Campo: CPF */}
          <AuthInput
            label="CPF"
            icon="id-card"
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            placeholder="*000.000.000-00"
            maxLength={14}
            error={errors.cpf}
          />

          {/* Campo: Número de Telefone */}
          <AuthInput
            label="Número de Telefone"
            icon="phone"
            type="text"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="*+55 (00) 00000-0000"
            maxLength={20}
            error={errors.telefone}
          />

          {/* Campo: Cargo / Função */}
          <AuthInput
            label="Cargo / Função na Empresa"
            icon="briefcase"
            type="text"
            name="cargo"
            value={formData.cargo}
            onChange={handleChange}
            placeholder="*Digite seu cargo ou papel na empresa"
            error={errors.cargo}
          />

          {/* Botão de avançar visível apenas em dispositivos móveis */}
          <div className="pt-6 block md:hidden flex justify-center w-full">
            <Button type="submit" variant="primary" className="!w-55 !text-2xl">
              Avançar
            </Button>
          </div>
        </div>

        {/* Coluna direita contendo o painel lateral e o Stepper de progresso */}
        <div className="contents md:flex md:w-1/2 md:bg-[#ECEFF4] md:p-8 md:flex-col md:items-center md:justify-between md:order-2">
          <div className="w-full bg-[#ECEFF4] md:bg-transparent p-6 md:p-0 flex flex-col items-start md:items-center order-1 border-b md:border-b-0 border-gray-200">
            
            <img
              src="/img/dados-pessoais.png"
              alt="Ilustração de Cadastro"
              className="h-[140px] md:h-[280px] w-auto object-contain mx-auto mb-4"
            />

            {/* Indicadores numéricos do passo atual do cadastro (Passo 1 ativo) */}
            <div className="flex items-center justify-center space-x-3 mx-auto mb-4">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-3xl md:text-4xl shadow">
                1
              </div>
              <div className="w-12 h-0.5 bg-gray-400" />
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gray-400 text-gray-500 flex items-center justify-center font-bold text-xl md:text-2xl shadow">
                2
              </div>
              <div className="w-12 h-0.5 bg-gray-400" />
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gray-400 text-gray-500 flex items-center justify-center font-bold text-xl md:text-2xl shadow">
                3
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 mx-auto mb-4">
              <h2 className="text-4xl font-bold text-gray-800">Dados Pessoais</h2>
            </div>

            {/* Botão de avançar principal para ecrãs de computador */}
            <div className="pt-2 hidden md:block flex justify-center">
              <Button type="submit" variant="primary" className="!w-55 !text-2xl">
                Avançar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
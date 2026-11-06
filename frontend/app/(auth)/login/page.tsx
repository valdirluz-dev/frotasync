"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthInput } from "@/components/ui/Authinput";
import { Button } from "@/components/ui";
import { Icon } from "@/components/ui/Icons";
import { mockFazerLogin } from "@/mocks/login"; 

export default function Login() {
    const router = useRouter();

    // Estado dos campos do formulário de login
    const [formData, setFormData] = useState({
        email: "",
        senha: "",
        lembreMe: false,
    });

    // Estado para controlar a visibilidade da senha (olhinho)
    const [showPassword, setShowPassword] = useState(false);

    // Estado dos erros individuais por campo
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Manipulação e alteração dos inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Limpa o erro do campo quando o usuário começa a digitar
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    // Submissão do login (valida se os campos estão preenchidos)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: { [key: string]: string } = {};

        if (!formData.email.trim()) {
            newErrors.email = "Digite seu e-mail corporativo";
        }

        if (!formData.senha.trim()) {
            newErrors.senha = "Digite sua senha";
        }

        setErrors(newErrors);

        // Se preenchido corretamente, simula o login
        if (Object.keys(newErrors).length === 0) {
            console.log("Login realizado com sucesso:", formData);
            
            //integração com o mock .
            
            // 1. Chama o mock (fazendo o papel da API/banco)
           const resposta = await mockFazerLogin(formData);
            
           // 2. Se o mock der sucesso, avança para a próxima tela
           if (resposta.success) {
               router.push("/dashboard");
            } else {
               // 3. Se der erro, avisa o usuário
               alert(resposta.message);
           }
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-gray-100 p-4 overflow-hidden">
            {/* Elementos de fundo (círculos azuis) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-700" />
                <div className="absolute -top-10 right-2 h-64 w-64 rounded-full bg-blue-700" />
                <div className="absolute left-10 -bottom-20 h-64 w-64 rounded-full bg-blue-700" />
                <div className="absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-blue-700" />
            </div>

            {/* Caixa Principal (Retângulo centralizado) */}
            <form 
                onSubmit={handleSubmit}
                className="relative z-20 flex flex-col md:flex-row w-full max-w-[1100px] my-auto h-[90vh] shrink-0 overflow-y-auto md:overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
                {/* Lado esquerdo: Espaçamentos compactos e alinhados */}
                <div className="w-full md:w-1/2 p-8 md:px-12 md:py-20 bg-white flex flex-col justify-start space-y-8 order-2 md:order-1 overflow-y-auto">
                    
                    {/* Título BEM-VINDO centralizado e ajustado */}
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-950 tracking-wider text-center mb-6">
                        BEM-VINDO
                    </h1>

                    {/* 1. E-mail Corporativo */}
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

                    {/* 2. Senha com o olhinho  centralizado */}
                    <div className="relative w-full flex items-center">
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
                        
                        {/* Botão do Olho centralizado  */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none z-20 p-1 flex items-center justify-center"
                            tabIndex={-1}
                        >
                            <Icon 
                                name={showPassword ? "eye" : "eye-off"} 
                                className="w-5 h-5" 
                            />
                        </button>
                    </div>

                    {/* Lembre-me & Esqueceu a senha */}
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

                        <a href="/recuperar-senha" className="text-blue-600 hover:underline text-sm font-medium">
                            Esqueceu a senha?
                        </a>
                    </div>

                    {/* Botão de Entrar */}
                    <div className="w-full mb-4 flex justify-center">
                        <Button
                            type="submit"
                            variant="primary"
                            className="!w-auto !py-3 !text-base md:w-2/3 !text-base uppercase tracking-wider py-2"
                        >
                            ENTRAR
                        </Button>
                    </div>

                    {/* Rodapé: Link para cadastro alinhado à esquerda */}
                    <p className="text-left text-xs text-gray-600 pt-1">
                        Ainda não tem uma conta?{" "}
                        <a href="/cadastro/Dados-Pessoais" className="text-blue-600 font-semibold hover:underline">
                            Cadastre-se
                        </a>
                    </p>
                </div>

                {/* Lado direito: Ilustração */}
                <div className="w-full md:w-1/2 bg-[#ECEFF4] p-8 flex flex-col items-center justify-center order-1 md:order-2">
                    <img 
                        src="/img/login.png" 
                        alt="Ilustração de Login" 
                        className="h-[200px] md:h-[300px] w-auto object-contain mx-auto" 
                    />
                </div>

            </form>
        </div>
    );
}

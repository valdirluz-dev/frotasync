"use client";

import React, {useState} from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icons";
import { AuthInput } from "@/components/ui/Authinput";
import { Button } from "@/components/ui";
import { object } from "zod";
import { mockValidarDadosLogin } from "@/mocks/dadosLogin";

//Função utilitária de validação do email
const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
};

//Função utilitária de validação senha
//-Mínimo 8 caracteres
//-Pelo menos uma letra maiúscula e uma minúscula
//-Pelo menos um número
//-Pelo menos um caractere especial (como *, @, #, $, etc.)
const isValidPassword = (senha: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(senha);
};

export default function DadosLogin(){

    const router = useRouter();//Inicializa o router para permitir a navegação entre as páginas 

    //Estado dos campos do formulário
    const [formData, setFormData] = useState({
        email: "",
        senha: "",
        confirmarSenha: "",
        aceiteTermos: false,
    });

    //Estado dos erros individuais por campo
    const [errors, setErrors] = useState<{[key: string]: string }>({});

    //Manipulação e alteração dos inputs
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const {name, value, type, checked} = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));

  //Limpa o erro do campo quando o usuário começa a digitar
  if (errors[name]) {
    setErrors((prev) => ({ ...prev, [name]: ""}));
  }
};

    //Submissão com validação Completa 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: {[key: string]: string } = {};

        if(!formData.email.trim()) {
            newErrors.email = "Digite o e-mail corporativo";
        } 
        else if (!isValidEmail(formData.email)){
            newErrors.email = "E-mail inválido";
        }

         if(!formData.senha.trim()) {
            newErrors.senha = "Digite uma senha";
        } 
        else if (!isValidPassword(formData.senha)){
            newErrors.senha = "A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e símbolo (ex:*, @, #, etc.)";
        }

         if(!formData.confirmarSenha.trim()) {
            newErrors.confirmarSenha = "Confirme sua senha";
        } 
        else if (formData.confirmarSenha !== formData.senha){
            newErrors.confirmarSenha = "As senhas não coincidem";
        }

         if(!formData.aceiteTermos) {
            newErrors.aceiteTermos = "É necessário aceitar os termos de Uso e a Política de Privacidade para prosseguir.";
        }
       
        setErrors(newErrors);

        //Se não houver erros, finaliza o cadastro e direciona para a tela de Sucesso
            console.log("Dados da empresa salvos com sucesso:", formData);
            
            //Redireciona o usuário para a pasta/página Dados-de-login
             if(Object.keys(newErrors).length === 0) {
            console.log("Dados de login salvos com sucesso:", formData);
          
            //integração com o mock .
            
            // 1. Chama o mock (fazendo o papel da API/banco)
            const resposta = await mockValidarDadosLogin(formData);
            
             // 2. Se o mock der sucesso, avança para a próxima tela
            if (resposta.success) {
                router.push("/cadastro/Sucesso");
            } else {
                 // 3. Se der erro, avisa o usuário
                 alert(resposta.message);
            }
         };
        
    };
    
    return (
        <div className="relative flex min-h-screen items-center justify-center bg-gray-100 p-4 overflow-hidden">
            {/*Elementos de fundo*/}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">

                {/*Círculo superior esquerdo*/}
                <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-700" />
                
                 {/*Círculo superior direito*/}
                 <div className="absolute -top-10 right-2 h-64 w-64 rounded-full bg-blue-700" />

                {/*Círculo inferior esquerdo*/}
                 <div className="absolute left-10 -bottom-20 h-64 w-64 rounded-full bg-blue-700" />

                {/*Círculo inferior direito*/}
                 <div className="absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-blue-700" />
            </div>

            {/*Caixa Principal do formulário | retângulo grande*/}
            <form 
            onSubmit={handleSubmit}
            className="relative z-20 flex flex-col md:flex-row w-full max-w-[1100px] my-auto h-[92vh] shrink-0 overflow-y-auto md:overflow-hidden rounded-3xl bg-white shadow-2xl">

                {/*Lado esquerdo: campos de preenchimento */}
                <div className="w-full md:w-1/2 p-8 md:p-10 bg-white flex flex-col justify-start space-y-4 order-2 md:order-1 overflow-y-auto max-h-[92vh]">

                {/*1.E-mail Corporativo*/}
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

                 {/*2.Criar Senha*/}
                <AuthInput
                label="Criar Senha"
                icon="lock"
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="*Mín. 8 caracteres (letras, números e símbolos)"
                error={errors.senha}
                />

                {/*3.Confirmar Senha*/}
                <AuthInput
                label="Confirmar Senha"
                icon="lock"
                type="password"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                placeholder="*Confirme sua senha"
                error={errors.confirmarSenha}
                />

                {/*4.Termos de Uso e Política de Privacidade*/}
                <div className="flex flex-col pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                    type="checkbox" 
                    name="aceiteTermos" 
                    checked={formData.aceiteTermos} 
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Li e aceito os {" "}
                      <span className="text-blue-600 hover:underline font-medium">
                      Termos de Uso</span>{" "} 
                      e {" "}
                      <span className="text-blue-600 hover:underline font-medium">Política de Privacidade</span>
                    </span>
                  </label>
                 {errors.aceiteTermos && (
                  <span className="text-xs text-red-500 mt-1">{errors.aceiteTermos}</span>
                 )}
                </div>
                
                   {/*Botão de Finalizar (aparece só na tela responsivel)*/}
                     <div className="pt-6 block md:hidden  flex justify-center w-full">
                        <Button
                        type="submit"
                        variant="primary"
                        className="!w-55 !text-2xl"
                        >
                            Finalizar Cadastro
                        </Button>
                     </div>
                </div>

                
                {/*Lado direito: ilustração, stepper e botão */}
                <div className="contents md:flex md:w-1/2 md:bg-[#ECEFF4] md:p-8 md:flex-col md:items-center md:justify-between md:order-2 ">

                {/*Cabeçalho do painel*/}
                <div className="w-full bg-[#ECEFF4] md:bg-transparent p-6 md:p-0 flex flex-col items-start md:items-center order-1 border-b md:border-b-0 border-gray-200">

                    {/*Imagem da tela dados pessoais */}
                    <img src="/img/dados-login.png" alt="Ilustração de Cadastro" className="h-[140px] md:h-[280px] w-auto object-contain flex items-center justify-center space-x-3 mx-auto mb-4 " />

                    {/*Indicadores de passos*/}
                    <div className="flex items-center justify-center space-x-3 mx-auto mb-4">
                        <div className="w-9 h-9 md:w-11  md:h-11 rounded-full bg-gray-400 text-gray-500  flex items-center justify-center font-bold text-xl md:text-2xl shadow">1</div>
                        <div className="w-12 h-0.5 bg-gray-400"/>{/*Linha divisória */}
                        <div className="w-9 h-9 md:w-11  md:h-11 rounded-full bg-gray-400 text-gray-500 flex items-center justify-center font-bold text-xl md:text-2xl shadow">2</div>
                        <div className="w-12 h-0.5 bg-gray-400"/>{/*Linha divisória */}
                        <div className="w-10 h-10 md:w-14  md:h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-3xl md:text-4xl shadow">3</div>
                    </div>

                      {/*Título da secção*/}
                    <div className="flex items-center justify-center space-x-3 mx-auto mb-4 ">
                        <h2 className="text-4xl md:text-4xl font-bold text-gray-800">Dados de Login</h2>
                    </div>

                     {/*Botão de Finalizar*/}
                     <div className="pt-2 hidden md:block flex justify-center ">
                        <Button
                        type="submit"
                        variant="primary"
                        className="!w-55 !text-2xl"
                        >
                            Finalizar Cadastro
                        </Button>
                     </div>

                </div>
                </div>

            </form>
        </div>
    );

}

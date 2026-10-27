"use client";

import React, {useState} from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icons";
import { AuthInput } from "@/components/ui/Authinput";
import { Button } from "@/components/ui";
import { object } from "zod";

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
    const handleSubmit = (e: React.FormEvent) => {
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
            newErrors.aceiteTermos = "Para continuar você precisa aceitar os Termos de Uso.";
        }
       
        setErrors(newErrors);

        //Se não houver erros, finaliza o cadastro e direciona para a tela de Sucesso
            console.log("Dados da empresa salvos com sucesso:", formData);
            
            //Redireciona o usuário para a pasta/página Dados-de-login
             if(Object.keys(newErrors).length === 0) {
            console.log("Dados de login salvos com sucesso:", formData);
            router.push("/cadastro/Sucesso")
            }
            //integração com o mock futuramente.
        }
    };
    
   

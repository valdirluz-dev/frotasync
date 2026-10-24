"use client";

import React, {useState} from "react";
import { Icon } from "@/components/ui/Icons";

//Funções utilitárias para formatação de máscara CPF e Telefone(limpar e reformatar texto em tempo real)
const formatCPF = (value: string) => {
    return value 
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1.$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits ? `+${digits}` : "";
    if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)})`;
    if (digits.length <= 9) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
};

//Validação Real do CPF
const isValidCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, "");
    if (cleanCPF.length !== 11 || /^(\d)1{10}$/.test(cleanCPF)) return false;

    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) sum += parseInt(cleanCPF.substring(i -1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder == 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

    return true;
};

export default function DadosPessoais(){
    //Estado dos campos do formulário
    const [formData, setFormData] = useState({
        nome: "",
        cpf: "",
        telefone: "",
        cargo: "",
    });

    //Estado dos erros individuais por campo
    const [errors, setErrors] = useState<{[key: string]: string }>({});

    //Manipulação e Aplicação de máscaras
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        let formattedValue =value;

        if(name == "cpf") {
            formattedValue = formatCPF(value);
        } else if (name == "telefone") {
            formattedValue = formatPhone(value);
        }

        setFormData((prev) => ({...prev, [name]: formattedValue}));

        //Limpa o erro do campo quando o utilizador começa a corrigir
        if (errors[name]){
            setErrors((prev) => ({...prev, [name]: ""}));
        }
    };

    //Submição com Validação Completa
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: {[key: string]: string} = {};

        if (!formData.nome.trim()) {
            newErrors.nome = "Digite seu nome completo"; 
        }

        if (!formData.cpf) {
            newErrors.cpf = "Digite seu CPF"; 
        } else if (!isValidCPF(formData.cpf)) {
            newErrors.cpf = "CPF inválido. Verifique os números novamente.";
        }

         if (!formData.telefone) {
            newErrors.telefone = "Digite seu número de telefone"; 
        } else if (formData.telefone.replace(/\D/g, "").length < 12) {
            newErrors.telefone = "Telefone incompleto";
        }

        if (!formData.cargo.trim()) {
            newErrors.cargo = "Digite seu cargo ou papel na empresa"; 
        }

        setErrors(newErrors);

        //Se não houver erros, prossegue com o fluxo
        if (Object.keys(newErrors).length === 0) {
            console.log("Dados salvos com sucesso:", formData);
            alert("Formulário validado com sucesso! Pronto para avançar.");
            //integração com o mock futuramente.
        }
    };
    
  

}
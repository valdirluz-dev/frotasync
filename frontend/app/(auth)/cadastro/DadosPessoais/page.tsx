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











export default function DadosPessoais(){

}
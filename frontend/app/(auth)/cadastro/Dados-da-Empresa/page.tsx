"use client";

import React, {useState} from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icons";
import { AuthInput } from "@/components/ui/Authinput";
import { Button } from "@/components/ui";

//Funções utilitárias para formatação de máscara  CNPJ (limpar e reformatar texto em tempo real)
const formatCNPJ = (value: string) => {
    return value 
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{2}).(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})(\d)/, ".$1/$2")
    .replace(/(-\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
};

//Validação Real do CNPJ
const isValidCNPJ = (cnpj: string) => {
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    if (cleanCNPJ.length !== 14 || /^(\d)1{13}$/.test(cleanCNPJ)) return false;

    let length = cleanCNPJ.length - 2;
    let numbers = cleanCNPJ.substring(0, length);
    let digits = cleanCNPJ.substring(length);
    let sum = 0;
    let pos = length - 7;
    for (let i = length; i >= 1; i--){
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
   let result = sum % 11 < 2? 0 : 11 - (sum % 11);
   if (result !== parseInt(digits.charAt(0))) return false;

   length += 1;
   numbers = cleanCNPJ.substring(0, length);
   sum = 0;
   pos = length - 7;
   for (let i = length; i >= 1; i--){
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
   }
   result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
   if (result !== parseInt(digits.charAt(1))) return false;

    return true;
};

export default function DadosEmpresa(){

    const router = useRouter();//Inicializa o router para permitir a navegação entre as páginas 

    //Estado dos campos do formulário
    const [formData, setFormData] = useState({
        nomeEmpresa: "",
        cnpj: "",
        segmento: "",
        tipoUnidade: "",
        endereco: "",
    });

        
    

}
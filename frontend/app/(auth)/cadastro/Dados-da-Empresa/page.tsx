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
        razaoSocial: "",
        cnpj: "",
        segmento: "",
        tipoUnidade: "",
        endereco: "",
    });

    //Estado dos erros individuais por campo
    const [errors, setErrors] = useState<{[key: string]: string }>({});

    //Manipulação e Aplicação de máscaras
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        let formattedValue =value;

        if(name == "cnpj") {
            formattedValue = formatCNPJ(value);
        } 

        setFormData((prev) => ({...prev, [name]: formattedValue}));

        //Limpa o erro do campo quando o usuário começa a digitar
        if (errors[name]){
            setErrors((prev) => ({...prev, [name]: ""}));
        }
    };

    //Submição com Validação Completa e redirecionamento
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: {[key: string]: string} = {};

        if (!formData.nomeEmpresa.trim()) {
            newErrors.nomeEmpresa = "Digite o nome comercial ou marca"; 
        }

        if (!formData.razaoSocial) {
            newErrors.razaoSocial = "Digite a razão social"; 
        }

        if (!formData.cnpj) {
            newErrors.cnpj = "Digite o CNPJ"; 
        } else if (!isValidCNPJ(formData.cnpj)) {
            newErrors.cnpj = "CNPJ inválido. Verifique os números novamente.";
        }

        if (!formData.segmento.trim()) {
            newErrors.segmento = "Digite o segmento da empresa"; 
        }

        if (!formData.tipoUnidade.trim()) {
            newErrors.tipoUnidade = "Digite se é Matriz ou Filial"; 
        }

         if (!formData.endereco.trim()) {
            newErrors.endereco = "Digite o endereço da empresa"; 
        }

        setErrors(newErrors);

        //Se não houver erros, valida com sucesso e direciona para a página Dados-de-Login
        if (Object.keys(newErrors).length === 0) {
            console.log("Dados da empresa salvos com sucesso:", formData);
            
            //Redireciona o usuário para a pasta/página Dados-de-login
            router.push("/cadastro/Dados-de-Login")
            //integração com o mock futuramente.
        }
    };
    
   

}
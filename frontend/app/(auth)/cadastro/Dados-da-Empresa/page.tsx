"use client";

import React, {useState} from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icons";
import { AuthInput } from "@/components/ui/Authinput";
import { Button } from "@/components/ui";
import { mockValidarDadosEmpresa } from "@/mocks/dadosEmpresa";

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
        cep: "",
        logradouro: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
    });

    //Estado dos erros individuais por campo
    const [errors, setErrors] = useState<{[key: string]: string }>({});

    //Formatação de máscara do CEP
const formatCEP = (value: string) => {
  return value
  .replace(/\D/g, "")
  .replace(/(\d{5})(\d)/, "$1-$2")
  .slice(0, 9);
};

//Função para buscar endereço automaticamente pelo CEP
const fetchAddressByCep = async (cep: string) => {
  const cleanCep = cep.replace(/\D/g, "");
  if(cleanCep.length !== 8) return;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();

    if (!data.erro) {
        setFormData((prev) => ({
            ...prev,
            logradouro: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || "",   
        }));
        setErrors((prev) => ({...prev, cep: ""}));
    } else {
        setErrors((prev) => ({...prev, cep: "CEP não encontrado."}));   
    } 
 }catch (error) {
    console.error("Erro ao buscar CEP:", error);
  }
};

    //Blur do CEP
    const handleCepBlur = (e: React.FocusEvent<HTMLInputElement>) => {
       fetchAddressByCep(e.target.value);
    };

    //Manipulação e Aplicação de máscaras
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        let formattedValue = value;

        if(name === "cnpj") {
            formattedValue = formatCNPJ(value);
        } 
        else if (name === "cep"){
            formattedValue = formatCEP(value);
        }

        setFormData((prev) => ({...prev, [name]: formattedValue}));

        //Limpa o erro do campo quando o usuário começa a digitar
        if (errors[name]){
            setErrors((prev) => ({...prev, [name]: ""}));
        }
    };

    //Submição com Validação Completa e redirecionamento
    const handleSubmit = async (e: React.FormEvent) => {
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

        if (!formData.cep.trim()) {
            newErrors.cep = "Digite o CEP"; 
        }

        if (!formData.logradouro.trim()) {
            newErrors.logradouro = "Digite o endereço"; 
        }

        if (!formData.numero.trim()) {
            newErrors.numero = "Digite o número"; 
        }

        if (!formData.bairro.trim()) {
            newErrors.bairro = "Digite o bairro"; 
        }

        setErrors(newErrors);

        //Se não houver erros, valida com sucesso e direciona para a página Dados-de-Login
        if (Object.keys(newErrors).length === 0) {
            console.log("Dados da empresa salvos com sucesso:", formData);
        
            //integração com o mock .
            
            // 1. Chama o mock (fazendo o papel da API/banco)
             const resposta = await mockValidarDadosEmpresa(formData as any);
            
                // 2. Se o mock der sucesso, avança para a próxima tela
                 if (resposta.success) {
                     router.push("/cadastro/Dados-de-Login");
                } else {
                 // 3. Se der erro, avisa o usuário
                      alert(resposta.message);
                  }
                         
        }
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

                {/*1.Nome da Empresa*/}
                <AuthInput
                label="Nome da Empresa"
                icon="tag"
                type="text"
                name="nomeEmpresa"
                value={formData.nomeEmpresa}
                onChange={handleChange}
                placeholder="*Nome comercial ou marca"
                error={errors.nomeEmpresa}
                />

                 {/*2.Razão Social*/}
                <AuthInput
                label="Razão Social"
                icon="building"
                type="text"
                name="razaoSocial"
                value={formData.razaoSocial}
                onChange={handleChange}
                placeholder="*Nome de registro oficial da empresa"
                error={errors.razaoSocial}
                />

                {/*3.CNPJ*/}
                <AuthInput
                label="CNPJ"
                icon="document"
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                placeholder="*00.000.000/0001-00"
                maxLength={18}
                error={errors.cnpj}
                />

                 {/*4.Segmento*/}
                <AuthInput
                label="Segmento"
                icon="segmento"
                type="text"
                name="segmento"
                value={formData.segmento}
                onChange={handleChange}
                placeholder="*Setor de mercado da empresa"
                error={errors.segmento}
                />

                {/*5.Tipo de Unidade*/}
                <AuthInput
                label="Tipo de Unidade"
                icon="unidade"
                type="text"
                name="tipoUnidade"
                value={formData.tipoUnidade}
                onChange={handleChange}
                placeholder="*Digite se é Matriz ou Filial"
                error={errors.tipoUnidade}
                />

                {/*6.CEP*/}
                <AuthInput
                label="CEP"
                icon="map-pin"
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                onBlur={handleCepBlur}
                placeholder="*00000-000"
                maxLength={9}
                error={errors.cep}
                />

                 {/*7.Endereço / Logradrouro*/}
                <AuthInput
                label="Endereço"
                icon="map-pin"
                type="text"
                name="logradouro"
                value={formData.logradouro}
                onChange={handleChange}
                placeholder="*Rua ou Avenida"
                error={errors.logradouro}
                />

                {/*8.Número e Bairro*/}
                <div className="flex space-x-4">
                    <div className="w-1/2">
                     <AuthInput
                        label="Número"
                        icon="map-pin"
                        type="text"
                        name="numero"
                        value={formData.numero}
                        onChange={handleChange}
                        placeholder="*Número"
                        error={errors.numero}
                      />
                    </div>
                    <div className="w-1/2">
                    <AuthInput
                        label="Bairro"
                        icon="map-pin"
                        type="text"
                        name="bairro"
                        value={formData.bairro}
                        onChange={handleChange}
                        placeholder="*Bairro"
                        error={errors.bairro}
                      />
                    </div>
                </div>
                
                   {/*Botão de Submissão/Avançar (aparece só na tela responsivel*/}
                     <div className="pt-6 block md:hidden  flex justify-center w-full">
                        <Button
                        type="submit"
                        variant="primary"
                        className="!w-55 !text-2xl"
                        >
                            Avançar
                        </Button>
                     </div>
                </div>

                
                {/*Lado direito: ilustração, stepper e botão */}
                <div className="contents md:flex md:w-1/2 md:bg-[#ECEFF4] md:p-8 md:flex-col md:items-center md:justify-between md:order-2 ">

                {/*Cabeçalho do painel*/}
                <div className="w-full bg-[#ECEFF4] md:bg-transparent p-6 md:p-0 flex flex-col items-start md:items-center order-1 border-b md:border-b-0 border-gray-200">

                    {/*Imagem da tela dados pessoais */}
                    <img src="/img/dados-empresa.png" alt="Ilustração de Cadastro" className="h-[140px] md:h-[280px] w-auto object-contain flex items-center justify-center space-x-3 mx-auto mb-4 " />

                    {/*Indicadores de passos*/}
                    <div className="flex items-center justify-center space-x-3 mx-auto mb-4">
                        <div className="w-9 h-9 md:w-11  md:h-11 rounded-full bg-gray-400 text-gray-500  flex items-center justify-center font-bold text-xl md:text-2xl shadow">1</div>
                        <div className="w-12 h-0.5 bg-gray-400"/>{/*Linha divisória */}
                        <div className="w-10 h-10 md:w-14  md:h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-3xl md:text-4xl shadow">2</div>
                        <div className="w-12 h-0.5 bg-gray-400"/>{/*Linha divisória */}
                        <div className="w-9 h-9 md:w-11  md:h-11 rounded-full bg-gray-400 text-gray-500 flex items-center justify-center font-bold text-xl md:text-2xl shadow">3</div>
                    </div>

                      {/*Título da secção*/}
                    <div className="flex items-center justify-center space-x-3 mx-auto mb-4 ">
                        <h2 className="text-4xl md:text-4xl font-bold text-gray-800">Dados da Empresa</h2>
                    </div>

                     {/*Botão de Submissão/Avançar*/}
                     <div className="pt-2 hidden md:block flex justify-center ">
                        <Button
                        type="submit"
                        variant="primary"
                        className="!w-55 !text-2xl"
                        >
                            Avançar
                        </Button>
                     </div>

                </div>
                </div>

            </form>
        </div>
    );

}
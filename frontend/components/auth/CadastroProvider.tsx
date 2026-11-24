"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import type { CadastroPessoalValues } from "@/schemas/cadastroPessoal";
import type { CadastroEmpresaValues } from "@/schemas/cadastroEmpresa";

type CadastroContextValue = {
  pessoais: CadastroPessoalValues;
  setPessoais: Dispatch<SetStateAction<CadastroPessoalValues>>;
  empresa: CadastroEmpresaValues;
  setEmpresa: Dispatch<SetStateAction<CadastroEmpresaValues>>;
  limparCadastro: () => void;
};

const pessoaisIniciais: CadastroPessoalValues = {
  nome: "",
  cpf: "",
  telefone: "",
  cargo: "",
};

const empresaInicial: CadastroEmpresaValues = {
  nomeEmpresa: "",
  razaoSocial: "",
  cnpj: "",
  segmento: "",
  tipoUnidade: "",
  cep: "",
  estado: "",
  cidade: "",
  bairro: "",
  logradouro: "",
  numero: "",
};

const CadastroContext = createContext<CadastroContextValue | null>(null);

export function CadastroProvider({ children }: { children: ReactNode }) {
  const [pessoais, setPessoais] = useState(pessoaisIniciais);
  const [empresa, setEmpresa] = useState(empresaInicial);

  function limparCadastro() {
    setPessoais(pessoaisIniciais);
    setEmpresa(empresaInicial);
  }

  return (
    <CadastroContext.Provider
      value={{ pessoais, setPessoais, empresa, setEmpresa, limparCadastro }}
    >
      {children}
    </CadastroContext.Provider>
  );
}

export function useCadastro() {
  const context = useContext(CadastroContext);

  if (!context) {
    throw new Error("useCadastro deve ser utilizado dentro de CadastroProvider.");
  }

  return context;
}

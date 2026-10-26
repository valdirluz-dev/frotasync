"use client";

import React, {useState} from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icons";
import { AuthInput } from "@/components/ui/Authinput";
import { Button } from "@/components/ui";

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


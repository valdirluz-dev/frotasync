"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthInput } from "@/components/ui/Authinput";
import { Button } from "@/components/ui";
import { Icon } from "@/components/ui/Icons";

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
    const handleSubmit = (e: React.FormEvent) => {
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
            // router.push("/dashboard");
        }
    };

    
}

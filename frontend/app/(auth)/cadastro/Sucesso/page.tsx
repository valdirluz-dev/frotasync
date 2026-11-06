"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Sucesso() {
    const router = useRouter();

    // Redirecionamento configurado para 8 segundos
    
    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/login");
        }, 8000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center relative overflow-hidden p-4">
            {/* Elementos de fundo */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* Círculo superior esquerdo */}
                <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-700" />
                
                {/* Círculo superior direito */}
                <div className="absolute -top-10 right-2 h-64 w-64 rounded-full bg-blue-700" />

                {/* Círculo inferior esquerdo */}
                <div className="absolute left-10 -bottom-20 h-64 w-64 rounded-full bg-blue-700" />

                {/* Círculo inferior direito */}
                <div className="absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-blue-700" />
            </div>

            {/* Container Principal: FORÇADO SEMPRE LADO A LADO (flex-row fixo) */}
            <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-row min-h-[480px]">
                
                {/* Lado Esquerdo: Mensagem de Sucesso (Ocupa exatamente 50%) */}
                <div className="w-1/2 p-8 md:p-12 flex flex-col justify-center items-center text-center bg-gray-200/60">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-4">
                        Cadastro realizado com sucesso!
                    </h1>
                    <p className="text-gray-700 text-sm md:text-base max-w-xs font-medium">
                        Sua conta foi criada. Você será redirecionado para tela de login em alguns segundos.
                    </p>
                </div>

                {/* Lado Direito: Ilustração no fundo cinza (Ocupa exatamente 50%) */}
                <div className="w-1/2 bg-gray-300/60 p-8 flex flex-col items-center justify-center relative">
                    <div className="flex items-center justify-center w-full h-full">
                        <img 
                            src="/img/sucesso.png" 
                            alt="Ilustração de Cadastro" 
                            className="h-[180px] md:h-[300px] w-auto object-contain mx-auto" 
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
import { forwardRef, type InputHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icons";

// Definição das propriedades aceitas pelo componente de input
export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon?: IconName;
    label?: string;
    error?: string;
}

//Componente principal de input estilizado com suporte a ícones, rótulos e estados de erro
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
    function AuthInput({ icon, label, error, className = "", ...props }, ref) { 
        return (
            <div className="flex flex-col w-full">
                {label && (
                    <label className="block text-sm font-bold text-gray-900 mb-1">
                        {label}
                    </label>
                )}
                  
                {/*Contentor relativo para posicionar o ícone sobreposto ao campo */}
                <div className="relative flex items-center w-full">
                    {/*Redenriza o ícone alinhado á esquerda e centrado na vertical */}
                    {icon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-500 pointer-events-none z-10">
                            <Icon name={icon} className="w-5 h-5" />
                        </span>
                    )}

                    {/*Campo de texto com estilos dinâmicos baseados no estado de erro */}
                    <input
                        {...props}
                        ref={ref} 
                        className={`w-full rounded-md border p-3 text-sm text-gray-800 placeholder-gray-500 outline-none transition focus:bg-white ${
                            error 
                                ? "border-red-500 bg-red-50 focus:border-red-500" 
                                : "border-gray-300 bg-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        } ${icon ? "pl-11" : "px-3"} ${className}`}
                    />
                </div>

                {/* Exibe a mensagem de erro abaixo do input se ela existir */}
                {error && (
                    <span className="text-xs text-red-500 mt-1 block font-medium">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

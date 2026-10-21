import { forwardRef, type InputHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icons";

//Definição das propiedades aceitas pelo componente de autenticação.
export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement>{
    icon?: IconName;
    label?: string;
}
//Componente principal de input estilizado para o fluxo de Auth (login, cadastro e recuperação).
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
    function AuthInput({icon, label, className = "", ...props}, ref) {
        return(
            <div className="flex flex-col gap-1.5 w-full">
                {/*Rederiza e etiqueta (label) se for passada no componente */}
                {label &&(
                    <label className="text-sm font-medium text-slate-700">
                        {label}
                    </label>
                )}

                {/*Contentor relativo para permitir posicionar o ícone sobreposto ao campo de texto */}
                <div className="relative flex items-center w-full">
                    {/*Renderiza o ícone alinhado á esquerda se for especificado */}
                    {icon && (
                        <span className="absolute left-4 text-slate-400 flex items-center pointer-events-none z-10">
                            <Icon name={icon}/>
                        </span>
                    )}

                    {/*Campo de texto (input html) utilizando o estilo padrão do projeto*/}
                    {/*adiciona espaçamento á esquerda (pl-12) apenas quando houver um ícone presente*/}
                    <input {...props}
                     ref={ref} 
                     className={`h-13 w-full rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-100 ${
                        icon ? "pl-12" : "px-4"
                    } ${className}`}
                    />
                    
                </div>
            </div>
        );
    }
);

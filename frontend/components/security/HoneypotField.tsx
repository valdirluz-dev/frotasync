import React from "react";

//Define as propriedades(props) que o componente recebe do formulario pai.
interface HoneypotProps {
    value : string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function HoneyPotField({ value, onChange }: HoneypotProps) {
    return (
        <div
          style={{
            position: 'absolute' , //Joga o elemento para fora da tela (invisível)
            left: '-9999px' , //Afasta o elemento horizontalmente
            width: '1px', //Mantém o tamanho mínimo
            height: '1px', //Mantém a altura mínima
            overflow: 'hidden', //Esconde qualquer conteúdo extra
        }}
        aria-hidden="true"  //Faz o navegador ignorar este elemento
        >

        <label htmlFor="website_url">Website</label>
        <input
        type="text"
        id="website_url"
        name="website"
        className="h-10 w-full border border-gray-300 px-3 text-gray-900"
        value={value}
        onChange={onChange}
        tabIndex={-1} //Remove o campo da navegação por tab
        autoComplete="new-password" //Evita o auto-preenchimento do navegador
        />
        </div>
    );
}
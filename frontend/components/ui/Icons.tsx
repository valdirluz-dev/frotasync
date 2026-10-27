import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "dashboard"
  | "units"
  | "settings"
  | "search"
  | "bell"
  | "help"
  | "chevron"
  | "menu"
  | "truck"
  | "edit"
  | "plus"
  | "left"
  | "right"
  | "document" //Novo Icon 
  | "building" //Novo Icon
  | "tasks" //Novo Icon
//---Novos ícones para Login, Cadastro e Recuperação de senha---
  | "email" //Ícone email
  | "lock" //Ícone senha
  | "user" //Ícone nome
  | "id-card" //Ícone CPF
  | "unidade" //Ícone unidade
  | "phone" //Ícone telefone
  | "briefcase" //Ícone cargo
  | "tag" //Ícone empresa
  | "cnpj" //Ícone CNPJ
  | "segmento" //Ícone segmento
  | "map-pin" //Ícone endereço
  | "key" //Ícone código
  | "eye" //Ícone olho aberto
  | "eye-off"; //Ícone olho fechado

type IconProps = SVGProps<SVGSVGElement> & { name: IconName };

export function Icon({ name, ...props }: IconProps) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
  };
  const paths: Record<IconName, ReactNode> = {
    dashboard: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
        <rect x="13.5" y="3.5" width="7" height="4" rx="1.2" />
        <rect x="13.5" y="10.5" width="7" height="10" rx="1.2" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      </>
    ),
    units: (
      <>
        <path d="M3.5 20.5h17M5.5 20V5.4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1V20M8.5 8h2m3 0h2m-7 4h2m3 0h2m-7 4h2m3 0h2" />
        <path d="M10 20v-3h4v3" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path
          d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z"
          transform="translate(-.2 1) scale(.96)"
        />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.4" />
        <path d="m16 16 4.2 4.2" />
      </>
    ),
    bell: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.7 9a2.4 2.4 0 1 1 4.3 1.5c-.9 1-2 1.3-2 2.8m0 3h.01" />
      </>
    ),
    chevron: <path d="m7 9 5 5 5-5" />,
    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),
    truck: (
      <>
        <path d="M2.5 7h12v10h-12zM14.5 10h4l3 3v4h-7z" />
        <circle cx="7" cy="18" r="1.7" />
        <circle cx="18" cy="18" r="1.7" />
      </>
    ),
    edit: (
      <>
        <path d="m14 5 5 5M4 20l4-.8L19.2 8a2.1 2.1 0 0 0-3-3L5 16.2 4 20Z" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    left: (
      <>
        <path d="M19 12H5m7 7-7-7 7-7" />
      </>
    ),
    right: (
      <>
        <path d="M5 12h14m-7-7 7 7-7 7" />
      </>
    ),
      document: (
    <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
    </>
   ),
   tasks: (
    <>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 11l1 1 2-2" />
    <line x1="14" y1="11" x2="17" y2="11" />
    <path d="M9 16l1 1 2-2" />
    <line x1="14" y1="16" x2="17" y2="16" />
    </>
   ),
   email: (
      <>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </>
    ),
    lock: (
      <>
        <rect width="14" height="10" x="5" y="11" rx="2" fill="currentColor" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 14.5v3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
    user: (
    <>
       <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  "id-card": (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="8" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M4 16v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="14" y1="9" x2="19" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="13" x2="19" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
   
    "unidade": (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.59 13.51 6.83 3.98" />
        <path d="m15.42 6.51-6.83 3.98" />
      </>
    ),
    phone: (
      <>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </>
    ),
    briefcase: (
      <>
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </>
    ),
    tag: (
      <>
        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l4.58-4.58a2.426 2.426 0 0 0 0-3.42z" />
        <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
      </>
    ),
    building: (
      <>
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
        <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
      </>
    ),
    cnpj: (
      <>
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z" />
        <path d="M7 8h10M7 12h10M7 16h6" />
      </>
    ),
    segmento: (
      <>
        <path d="M3 20h18"/>
        <rect x="5" y="9" width="3" height="8" rx="0.5"/>
        <rect x="10" y="5" width="3" height="12" rx="0.5"/>
        <rect x="15" y="1" width="3" height="16" rx="0.5"/>
      </>
    ),
    "map-pin": (
      <>
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    key: (
      <>
        <circle cx="7.5" cy="15.5" r="5.5" />
        <path d="m21 2-9.6 9.6M15.5 7.5l3 3M17 6l1 1" />
      </>
    ),
    "eye": (
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    "eye-off": (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 5c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ),
  };
  
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      {...common}
      {...props}>
      {paths[name]}
    </svg>
  );
}

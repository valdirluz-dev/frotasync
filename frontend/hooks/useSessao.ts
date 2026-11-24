"use client";

import { useEffect, useState } from "react";
import { http } from "@/lib/http";
import type { PerfilUsuario, UsuarioSessao } from "@/types/domain";

interface SessaoResponse {
  usuario: {
    nome: string;
    perfil: "colaborador" | "gestor" | "administrador";
    email: string;
    cargo: string;
    id: string;
    cpf: string;
    telefone: string;
    empresaId: string;
    criadoEm: string;
  };
  empresa: {
    id: string;
    nomeEmpresa: string;
    razaoSocial: string;
    cnpj: string;
    segmento: string;
    tipoUnidade: "matriz" | "filial";
    endereco: unknown;
    criadoEm: string;
  };
}

export function useSessao() {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    http<SessaoResponse>("/auth/me")
      .then((sessao) => {
        if (active) {
          const perfis: Record<string, PerfilUsuario> = {
            colaborador: "Colaborador",
            gestor: "Gestor",
            administrador: "Administrador",
          };
          setUsuario({
            nome: sessao.usuario.nome,
            perfil: perfis[sessao.usuario.perfil] ?? "Colaborador",
            email: sessao.usuario.email,
            cargo: sessao.usuario.cargo,
          });
        }
      })
      .catch(() => {
        if (active) {
          setUsuario(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { usuario, loading };
}

import type { Notificacao } from "@/types/domain";

function minutosAtras(minutos: number): string {
  return new Date(Date.now() - minutos * 60_000).toISOString();
}

export const mockNotificacoes: Notificacao[] = [
  {
    id: "notif-001",
    titulo: "Documento próximo do vencimento",
    descricao: "A Licença Ambiental vence em breve.",
    categoria: "documento_proximo_vencimento",
    criadaEm: minutosAtras(5),
    lida: false,
    destino: "/documentos/doc-002/editar",
  },
  {
    id: "notif-002",
    titulo: "Documento vencido",
    descricao: "O Certificado de Bombeiros está vencido.",
    categoria: "documento_vencido",
    criadaEm: minutosAtras(15),
    lida: false,
    destino: "/documentos/doc-003/editar",
  },
  {
    id: "notif-003",
    titulo: "Tarefa pendente",
    descricao: "A tarefa Repor extintores continua pendente.",
    categoria: "tarefa_pendente",
    criadaEm: minutosAtras(30),
    lida: true,
    destino: "/tarefas/task-003/editar",
  },
  {
    id: "notif-004",
    titulo: "Prazo de tarefa próximo",
    descricao: "O prazo de Agendar vistoria técnica está próximo.",
    categoria: "prazo_tarefa_proximo",
    criadaEm: minutosAtras(45),
    lida: false,
    destino: "/tarefas/task-006/editar",
  },
];

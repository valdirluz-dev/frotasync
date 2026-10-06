import type { Documento, Tarefa, Unidade } from "@/types/dashboard";

const units: Unidade[] = [
  { id: "u-001", codigo: "001", nome: "Recife Centro", status: "Ativa" },
  { id: "u-002", codigo: "002", nome: "Boa Viagem", status: "Ativa" },
  { id: "u-003", codigo: "003", nome: "Olinda", status: "Ativa" },
  { id: "u-004", codigo: "004", nome: "Jaboatão", status: "Ativa" },
  { id: "u-005", codigo: "005", nome: "Caruaru", status: "Ativa" },
  { id: "u-006", codigo: "006", nome: "Paulista", status: "Ativa" },
  {
    id: "u-007",
    codigo: "007",
    nome: "Cabo de Santo Agostinho",
    status: "Ativa",
  },
  { id: "u-008", codigo: "008", nome: "Petrolina", status: "Ativa" },
  { id: "u-009", codigo: "009", nome: "Garanhuns", status: "Ativa" },
  { id: "u-010", codigo: "010", nome: "Igarassu", status: "Ativa" },
  { id: "u-011", codigo: "011", nome: "Arcoverde", status: "Inativa" },
  {
    id: "u-012",
    codigo: "012",
    nome: "Vitória de Santo Antão",
    status: "Inativa",
  },
];

const docSeeds = [
  ["Alvará de funcionamento", "Legal", 140],
  ["Licença Ambiental", "Ambiental", 8],
  ["Certificado de Bombeiros", "Segurança", -12],
  ["Certidão Negativa de Débitos", "Fiscal", 230],
  ["Contrato de Locação", "Contratual", 85],
  ["Laudo Técnico (Elétrica)", "Técnica", 320],
  ["AVCB - Auto de Vistoria", "Segurança", 190],
  ["Licença Sanitária", "Sanitária", 14],
  ["Registro no Conselho", "Técnica", 410],
  ["Seguro Patrimonial", "Contratual", 175],
  ["Registro na ANTT", "Fiscal", 5],
  ["Seguro de Carga", "Contratual", -35],
  ["Certificado de Dedetização", "Sanitária", 11],
  ["Licença de Operação", "Ambiental", 95],
  ["Alvará do Pátio", "Legal", -2],
  ["Certificado de Manutenção", "Técnica", 60],
] as const;

const taskSeeds = [
  ["Renovar alvará de funcionamento", "Concluída"],
  ["Enviar relatório mensal", "Em andamento"],
  ["Repor extintores", "Pendente"],
  ["Revisar licença ambiental", "Concluída"],
  ["Atualizar cadastro da unidade", "Em andamento"],
  ["Agendar vistoria técnica", "Pendente"],
  ["Conferir seguro patrimonial", "Concluída"],
  ["Regularizar documentação fiscal", "Pendente"],
  ["Validar certificado de bombeiros", "Em andamento"],
  ["Concluir checklist operacional", "Concluída"],
  ["Solicitar renovação da licença", "Pendente"],
  ["Enviar comprovantes de manutenção", "Em andamento"],
  ["Revisar contratos vigentes", "Concluída"],
  ["Organizar documentos da filial", "Pendente"],
  ["Atualizar laudo elétrico", "Concluída"],
  ["Preparar auditoria trimestral", "Em andamento"],
] as const;

function dateOffset(days: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export const mockUnidades = units;
export const mockCategorias = [
  ...new Set(docSeeds.map(([, categoria]) => categoria)),
];

export const mockDocumentos: Documento[] = Array.from(
  { length: 128 },
  (_, index) => {
    const [nome, categoria, baseValidityOffset] =
      docSeeds[index % docSeeds.length];
    const cycle = Math.floor(index / docSeeds.length);
    const validityOffset =
      baseValidityOffset > 15
        ? baseValidityOffset + (cycle % 3) * 17
        : baseValidityOffset;

    return {
      id: `doc-${String(index + 1).padStart(3, "0")}`,
      nome,
      categoria,
      unidadeId: units[index % units.length].id,
      dataEmissao: dateOffset(-365 - (index % 90)),
      dataValidade: dateOffset(validityOffset),
    };
  },
);

export const mockTarefas: Tarefa[] = Array.from({ length: 128 }, (_, index) => {
  const [titulo, status] = taskSeeds[index % taskSeeds.length];
  const startOffset = -((index % 70) + 1);
  const completed = status === "Concluída";

  return {
    id: `task-${String(index + 1).padStart(3, "0")}`,
    titulo,
    unidadeId: units[index % units.length].id,
    dataInicio: dateOffset(startOffset),
    prazoFinal: dateOffset(startOffset + (index % 24) + 3),
    status,
    dataConclusao: completed ? dateOffset(startOffset + 2) : null,
  };
});

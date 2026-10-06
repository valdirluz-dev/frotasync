import type {
  Documento,
  Tarefa,
  Unidade,
  UnidadeStatus,
} from "../types/dashboard";

type UnidadeSeed = [
  nome: string,
  status: UnidadeStatus,
  cidade: string,
  logradouro: string,
  numero: string,
  bairro: string,
];

const unitSeeds: UnidadeSeed[] = [
  [
    "Recife Centro",
    "Ativa",
    "Recife",
    "Av. Conde da Boa Vista",
    "120",
    "Boa Vista",
  ],
  [
    "Boa Viagem",
    "Ativa",
    "Recife",
    "Av. Domingos Ferreira",
    "1850",
    "Boa Viagem",
  ],
  ["Olinda", "Ativa", "Olinda", "Av. Getúlio Vargas", "640", "Bairro Novo"],
  [
    "Jaboatão",
    "Ativa",
    "Jaboatão dos Guararapes",
    "Av. Barreto de Menezes",
    "315",
    "Prazeres",
  ],
  [
    "Caruaru",
    "Inativa",
    "Caruaru",
    "Av. Agamenon Magalhães",
    "720",
    "Maurício de Nassau",
  ],
  ["Paulista", "Ativa", "Paulista", "Av. Sen. Salgado Filho", "98", "Centro"],
  [
    "Cabo de Santo Agostinho",
    "Ativa",
    "Cabo de Santo Agostinho",
    "Rod. PE-60",
    "1250",
    "Garapu",
  ],
  [
    "Petrolina",
    "Ativa",
    "Petrolina",
    "Av. Monsenhor Ângelo Sampaio",
    "410",
    "Areia Branca",
  ],
  ["Garanhuns", "Ativa", "Garanhuns", "Av. Rui Barbosa", "155", "Heliópolis"],
  ["Igarassu", "Inativa", "Igarassu", "Rua Barbosa Lima", "82", "Centro"],
  [
    "Arcoverde",
    "Inativa",
    "Arcoverde",
    "Av. Cel. Antônio Japiassu",
    "520",
    "Centro",
  ],
  [
    "Vitória de Santo Antão",
    "Ativa",
    "Vitória de Santo Antão",
    "Av. Mariana Amália",
    "340",
    "Matriz",
  ],
  ["Camaragibe", "Ativa", "Camaragibe", "Av. Belmino Correia", "905", "Timbi"],
  [
    "Serra Talhada",
    "Ativa",
    "Serra Talhada",
    "Av. Miguel Nunes de Souza",
    "270",
    "Nossa Senhora da Penha",
  ],
  ["Gravatá", "Inativa", "Gravatá", "Av. Agamenon Magalhães", "615", "Prado"],
  [
    "Abreu e Lima",
    "Ativa",
    "Abreu e Lima",
    "Av. Duque de Caxias",
    "188",
    "Centro",
  ],
  [
    "São Lourenço da Mata",
    "Ativa",
    "São Lourenço da Mata",
    "Av. Oito de Maio",
    "450",
    "Centro",
  ],
  ["Ipojuca", "Ativa", "Ipojuca", "PE-038", "1110", "Centro"],
  [
    "Bezerros",
    "Inativa",
    "Bezerros",
    "Av. Major Aprígio da Fonseca",
    "380",
    "São Sebastião",
  ],
  [
    "Santa Cruz do Capibaribe",
    "Inativa",
    "Santa Cruz do Capibaribe",
    "Av. 29 de Dezembro",
    "225",
    "Centro",
  ],
  ["Araripina", "Ativa", "Araripina", "Rua Santana", "760", "Centro"],
  ["Ouricuri", "Ativa", "Ouricuri", "Av. Fernando Bezerra", "130", "Centro"],
  [
    "Salgueiro",
    "Ativa",
    "Salgueiro",
    "Av. Agamenon Magalhães",
    "515",
    "Nossa Senhora das Graças",
  ],
  [
    "Pesqueira",
    "Ativa",
    "Pesqueira",
    "Rua Anápio Gomes de Andrade",
    "94",
    "Centro",
  ],
  [
    "Belo Jardim",
    "Inativa",
    "Belo Jardim",
    "Av. Deputado José Mendonça",
    "320",
    "Centro",
  ],
  ["Escada", "Ativa", "Escada", "Rua João Manoel Pontual", "180", "Centro"],
  ["Goiana", "Ativa", "Goiana", "Av. Nunes Machado", "845", "Centro"],
  [
    "Palmares",
    "Ativa",
    "Palmares",
    "Av. Visconde do Rio Branco",
    "402",
    "Centro",
  ],
  ["Limoeiro", "Inativa", "Limoeiro", "Rua da Matriz", "73", "Centro"],
  ["Timbaúba", "Ativa", "Timbaúba", "Av. Ferreira Lima", "291", "Centro"],
  ["Surubim", "Ativa", "Surubim", "Rua João Batista", "640", "São José"],
  [
    "Afogados da Ingazeira",
    "Ativa",
    "Afogados da Ingazeira",
    "Av. Manoel Borba",
    "210",
    "Centro",
  ],
  ["Buíque", "Ativa", "Buíque", "Rua Cel. José de Souza", "101", "Centro"],
  [
    "São Bento do Una",
    "Inativa",
    "São Bento do Una",
    "Av. Manoel Cândido",
    "370",
    "Centro",
  ],
  [
    "Lagoa Grande",
    "Ativa",
    "Lagoa Grande",
    "Av. Miguel Arraes",
    "88",
    "Centro",
  ],
];

const units: Unidade[] = unitSeeds.map(
  ([nome, status, cidade, logradouro, numero, bairro], index) => ({
    id: `u-${String(index + 1).padStart(3, "0")}`,
    codigo: String(index + 1).padStart(3, "0"),
    nome,
    status,
    endereco: { logradouro, numero, bairro, cidade, uf: "PE" },
  }),
);

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

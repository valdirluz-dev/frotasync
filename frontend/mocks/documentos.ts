import { wait } from "@/lib/mockApi";
import { generateMockDocumentos } from "@/mocks/factories/documentos";
import { mockUnidades } from "@/mocks/unidades";
import type { Documento } from "@/types/domain";

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

const pdfsMock = [
  "/mock-docs/alvara-funcionamento.pdf",
  "/mock-docs/licenca-ambiental.pdf",
  "/mock-docs/certificado-bombeiros.pdf",
];

export const mockCategorias = [
  ...new Set(docSeeds.map(([, categoria]) => categoria)),
];

export const mockDocumentos: Documento[] = generateMockDocumentos(
  mockUnidades,
  docSeeds,
  pdfsMock,
);

export async function fetchMockDocumentos(): Promise<Documento[]> {
  await wait(300 + Math.floor(Math.random() * 301));
  return mockDocumentos;
}

import type { DocumentoFormValues } from "@/schemas/documento";

export const mockNovoDocumento: DocumentoFormValues = {
  nome: "Licença Ambiental",
  unidadeId: "u-002",
  categoria: "Licença Ambiental",
  dataEmissao: "",
  dataValidade: "2027-12-31",
  descricao: "Documento de teste para cadastro.",
};

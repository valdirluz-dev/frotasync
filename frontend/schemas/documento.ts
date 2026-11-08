import { z } from "zod";

export const documentoSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe o nome do documento.").max(150, "O nome do documento deve ter até 150 caracteres."),
    categoria: z.string().trim().min(1, "Selecione a categoria."),
    dataEmissao: z.string().min(1, "Informe a data de emissão."),
    dataValidade: z.string().min(1, "Informe a data de vencimento."),
    descricao: z.string().trim().max(500, "A descrição deve ter até 500 caracteres.").optional(),
    anexo: z.custom<File>((value) => typeof File !== "undefined" && value instanceof File, "Selecione um arquivo válido.").optional(),
  })
  .superRefine((value, ctx) => {
    if (value.dataEmissao && value.dataValidade && value.dataEmissao > value.dataValidade) {
      ctx.addIssue({ code: "custom", path: ["dataEmissao"], message: "A emissão não pode ser posterior ao vencimento." });
    }
    if (value.anexo) {
      const allowed = ["application/pdf", "image/jpeg", "image/png"];
      const max = 10 * 1024 * 1024;
      if (!allowed.includes(value.anexo.type)) {
        ctx.addIssue({ code: "custom", path: ["anexo"], message: "Envie um PDF, JPG ou PNG." });
      }
      if (value.anexo.size > max) {
        ctx.addIssue({ code: "custom", path: ["anexo"], message: "O arquivo deve ter no máximo 10 MB." });
      }
    }
  });

export type DocumentoFormInput = z.input<typeof documentoSchema>;
export type DocumentoFormValues = z.output<typeof documentoSchema>;

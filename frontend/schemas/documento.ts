import { z } from "zod";

const anexoFileSchema = z.custom<File>(
  (value) => typeof File !== "undefined" && value instanceof File,
  "Selecione um arquivo válido.",
);

const documentoFields = {
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome do documento.")
    .max(150, "O nome do documento deve ter até 150 caracteres."),
  unidadeId: z.string().min(1, "Selecione uma unidade."),
  categoria: z
    .string()
    .trim()
    .min(1, "Selecione a categoria.")
    .max(40, "A categoria deve ter até 40 caracteres."),
  dataEmissao: z
    .union([
      z.literal(""),
      z.iso.date({ error: "Informe uma data de emissão válida." }),
    ])
    .optional(),
  dataValidade: z.iso.date({ error: "Informe a data de vencimento válida." }),
  descricao: z
    .string()
    .trim()
    .max(500, "A descrição deve ter até 500 caracteres.")
    .optional(),
  anexo: anexoFileSchema.optional(),
};

function validarDocumento(
  value: {
    dataEmissao?: string;
    dataValidade: string;
    anexo?: File;
  },
  ctx: z.RefinementCtx,
) {
  if (
    value.dataEmissao &&
    value.dataValidade &&
    value.dataEmissao > value.dataValidade
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["dataEmissao"],
      message: "A emissão não pode ser posterior ao vencimento.",
    });
  }

  if (!value.anexo) return;

  if (!["application/pdf", "image/jpeg", "image/png"].includes(value.anexo.type)) {
    ctx.addIssue({
      code: "custom",
      path: ["anexo"],
      message: "Envie um PDF, JPG ou PNG.",
    });
  }
  if (value.anexo.size > 10 * 1024 * 1024) {
    ctx.addIssue({
      code: "custom",
      path: ["anexo"],
      message: "O arquivo deve ter no máximo 10 MB.",
    });
  }
}

export const documentoSchema = z
  .object(documentoFields)
  .superRefine(validarDocumento);

export const documentoCadastroSchema = z
  .object({
    ...documentoFields,
    anexo: anexoFileSchema,
  })
  .superRefine(validarDocumento);

export type DocumentoFormInput = z.input<typeof documentoSchema>;
export type DocumentoFormValues = z.output<typeof documentoSchema>;

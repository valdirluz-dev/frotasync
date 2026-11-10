import type { Documento, Unidade } from "@/types/domain";
import { dateOffset } from "@/utils/date";

type DocumentoSeed = readonly [nome: string, categoria: string, dias: number];

export function generateMockDocumentos(
  unidades: readonly Unidade[],
  seeds: readonly DocumentoSeed[],
  pdfs: readonly string[],
): Documento[] {
  return Array.from({ length: 128 }, (_, index) => {
    const [nome, categoria] = seeds[index % seeds.length];
    const unidadeIndex = index % unidades.length;
    const unitDocumentIndex = Math.floor(index / unidades.length);
    const statusIndex = (unidadeIndex + unitDocumentIndex) % 3;
    const validityOffset =
      statusIndex === 0
        ? 45 + (unidadeIndex % 30)
        : statusIndex === 1
          ? 1 + (unidadeIndex % 14)
          : -(1 + (unidadeIndex % 35));

    return {
      id: `doc-${String(index + 1).padStart(3, "0")}`,
      nome,
      categoria,
      unidadeId: unidades[unidadeIndex].id,
      dataEmissao: dateOffset(-365 - (index % 90)),
      dataValidade: dateOffset(validityOffset),
      descricao: `Documento ${nome.toLocaleLowerCase("pt-BR")} da unidade ${unidades[unidadeIndex].nome}.`,
      anexo: {
        nome: `${nome}.pdf`,
        tamanhoBytes: 420_000 + (index % 9) * 73_000,
        tipo: "application/pdf",
        url: pdfs[index % pdfs.length],
      },
    };
  });
}

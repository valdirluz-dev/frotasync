import { Select } from "@/components/ui/Select";
import { UF_SIGLAS } from "@/types/dashboard";
import type { SelectHTMLAttributes } from "react";

export function UnidadeSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Select {...props}>
      <option value="">Selecione a UF</option>
      {UF_SIGLAS.map((uf) => (
        <option key={uf} value={uf}>
          {uf}
        </option>
      ))}
    </Select>
  );
}

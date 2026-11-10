import {
  RecursoJaExisteError,
  RecursoNaoEncontradoError,
} from "@/lib/errors";
import { wait } from "@/lib/mockApi";
import type { Repository } from "@/repositories/contracts";

export function createMemoryRepository<
  T extends { id: string },
  TCreate = Omit<T, "id">,
>(
  records: T[],
  createRecord: (input: TCreate, records: readonly T[]) => T,
): Repository<T, TCreate> {
  return {
    async list() {
      await wait();
      return [...records];
    },
    async findById(id) {
      await wait(120);
      return records.find((record) => record.id === id) ?? null;
    },
    async insert(input) {
      await wait();
      const value = createRecord(input, records);
      if (records.some((record) => record.id === value.id)) {
        throw new RecursoJaExisteError("Recurso");
      }
      records.push(value);
      return value;
    },
    async update(value) {
      await wait();
      const index = records.findIndex((record) => record.id === value.id);
      if (index < 0) throw new RecursoNaoEncontradoError("Recurso");
      records[index] = value;
      return value;
    },
    async remove(id) {
      await wait();
      const index = records.findIndex((record) => record.id === id);
      if (index < 0) return false;
      records.splice(index, 1);
      return true;
    },
  };
}

export function nextNumericId<T extends { id: string }>(
  prefix: string,
  records: readonly T[],
): string {
  const expression = new RegExp(`^${prefix}-(\\d+)$`);
  const next = records.reduce((maximum, record) => {
    const matched = expression.exec(record.id);
    return Math.max(maximum, matched ? Number(matched[1]) : 0);
  }, 0) + 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

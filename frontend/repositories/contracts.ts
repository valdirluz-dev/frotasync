import type {
  Documento,
  Tarefa,
  Unidade,
} from "@/types/domain";

export interface Repository<T extends { id: string }, TCreate = Omit<T, "id">> {
  list(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  insert(value: TCreate): Promise<T>;
  update(value: T): Promise<T>;
  remove(id: string): Promise<boolean>;
}

export type UnidadesRepository = Repository<Unidade>;
export interface DocumentosRepository extends Repository<Documento> {
  listCategories(): Promise<string[]>;
}
export type TarefasRepository = Repository<Tarefa>;

export type DataRepositories = Readonly<{
  unidades: UnidadesRepository;
  documentos: DocumentosRepository;
  tarefas: TarefasRepository;
}>;

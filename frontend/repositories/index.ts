import { demoRepositories } from "@/repositories/demo";

export type {
  DataRepositories,
  DocumentosRepository,
  Repository,
  TarefasRepository,
  UnidadesRepository,
} from "./contracts";

export const repositories = demoRepositories;

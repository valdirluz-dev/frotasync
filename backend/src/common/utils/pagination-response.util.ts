import { PaginationMeta } from './pagination.util';

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function createPaginatedResponse<T>(
  items: T[],
  meta: PaginationMeta,
): PaginatedResponse<T> {
  return {
    items,
    page: meta.page,
    pageSize: meta.pageSize,
    total: meta.total,
    totalPages: meta.totalPages,
  };
}

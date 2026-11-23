export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function calculatePagination(
  params: PaginationParams,
  total: number,
): PaginationMeta & { skip: number; take: number } {
  const totalPages = Math.max(1, Math.ceil(total / params.pageSize));
  const page = Math.min(params.page, totalPages);

  return {
    page,
    pageSize: params.pageSize,
    total,
    totalPages,
    skip: (page - 1) * params.pageSize,
    take: params.pageSize,
  };
}

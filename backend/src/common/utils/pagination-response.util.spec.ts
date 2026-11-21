import { createPaginatedResponse } from './pagination-response.util';

describe('createPaginatedResponse', () => {
  it('should return the correct paginated response structure', () => {
    const items = [{ id: 1, nome: 'Empresa A' }, { id: 2, nome: 'Empresa B' }];

    const meta = {
      page: 1,
      pageSize: 20,
      total: 45,
      totalPages: 3,
    };

    expect(createPaginatedResponse(items, meta)).toEqual({
      items,
      page: 1,
      pageSize: 20,
      total: 45,
      totalPages: 3,
    });
  });

  it('should preserve the received items', () => {
    const items = [{ id: 10, nome: 'FrotaSync' }];

    const meta = {
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    };

    const result = createPaginatedResponse(items, meta);

    expect(result.items).toBe(items);
  });

  it('should handle empty items', () => {
    const meta = {
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1,
    };

    expect(createPaginatedResponse([], meta)).toEqual({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1,
    });
  });
});

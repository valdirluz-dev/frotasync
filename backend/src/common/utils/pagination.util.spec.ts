import { calculatePagination } from './pagination.util';

describe('calculatePagination', () => {
  it('should calculate the first page correctly', () => {
    expect(calculatePagination({ page: 1, pageSize: 20 }, 45)).toEqual({
      page: 1,
      pageSize: 20,
      total: 45,
      totalPages: 3,
      skip: 0,
      take: 20,
    });
  });

  it('should calculate the second page correctly', () => {
    expect(calculatePagination({ page: 2, pageSize: 20 }, 45)).toEqual({
      page: 2,
      pageSize: 20,
      total: 45,
      totalPages: 3,
      skip: 20,
      take: 20,
    });
  });

  it('should clamp page above the last page', () => {
    expect(calculatePagination({ page: 99, pageSize: 20 }, 45)).toEqual({
      page: 3,
      pageSize: 20,
      total: 45,
      totalPages: 3,
      skip: 40,
      take: 20,
    });
  });

  it('should handle empty database results', () => {
    expect(calculatePagination({ page: 99, pageSize: 20 }, 0)).toEqual({
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1,
      skip: 0,
      take: 20,
    });
  });

  it('should handle total exactly divisible by pageSize', () => {
    expect(calculatePagination({ page: 2, pageSize: 20 }, 40)).toEqual({
      page: 2,
      pageSize: 20,
      total: 40,
      totalPages: 2,
      skip: 20,
      take: 20,
    });
  });

  it('should calculate the last partial page correctly', () => {
    expect(calculatePagination({ page: 3, pageSize: 20 }, 45)).toEqual({
      page: 3,
      pageSize: 20,
      total: 45,
      totalPages: 3,
      skip: 40,
      take: 20,
    });
  });
});

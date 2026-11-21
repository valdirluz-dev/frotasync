import { paginationSchema } from './pagination.schema';

describe('paginationSchema', () => {
  it('should use default values when no parameters are provided', () => {
    const result = paginationSchema.parse({});

    expect(result).toEqual({
      page: 1,
      pageSize: 20,
    });
  });

  it('should convert string parameters to numbers', () => {
    const result = paginationSchema.parse({
      page: '3',
      pageSize: '50',
    });

    expect(result).toEqual({
      page: 3,
      pageSize: 50,
    });
  });

  it('should reject page smaller than 1', () => {
    expect(() => paginationSchema.parse({ page: '0' })).toThrow();
  });

  it('should reject pageSize greater than 100', () => {
    expect(() =>
      paginationSchema.parse({ pageSize: '101' }),
    ).toThrow();
  });

  it('should reject decimal numbers', () => {
    expect(() =>
      paginationSchema.parse({ page: '1.5' }),
    ).toThrow();
  });
});

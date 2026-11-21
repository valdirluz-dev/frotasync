import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(
    z.object({
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(20),
    }),
  );

  it('should return validated data with default values', () => {
    expect(pipe.transform({}, {} as never)).toEqual({
      page: 1,
      pageSize: 20,
    });
  });

  it('should transform string values into numbers', () => {
    expect(
      pipe.transform({ page: '3', pageSize: '50' }, {} as never),
    ).toEqual({
      page: 3,
      pageSize: 50,
    });
  });

  it('should throw BadRequestException for invalid data', () => {
    expect(() => pipe.transform({ page: '0' }, {} as never)).toThrow(
      BadRequestException,
    );
  });

  it('should return structured validation errors', () => {
    try {
      pipe.transform({ page: '0' }, {} as never);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);

      const exception = error as BadRequestException;
      expect(exception.getResponse()).toEqual({
        statusCode: 400,
        message: 'Validation failed',
        errors: [
          {
            field: 'page',
            message: expect.any(String),
          },
        ],
      });
    }
  });
});

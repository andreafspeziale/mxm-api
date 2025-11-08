import { z } from 'zod';

export const apiKeySchema = z.string().min(1);

export const successStatusCodeSchema = z.literal(200);

export const buildLegacyAPIResponseSchema = <T>(schema: z.ZodType<T>) => {
  return z.object({
    message: z.object({
      header: z.object({
        status_code: z.literal(200),
        execute_time: z.number(),
      }),
      body: schema,
    }),
  });
};

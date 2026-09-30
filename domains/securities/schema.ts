import { z } from 'zod/v4';

export const security = z.object({
  id: z.number('Security ID must be a number'),
  symbol: z.string('Security Symbol must be a string')
});

export const securities = z.array(security)

export type Security = z.output<typeof security>;
export type Securities = z.output<typeof securities>;

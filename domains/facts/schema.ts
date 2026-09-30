import { z } from "zod/v4";

export const rawFact = z
  .object({
    security_id: z.number(),
    attribute_id: z.number(),
    value: z.number(),
  })

export type RawFact = z.output<typeof rawFact>;

export const fact = rawFact
  .transform(({ security_id, attribute_id, value }) => ({
    securityId: security_id,
    attributeId: attribute_id,
    value,
  }));

export const facts = z.array(fact);

export type Fact = z.output<typeof fact>;
export type Facts = z.output<typeof facts>;

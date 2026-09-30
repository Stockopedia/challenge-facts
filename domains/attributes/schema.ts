import { z } from 'zod/v4';

export const attribute = z.object({
  id: z.number('Attribute ID must be a number'),
  name: z.string('Attribute Name must be a string')
});

export const attributes = z.array(attribute);

export type Attribute = z.output<typeof attribute>;
export type Attributes = z.output<typeof attributes>;

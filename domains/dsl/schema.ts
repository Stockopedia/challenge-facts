import { z } from 'zod/v4';

export const operator = z.enum([
  '+', '-', '*', '/'
], `Unsupported Operator`);

export type Operator = z.output<typeof operator>;

export const expression = z.object({
  fn: operator,
  get a() {
    return operand
  },
  get b(){
    return operand
  }
}, 'Expression is Missing');

export const operand = z.union([z.number(), z.string(), expression], "Invalid Operand Provided");

export type Expression = z.output<typeof expression>;
export type Operand = z.output<typeof operand>;

export const query = z.object({
  security: z.string('Security is required'),
  expression: expression
})

export type Query = z.output<typeof query>;

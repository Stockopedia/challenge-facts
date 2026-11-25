export type Operand = string | number | Expression;

export interface Expression {
  fn: string;
  a: Operand;
  b: Operand;
}

export interface Query {
  security: string;
  expression: Expression;
}
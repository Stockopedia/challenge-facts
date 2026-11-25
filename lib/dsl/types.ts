export const operators = { "*": "*", "/": "/", "+": "+", "-": "-" } as const;
export type Operator = (typeof operators)[keyof typeof operators];

export type Operand = Expression | string | number;

export type Expression = {
  fn: Operator;
  a: Operand;
  b: Operand;
};

export type DSLQuery = {
  security: string;
  expression: Expression;
};

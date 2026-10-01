// so a side on an expression could be a number or an attribute name or another expr inside it
export interface Expression {
  fn: string;
  a: string | number | Expression;
  b: string | number | Expression;
}

export interface Query {
  security: string;
  expression: Expression;
}

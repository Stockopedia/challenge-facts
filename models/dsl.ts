export interface Expression {
  fn: "*" | "/" | "+" | "-";
  a: string | number | Expression;
  b: string | number | Expression;
}

export interface DSL {
  security: string;
  expression: Expression;
}

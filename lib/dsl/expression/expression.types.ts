import type { ExpressionKind } from "./expression-kind.enum";
import type { Operator } from "../operator/operator.enum";

export interface NumberLiteral {
  kind: ExpressionKind.Number;
  value: number;
}

export interface AttributeRef {
  kind: ExpressionKind.Attribute;
  name: string;
}

export interface Call {
  kind: ExpressionKind.Call;
  fn: Operator;
  a: Expression;
  b: Expression;
}

export type Expression = NumberLiteral | AttributeRef | Call;

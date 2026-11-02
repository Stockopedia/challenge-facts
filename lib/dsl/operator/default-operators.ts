import { Operator } from "./operator.enum";
import { MathError } from "../errors/dsl.errors";
import type { Operators } from "./operator.types";

/** Adding an operator = enum member + entry here. */
export const DEFAULT_OPERATORS: Operators = {
  [Operator.Add]: (a, b) => a + b,
  [Operator.Subtract]: (a, b) => a - b,
  [Operator.Multiply]: (a, b) => a * b,
  [Operator.Divide]: (a, b) => {
    if (b === 0) throw new MathError("Division by zero");
    return a / b;
  },
};

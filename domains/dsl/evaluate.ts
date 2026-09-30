import type { Expression, Operand } from "./schema";
import { operatorFns } from "./operators";
import { resolveAttributeByName } from "../attributes/resolver";
import { resolveFact } from "../facts/resolver";
import type { Security } from "../securities/schema";

export function evaluateExpression(
  expression: Expression,
  security: Security,
): number {
  const fn = operatorFns[expression.fn];

  const a = evaluateOperand(expression.a, security);
  const b = evaluateOperand(expression.b, security);

  return fn(a, b);
}

function evaluateOperand(operand: Operand, security: Security): number {
  if (typeof operand === "number") {
    return operand;
  }

  if (typeof operand === "string") {
    const attribute = resolveAttributeByName(operand);
    const { value } = resolveFact({ attribute, security });

    return value;
  }

  return evaluateExpression(operand, security);
}

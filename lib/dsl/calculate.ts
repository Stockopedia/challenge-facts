import type { Security } from "../../models/security";
import { findAttribute, findFact, findSecurity } from "./dataset";
import { OPERATORS } from "./operator-registry";
import type { Operand, Query } from "./query";
import type { Result } from "./result";

export function calculate(query: Query): Result<number> {
  const security = findSecurity(query.security);
  if (!security) {
    return lookupError(`Unknown security "${query.security}"`);
  }

  return calculateOperand(query.expression, security, "expression");
}

function calculateOperand(
  operand: Operand,
  security: Security,
  path: string,
): Result<number> {
  if (typeof operand === "number") return { ok: true, value: operand };

  if (typeof operand === "string") return lookupFact(operand, security, path);

  const a = calculateOperand(operand.a, security, `${path}.a`);
  if (!a.ok) return a;

  const b = calculateOperand(operand.b, security, `${path}.b`);
  if (!b.ok) return b;

  const value = OPERATORS[operand.fn](a.value, b.value);

  if (!Number.isFinite(value)) {
    return {
      ok: false,
      error: {
        kind: "evaluation",
        message: `No finite answer, e.g. division by zero (at ${path})`,
      },
    };
  }

  return { ok: true, value };
}

function lookupFact(
  name: string,
  security: Security,
  path: string,
): Result<number> {
  const attribute = findAttribute(name);
  if (!attribute)
    return lookupError(`Unknown attribute "${name}" (at ${path})`);

  const value = findFact(security.id, attribute.id);
  if (value === undefined) {
    return lookupError(
      `No "${name}" value for ${security.symbol} (at ${path})`,
    );
  }

  return { ok: true, value };
}

const lookupError = (message: string): Result<never> => ({
  ok: false,
  error: { kind: "lookup", message },
});
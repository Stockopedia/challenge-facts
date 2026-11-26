import { isOperator, OPERATORS } from "./operator-registry";
import type { Expression, Operand, Query } from "./query";
import type { Result } from "./result";

const fail = (path: string, message: string): Result<never> => ({
  ok: false,
  error: { kind: "schema", message: `${message} (at ${path})` },
});

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// Rejects extra keys, so a typo like "bb" fails loudly instead of being ignored.
const extraKey = (value: Record<string, unknown>, allowed: string[]) =>
  Object.keys(value).find((key) => !allowed.includes(key));

// Step 2: check the JSON has the shape of a query. Whether the data exists is checked later.
export function validateQuery(input: unknown): Result<Query> {
  if (!isObject(input)) return fail("$", "Query must be an object");

  const extra = extraKey(input, ["security", "expression"]);
  if (extra) return fail(extra, `Unexpected property "${extra}"`);

  if (typeof input.security !== "string") {
    return fail("security", "security must be a string");
  }

  const expression = validateExpression(input.expression, "expression");
  if (!expression.ok) return expression;

  return {
    ok: true,
    value: { security: input.security, expression: expression.value },
  };
}

function validateExpression(value: unknown, path: string): Result<Expression> {
  if (!isObject(value)) return fail(path, "Expected an expression object");

  const extra = extraKey(value, ["fn", "a", "b"]);
  if (extra) return fail(`${path}.${extra}`, `Unexpected property "${extra}"`);

  if (!isOperator(value.fn)) {
    const supported = Object.keys(OPERATORS).join(" ");
    return fail(`${path}.fn`, `Unknown operator, expected one of ${supported}`);
  }

  const a = validateOperand(value.a, `${path}.a`);
  if (!a.ok) return a;

  const b = validateOperand(value.b, `${path}.b`);
  if (!b.ok) return b;

  return { ok: true, value: { fn: value.fn, a: a.value, b: b.value } };
}

function validateOperand(value: unknown, path: string): Result<Operand> {
  if (typeof value === "number" || typeof value === "string") {
    return { ok: true, value };
  }
  if (isObject(value)) return validateExpression(value, path);

  return fail(path, "Expected an attribute name, a number or an expression");
}
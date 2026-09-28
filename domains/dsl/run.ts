import { prettifyError } from "zod/v4";
import { Expression, Operand, Query, query } from "./schema";
import { operatorFns, DivisionByZeroError } from "./operators";
import {
  AttributeNotFoundError,
  resolveAttributeByName,
} from "../attributes/resolver";
import {
  resolveSecurityBySymbol,
  SecurityNotFoundError,
} from "../securities/resolver";
import { FactNotFoundError, resolveFact } from "../facts/resolver";
import { Security } from "../securities/schema";

export function run(input: string): RunResult {
  let maybeJson;
  try {
    maybeJson = ensureValidJSON(input);

    if (isValidQuery(maybeJson)) {
      const security = resolveSecurityBySymbol(maybeJson.security);
      const value = runExpression(maybeJson.expression, security);

      return { success: true, value };
    }
    return err("unknown", new Error("isValidQuery Should have thrown, but typescript isnt happy unless i do something like this..."))
  } catch (error) {

    if (error instanceof JsonError) {
      return err("invalid-json", error);
    }
    if (error instanceof QueryError) {
      return err("invalid-query", error);
    }
    if (error instanceof AttributeNotFoundError) {
      return err("attribute-not-found", error);
    }
    if (error instanceof FactNotFoundError) {
      return err("fact-not-found", error);
    }
    if (error instanceof SecurityNotFoundError) {
      return err("security-not-found", error);
    }
    if (error instanceof DivisionByZeroError) {
      return err("division-by-zero", error)
    }
    throw error
  }
}

function runExpression(expression: Expression, security: Security): number {
  const fn = operatorFns[expression.fn];

  const a = runOperand(expression.a, security);
  const b = runOperand(expression.b, security);

  return fn(a, b);
}

function runOperand(operand: Operand, security: Security) {
  if (typeof operand === "number") {
    return operand;
  }

  if (typeof operand === "string") {
    const attribute = resolveAttributeByName(operand);
    const { value } = resolveFact({ attribute, security });

    return value;
  }

  return runExpression(operand, security);
}

function err(kind: ErrorKind, error?: Error) {
  const errorMessage = error?.message ? error.message : "";
  const causedByTrailer = isError(error?.cause)
    ? `, Caused By: ${String(error.cause?.message)}`
    : error?.cause
      ? `, Caused By: ${String(error.cause)}`
      : "";
  return {
    success: false,
    error: { kind, message: `${errorMessage}${causedByTrailer}` },
  } as const;
}

function isError(input: unknown): input is Error {
  return input instanceof Error;
}

function isValidQuery(input: unknown): input is Query {
  const result = query.safeParse(input);

  if (!result.success) {
    throw new QueryError(prettifyError(result.error));
  }

  return true;
}

function ensureValidJSON(input: string) {
  try {
    return JSON.parse(input);
  } catch (error) {
    throw new JsonError("Invalid JSON", { cause: error });
  }
}

class JsonError extends Error {}

class QueryError extends Error {}

type ErrorKind =
  | "invalid-json"
  | "invalid-query"
  | "security-not-found"
  | "attribute-not-found"
  | "fact-not-found"
  | "division-by-zero"
  | "unknown";

export type RunResult =
  | { success: true; value: number }
  | { success: false; error: { kind: ErrorKind; message: string } };

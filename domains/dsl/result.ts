import { DivisionByZeroError } from "./operators";
import { InvalidJsonError, InvalidQueryError } from "./parse";
import { AttributeNotFoundError } from "../attributes/resolver";
import { FactNotFoundError } from "../facts/resolver";
import { SecurityNotFoundError } from "../securities/resolver";

export type ErrorKind =
  | "invalid-json"
  | "invalid-query"
  | "security-not-found"
  | "attribute-not-found"
  | "fact-not-found"
  | "division-by-zero";

export type RunResult =
  | { success: true; value: number }
  | { success: false; error: { kind: ErrorKind; message: string } };

type ErrorClass = abstract new (...args: never[]) => Error;

const errorKinds: [errorClass: ErrorClass, kind: ErrorKind][] = [
  [InvalidJsonError, "invalid-json"],
  [InvalidQueryError, "invalid-query"],
  [SecurityNotFoundError, "security-not-found"],
  [AttributeNotFoundError, "attribute-not-found"],
  [FactNotFoundError, "fact-not-found"],
  [DivisionByZeroError, "division-by-zero"],
];

export function success(value: number): RunResult {
  return { success: true, value };
}

// Returns undefined for errors we don't recognise, so the caller can rethrow them
export function failure(error: unknown): RunResult | undefined {
  const match = errorKinds.find(([errorClass]) => error instanceof errorClass);

  if (!match || !(error instanceof Error)) {
    return undefined;
  }

  const [, kind] = match;

  return { success: false, error: { kind, message: describe(error) } };
}

function describe(error: Error): string {
  if (!error.cause) {
    return error.message;
  }

  const cause =
    error.cause instanceof Error ? error.cause.message : String(error.cause);

  return `${error.message}, Caused By: ${cause}`;
}

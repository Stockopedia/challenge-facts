import { prettifyError } from "zod/v4";
import { type Query, query } from "./schema";

export function parseQuery(input: string): Query {
  const result = query.safeParse(parseJson(input));

  if (!result.success) {
    throw new InvalidQueryError(prettifyError(result.error));
  }

  return result.data;
}

function parseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch (error) {
    throw new InvalidJsonError("Invalid JSON", { cause: error });
  }
}

export class InvalidJsonError extends Error {}

export class InvalidQueryError extends Error {}

import { calculate } from "./calculate";
import { parseJson } from "./parse";
import type { Result } from "./result";
import { validateQuery } from "./schema";

export function interpret(input: string): Result<number> {
  const parsed = parseJson(input);
  if (!parsed.ok) return parsed;

  const query = validateQuery(parsed.value);
  if (!query.ok) return query;

  return calculate(query.value);
}
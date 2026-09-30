import { evaluateExpression } from "./evaluate";
import { parseQuery } from "./parse";
import { failure, type RunResult, success } from "./result";
import { resolveSecurityBySymbol } from "../securities/resolver";

export type { RunResult } from "./result";

export function run(input: string): RunResult {
  try {
    const { security: symbol, expression } = parseQuery(input);
    const security = resolveSecurityBySymbol(symbol);

    return success(evaluateExpression(expression, security));
  } catch (error) {
    const result = failure(error);

    if (!result) {
      throw error;
    }

    return result;
  }
}

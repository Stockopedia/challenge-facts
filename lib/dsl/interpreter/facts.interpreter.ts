import type { Security } from "../../../models/security";
import { ExpressionKind } from "../expression/expression-kind.enum";
import { DslError, LookupError, UnexpectedError } from "../errors/dsl.errors";
import type { FactRepository } from "../repository/repository.types";
import type { Interpreter, Result } from "./interpreter.types";
import { DEFAULT_OPERATORS } from "../operator/default-operators";
import { JsonQueryParser } from "../parser/json-query.parser";
import type { QueryParser } from "../parser/parser.types";
import type { Expression } from "../expression/expression.types";
import type { Operators } from "../operator/operator.types";

export class FactsInterpreter implements Interpreter {
  constructor(
    private readonly repository: FactRepository,
    private readonly operators: Operators = DEFAULT_OPERATORS,
    private readonly parser: QueryParser = new JsonQueryParser(),
  ) {}

  run(input: string): Result<number> {
    try {
      const query = this.parser.parse(input);
      const security = this.repository.findSecurity(query.security);

      if (!security) {
        throw new LookupError(`Unknown security "${query.security}"`);
      }

      return { ok: true, value: this.evaluate(query.expression, security) };
    } catch (error) {
      if (error instanceof DslError) return { ok: false, error };

      // Safety net so the UI always gets a Result, never an uncaught throw.
      const reason = error instanceof Error ? error.message : String(error);

      return {
        ok: false,
        error: new UnexpectedError(`Unexpected error: ${reason}`, {
          cause: error,
        }),
      };
    }
  }

  private evaluate(expression: Expression, security: Security): number {
    switch (expression.kind) {
      case ExpressionKind.Number:
        return expression.value;
      case ExpressionKind.Attribute:
        return this.lookup(expression.name, security);
      case ExpressionKind.Call:
        return this.operators[expression.fn](
          this.evaluate(expression.a, security),
          this.evaluate(expression.b, security),
        );
      default: {
        // Compile-time exhaustiveness check
        const unhandled: never = expression;
        throw new Error(
          `Unhandled expression kind: ${JSON.stringify(unhandled)}`,
        );
      }
    }
  }

  private lookup(name: string, security: Security): number {
    const attribute = this.repository.findAttribute(name);

    if (!attribute) {
      throw new LookupError(`Unknown attribute "${name}"`);
    }

    const fact = this.repository.findFact(security.id, attribute.id);

    if (!fact) {
      throw new LookupError(
        `No "${name}" value for security "${security.symbol}"`,
      );
    }
    return fact.value;
  }
}

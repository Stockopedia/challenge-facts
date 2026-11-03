import type { DslError } from "../errors/dsl.errors";

export type Result<T> = { ok: true; value: T } | { ok: false; error: DslError };

export interface Interpreter {
  /** Evaluates a raw DSL query. Never throws: every failure is a Result. */
  run(input: string): Result<number>;
}

import type { Expression } from "../expression/expression.types";

export interface Query {
  security: string;
  expression: Expression;
}

/** Shared across one parse so the node limit covers the whole tree. */
export interface NodeCounter {
  count: number;
}

export interface QueryParser {
  /**
   * Turns raw user input into a validated AST.
   * Throws ParseError / SchemaError for invalid input.
   */
  parse(input: string): Query;
}

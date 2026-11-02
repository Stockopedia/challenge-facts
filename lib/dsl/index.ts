// Public API of the DSL module. Consumers import from here, not from internals.

// expression
export { ExpressionKind } from "./expression/expression-kind.enum";
export type { Expression } from "./expression/expression.types";

// operator
export { Operator } from "./operator/operator.enum";
export type { BinaryOperator, Operators } from "./operator/operator.types";
export { DEFAULT_OPERATORS } from "./operator/default-operators";

// errors
export {
  DslError,
  ParseError,
  SchemaError,
  LookupError,
  MathError,
  UnexpectedError,
} from "./errors/dsl.errors";

// parser
export type { Query, QueryParser } from "./parser/parser.types";
export { JsonQueryParser } from "./parser/json-query.parser";

// repository
export type { FactRepository, FactRow } from "./repository/repository.types";
export { InMemoryFactRepository } from "./repository/in-memory-fact.repository";

// interpreter
export type { Interpreter, Result } from "./interpreter/interpreter.types";
export { FactsInterpreter } from "./interpreter/facts.interpreter";

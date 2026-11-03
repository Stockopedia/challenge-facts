/** Base class for every error a user can cause with a DSL query. */
export abstract class DslError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

/** The input is not valid JSON. */
export class ParseError extends DslError {}

/** The input is valid JSON but does not follow the DSL schema. */
export class SchemaError extends DslError {}

/** A security, attribute or fact referenced by the query does not exist. */
export class LookupError extends DslError {}

/** The expression cannot be computed, e.g. division by zero. */
export class MathError extends DslError {}

/**
 * Anything else that went wrong while running a query, e.g. a bug or a
 * failing operator implementation. The original error is the `cause`.
 */
export class UnexpectedError extends DslError {}

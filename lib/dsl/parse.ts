import { InvalidQueryError, MalformedJSONError } from "./errors";
import { DSLQuery, Expression, operators } from "./types";

const isPlainObject = (value: unknown) =>
  value !== null &&
  typeof value === "object" &&
  Object.getPrototypeOf(value) === Object.prototype;

const validateExpression = (expression: Expression) => {
  // Check expression is an object with the right keys
  if (!isPlainObject(expression)) {
    throw new InvalidQueryError(
      "The provided DSL query contains a non-object expression.",
    );
  }
  const keys = Object.keys(expression);
  if (keys.length !== 3) {
    throw new InvalidQueryError(
      "The provided DSL query contains an expression with the wrong number of fields.",
    );
  }
  if (!keys.includes("fn") || !keys.includes("a") || !keys.includes("b")) {
    throw new InvalidQueryError(
      "The provided DSL query contains an expression with invalid fields.",
    );
  }

  // Check the fn value is valid
  if (!Object.hasOwn(operators, expression.fn)) {
    throw new InvalidQueryError(
      "The provided DSL query contains an expression with an invalid operation.",
    );
  }

  // Check the a & b values are valid
  if (typeof expression.a !== "string" && typeof expression.a !== "number") {
    validateExpression(expression.a);
  }
  if (typeof expression.b !== "string" && typeof expression.b !== "number") {
    validateExpression(expression.b);
  }
};

const validateQuery = (query: ReturnType<typeof JSON.parse>) => {
  if (!isPlainObject(query)) {
    throw new InvalidQueryError("The provided DSL query is not an object.");
  }

  const keys = Object.keys(query);
  if (keys.length !== 2) {
    throw new InvalidQueryError(
      "The provided DSL query has the wrong number of fields.",
    );
  }

  if (
    !keys.includes("security") ||
    !keys.includes("expression") ||
    typeof query["security"] !== "string"
  ) {
    throw new InvalidQueryError("The provided DSL query has invalid fields.");
  }

  validateExpression(query["expression"]);
};

const parse = (rawQuery: string): DSLQuery => {
  let unvalidatedQuery: unknown;
  try {
    unvalidatedQuery = JSON.parse(rawQuery);
  } catch {
    throw new MalformedJSONError("The provided DSL query is not valid JSON.");
  }

  // Check the query adheres to the DSL schema
  validateQuery(unvalidatedQuery);

  // If we have validated without throwing an error, return the query
  return unvalidatedQuery as DSLQuery;
};

export default parse;

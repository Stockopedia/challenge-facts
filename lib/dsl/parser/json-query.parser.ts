import { ParseError, SchemaError } from "../errors/dsl.errors";
import { ExpressionKind } from "../expression/expression-kind.enum";
import type { Expression } from "../expression/expression.types";
import { Operator } from "../operator/operator.enum";
import { ExpressionField } from "./expression-field.enum";
import { QueryField } from "./query-field.enum";
import type { NodeCounter, QueryParser, Query } from "./parser.types";

type JsonObject = Record<string, unknown>;

/**
 * Limits that keep evaluation cheap and well below the JS call-stack limit
 * (recursion overflows at roughly 5–10k levels), so a hostile query is
 * rejected with a SchemaError instead of freezing or crashing the page.
 */
export const MAX_DEPTH = 1_000;
export const MAX_NODES = 10_000;

/** Label of the query root in error paths */
const ROOT_PATH = "query";
const QUERY_FIELDS: readonly string[] = Object.values(QueryField);
const EXPRESSION_FIELDS: readonly string[] = Object.values(ExpressionField);
const OPERATORS: readonly string[] = Object.values(Operator);

/**
 * Parses the JSON DSL. Throws ParseError for malformed JSON and SchemaError
 * for anything that is valid JSON but not a valid query, so evaluation never
 * sees bad shapes.
 */
export class JsonQueryParser implements QueryParser {
  parse(input: string): Query {
    let raw: unknown;

    try {
      raw = JSON.parse(input);
    } catch (error) {
      throw new ParseError(`Invalid JSON: ${(error as Error).message}`);
    }

    if (!isObject(raw)) {
      throw new SchemaError("Query must be a JSON object");
    }

    assertKnownFields(raw, QUERY_FIELDS, ROOT_PATH);

    const security = raw[QueryField.Security];
    if (typeof security !== "string" || security.trim() === "") {
      throw new SchemaError(
        `"${QueryField.Security}" must be a non-empty string`,
      );
    }

    return {
      security,
      expression: parseExpression(
        raw[QueryField.Expression],
        QueryField.Expression,
        1,
        { count: 0 },
      ),
    };
  }
}

function parseExpression(
  node: unknown,
  path: string,
  depth: number,
  nodes: NodeCounter,
): Expression {
  nodes.count += 1;
  if (nodes.count > MAX_NODES) {
    throw new SchemaError(
      `${QueryField.Expression} has too many nodes (max ${MAX_NODES})`,
    );
  }

  if (depth > MAX_DEPTH) {
    throw new SchemaError(
      `${QueryField.Expression} is nested too deeply (max ${MAX_DEPTH} levels)`,
    );
  }

  if (node === undefined) {
    throw new SchemaError(`${path} is required`);
  }

  if (typeof node === "number") {
    return { kind: ExpressionKind.Number, value: node };
  }

  if (typeof node === "string" && node !== "") {
    return { kind: ExpressionKind.Attribute, name: node };
  }

  if (isObject(node)) {
    assertKnownFields(node, EXPRESSION_FIELDS, path);

    const fn = node[ExpressionField.Fn];
    if (!isOperator(fn)) {
      throw new SchemaError(
        `${path}.${ExpressionField.Fn}: unknown operator ${JSON.stringify(fn)} (supported: ${OPERATORS.join(", ")})`,
      );
    }

    return {
      kind: ExpressionKind.Call,
      fn,
      a: parseExpression(
        node[ExpressionField.A],
        `${path}.${ExpressionField.A}`,
        depth + 1,
        nodes,
      ),
      b: parseExpression(
        node[ExpressionField.B],
        `${path}.${ExpressionField.B}`,
        depth + 1,
        nodes,
      ),
    };
  }

  throw new SchemaError(
    `${path} must be a number, an attribute name or an expression object`,
  );
}

function isOperator(fn: unknown): fn is Operator {
  return typeof fn === "string" && OPERATORS.includes(fn);
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertKnownFields(
  object: JsonObject,
  allowed: readonly string[],
  path: string,
): void {
  const unknown = Object.keys(object).find((key) => !allowed.includes(key));
  if (unknown !== undefined) {
    throw new SchemaError(`${path}: unknown field "${unknown}"`);
  }
}

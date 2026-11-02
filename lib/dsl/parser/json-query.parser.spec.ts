import { ParseError, SchemaError } from "../errors/dsl.errors";
import { ExpressionKind } from "../expression/expression-kind.enum";
import { Operator } from "../operator/operator.enum";
import { JsonQueryParser, MAX_DEPTH, MAX_NODES } from "./json-query.parser";
import type { Query } from "./parser.types";

/** Query whose expression is `levels` deep: a chain of `+` calls ending in 1. */
function nestedQuery(levels: number): string {
  const calls = levels - 1;
  const expression =
    '{"fn":"+","a":'.repeat(calls) + "1" + ',"b":1}'.repeat(calls);

  return `{"security":"ABC","expression":${expression}}`;
}

/** Query whose expression is a full binary tree of `+` calls. */
function wideQuery(levels: number): string {
  function tree(level: number): string {
    return level === 1
      ? "1"
      : `{"fn":"+","a":${tree(level - 1)},"b":${tree(level - 1)}}`;
  }

  return `{"security":"ABC","expression":${tree(levels)}}`;
}

/** Number of nodes in `wideQuery(levels)`. */
function wideNodeCount(levels: number): number {
  return 2 ** levels - 1;
}

describe("JsonQueryParser", () => {
  const parser = new JsonQueryParser();

  describe("parse", () => {
    describe("with a valid query", () => {
      it("should build an AST from numbers, attribute names and nested calls", () => {
        const input = JSON.stringify({
          security: "ABC",
          expression: { fn: "+", a: "price", b: { fn: "*", a: 2, b: "eps" } },
        });
        const expected: Query = {
          security: "ABC",
          expression: {
            kind: ExpressionKind.Call,
            fn: Operator.Add,
            a: { kind: ExpressionKind.Attribute, name: "price" },
            b: {
              kind: ExpressionKind.Call,
              fn: Operator.Multiply,
              a: { kind: ExpressionKind.Number, value: 2 },
              b: { kind: ExpressionKind.Attribute, name: "eps" },
            },
          },
        };

        const result = parser.parse(input);

        expect(result).toEqual(expected);
      });
    });

    describe("with malformed JSON", () => {
      it("should throw ParseError", () => {
        const act = () => parser.parse("{");

        expect(act).toThrow(ParseError);
      });
    });

    describe("with a schema violation", () => {
      it.each([
        {
          name: "a non-object query",
          query: [1, 2],
          message: /query must be a json object/i,
        },
        {
          name: "a missing security",
          query: { expression: 1 },
          message: /"security"/,
        },
        {
          name: "an empty security",
          query: { security: " ", expression: 1 },
          message: /"security"/,
        },
        {
          name: "a missing expression",
          query: { security: "ABC" },
          message: /expression is required/,
        },
        {
          name: "an unknown query field",
          query: { security: "ABC", expression: 1, extra: true },
          message: /unknown field "extra"/,
        },
        {
          name: "an unknown operator",
          query: { security: "ABC", expression: { fn: "%", a: 1, b: 2 } },
          message: /unknown operator "%"/,
        },
        {
          name: "a missing argument",
          query: { security: "ABC", expression: { fn: "+", a: 1 } },
          message: /expression\.b is required/,
        },
        {
          name: "an invalid nested argument",
          query: {
            security: "ABC",
            expression: { fn: "+", a: 1, b: { fn: "-", a: true, b: 1 } },
          },
          message: /expression\.b\.a/,
        },
        {
          name: "an unknown expression field",
          query: { security: "ABC", expression: { fn: "+", a: 1, b: 2, c: 3 } },
          message: /unknown field "c"/,
        },
        {
          name: "an empty attribute name",
          query: { security: "ABC", expression: { fn: "+", a: "", b: 2 } },
          message: /expression\.a/,
        },
      ])("should throw SchemaError on $name", ({ query, message }) => {
        const act = () => parser.parse(JSON.stringify(query));

        expect(act).toThrow(SchemaError);
        expect(act).toThrow(message);
      });
    });

    describe("with size limits", () => {
      it("should accept an expression exactly MAX_DEPTH levels deep", () => {
        const act = () => parser.parse(nestedQuery(MAX_DEPTH));

        expect(act).not.toThrow();
      });

      it("should reject an expression deeper than MAX_DEPTH", () => {
        const act = () => parser.parse(nestedQuery(MAX_DEPTH + 1));

        expect(act).toThrow(SchemaError);
        expect(act).toThrow(/nested too deeply/);
      });

      it("should accept an expression within MAX_NODES", () => {
        const levels = 13;
        expect(wideNodeCount(levels)).toBeLessThanOrEqual(MAX_NODES);

        const act = () => parser.parse(wideQuery(levels));

        expect(act).not.toThrow();
      });

      it("should reject an expression with more than MAX_NODES nodes", () => {
        const levels = 14;
        expect(wideNodeCount(levels)).toBeGreaterThan(MAX_NODES);

        const act = () => parser.parse(wideQuery(levels));

        expect(act).toThrow(SchemaError);
        expect(act).toThrow(/too many nodes/);
      });
    });
  });
});

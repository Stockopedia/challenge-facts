import attributes from "../../../data/attributes.json";
import facts from "../../../data/facts.json";
import securities from "../../../data/securities.json";
import {
  LookupError,
  MathError,
  ParseError,
  SchemaError,
  UnexpectedError,
} from "../errors/dsl.errors";
import { DEFAULT_OPERATORS } from "../operator/default-operators";
import { Operator } from "../operator/operator.enum";
import { InMemoryFactRepository } from "../repository/in-memory-fact.repository";
import { FactsInterpreter } from "./facts.interpreter";

const repository = new InMemoryFactRepository(securities, attributes, facts);

/** Serialises a DSL query the way a user would type it. */
function query(expression: unknown, security = "ABC"): string {
  return JSON.stringify({ expression, security });
}

/** `{"fn":"+","a":{"fn":"+","a":…1…,"b":1},"b":1}` nested `depth` times. */
function deeplyNested(depth: number): string {
  const expression =
    '{"fn":"+","a":'.repeat(depth) + "1" + ',"b":1}'.repeat(depth);

  return `{"security":"ABC","expression":${expression}}`;
}

describe("FactsInterpreter", () => {
  const interpreter = new FactsInterpreter(repository);

  describe("run", () => {
    describe("with a valid query", () => {
      it.each([
        {
          name: "multiply an attribute by a number",
          input: query({ fn: "*", a: "sales", b: 2 }, "ABC"),
          expected: 8,
        },
        {
          name: "divide two attributes",
          input: query({ fn: "/", a: "price", b: "eps" }, "BCD"),
          expected: 0.5,
        },
        {
          name: "evaluate nested expressions",
          input: query(
            {
              fn: "-",
              a: { fn: "-", a: "eps", b: "shares" },
              b: { fn: "-", a: "assets", b: "liabilities" },
            },
            "CDE",
          ),
          expected: -21,
        },
        {
          name: "add two numbers",
          input: query({ fn: "+", a: 1, b: 2 }),
          expected: 3,
        },
      ])("should $name", ({ input, expected }) => {
        const result = interpreter.run(input);

        expect(result).toEqual({ ok: true, value: expected });
      });
    });

    describe("with an invalid query", () => {
      it.each([
        {
          name: "malformed JSON",
          input: '{"expression": {',
          error: ParseError,
          message: /invalid json/i,
        },
        {
          name: "a schema violation",
          input: '{"wrong": 123, "security": "BCD"}',
          error: SchemaError,
          message: /wrong/,
        },
        {
          name: "an unknown security",
          input: query({ fn: "*", a: "sales", b: 2 }, "ZZZ"),
          error: LookupError,
          message: /security "ZZZ"/,
        },
        {
          name: "an unknown attribute",
          input: query({ fn: "*", a: "revenue", b: 2 }),
          error: LookupError,
          message: /attribute "revenue"/,
        },
        {
          name: "a missing fact",
          input: query({ fn: "*", a: "shares", b: 2 }, "JKL"),
          error: LookupError,
          message: /"shares".*"JKL"/,
        },
        {
          name: "division by zero",
          input: query({ fn: "/", a: "price", b: 0 }),
          error: MathError,
          message: /zero/,
        },
      ])("should report $name", ({ input, error, message }) => {
        const result = interpreter.run(input);

        expect(result).toEqual({ ok: false, error: expect.any(error) });
        expect(result).toMatchObject({
          error: { message: expect.stringMatching(message) },
        });
      });
    });

    describe("with an extremely deeply nested expression", () => {
      it("should reject it with a SchemaError before evaluating", () => {
        const input = deeplyNested(20_000);

        const result = interpreter.run(input);

        expect(result).toEqual({ ok: false, error: expect.any(SchemaError) });
        expect(result).toMatchObject({
          error: { message: expect.stringMatching(/nested too deeply/) },
        });
      });
    });

    describe("with an unexpected failure", () => {
      it("should return an UnexpectedError instead of throwing", () => {
        const crashing = new FactsInterpreter(repository, {
          ...DEFAULT_OPERATORS,
          [Operator.Add]: () => {
            throw new RangeError("boom");
          },
        });

        const result = crashing.run(query({ fn: "+", a: 1, b: 2 }));

        expect(result).toEqual({
          ok: false,
          error: expect.any(UnexpectedError),
        });
        expect(result).toMatchObject({
          error: {
            message: "Unexpected error: boom",
            cause: expect.any(RangeError),
          },
        });
      });
    });

    describe("with custom operators", () => {
      it("should use the injected implementation", () => {
        const safeDivide = new FactsInterpreter(repository, {
          ...DEFAULT_OPERATORS,
          [Operator.Divide]: (a, b) => (b === 0 ? 0 : a / b),
        });

        const result = safeDivide.run(query({ fn: "/", a: "price", b: 0 }));

        expect(result).toEqual({ ok: true, value: 0 });
      });
    });
  });
});

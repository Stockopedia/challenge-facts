import { interpret } from "./interpret";

const query = (expression: unknown, security = "ABC") =>
  JSON.stringify({ security, expression });

describe("interpret", () => {
  describe("evaluating valid queries", () => {
    it.each([
      ["adds", { fn: "+", a: "price", b: "eps" }, 3],
      ["subtracts", { fn: "-", a: "price", b: "eps" }, -1],
      ["multiplies", { fn: "*", a: "sales", b: 2 }, 8],
      ["divides", { fn: "/", a: "price", b: "eps" }, 0.5],
      ["uses two numbers", { fn: "*", a: 3, b: 4 }, 12],
      [
        "evaluates nested expressions",
        {
          fn: "-",
          a: { fn: "*", a: "sales", b: 2 },
          b: { fn: "+", a: "eps", b: 1 },
        },
        5,
      ],
    ])("%s", (_name, expression, expected) => {
      expect(interpret(query(expression))).toEqual({
        ok: true,
        value: expected,
      });
    });

    it("looks up facts for the chosen security", () => {
      expect(
        interpret(query({ fn: "+", a: "price", b: "eps" }, "BCD")),
      ).toEqual({
        ok: true,
        value: 6,
      });
    });
  });

  describe("parse errors", () => {
    it.each([
      ["malformed JSON", '{"security": "ABC",'],
      ["an empty query", "   "],
    ])("reports %s", (_name, input) => {
      const result = interpret(input);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe("parse");
    });
  });

  describe("schema errors", () => {
    it.each([
      ["a non-object query", "[1, 2]", "$"],
      [
        "a missing security",
        JSON.stringify({ expression: { fn: "+", a: 1, b: 2 } }),
        "security",
      ],
      [
        "a missing expression",
        JSON.stringify({ security: "ABC" }),
        "expression",
      ],
      ["an unknown operator", query({ fn: "^", a: 1, b: 2 }), "expression.fn"],
      [
        "a built-in property as an operator",
        query({ fn: "toString", a: 1, b: 2 }),
        "expression.fn",
      ],
      ["a missing argument", query({ fn: "+", a: 1 }), "expression.b"],
      ["a boolean argument", query({ fn: "+", a: true, b: 1 }), "expression.a"],
      [
        "an unexpected property",
        query({ fn: "+", a: 1, b: 2, bb: 3 }),
        "expression.bb",
      ],
      [
        "a bad nested expression",
        query({ fn: "+", a: { fn: "*", a: 1, b: null }, b: 2 }),
        "expression.a.b",
      ],
    ])("reports %s at the right path", (_name, input, path) => {
      const result = interpret(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("schema");
        expect(result.error.message).toContain(`(at ${path})`);
      }
    });
  });

  describe("lookup errors", () => {
    it.each([
      [
        "an unknown security",
        query({ fn: "+", a: 1, b: 2 }, "ZZZ"),
        'Unknown security "ZZZ"',
      ],
      [
        "an unknown attribute",
        query({ fn: "+", a: "colour", b: 1 }),
        'Unknown attribute "colour"',
      ],
      [
        "a missing fact",
        query({ fn: "+", a: "shares", b: 1 }, "JKL"),
        'No "shares" value for JKL',
      ],
    ])("reports %s", (_name, input, message) => {
      expect(interpret(input)).toMatchObject({
        ok: false,
        error: { kind: "lookup", message: expect.stringContaining(message) },
      });
    });
  });

  describe("evaluation errors", () => {
    it("reports division by zero", () => {
      expect(interpret(query({ fn: "/", a: "price", b: 0 }))).toMatchObject({
        ok: false,
        error: {
          kind: "evaluation",
          message: expect.stringContaining("division by zero"),
        },
      });
    });
  });
});
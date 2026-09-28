import { run } from "./run";

// These run against the real files in /data, so expected values come from there:
//   ABC: sales = 4
//   BCD: price = 2, eps = 4
//   CDE: eps = 6, shares = 30, assets = 21, liabilities = 24
//   JKL: has no fact for "shares"

const dsl = (query: unknown) => JSON.stringify(query);

describe("run", () => {
  describe("valid queries", () => {
    it("evaluates an attribute and a number", () => {
      const result = run(
        dsl({ expression: { fn: "*", a: "sales", b: 2 }, security: "ABC" }),
      );

      expect(result).toEqual({ success: true, value: 8 });
    });

    it("evaluates two attributes", () => {
      const result = run(
        dsl({ expression: { fn: "/", a: "price", b: "eps" }, security: "BCD" }),
      );

      expect(result).toEqual({ success: true, value: 0.5 });
    });

    it("evaluates nested expressions", () => {
      const result = run(
        dsl({
          expression: {
            fn: "-",
            a: { fn: "-", a: "eps", b: "shares" },
            b: { fn: "-", a: "assets", b: "liabilities" },
          },
          security: "CDE",
        }),
      );

      // (6 - 30) - (21 - 24)
      expect(result).toEqual({ success: true, value: -21 });
    });

    it("evaluates two numbers", () => {
      const result = run(
        dsl({ expression: { fn: "+", a: 1, b: 2 }, security: "ABC" }),
      );

      expect(result).toEqual({ success: true, value: 3 });
    });

    // ABC's fact values equal their attribute ids, so use other securities here
    it("treats numbers as literals rather than attribute ids", () => {
      const result = run(
        dsl({ expression: { fn: "+", a: 1, b: 2 }, security: "BCD" }),
      );

      expect(result).toEqual({ success: true, value: 3 });
    });

    it("evaluates numbers that are not attribute ids", () => {
      const result = run(
        dsl({ expression: { fn: "+", a: 100, b: 0.5 }, security: "CDE" }),
      );

      expect(result).toEqual({ success: true, value: 100.5 });
    });

    it("respects operand order", () => {
      const result = run(
        dsl({ expression: { fn: "-", a: 2, b: "sales" }, security: "ABC" }),
      );

      expect(result).toEqual({ success: true, value: -2 });
    });

    it("evaluates attributes with underscores in their name", () => {
      const result = run(
        dsl({
          expression: { fn: "-", a: "free_cash_flow", b: "free_cash_flow" },
          security: "ABC",
        }),
      );

      expect(result).toEqual({ success: true, value: 0 });
    });

    it("uses the facts of the requested security", () => {
      const abc = run(
        dsl({ expression: { fn: "+", a: "sales", b: 0 }, security: "ABC" }),
      );
      const bcd = run(
        dsl({ expression: { fn: "+", a: "sales", b: 0 }, security: "BCD" }),
      );

      expect(abc).toMatchObject({ success: true });
      expect(bcd).toMatchObject({ success: true });
      expect(abc).not.toEqual(bcd);
    });
  });

  describe("invalid JSON", () => {
    test.each([
      [
        "an unclosed object",
        `{ "expression": {"fn": "+", "a": 1, "b": 2}, "security": "BCD"`,
      ],
      ["an empty string", ""],
      ["plain text", "sales * 2"],
    ])("reports %s", (_, input) => {
      const result = run(input);

      expect(result).toEqual({
        success: false,
        error: { kind: "invalid-json", message: expect.any(String) },
      });
    });
  });

  describe("invalid queries", () => {
    test.each([
      ["the wrong keys", { wrong: 123, security: "BCD" }],
      ["a missing security", { expression: { fn: "+", a: 1, b: 2 } }],
      [
        "an unknown operator",
        { expression: { fn: "^", a: 1, b: 2 }, security: "ABC" },
      ],
      [
        "an invalid nested expression",
        {
          expression: { fn: "+", a: { fn: "+", a: 1 }, b: 2 },
          security: "ABC",
        },
      ],
      ["valid JSON that is not an object", 42],
    ])("reports %s", (_, input) => {
      const result = run(dsl(input));

      expect(result).toEqual({
        success: false,
        error: { kind: "invalid-query", message: expect.any(String) },
      });
    });
  });

  describe("failed lookups", () => {
    it("reports an unknown security by its symbol", () => {
      const result = run(
        dsl({ expression: { fn: "*", a: "sales", b: 2 }, security: "ZZZ" }),
      );

      expect(result).toEqual({
        success: false,
        error: {
          kind: "security-not-found",
          message: expect.stringContaining("ZZZ"),
        },
      });
    });

    it("reports an unknown security even when no attributes are used", () => {
      const result = run(
        dsl({ expression: { fn: "+", a: 1, b: 2 }, security: "ZZZ" }),
      );

      expect(result).toMatchObject({
        success: false,
        error: { kind: "security-not-found" },
      });
    });

    it("reports an unknown attribute by its name", () => {
      const result = run(
        dsl({ expression: { fn: "*", a: "revenue", b: 2 }, security: "ABC" }),
      );

      expect(result).toEqual({
        success: false,
        error: {
          kind: "attribute-not-found",
          message: expect.stringContaining("revenue"),
        },
      });
    });

    it("reports an unknown attribute inside a nested expression", () => {
      const result = run(
        dsl({
          expression: { fn: "+", a: 1, b: { fn: "+", a: 1, b: "revenue" } },
          security: "ABC",
        }),
      );

      expect(result).toMatchObject({
        success: false,
        error: { kind: "attribute-not-found" },
      });
    });

    it("reports a missing fact by its attribute and security", () => {
      const result = run(
        dsl({ expression: { fn: "*", a: "shares", b: 2 }, security: "JKL" }),
      );

      expect(result).toEqual({
        success: false,
        error: {
          kind: "fact-not-found",
          message: expect.stringMatching(/shares.*JKL|JKL.*shares/),
        },
      });
    });
  });

  it("does not throw on any input", () => {
    const inputs = ["", "{", "null", "[]", dsl({ security: "ZZZ" })];

    for (const input of inputs) {
      expect(() => run(input)).not.toThrow();
    }
  });

  describe("division by zero", () => {
    it("reports a literal zero divisor", () => {
      const result = run(
        dsl({ expression: { fn: "/", a: 1, b: 0 }, security: "ABC" }),
      );

      expect(result).toEqual({
        success: false,
        error: { kind: "division-by-zero", message: expect.any(String) },
      });
    });

    it("reports a divisor that evaluates to zero", () => {
      const result = run(
        dsl({
          expression: {
            fn: "/",
            a: "price",
            b: { fn: "-", a: "sales", b: "sales" },
          },
          security: "BCD",
        }),
      );

      expect(result).toMatchObject({
        success: false,
        error: { kind: "division-by-zero" },
      });
    });

    it("reports a division by zero inside a nested expression", () => {
      const result = run(
        dsl({
          expression: { fn: "+", a: 1, b: { fn: "/", a: 1, b: 0 } },
          security: "ABC",
        }),
      );

      expect(result).toMatchObject({
        success: false,
        error: { kind: "division-by-zero" },
      });
    });

    it("allows a zero numerator", () => {
      const result = run(
        dsl({ expression: { fn: "/", a: 0, b: 2 }, security: "ABC" }),
      );

      expect(result).toEqual({ success: true, value: 0 });
    });
  });
});

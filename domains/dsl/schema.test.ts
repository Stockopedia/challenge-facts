import { expression, query } from "./schema";

describe("expression schema", () => {
  test.each([
    ["attribute and number operands", { fn: "*", a: "sales", b: 2 }],
    ["two attribute operands", { fn: "/", a: "price", b: "eps" }],
    ["two number operands", { fn: "+", a: 1, b: 2.5 }],
    [
      "nested expressions",
      {
        fn: "-",
        a: { fn: "-", a: "eps", b: "shares" },
        b: { fn: "-", a: "assets", b: "liabilities" },
      },
    ],
    [
      "deeply nested expressions",
      { fn: "+", a: { fn: "+", a: { fn: "+", a: 1, b: 2 }, b: 3 }, b: 4 },
    ],
  ])("accepts %s", (_, input) => {
    const result = expression.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(input);
  });

  test.each([
    ["an unknown operator", { fn: "^", a: 1, b: 2 }],
    ["a missing operator", { a: 1, b: 2 }],
    ["a missing a operand", { fn: "+", b: 2 }],
    ["a missing b operand", { fn: "+", a: 1 }],
    ["a boolean operand", { fn: "+", a: true, b: 2 }],
    ["a null operand", { fn: "+", a: 1, b: null }],
    ["an array operand", { fn: "+", a: [1], b: 2 }],
    [
      "an invalid nested expression",
      { fn: "+", a: { fn: "^", a: 1, b: 2 }, b: 2 },
    ],
    [
      "an incomplete nested expression",
      { fn: "+", a: 1, b: { fn: "+", a: 1 } },
    ],
  ])("rejects %s", (_, input) => {
    expect(expression.safeParse(input).success).toBe(false);
  });
});

describe("query schema", () => {
  const validExpression = { fn: "*", a: "sales", b: 2 };

  it("accepts a security and an expression", () => {
    const input = { security: "ABC", expression: validExpression };

    const result = query.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(input);
  });

  test.each([
    ["a missing security", { expression: validExpression }],
    ["a missing expression", { security: "ABC" }],
    ["a non-string security", { security: 1, expression: validExpression }],
    ["an invalid expression", { security: "ABC", expression: { fn: "^" } }],
    ["the wrong keys", { wrong: 123, security: "BCD" }],
    ["a non-object", "ABC"],
    ["null", null],
  ])("rejects %s", (_, input) => {
    expect(query.safeParse(input).success).toBe(false);
  });
});

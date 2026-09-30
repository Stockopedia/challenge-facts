import { evaluate } from "./interpreter";

describe("evaluates a simple expression", () => {

  it("multiplies an attribute (by a number)", () => {
    const dsl = `{
      "expression": {"fn": "*", "a": "sales", "b": 2},
      "security": "ABC"
    }`;

    expect(evaluate(dsl)).toBe(8);
  });

  it("divides one attribute by another", () => {
    const dsl = `{
      "expression": {"fn": "/", "a": "price", "b": "eps"},
      "security": "BCD"
    }`;

    expect(evaluate(dsl)).toBe(0.5);
  });
});

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

describe("rejects malformed JSON", () => {
  it("throws when a closing brace is missing (invalid JSON)", () => {
    const dsl = `{
      "expression": {"fn": "+", "a": "price", "b": "eps"},
      "security": "BCD"
    `;

    expect(() => evaluate(dsl)).toThrow("Invalid JSON");
  });
});

describe("rejects a wrongly shaped JSON", () => {
  it("throws when expression is missing", () => {
    const dsl = `{
      "wrong": 123,
      "security": "BCD"
    }`;

    expect(() => evaluate(dsl)).toThrow('"expression" must be an object');
  });

  it("throws when the security isn't a string", () => {
    const dsl = `{
      "expression": {"fn": "*", "a": "sales", "b": 2},
      "security": 1
    }`;

    expect(() => evaluate(dsl)).toThrow('"security" must be a string');
  });

  it("throws when operator isn't known", () => {
    const dsl = `{
      "expression": {"fn": "^", "a": "sales", "b": 2},
      "security": "ABC"
    }`;

    expect(() => evaluate(dsl)).toThrow('"expression.fn" must be one of');
  });

  it("throws when a side is not a number, an attribute or an expression", () => {
    const dsl = `{
      "expression": {"fn": "*", "a": true, "b": 2},
      "security": "ABC"
    }`;

    expect(() => evaluate(dsl)).toThrow('"expression.a" must be an object');
  });

  it("names the path when when we have an issue inside a nested expression", () => {
    const dsl = `{
      "expression": {
        "fn": "-",
        "a": {"fn": "-", "a": "eps", "b": "shares"},
        "b": {"fn": "%", "a": "assets", "b": "liabilities"}
      },
      "security": "CDE"
    }`;

    expect(() => evaluate(dsl)).toThrow('"expression.b.fn" must be one of');
  });
});

describe("rejects a lookup that fails", () => {
  it("throws when the security does not exist", () => {
    const dsl = `{
      "expression": {"fn": "*", "a": "sales", "b": 2},
      "security": "ZZZ"
    }`;

    expect(() => evaluate(dsl)).toThrow('Unknown security "ZZZ"');
  });

  it("throws when attribute does not exist", () => {
    const dsl = `{
      "expression": {"fn": "*", "a": "turnover", "b": 2},
      "security": "ABC"
    }`;

    expect(() => evaluate(dsl)).toThrow('Unknown attribute "turnover"');
  });

  it("throws when attribute is unknown inside a nested expression", () => {
    const dsl = `{
      "expression": {
        "fn": "-",
        "a": {"fn": "-", "a": "eps", "b": "shares"},
        "b": {"fn": "-", "a": "assets", "b": "turnover"}
      },
      "security": "CDE"
    }`;

    expect(() => evaluate(dsl)).toThrow('Unknown attribute "turnover"');
  });

  it("throws when the security has no fact for an attribute", () => {
    const dsl = `{
      "expression": {"fn": "*", "a": "shares", "b": 2},
      "security": "JKL"
    }`;

    expect(() => evaluate(dsl)).toThrow(
      'No fact for attribute "shares" on the security with id 10',
    );
  });
});

describe("evaluates a nested expression", () => {
  it("subtracts the result of two subtractions", () => {
    const dsl = `{
      "expression": {
        "fn": "-",
        "a": {"fn": "-", "a": "eps", "b": "shares"},
        "b": {"fn": "-", "a": "assets", "b": "liabilities"}
      },
      "security": "CDE"
    }`;

    expect(evaluate(dsl)).toBe(-21);
  });
});

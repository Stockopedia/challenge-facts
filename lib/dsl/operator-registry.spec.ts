import { isOperator, OPERATORS } from "./operator-registry";

describe("operator registry", () => {
  it.each([
    ["+", 6, 2, 8],
    ["-", 6, 2, 4],
    ["*", 6, 2, 12],
    ["/", 6, 2, 3],
  ])("%s works out the answer", (symbol, a, b, expected) => {
    expect(OPERATORS[symbol](a, b)).toBe(expected);
  });

  it("recognises the supported operators", () => {
    expect(["+", "-", "*", "/"].every(isOperator)).toBe(true);
  });

  it.each(["^", "toString", "constructor", 1, null])("rejects %p", (value) => {
    expect(isOperator(value)).toBe(false);
  });
});
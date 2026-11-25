import interpret from "./interpret";

describe("The interpret function", () => {
  it("evaluates a valid DSL query", () =>
    expect(
      interpret({ security: "ABC", expression: { fn: "+", a: 2, b: 2 } }),
    ).toBe(4));

  describe("throws an error if a DSL query", () => {
    xit("has an invalid security token", () => {});
    xit("has an invalid attribute", () => {});
    xit("has an invalid function", () => {});
  });
});

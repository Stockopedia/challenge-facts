import parse from "./parse";

describe("The parse function", () => {
  it("accepts a DSL query string and returns a DSL query object", () =>
    expect(
      parse(`{"security":"ABC", "expression":{"fn":"+","a":1,"b":1}}`),
    ).toMatchObject({ security: "ABC", expression: { fn: "+", a: 1, b: 1 } }));

  describe("throws an error if a DSL query string", () => {
    xit("is malformed", () => {});
    xit("is not an object", () => {});
    xit("has the wrong number of fields", () => {});
    xit("has invalid fields", () => {});
    xit("has a non-object expression", () => {});
    xit("has an expression with the wrong number of fields", () => {});
    xit("has an expression with invalid fields", () => {});
    xit("has an expression with an invalid function", () => {});
  });
});

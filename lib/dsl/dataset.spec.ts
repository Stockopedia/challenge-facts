import { findAttribute, findFact, findSecurity } from "./dataset";

describe("dataset", () => {
  it("finds a security by its symbol", () => {
    expect(findSecurity("ABC")).toEqual({ id: 1, symbol: "ABC" });
    expect(findSecurity("ZZZ")).toBeUndefined();
  });

  it("finds an attribute by its name", () => {
    expect(findAttribute("sales")).toEqual({ id: 4, name: "sales" });
    expect(findAttribute("colour")).toBeUndefined();
  });

  it("finds the fact for a security and attribute", () => {
    expect(findFact(1, 4)).toBe(4); 
    expect(findFact(3, 10)).toBe(30); 
  });

  it("returns undefined when a fact is missing", () => {
    expect(findFact(10, 10)).toBeUndefined(); 
  });
});
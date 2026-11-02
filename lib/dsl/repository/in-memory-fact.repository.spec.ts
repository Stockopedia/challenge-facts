import { InMemoryFactRepository } from "./in-memory-fact.repository";

const SECURITY = { id: 1, symbol: "ABC" };
const ATTRIBUTE = { id: 7, name: "price" };
const FACT_ROW = { security_id: 1, attribute_id: 7, value: 42 };

describe("InMemoryFactRepository", () => {
  const repository = new InMemoryFactRepository(
    [SECURITY],
    [ATTRIBUTE],
    [FACT_ROW],
  );

  describe("findSecurity", () => {
    it("should return the security with the given symbol", () => {
      expect(repository.findSecurity("ABC")).toEqual(SECURITY);
    });

    it("should return undefined for an unknown symbol", () => {
      expect(repository.findSecurity("XYZ")).toBeUndefined();
    });
  });

  describe("findAttribute", () => {
    it("should return the attribute with the given name", () => {
      expect(repository.findAttribute("price")).toEqual(ATTRIBUTE);
    });

    it("should return undefined for an unknown name", () => {
      expect(repository.findAttribute("eps")).toBeUndefined();
    });
  });

  describe("findFact", () => {
    it("should return the fact mapped from a snake_case row to a camelCase Fact", () => {
      expect(repository.findFact(1, 7)).toEqual({
        securityId: 1,
        attributeId: 7,
        value: 42,
      });
    });

    it("should return undefined when ids are swapped", () => {
      expect(repository.findFact(7, 1)).toBeUndefined();
    });
  });
});

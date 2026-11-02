import type { Attribute } from "../../../models/attribute";
import type { Fact } from "../../../models/fact";
import type { Security } from "../../../models/security";
import type { FactRepository, FactRow } from "./repository.types";

/** Indexes the whole data set in memory for O(1) lookups. */
export class InMemoryFactRepository implements FactRepository {
  private readonly securities: ReadonlyMap<string, Security>;
  private readonly attributes: ReadonlyMap<string, Attribute>;
  private readonly facts: ReadonlyMap<string, Fact>;

  constructor(
    securities: readonly Security[],
    attributes: readonly Attribute[],
    factRows: readonly FactRow[],
  ) {
    this.securities = new Map(securities.map((s) => [s.symbol, s]));
    this.attributes = new Map(attributes.map((a) => [a.name, a]));
    this.facts = new Map(
      factRows.map((row) => [
        factKey(row.security_id, row.attribute_id),
        toFact(row),
      ]),
    );
  }

  findSecurity(symbol: string): Security | undefined {
    return this.securities.get(symbol);
  }

  findAttribute(name: string): Attribute | undefined {
    return this.attributes.get(name);
  }

  findFact(securityId: number, attributeId: number): Fact | undefined {
    return this.facts.get(factKey(securityId, attributeId));
  }
}

function factKey(securityId: number, attributeId: number): string {
  return `${securityId}:${attributeId}`;
}

/** data/facts.json uses snake_case; the Fact model uses camelCase. */
function toFact(row: FactRow): Fact {
  return {
    securityId: row.security_id,
    attributeId: row.attribute_id,
    value: row.value,
  };
}

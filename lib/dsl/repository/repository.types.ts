import type { Attribute } from "../../../models/attribute";
import type { Fact } from "../../../models/fact";
import type { Security } from "../../../models/security";

/** Read access to the data set; the interpreter depends only on this. */
export interface FactRepository {
  findSecurity(symbol: string): Security | undefined;
  findAttribute(name: string): Attribute | undefined;
  findFact(securityId: number, attributeId: number): Fact | undefined;
}

/** Shape of a row in data/facts.json (snake_case, unlike the Fact model). */
export interface FactRow {
  security_id: number;
  attribute_id: number;
  value: number;
}

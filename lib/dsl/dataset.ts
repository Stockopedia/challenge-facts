import attributes from "../../data/attributes.json";
import facts from "../../data/facts.json";
import securities from "../../data/securities.json";

export const findSecurity = (symbol: string) =>
  securities.find((security) => security.symbol === symbol);

export const findAttribute = (name: string) =>
  attributes.find((attribute) => attribute.name === name);

export const findFact = (securityId: number, attributeId: number) =>
  facts.find(
    (fact) =>
      fact.security_id === securityId && fact.attribute_id === attributeId,
  )?.value;
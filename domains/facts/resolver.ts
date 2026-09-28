import { facts } from './schema';
import rawFacts from '../../data/facts.json';
import { Attribute } from '../attributes/schema';
import { Security } from '../securities/schema';

const data = facts.parse(rawFacts);

export function resolveFact({ attribute, security }: { attribute: Attribute, security: Security }) {
  const foundFact = data.find((fact) => fact.attributeId === attribute.id && fact.securityId === security.id);

  if (!foundFact) {
    throw new FactNotFoundError({ attribute, security })
  }

  return foundFact;
}


export class FactError extends Error { }


export class FactNotFoundError extends FactError {
  constructor({
    attribute, security
  }: { attribute: Attribute, security: Security }) {
    super(`Unable to find the Fact with the attribute "${attribute.name}" and the security "${security.symbol}"`)
  }
}

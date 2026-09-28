import { type Attribute, attributes } from './schema';
import rawAttributes from '../../data/attributes.json';

const data = attributes.parse(rawAttributes)


export function resolveAttributeByName(name: Attribute['name']) {
  const attribute = data.find((attr) =>  attr.name === name);

  if (!attribute) {
    throw new AttributeNotFoundError(name);
  }

  return attribute;
}

export class AttributeError extends Error { }

export class AttributeNotFoundError extends AttributeError {
  constructor(name: Attribute['name']) {
    super(`Attribute  ${name ? `with name ${name}`: ''} not found`)
  }
}

import { type Security, securities } from './schema';
import rawSecurities from '../../data/securities.json';

const data = securities.parse(rawSecurities)


export function resolveSecurityBySymbol(symbol: Security['symbol']): Security {
  const security = data.find((sec) => sec.symbol === symbol);

  if (!security) {
    throw new SecurityNotFoundError(symbol);
  }

  return security;
}

export class SecurityError extends Error { }

export class SecurityNotFoundError extends SecurityError {
  constructor(symbol: Security['symbol']) {
    super(`Security with symbol ${symbol} not found`)
  }
}

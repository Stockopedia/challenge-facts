import { Operator } from './schema';

type OperatorFn = (a: number, b: number) => number;

export const operatorFns: Record<Operator, OperatorFn> = {
  "*": (a, b) => a * b,
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "/": (a, b) => {
    if (b === 0) {
      throw new DivisionByZeroError(a)
    }
    return a / b
  }
};


export class DivisionByZeroError extends Error {
  constructor(numerator: number) {
    super(`Cannot divide ${numerator} by zero`);
  }
}

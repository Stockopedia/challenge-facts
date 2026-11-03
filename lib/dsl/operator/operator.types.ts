import type { Operator } from "./operator.enum";

export type BinaryOperator = (a: number, b: number) => number;

/**
 * Implementation for every `Operator`. A full Record, so the compiler fails
 * if an enum member has no implementation.
 */
export type Operators = Readonly<Record<Operator, BinaryOperator>>;

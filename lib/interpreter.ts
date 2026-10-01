import attributes from "../data/attributes.json";
import facts from "../data/facts.json";
import securities from "../data/securities.json";
import type { Expression, Query } from "../models/query";
import {
  DivisionByZeroError,
  InvalidJsonError,
  InvalidShapeError,
  LookupError,
} from "./errors";

// we need two numbers but a side can also be an attribute name like "sales" OR anotehr expression so we just turn whatever we get into a number
const getNumber = (
  operand: string | number | Expression,
  securityId: number,
): number => {

  if (typeof operand === "number") {
    return operand;
  }

  // so an object means another expression inside this one!
  if (typeof operand === "object") {
    return calculate(operand, securityId);
  }

  // it must be an attribute name
  const attribute = attributes.find((attr) => attr.name === operand);
  if (!attribute) {
    throw new LookupError(`Unknown attribute "${operand}"`);
  }

  // the attribute might exist but not every security has a fact for it
  const fact = facts.find(
    (f) => f.security_id === securityId && f.attribute_id === attribute.id,
  );
  if (!fact) {
    throw new LookupError(
      `We don't have a fact for attribute "${operand}" on the security with id ${securityId}`,
    );
  }

  return fact.value;
};

// both sides have to be numbers before we can apply the operator, now a side can be another expression hence we calls getNumber which is then calling calculate again
const calculate = (expression: Expression, securityId: number): number => {
  const a = getNumber(expression.a, securityId);
  const b = getNumber(expression.b, securityId);

  // the operator will decide what we'll do with the two numbers
  switch (expression.fn) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      // dividing by zero gives will look like a real answer and that's not right
      if (b === 0) {
        throw new DivisionByZeroError("Can't divide by zero");
      }
      return a / b;
    default:
      // this should be fine for now, deal with it later
      return NaN;
  }
};

const operators = ["+", "-", "*", "/"];

const objectCheck = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// valid JSON can still be the wrong shape, e.g. no "expression" at all, and then calculate would crash with an unclear message
// so we check everything first and say which field is wrong, name is where we are in the query like "expression.a"
const checkExpression = (expression: unknown, name: string): void => {
  if (!objectCheck(expression)) {
    throw new InvalidShapeError(`Invalid DSL: "${name}" must be an object`);
  }

  if (typeof expression.fn !== "string" || !operators.includes(expression.fn)) {
    throw new InvalidShapeError(
      `Invalid DSL: "${name}.fn" must be one of ${operators.join(" ")}`,
    );
  }

  checkOperand(expression.a, `${name}.a`);
  checkOperand(expression.b, `${name}.b`);
};

// a side is fine as a number or an attribute name, anything else must be another expression
const checkOperand = (operand: unknown, name: string): void => {
  if (typeof operand === "number" || typeof operand === "string") {
    return;
  }

  checkExpression(operand, name);
};

const checkQuery = (query: unknown): void => {
  if (!objectCheck(query)) {
    throw new InvalidShapeError("Invalid DSL: the query must be an object");
  }

  if (typeof query.security !== "string") {
    throw new InvalidShapeError('Invalid DSL: "security" must be a string');
  }

  checkExpression(query.expression, "expression");
};

// this now reads the text the user typed then finds the security and we get back the final number
export const evaluate = (text: string): number => {
  // JSON.parse throws here so we catch that
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new InvalidJsonError(`Invalid JSON: ${(e as Error).message}`);
  }

  checkQuery(parsed);
  const { security, expression } = parsed as Query;

  const foundSecurity = securities.find((s) => s.symbol === security);
  if (!foundSecurity) {
    throw new LookupError(`Unknown security "${security}"`);
  }

  return calculate(expression, foundSecurity.id);
};

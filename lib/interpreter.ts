import attributes from "../data/attributes.json";
import facts from "../data/facts.json";
import { z } from "zod";
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

// we have every operator we support and what it does with the two numbers
// so we had this list in both the switch and in the shape check so adding an operator meant remembering both places
const operators: Record<string, (a: number, b: number) => number> = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => {
    // dividing by zero gives will look like a real answer and that's not right
    if (b === 0) {
      throw new DivisionByZeroError("Can't divide by zero");
    }
    return a / b;
  },
};

const operatorSymbols = Object.keys(operators);

// both sides have to be numbers before we can apply the operator, now a side can be another expression hence we calls getNumber which is then calling calculate again
const calculate = (expression: Expression, securityId: number): number => {
  const a = getNumber(expression.a, securityId);
  const b = getNumber(expression.b, securityId);

  // the operator will decide what we'll do with the two numbers
  return operators[expression.fn](a, b);
};

// valid JSON can still be the wrong shape, e.g. no "expression" at all, and then calculate would crash with an unclear message
// so the schema describes the shape we expect and Zod now checks that for us
// expressionSchema has to be lazy because an expression can hold another expression inside it
const expressionSchema: z.ZodType<Expression> = z.lazy(() =>
  z.object(
    {
      fn: z
        .string({ error: "must be a string" })
        .refine((fn) => operatorSymbols.includes(fn), {
          error: `must be one of ${operatorSymbols.join(" ")}`,
        }),
      a: operandSchema,
      b: operandSchema,
    },
    { error: "must be an object" },
  ),
);

// a side is fine as a number or an attribute name, anything else must be another expression
const operandSchema = z.union([z.number(), z.string(), expressionSchema], {
  error: "must be a number, an attribute name or an expression",
});

const querySchema: z.ZodType<Query> = z.object(
  {
    security: z.string({ error: "must be a string" }),
    expression: expressionSchema,
  },
  { error: "must be an object" },
);

// we only report the first problem, path is where it is in the query like "expression.a"
const checkQuery = (parsed: unknown): Query => {
  const result = querySchema.safeParse(parsed);
  if (!result.success) {
    const { path, message } = result.error.issues[0];
    const where = path.length ? `"${path.join(".")}"` : "the query";
    throw new InvalidShapeError(`Invalid DSL: ${where} ${message}`);
  }

  return result.data;
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

  const { security, expression } = checkQuery(parsed);

  const foundSecurity = securities.find((s) => s.symbol === security);
  if (!foundSecurity) {
    throw new LookupError(`Unknown security "${security}"`);
  }

  return calculate(expression, foundSecurity.id);
};

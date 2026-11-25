import {
  AttributeNotFoundError,
  InvalidOperationError,
  OperatorNotFoundError,
  SecurityNotFoundError,
} from "./errors";
import { DSLQuery, Operand, Operator } from "./types";
import rawSecurities from "@/data/securities.json";
import rawFacts from "@/data/facts.json";
import rawAttributes from "@/data/attributes.json";

type Operators = { [key in Operator]: (a: number, b: number) => number };

const operators: Operators = {
  "*": (a, b) => a * b,
  "/": (a, b) => {
    if (b === 0)
      throw new InvalidOperationError(
        "A query expression tried to divide by zero.",
      );
    return a / b;
  },
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
};

const calculate = (a: number, b: number, fn: Operator) => {
  if (!(fn in operators)) {
    throw new OperatorNotFoundError("A supplied function is invalid.");
  }
  return operators[fn](a, b);
};

const evaluate = (operand: Operand, facts: Map<string, number>): number => {
  if (typeof operand === "number") return operand;
  if (typeof operand === "string") {
    const result = facts.get(operand);
    if (result === undefined) {
      throw new AttributeNotFoundError("A supplied attribute is invalid.");
    }
    return result;
  }

  return calculate(
    evaluate(operand.a, facts),
    evaluate(operand.b, facts),
    operand.fn,
  );
};

const interpret = (query: DSLQuery) => {
  // Check security exists
  const securities = new Map<string, number>(
    rawSecurities.map((security) => [security.symbol, security.id]),
  );
  if (!securities.has(query.security)) {
    throw new SecurityNotFoundError("The supplied security token is invalid.");
  }

  const attributes = new Map<number, string>(
    rawAttributes.map((attribute) => [attribute.id, attribute.name]),
  );

  // Populate facts map by converting raw facts into attribute -> value references for our particular security
  const facts = new Map<string, number>();
  const filteredFacts = rawFacts.filter(
    (fact) => fact.security_id === securities.get(query.security),
  );
  for (const fact of filteredFacts) {
    const attributeName = attributes.get(fact.attribute_id);
    if (attributeName === undefined) {
      throw new AttributeNotFoundError();
    }
    facts.set(attributeName, fact.value);
  }

  // Evaluate expression
  return evaluate(query.expression, facts);
};

export default interpret;

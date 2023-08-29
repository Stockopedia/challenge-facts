import { DSL, Expression } from "../../models/dsl";
import securities from "../../data/securities.json";
import attributes from "../../data/attributes.json";
import facts from "../../data/facts.json";

// Adding new operators could be achieved by simply adding a record into this object => but the fn type will need to be updated in ../../models/dsl
const operators = {
  "+": (a: number, b: number) => a + b,
  "*": (a: number, b: number) => a * b,
  "-": (a: number, b: number) => a - b,
  "/": (a: number, b: number) => a / b,
};

export const execute = (dsl: DSL): [boolean, number, string] => {
  try {
    // 1. Find the security object from the data file
    const security = securities.find((value) => value.symbol === dsl.security);
    if (!security) {
      // If the security wasn't found, return out.
      return [false, 0, `Security (${dsl.security}) could not be found.`];
    }

    // 2. Security found, start evaluating the expression in the DSL.
    return evaluateExpression(dsl.expression, security.id);
  } catch (error) {
    // Catching incase something goes wrong not accounted for.
    return [false, 0, "Something was wrong executing the DSL."];
  }
};

const evaluateExpression = (
  expression: Expression,
  securityId: number,
): [boolean, number, string] => {
  // 1. Evaluate the "a" side of the expression.
  const [successA, a, errorMessageA] = evaluateParameter(
    expression.a,
    securityId,
  );

  // If evaluating the "a" side failed, return out.
  if (!successA) {
    return [false, 0, errorMessageA];
  }

  // 2. Evaluate the "b" side of the expression.
  const [successB, b, errorMessageB] = evaluateParameter(
    expression.b,
    securityId,
  );

  // If evaluating the "b" side failed, return out.
  if (!successB) {
    return [false, 0, errorMessageB];
  }

  // 3. Once we have the values for "a" and "b", evaluate the value to be returned.
  return [true, operators[expression.fn](a, b), ""];
};

const evaluateParameter = (
  param: string | Expression | number,
  securityId: number,
): [boolean, number, string] => {
  // 1. If the parameter is an object, then it is an expression and needs to be evaluated as such.
  if (typeof param === "object") {
    return evaluateExpression(param, securityId);
  }
  // 2. If the parameter is a string, then go and find the attributes value it refers to.
  else if (typeof param === "string") {
    return findAttributeValue(param, securityId);
  }
  // 3. The parameter must be a number, so return it in the return value.
  else {
    return [true, param, ""];
  }
};

const findAttributeValue = (
  attributeName: string,
  securityId: number,
): [boolean, number, string] => {
  // 1. Retrieve the attribute object.
  const attribute = attributes.find((value) => value.name === attributeName);

  // If the attribute wasn't found, then start returning.
  if (!attribute) {
    return [false, 0, `Attribute (${attributeName}) could not be found.`];
  }

  // 2. Find the fact referenced by the security and the attribute.
  const fact = facts.find(
    (value) =>
      value.attribute_id === attribute.id && value.security_id === securityId,
  );

  // If the fact wasn't found, start returning.
  if (!fact) {
    return [false, 0, `Value not found for ${attributeName}.`];
  }

  // 3. Return the value of the fact.
  return [true, fact.value, ""];
};

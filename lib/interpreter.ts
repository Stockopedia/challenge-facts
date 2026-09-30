import attributes from "../data/attributes.json";
import facts from "../data/facts.json";
import securities from "../data/securities.json";

// so a side on an expression could be a number or an attribute name or another expr inside it
// move later to  its own file
interface Expression {
  fn: string;
  a: string | number | Expression;
  b: string | number | Expression;
}

interface Query {
  security: string;
  expression: Expression;
}

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
  const fact = facts.find(
    (f) => f.security_id === securityId && f.attribute_id === attribute?.id,
  );
  return fact?.value as number;
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
      return a / b;
    default:
      // this should be fine for now, deal with it later
      return NaN;
  }
};

// this now reads the text the user typed then finds the security and we get back the final number
export const evaluate = (text: string): number => {

  const query: Query = JSON.parse(text);
  const { security, expression } = query;

  // we cast to a number for now, will deal with edge cases later
  const securityId = securities.find((s) => s.symbol === security)
    ?.id as number;

  return calculate(expression, securityId);
};

import attributes from "../data/attributes.json";
import facts from "../data/facts.json";
import securities from "../data/securities.json";

// a flat expression where each side is a number or an attribute name
// move later to  its own file
interface FlatExpression {
  fn: string;
  a: string | number;
  b: string | number;
}

interface Query {
  security: string;
  expression: FlatExpression;
}

// we need two numbers but a side can also be an attribute name like "sales" so win this we find its fact value for that security
const resolve = (operand: string | number, securityId: number): number => {

  if (typeof operand === "number") {
    return operand;
  }

  const attribute = attributes.find((attr) => attr.name === operand);
  const fact = facts.find(
    (f) => f.security_id === securityId && f.attribute_id === attribute?.id,
  );
  return fact?.value as number;
};

// we parse the JSON and get the security with Array.find
export const evaluate = (text: string): number => {

  const query: Query = JSON.parse(text);
  const { security, expression } = query;

  // we cast to a number for now, will deal with edge cases later
  const securityId = securities.find((s) => s.symbol === security)
    ?.id as number;

  const a = resolve(expression.a, securityId);
  const b = resolve(expression.b, securityId);

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

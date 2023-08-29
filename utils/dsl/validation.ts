import { DSL, Expression } from "../../models/dsl";

const validateSide = (
  param: string | number | Expression,
  side: string,
): [boolean, string] => {
  // 1. Validate field type
  if (
    typeof param !== "string" &&
    typeof param !== "number" &&
    typeof param !== "object"
  ) {
    return [false, `${side} field is not a valid type: ${param}`];
  }

  // 2. If side is an object, recursively validate the expression inside of it again.
  if (typeof param === "object") {
    const [success, error] = validExpression(param);

    if (!success) {
      return [false, error];
    }
  }

  return [true, ""];
};

const validExpression = (expression: Expression): [boolean, string] => {
  // 1. Check that the expression contains the relevant fields we expect AND only those fields.
  if (!expression.fn || !expression.a || !expression.b) {
    return [
      false,
      'Missing field in "expression": ' +
        JSON.stringify(expression, undefined, 1),
    ];
  }

  if (Object.keys(expression).length !== 3) {
    return [
      false,
      'Too many fields in "expression": ' +
        JSON.stringify(expression, undefined, 1),
    ];
  }

  // 2. Validate "fn" field type
  if (
    expression.fn !== "*" &&
    expression.fn !== "+" &&
    expression.fn !== "-" &&
    expression.fn !== "/"
  ) {
    return [false, '"fn" field is not a valid type: ' + expression.fn];
  }

  // 3. Validate "a" field type
  const [aSuccess, aError] = validateSide(expression.a, "a");

  if (!aSuccess) {
    return [false, aError];
  }

  // 4. Validate "b" field type
  const [bSuccess, bError] = validateSide(expression.b, "b");

  if (!bSuccess) {
    return [false, bError];
  }

  // 5. If it got here the expressions fine, so return true.
  return [true, ""];
};

const isDslWhole = (dsl: DSL): [boolean, string] => {
  // 1. Validate "security" field is there and the correct type
  if (!dsl.security || typeof dsl.security !== "string") {
    return [false, '"security" field is missing or not a valid type in root.'];
  }

  // 2. Validate "expression" field is there and the correct type
  if (!dsl.expression || typeof dsl.expression !== "object") {
    return [
      false,
      '"expression" field is missing or not a valid type in root.',
    ];
  }

  // 3. Validate there are no additional fields in the DSL
  if (Object.keys(dsl).length !== 2) {
    return [false, "Too many fields in root."];
  }

  // 4. Validate the expression and return the answer from that
  return validExpression(dsl.expression);
};

export const validateDsl = (dsl: string): [boolean, string] => {
  try {
    // 1. Try and parse the dsl to an object. If it succeeds, the DSL is valid JSON
    const dslParsed: DSL = JSON.parse(dsl);

    // 2. Validate the DSL fields entirely.
    return isDslWhole(dslParsed);
  } catch (error) {
    // If the JSON parse failed, return false from here.
    return [false, "Invalid JSON."];
  }
};

export const OPERATORS: Record<string, (a: number, b: number) => number> = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
};


export const isOperator = (name: unknown): name is string =>
  typeof name === "string" && Object.hasOwn(OPERATORS, name);
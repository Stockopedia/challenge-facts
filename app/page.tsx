"use client";

import { ChangeEvent, FunctionComponent, useState } from "react";
import attributesData from "../data/attributes.json";
import factsData from "../data/facts.json";
import securitiesData from "../data/securities.json";
import styles from "./page.module.css";

interface DSLExample {
  id: string;
  label: string;
  dsl: string;
}

interface Expression {
  fn: string;
  a: unknown;
  b: unknown;
}

interface Query {
  security: string;
  expression: Expression;
}

const examples: readonly DSLExample[] = [
  {
    id: "multiply",
    label: "Simple multiplication",
    dsl: `{
  "expression": {"fn": "*", "a": "sales", "b": 2},
  "security": "ABC"
}`,
  },
  {
    id: "divide",
    label: "Simple division",
    dsl: `{
  "expression": {"fn": "/", "a": "price", "b": "eps"},
  "security": "BCD"
}`,
  },
  {
    id: "nested",
    label: "Nested expression",
    dsl: `{
  "expression": {
    "fn": "-",
    "a": {"fn": "-", "a": "eps", "b": "shares"},
    "b": {"fn": "-", "a": "assets", "b": "liabilities"}
  },
  "security": "CDE"
}`,
  },
  {
    id: "invalid-json",
    label: "Invalid JSON",
    dsl: `{
  "expression": {"fn": "+", "a": "price", "b": "eps"},
  "security": "BCD"
`,
  },
  {
    id: "invalid-dsl",
    label: "Invalid DSL",
    dsl: `{
  "wrong": 123,
  "security": "BCD"
}`,
  },
  {
    id: "missing-security",
    label: "Missing security",
    dsl: `{
  "expression": {"fn": "*", "a": "sales", "b": 2},
  "security": "ZZZ"
}`,
  },
];

const securities = securitiesData as Array<{ id: number; symbol: string }>;
const attributes = attributesData as Array<{ id: number; name: string }>;
const facts = factsData as Array<{
  security_id: number;
  attribute_id: number;
  value: number;
}>;

const supportedOperators = new Set(["+", "-", "*", "/"]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function validateQuery(value: unknown): Query {
  if (!isRecord(value)) {
    throw new Error("A query must be a JSON object.");
  }

  // Security validate
  if (typeof value.security !== "string" || value.security.trim() === "")
    throw new Error('The "security" field must be a non-empty string.');

  // Expression validate
  if (!isRecord(value.expression))
    throw new Error('The "expression" field must be an object.');
  validateExpression(value.expression);

  return value as unknown as Query;
}

function validateExpression(value: unknown): void {
  if (!isRecord(value)) {
    throw new Error("Each expression must be an object.");
  }

  if (typeof value.fn !== "string") {
    throw new Error('Each expression must have a string "fn" field.');
  }

  if (!("a" in value) || !("b" in value)) {
    throw new Error('Each expression must have both "a" and "b" fields.');
  }

  if (!supportedOperators.has(value.fn)) {
    throw new Error(
      `Unsupported operator "${value.fn}". Supported operators: ${Array.from(supportedOperators).join(", ")}.`,
    );
  }

  for (const operand of [value.a, value.b]) {
    if (isRecord(operand)) {
      validateExpression(operand);
      continue;
    }

    if (typeof operand === "string") continue;

    if (typeof operand !== "number" || !Number.isFinite(operand)) {
      throw new Error(
        "Expression arguments must be attribute names, finite numbers, or expressions.",
      );
    }
  }
}

function runQuery(source: string): number {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    throw new Error(
      "The query is not valid JSON. Check the braces, commas, and quotation marks.",
    );
  }

  const query = validateQuery(parsed);
  const security = securities.find(({ symbol }) => symbol === query.security);
  if (!security) throw new Error(`Security "${query.security}" was not found.`);

  const evaluateOperand = (operand: unknown): number => {
    if (typeof operand === "number") return operand;
    if (typeof operand === "string") {
      const attribute = attributes.find(({ name }) => name === operand);
      if (!attribute) throw new Error(`Attribute "${operand}" was not found.`);
      const fact = facts.find(
        (item) =>
          item.security_id === security.id &&
          item.attribute_id === attribute.id,
      );
      if (!fact) {
        throw new Error(
          `No value was found for "${operand}" on ${security.symbol}.`,
        );
      }
      return fact.value;
    }
    return evaluateExpression(operand as Expression);
  };

  const evaluateExpression = (expression: Expression): number => {
    const a = evaluateOperand(expression.a);
    const b = evaluateOperand(expression.b);
    switch (expression.fn) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        if (b === 0) throw new Error("Cannot divide by zero.");
        return a / b;
      default:
        throw new Error(`Operator "${expression.fn}" is not yet supported.`);
    }
  };

  const result = evaluateExpression(query.expression);
  if (!Number.isFinite(result))
    throw new Error("The calculation did not produce a finite number.");
  return result;
}

const Home: FunctionComponent = () => {
  const [expression, setExpression] = useState<string>(examples[0].dsl);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const setDsl = (dsl: string) => () => {
    setExpression(dsl);
    setResult("");
    setError("");
  };
  const execute = () => {
    try {
      setResult(String(runQuery(expression)));
      setError("");
    } catch (cause) {
      setResult("");
      setError(
        cause instanceof Error
          ? cause.message
          : "The query could not be evaluated.",
      );
    }
  };

  return (
    <main className={styles.container}>
      <h1>Welcome to facts!</h1>
      <p>
        Enter the DSL query below and press the{" "}
        <strong>
          <q>run</q>
        </strong>{" "}
        button to evaluate it.
      </p>

      {/* Pre-canned Examples Section */}
      <div className={styles.section}>
        <p id="pre-canned-description">
          <strong>Pre-canned examples:</strong>
        </p>
        <nav
          className={styles.navigation}
          aria-describedby="pre-canned-description"
        >
          {examples.map(({ id, label, dsl }) => (
            <button
              type="button"
              onClick={setDsl(dsl)}
              key={id}
              data-testid={`button-${id}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* DSL Editor Section */}
      <div className={styles.section}>
        <label htmlFor="dsl-expression">DSL Expression:</label>
        <textarea
          id="dsl-expression"
          className={styles.field}
          data-testid="expression-input"
          placeholder="Enter your DSL"
          value={expression}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setExpression(event.target.value)
          }
          rows={8}
        />
        {result && (
          <div
            className={[styles.message, styles.messageSuccess].join(" ")}
            role="status"
          >
            DSL query ran successfully.
          </div>
        )}
        {error && (
          <div
            className={[styles.message, styles.messageError].join(" ")}
            role="alert"
          >
            {error}
          </div>
        )}
        <button data-testid="run-button" type="button" onClick={execute}>
          Run
        </button>
      </div>

      {/* DSL Output Section */}
      <div className={styles.section}>
        <label htmlFor="dsl-output">Output:</label>
        <textarea
          id="dsl-output"
          className={styles.field}
          data-testid="output"
          readOnly
          rows={1}
          value={result}
        />
      </div>
    </main>
  );
};

export default Home;

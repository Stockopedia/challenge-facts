"use client";

import { ChangeEvent, FunctionComponent, useState } from "react";

import attributes from "../data/attributes.json";
import facts from "../data/facts.json";
import securities from "../data/securities.json";
import {
  FactsInterpreter,
  InMemoryFactRepository,
  type Result,
} from "../lib/dsl";
import styles from "./page.module.css";

const interpreter = new FactsInterpreter(
  new InMemoryFactRepository(securities, attributes, facts),
);

interface DSLExample {
  id: string;
  label: string;
  dsl: string;
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

const Home: FunctionComponent = () => {
  const [expression, setExpression] = useState<string>(examples[0].dsl);
  const [lastRun, setLastRun] = useState<{
    input: string;
    result: Result<number>;
  } | null>(null);

  // A result is only shown for the exact input it was computed from.
  const result = lastRun?.input === expression ? lastRun.result : null;

  const setDsl = (dsl: string) => () => setExpression(dsl);
  const run = () =>
    setLastRun({ input: expression, result: interpreter.run(expression) });

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
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setExpression(e.target.value)
          }
          rows={8}
        ></textarea>
        {result?.ok && (
          <div
            role="status"
            data-testid="success-message"
            className={[styles.message, styles.messageSuccess].join(" ")}
          >
            DSL query ran successfully!
          </div>
        )}
        {result && !result.ok && (
          <div
            role="alert"
            data-testid="error-message"
            className={[styles.message, styles.messageError].join(" ")}
          >
            There is a problem with your DSL query: {result.error.message}
          </div>
        )}
        <button data-testid="run-button" type="button" onClick={run}>
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
          value={result?.ok ? String(result.value) : ""}
          readOnly
          rows={1}
        ></textarea>
      </div>
    </main>
  );
};

export default Home;

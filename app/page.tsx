"use client";

import { ChangeEvent, FunctionComponent, useCallback, useState } from "react";
import { run, type RunResult } from "../domains/dsl/run";

import styles from "./page.module.css";

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
  const [result, setResult] = useState<RunResult | null>(null);

  const setDsl = (dsl: string) => () => {
    setExpression(dsl);
    setResult(null);
  };

  const runExpression = useCallback(() => {
    setResult(run(expression));
  }, [expression]);

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
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            setExpression(e.target.value);
            setResult(null);
          }}
          rows={8}
        ></textarea>
        {result &&
          (result.success ? (
            <div
              role="alert"
              className={[styles.message, styles.messageSuccess].join(" ")}
            >
              DSL query ran successfully!
            </div>
          ) : (
            <div
              role="alert"
              className={[styles.message, styles.messageError].join(" ")}
            >
              There is a problem with your DSL query: {result.error.message}
            </div>
          ))}
        <button
          data-testid="run-button"
          type="button"
          onClick={() => runExpression()}
        >
          Run
        </button>
      </div>

      {/* DSL Output Section */}
      {result?.success ? (
        <div className={styles.section}>
          <label htmlFor="dsl-output">Output:</label>
          <textarea
            id="dsl-output"
            className={styles.field}
            readOnly
            rows={1}
            value={String(result.value)}
          ></textarea>
        </div>
      ) : null}
    </main>
  );
};

export default Home;

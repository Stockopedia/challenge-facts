"use client";

import { type ChangeEvent, type FunctionComponent, useState } from "react";

import { evaluate } from "../lib/interpreter";
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
  // erm, nothing has been run yet so not sure why we have a result and an error in the JSX
  const [result, setResult] = useState<string | null>(null);
  const [error] = useState<string | null>(null);
  const setDsl = (dsl: string) => () => setExpression(dsl);
  const run = () => setResult(String(evaluate(expression)));

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
        {/** biome-ignore lint/correctness/useUniqueElementIds: Not relevant */}
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
        {/** biome-ignore lint/correctness/useUniqueElementIds: Not relevant for now */}
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
        {/* condition the result and the error messages */}
        {result !== null && (
          <div
            className={[styles.message, styles.messageSuccess].join(" ")}
            data-testid="success"
          >
            DSL query ran successfully!
          </div>
        )}
        {error !== null && (
          <div
            className={[styles.message, styles.messageError].join(" ")}
            data-testid="error"
          >
            There is a problem with your DSL query.
          </div>
        )}
        <button data-testid="run-button" type="button" onClick={run}>
          Run
        </button>
      </div>

      {/* DSL Output Section */}
      <div className={styles.section}>
        <label htmlFor="dsl-output">Output:</label>
        {/** biome-ignore lint/correctness/useUniqueElementIds: Not relevant for now */}
        <textarea
          id="dsl-output"
          className={styles.field}
          data-testid="output"
          value={result ?? ""}
          readOnly
          rows={1}
        ></textarea>
      </div>
    </main>
  );
};

export default Home;

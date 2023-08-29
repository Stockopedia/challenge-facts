import type { NextPage } from "next";
import Head from "next/head";
import { ChangeEvent, useEffect, useState } from "react";
import styles from "./index.module.css";
import { validateDsl } from "../utils/dsl/validation";
import { execute } from "../utils/dsl/executor";
import { DSL } from "../models/dsl";

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

const Home: NextPage = () => {
  const [expression, setExpression] = useState<string>(examples[0].dsl);
  const [expressionError, setExpressionError] = useState<boolean>(false);
  const [expressionErrorMessage, setExpressionErrorMessage] =
    useState<string>("");
  const [expressionRan, setExpressionRan] = useState<boolean>(false);
  const [expressionValue, setExpressionValue] = useState<string>("");

  // This useEffect runs every time the expression is updated in state. It will then validate the expression allowing for live error checking.
  useEffect(() => {
    if (expression) {
      setExpressionRan(false);
      setExpressionValue("");

      const [valid, errorString] = validateDsl(expression);
      setExpressionError(!valid);
      setExpressionErrorMessage(errorString);
    }
  }, [expression]);

  // This function runs the query using the executor utility and then sets the relevant state values.
  const runQuery = () => {
    const [success, value, errorMessage] = execute(
      JSON.parse(expression) as DSL,
    );
    if (!success) {
      setExpressionError(!success);
      setExpressionErrorMessage(errorMessage);
    } else {
      setExpressionRan(true);
      setExpressionValue(value + "");
    }
  };

  /**
   * This could have been done without using useEffect.
   *
   * In order to do that:
   * - a function would be created to reset the states.
   * - that function would then be called each "run" button click.
   * - then the validation function would be run each time the "run" button is also clicked.
   */

  return (
    <>
      <Head>
        <title>Stockopedia facts challenge</title>
        <meta
          name="description"
          content="Coding challenge for Stockopedia Ltd"
        />
      </Head>

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
                onClick={() => setExpression(dsl)}
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
          <div
            className={[
              styles.message,
              styles.messageSuccess,
              expressionRan ? null : styles.messageHidden,
            ].join(" ")}
          >
            DSL query ran successfully!
          </div>
          <div
            className={[
              styles.message,
              styles.messageError,
              expressionError ? null : styles.messageHidden,
            ].join(" ")}
          >
            <p>There is a problem with your DSL query:</p>
            <p>{expressionErrorMessage}</p>
          </div>
          <button
            onClick={() => runQuery()}
            data-testid="run-button"
            type="button"
            disabled={expressionError}
          >
            Run
          </button>
        </div>

        {/* DSL Output Section */}
        <div className={styles.section}>
          <label htmlFor="dsl-output">Output:</label>
          <textarea
            value={expressionValue}
            id="dsl-output"
            className={styles.field}
            readOnly
            rows={1}
            data-testid="dsl-output"
          ></textarea>
        </div>
      </main>
    </>
  );
};

export default Home;

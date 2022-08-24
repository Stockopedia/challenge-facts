import type { NextPage } from "next";
import Head from "next/head";
import { ChangeEvent, useState } from "react";
import styles from "../styles/Home.module.css";

interface DSLExample {
  label: string;
  dsl: string;
}

const examples: readonly DSLExample[] = [
  {
    label: "Simple multiplication",
    dsl: `{
  "expression": {"fn": "*", "a": "sales", "b": 2},
  "security": "ABC"
}`,
  },
  {
    label: "Simple division",
    dsl: `{
  "expression": {"fn": "/", "a": "price", "b": "eps"},
  "security": "BCD"
}`,
  },
  {
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
];

const Home: NextPage = () => {
  const [expression, setExpression] = useState<string>(examples[0].dsl);
  const setDsl = (dsl: string) => () => setExpression(dsl);

  return (
    <div className={styles.container}>
      <Head>
        <title>Stockopedia facts challenge</title>
        <meta
          name="description"
          content="Coding challenge for Stockopedia Ltd"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to facts!</h1>

        <p className={styles.description}>
          Enter the DSL query below and press the <strong>run</strong> button to
          evaluate it
        </p>
        <textarea
          className={styles.expressionInput}
          placeholder="Enter your DSL"
          value={expression}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setExpression(e.target.value)
          }
        ></textarea>
        <button type="button">Run</button>

        <hr />
        <h2>Pre-canned examples</h2>
        {examples.map(({ label, dsl }) => (
          <button type="button" onClick={setDsl(dsl)}>
            {label}
          </button>
        ))}
      </main>
    </div>
  );
};

export default Home;

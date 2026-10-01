# Stockopedia Interview Project

The goal of the project is to build a small interpreter for a JSON-based DSL that performs some simple analytics on a
data set.

We have included basic UI boilerplate in this project to help you get started quickly. This way, you can focus your
attention on implementing the application logic. We expect you to spend a few hours on this project, but don't worry if
you don't finish everything within that timeframe. Please let us know which areas you weren't able to complete and how
you plan to finish them if given more time.

## Requirements

- The example expressions are correctly interpreted and give the correct result
- Syntactically invalid DSLs are handled and the user made aware (i.e. malformed JSON)
- Syntactically valid DSLs which do not adhere to the schema are handled the user made aware
- Valid DSL expressions that fail on either attribute or security look-up are handled and the user made aware

## The Data

The data set comprises 3 small csv files, `securities.json`,
`attributes.json` and `facts.json`. There are 10 securities and 10 attributes, and for each
security and each attribute, there is one fact. I.e. there is a one-to-many relationship between
securities and facts, and attributes and facts. These are located in the `data` directory in the root of then project.

### Securities Schema

```typescript
export interface Security {
  id: number;
  symbol: string;
}
```

### Attributes Schema

```typescript
export interface Attribute {
  id: number;
  name: string;
}
```

### Facts Schema

```typescript
export interface Fact {
  securityId: number;
  attributeId: number;
  value: number;
}
```

## The DSL

A query in our DSL has the basic format:

```json
{
  "security": <String>,
  "expression": <Expression>
}
```

The security property contains a single string, which is the symbol of a security the user wishes
to evaluate an expression for.

The expression field contains a single expression, which the user wishes to evaluate for the
chosen security. An expression contains an operator (the `fn` property), and the arguments to
that operator has other properties. The arguments to operators can either be the name of an
attribute, a number, or another expression.

You only have to implement one operator, though it should be clear in your solution
how it might be possible to extend the interpreter to include additional operators. Please choose
one of the following operators to implement:

| Operator | Arguments | Behaviour          |
| -------- | --------- | ------------------ |
| +        | a, b      | Adds a and b       |
| -        | a, b      | Subtracts b from a |
| \*       | a, b      | Multiplies a and b |
| /        | a, b      | Divides a by b     |

Here are some example queries, demonstrating what each operator looks like and what the different
parameters can be:

This one uses the `*` operator and makes use of one attribute name and an integer as its arguments:

```json
{
  "expression": { "fn": "*", "a": "sales", "b": 2 },
  "security": "ABC"
}
```

This one uses the `/` operator and makes uses two attribute names as arguments:

```json
{
  "expression": { "fn": "/", "a": "price", "b": "eps" },
  "security": "BCD"
}
```

This one uses the `-` operator and the arguments are two expressions, which in turn use the `-`
operator and attribute names as arguments:

```json
{
  "expression": {
    "fn": "-",
    "a": { "fn": "-", "a": "eps", "b": "shares" },
    "b": { "fn": "-", "a": "assets", "b": "liabilities" }
  },
  "security": "CDE"
}
```

## Solution

All four operators (`+`, `-`, `*`, `/`) are implemented and we can nest an expression at any depth. Commit history is written to be read in order, small new steps and the newer ones improve the older.

- The `interpreter.ts` has `evaluate(text)` so it takes the text the user typed and returns a number or throws an error, React or no React.
- `lib/errors.ts` one class per possible issue
- `models/query.ts` contains ~~nuts~~ `Query` and `Expression` types.
- `app/page.tsx` we just call `evaluate` and show the result or the error message, if any
- `lib/interpreter.spec.ts` has the tests (`pnpm test`)

The shape is checked with a recursive `Zod` schema.

### Operators

Add one line to the `operators` object in `lib/interpreter.ts`, for example `"%": (a, b) => a % b`. The shape check and its error message read the same object

### What I would do with more time

- No rounding/formatting for numbers so we will end up with funny looking long numbers, I'd fix that too
- WOuld change the arr lookups from find to a map as then each lookup would be a direct get.
- We can show different things for different errors due to those error classes but UI wise it looks the same, I'd prettify that in the page.
- The data and the `Fact` model aren't in sync, `Fact` uses camelCase.
- Dismissing the error after the user clicks on another example

## Developing

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

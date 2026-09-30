# Challenge write-up

This was familiar territory: I recently worked on a DSL-driven data table project, so the shape of the problem (validate, resolve, evaluate, report) was one I'd already made a few mistakes in. I spent roughly 3 hours on it, and all four requirements in the README are met.

## What's there

- **All four operators** (`+`, `-`, `*`, `/`), not just the one the brief asked for. Once the structure was in place the other three were one line each.
- **Nested expressions**, evaluated recursively. An operand is a number, an attribute name or another expression.
- **Every failure reaches the user as a typed error** rather than an exception: invalid JSON, schema violations, unknown security, unknown attribute, missing fact, and division by zero.

## How it's put together

The code is organised by domain under `domains/`, with the DSL as a thin pipeline over the data domains:

| Module | Responsibility |
| --- | --- |
| `dsl/parse.ts` | JSON parsing, then schema validation with zod |
| `dsl/schema.ts` | The query grammar. The expression schema is recursive, and the TypeScript types are inferred from it |
| `dsl/evaluate.ts` | Recursive evaluation of an expression for a security |
| `dsl/operators.ts` | The operator table |
| `dsl/result.ts` | Maps known error classes onto a `RunResult` discriminated union |
| `dsl/run.ts` | Orchestrates the above; the only thing the UI imports |
| `securities/`, `attributes/`, `facts/` | A schema and a resolver each |

A few things worth calling out:

- **The UI never sees an exception.** `run()` returns `{ success: true, value }` or `{ success: false, error: { kind, message } }`, so the page only has to branch on a union. The `kind` is a stable identifier the UI could switch on later without parsing message strings.
- **Unknown errors are rethrown, not swallowed.** Only error classes I've explicitly registered become user-facing failures. A genuine bug still surfaces as a bug instead of being dressed up as "there is a problem with your query".
- **Adding an operator is a two-line change.** Add the symbol to the zod enum in `schema.ts` and an entry to the table in `operators.ts`. The table is typed as `Record<Operator, OperatorFn>`, so forgetting the second step is a compile error.
- **The data files are validated on load too.** They're parsed through zod rather than cast, and the facts are normalised from `snake_case` to `camelCase` at that boundary, so nothing downstream deals with the raw shape.
- **Division by zero is an error**, not `Infinity`. For financial ratios I'd rather tell the user than hand back a number that isn't one.

## Decisions made

- **I wrote the core logic by hand.** I know it's 2026 and AI writes most code these days, but I wanted the design decisions to be mine, and frankly writing it beats reviewing it.
- **Claude did the follow-up refactor and the commit messages.** Once the logic was working, I had Claude split `run.ts` into the parse / evaluate / result modules. That's a separate commit (`f5a62a5`) with no behaviour change, so you can see exactly where the line is.
- **mise for tooling.** The repo had no Node or npm version pinned, so I added a `mise.toml` (Node 24, npm 12) rather than rely on whatever happened to be installed.
- **No FP library.** My first instinct was an `Effect` / `fp-ts` style pipeline, which suits this problem well. I decided against it: I'm rusty, it's a divisive style, and I didn't want a reviewer to have to learn a library to read a small interpreter. Thrown errors caught at a single boundary give most of the benefit with none of the vocabulary.

## What I'd do next

- **Unify error handling.** It's currently a mix of zod issues and hand-thrown error classes, and they don't quite feel like one system. I'd move to a single error model, probably structured issues (`kind`, `path`, `message`) all the way through, with formatting left to the UI.
- **Render validation errors properly.** Schema failures go through zod's `prettifyError`, which produces nice multi-line output that I then squash into a single string, because I didn't want to reach for `dangerouslySetInnerHTML` just to show an error. With structured issues the UI could render a proper list, which fixes this as a side effect.
- **Fill in the testing gaps.** The interpreter is well covered end to end through `run()`, and the operators have their own tests. The schema tests are thin, the resolvers are only exercised indirectly, and the UI tests cover the main paths rather than every error kind.
- **Index the data.** Resolvers use `Array.find`, which is fine for 10 securities and 10 attributes. With real data I'd build maps keyed by symbol, name and `(securityId, attributeId)` once at load.
- **Operators beyond binary.** The schema assumes every operator takes `a` and `b`. Unary or variadic operators would mean making the expression a discriminated union on `fn`, which zod handles well but is a bigger change than adding a table entry.

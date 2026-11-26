# Read Me

## Getting started

```bash
npm install
npm run dev     # opens on http://localhost:3000
```

Other commands:

```bash
npm test        
npm run lint    
npm run build  
```

## Approach

All the query logic is in `lib/dsl/`, separate from React. The page calls one
function, `interpret(text)`, which returns either the answer or an error with a
kind and a message. Nothing throws, so the page just shows one or the other.

`interpret` does three things in order and stops at the first problem:

1. `parse.ts` reads the text as JSON. Fails with a `parse` error.
2. `schema.ts` checks it has the shape of a query. Fails with a `schema` error.
3. `calculate.ts` looks up the data and works out the answer. Fails with a
   `lookup` or `evaluation` error.

Those four kinds match the four requirements in the brief.

`operator-registry.ts` lists the operators, so adding one is a single line.
`dataset.ts` is the only file that reads the JSON data.

## Decisions

- **All four operators.** The examples need `*`, `/` and `-`, and with a
  registry `+` was one more line.
- **Extra properties are rejected.** A query with a misspelt key, like `"bb"`
  instead of `"b"`, gets a clear error rather than being partly ignored.
- **Shape and data are checked separately,** so a badly formed query and a
  missing attribute give different errors.
- **Dividing by zero is an error.** JavaScript would return `Infinity`, which
  isn't a useful answer.
- **`Object.hasOwn` for operators,** so `"toString"` isn't mistaken for one.
- **Simple array lookups,** because there are only 10 securities and 99 facts.
- **Clear feedback on the page.** The result clears when the query changes, the
  chosen example is highlighted, and messages replay on every run and are
  announced to screen readers.
- **Tests next to the code,** plus end-to-end query tests and page tests. There
  are 54 in total.

## If I had more time

- **Mobile first.** Rebuild the layout for small screens first, then scale up.
- **Playwright tests** to run the real app in a browser, alongside the Jest
  tests.
- **More accessibility work:** check colour contrast with axe, test with NVDA
  and VoiceOver, and move focus to the result after a run.
- **Better error messages,** such as where the JSON broke, and every problem
  listed at once.
- **More data:** build keyed lookups once at load time, or run queries on the
  server.

## Things I noticed in the starter project

- `app/layout.tsx` had the font `<link>` outside `<head>`, which caused
  hydration errors. I moved it, and added `suppressHydrationWarning` to
  `<html>` because browser extensions change it before React loads.
- `facts.json` uses `security_id`, but the `Fact` model uses `securityId`.
  `dataset.ts` handles the difference.
- There are 99 facts, not 100. JKL has no `shares` value, which shows as a
  lookup error.
- The skipped page test called `fail()`, which current Jest doesn't include.
- The Semantic PR check expects titles like `feat:` and `fix:`. I spotted this
  partway through, so only the later commits follow it.
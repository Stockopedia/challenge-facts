import type { Result } from "./result";

export function parseJson(input: string): Result<unknown> {
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch {
    return { ok: false, error: { kind: "parse", message: "Invalid JSON" } };
  }
}
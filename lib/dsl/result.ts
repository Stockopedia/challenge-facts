import type { DslError } from "./errors";

export type Result<T> = { ok: true; value: T } | { ok: false; error: DslError };
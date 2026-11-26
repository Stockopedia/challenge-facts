export type DslErrorKind = "parse" | "schema" | "lookup" | "evaluation";

export interface DslError {
  kind: DslErrorKind;
  message: string;
}
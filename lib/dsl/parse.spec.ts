import { parseJson } from "./parse";

describe("parseJson", () => {
  it("returns the parsed value for valid JSON", () => {
    expect(parseJson('{"security": "ABC"}')).toEqual({
      ok: true,
      value: { security: "ABC" },
    });
  });

  it.each([
    ["malformed JSON", '{"security": "ABC"'],
    ["an empty string", ""],
    ["plain text", "hello"],
  ])("returns a parse error for %s", (_name, input) => {
    expect(parseJson(input)).toEqual({
      ok: false,
      error: { kind: "parse", message: "Invalid JSON" },
    });
  });
});
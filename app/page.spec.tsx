import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import Home from "./page";

const runExample = (id: string) => {
  fireEvent.click(screen.getByTestId(`button-${id}`));
  fireEvent.click(screen.getByTestId("run-button"));
};

describe("Index page", () => {
  beforeEach(() => {
    render(<Home />);
  });

  it("should set the initial value of the expression", () => {
    expect(screen.getByTestId("expression-input")).toHaveValue(`{
  "expression": {"fn": "*", "a": "sales", "b": 2},
  "security": "ABC"
}`);
  });

  it("should set the expression when an example button is clicked", () => {
    fireEvent.click(screen.getByTestId("button-divide"));

    expect(screen.getByTestId("expression-input")).toHaveValue(`{
  "expression": {"fn": "/", "a": "price", "b": "eps"},
  "security": "BCD"
}`);
  });

  it("should not show a message before anything has run", () => {
    expect(screen.queryByTestId("success-message")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it('should evaluate the expression when the "run" button is clicked', () => {
    fireEvent.click(screen.getByTestId("run-button"));

    expect(screen.getByTestId("success-message")).toBeInTheDocument();
    expect(screen.getByTestId("output")).toHaveValue("8");
  });

  it.each([
    ["multiply", "8"],
    ["divide", "0.5"],
    ["nested", "-21"],
  ])("should show the result for the %s example", (id, expected) => {
    runExample(id);

    expect(screen.getByTestId("success-message")).toBeInTheDocument();
    expect(screen.getByTestId("output")).toHaveValue(expected);
  });

  it.each([
    ["invalid-json", /Invalid JSON/],
    ["invalid-dsl", /Unexpected property "wrong"/],
    ["missing-security", /Unknown security "ZZZ"/],
  ])("should show an error for the %s example", (id, message) => {
    runExample(id);

    expect(screen.getByTestId("error-message")).toHaveTextContent(message);
    expect(screen.getByTestId("output")).toHaveValue("");
  });

  it("should report the fact missing from the real data", () => {
    fireEvent.change(screen.getByTestId("expression-input"), {
      target: {
        value:
          '{"security": "JKL", "expression": {"fn": "+", "a": "shares", "b": 1}}',
      },
    });
    fireEvent.click(screen.getByTestId("run-button"));

    expect(screen.getByTestId("error-message")).toHaveTextContent(
      /No "shares" value for JKL/,
    );
  });

  it("should clear the result when the expression is edited", () => {
    fireEvent.click(screen.getByTestId("run-button"));
    fireEvent.change(screen.getByTestId("expression-input"), {
      target: { value: "{}" },
    });

    expect(screen.queryByTestId("success-message")).not.toBeInTheDocument();
    expect(screen.getByTestId("output")).toHaveValue("");
  });
});
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import Home from "./page";

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

  const ADDITION_EXPRESSION = `{ "expression": { "fn": "+", "a": 1, "b": 2 }, "security": "ABC" }`;
  const ADDITION_EXPRESSION_RESULT = "3";

  it('should evaluate the expression when the "run" button is clicked', () => {
    fireEvent.change(screen.getByTestId("expression-input"), {
      target: {
        value: ADDITION_EXPRESSION,
      },
    });
    fireEvent.click(screen.getByTestId("run-button"));
    expect(screen.getByLabelText("Output:")).toHaveTextContent(
      ADDITION_EXPRESSION_RESULT,
    );
  });

  it("shows a success message when an expression has been evaluated", () => {
    fireEvent.change(screen.getByTestId("expression-input"), {
      target: {
        value: ADDITION_EXPRESSION,
      },
    });
    fireEvent.click(screen.getByTestId("run-button"));
    expect(screen.getByTestId("success-message")).toBeInTheDocument();
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("shows an error message when the interpretation of an expression fails", () => {
    fireEvent.change(screen.getByTestId("expression-input"), {
      target: { value: `{ "hello": "world" }` },
    });
    fireEvent.click(screen.getByTestId("run-button"));
    expect(screen.queryByTestId("success-message")).not.toBeInTheDocument();
    expect(screen.getByTestId("error-message")).toBeInTheDocument();
  });
});

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import Home from "./page";

/** Page object: one place for every element the tests interact with. */
const ui = {
  expressionInput: () => screen.getByTestId("expression-input"),
  output: () => screen.getByTestId("output"),
  runButton: () => screen.getByTestId("run-button"),
  exampleButton: (id: string) => screen.getByTestId(`button-${id}`),
  successMessage: () => screen.queryByTestId("success-message"),
  errorMessage: () => screen.queryByTestId("error-message"),
};

describe("Index page", () => {
  beforeEach(() => {
    render(<Home />);
  });

  describe("expression input", () => {
    it("should set the initial value of the expression", () => {
      expect(ui.expressionInput()).toHaveValue(`{
  "expression": {"fn": "*", "a": "sales", "b": 2},
  "security": "ABC"
}`);
    });

    it("should set the expression when an example button is clicked", () => {
      fireEvent.click(ui.exampleButton("divide"));

      expect(ui.expressionInput()).toHaveValue(`{
  "expression": {"fn": "/", "a": "price", "b": "eps"},
  "security": "BCD"
}`);
    });
  });

  describe("run button", () => {
    it("should show the result and a success message for a valid query", () => {
      fireEvent.click(ui.runButton());

      expect(ui.output()).toHaveValue("8");
      expect(ui.successMessage()).toBeInTheDocument();
      expect(ui.errorMessage()).not.toBeInTheDocument();
    });

    it("should show an error and no output for an invalid query", () => {
      fireEvent.click(ui.exampleButton("missing-security"));

      fireEvent.click(ui.runButton());

      expect(ui.errorMessage()).toHaveTextContent('Unknown security "ZZZ"');
      expect(ui.output()).toHaveValue("");
      expect(ui.successMessage()).not.toBeInTheDocument();
    });

    it("should clear the previous result when the expression changes", () => {
      fireEvent.click(ui.runButton());

      fireEvent.click(ui.exampleButton("divide"));

      expect(ui.output()).toHaveValue("");
      expect(ui.successMessage()).not.toBeInTheDocument();
    });
  });
});

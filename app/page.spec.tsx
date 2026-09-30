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

  it('should evaluate the expression when the "run" button is clicked', () => {
    fireEvent.click(screen.getByTestId("run-button"));

    expect(screen.getByRole("alert")).toBeVisible()
    expect(screen.getByRole("alert")).toHaveTextContent("DSL query ran successfully!")
    expect(screen.getByLabelText('Output:')).toHaveValue("8")
  });

  it("should not show a message or output before the query is run", () => {
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Output:')).not.toBeInTheDocument()
  });

  it.each([
    ["divide", "0.5"],
    ["nested", "-21"],
  ])("should evaluate the %s example", (id, expectedOutput) => {
    fireEvent.click(screen.getByTestId(`button-${id}`));
    fireEvent.click(screen.getByTestId("run-button"));

    expect(screen.getByRole("alert")).toHaveTextContent("DSL query ran successfully!")
    expect(screen.getByLabelText('Output:')).toHaveValue(expectedOutput)
  });

  it.each([
    ["invalid-json", "Invalid JSON"],
    ["invalid-dsl", "expression"],
    ["missing-security", "ZZZ"],
  ])("should report a problem with the %s example", (id, expectedMessage) => {
    fireEvent.click(screen.getByTestId(`button-${id}`));
    fireEvent.click(screen.getByTestId("run-button"));

    expect(screen.getByRole("alert")).toHaveTextContent("There is a problem with your DSL query")
    expect(screen.getByRole("alert")).toHaveTextContent(expectedMessage)
    expect(screen.queryByLabelText('Output:')).not.toBeInTheDocument()
  });

  it("should report a problem when dividing by zero", () => {
    fireEvent.change(screen.getByTestId("expression-input"), {
      target: { value: `{"expression": {"fn": "/", "a": 1, "b": 0}, "security": "ABC"}` },
    });
    fireEvent.click(screen.getByTestId("run-button"));

    expect(screen.getByRole("alert")).toHaveTextContent("There is a problem with your DSL query")
    expect(screen.queryByLabelText('Output:')).not.toBeInTheDocument()
  });

  it("should clear the result when an example button is clicked", () => {
    fireEvent.click(screen.getByTestId("run-button"));
    fireEvent.click(screen.getByTestId("button-divide"));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Output:')).not.toBeInTheDocument()
  });

  it("should clear the result when the expression is edited", () => {
    fireEvent.click(screen.getByTestId("run-button"));
    fireEvent.change(screen.getByTestId("expression-input"), {
      target: { value: "{}" },
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Output:')).not.toBeInTheDocument()
  });
});

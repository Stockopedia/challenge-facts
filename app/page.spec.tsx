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

  it("should not show a success/error message on page load", () => {
    expect(screen.queryByTestId("success")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error")).not.toBeInTheDocument();
    expect(screen.getByTestId("output")).toHaveValue("");
  });

  it('should evaluate the expression when the "run" button is clicked', () => {
			fireEvent.click(screen.getByTestId("run-button"));

      // adding basic checks re erorr, result, output
			expect(screen.getByTestId("output")).toHaveValue("8");
			expect(screen.getByTestId("success")).toBeInTheDocument();
			expect(screen.queryByTestId("error")).not.toBeInTheDocument();
		});

  it("should show an error (and no result) when the JSON is not valid", () => {
    fireEvent.click(screen.getByTestId("button-invalid-json"));
    fireEvent.click(screen.getByTestId("run-button"));

    expect(screen.getByTestId("error")).toHaveTextContent("Invalid JSON");
    expect(screen.queryByTestId("success")).not.toBeInTheDocument();
    expect(screen.getByTestId("output")).toHaveValue("");
  });

  it("should show an error (and no result) when the DSL has the wrong shape", () => {
    fireEvent.click(screen.getByTestId("button-invalid-dsl"));
    fireEvent.click(screen.getByTestId("run-button"));

    expect(screen.getByTestId("error")).toHaveTextContent("Invalid DSL");
    expect(screen.queryByTestId("success")).not.toBeInTheDocument();
    expect(screen.getByTestId("output")).toHaveValue("");
  });
});

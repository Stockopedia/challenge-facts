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

  it("should not show a success/error message on page laod", () => {
    expect(screen.queryByTestId("success")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error")).not.toBeInTheDocument();
    expect(screen.getByTestId("output")).toHaveValue("");
  });

  // TODO: Complete this test suite once implementation is complete
  xit('should evaluate the expression when the "run" button is clicked', () => {
    fireEvent.click(screen.getByTestId("run-button"));

    fail("Implement me!");
  });
});

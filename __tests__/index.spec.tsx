import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import Home from "../pages";

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

  it('should evaluate the default (multiplication) expression when the "run" button is clicked', () => {
    fireEvent.click(screen.getByTestId("run-button"));

    expect(screen.getByTestId("dsl-output")).toHaveValue("8");
  });

  it('should evaluate the division expression when the "run" button is clicked', () => {
    fireEvent.click(screen.getByTestId("button-divide"));
    fireEvent.click(screen.getByTestId("run-button"));

    expect(screen.getByTestId("dsl-output")).toHaveValue("0.5");
  });
});

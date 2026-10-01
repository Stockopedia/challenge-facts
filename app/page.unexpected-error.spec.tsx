import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import Home from "./page";

jest.mock("../lib/interpreter", () => ({
  evaluate: () => {
    throw new TypeError("A bug");
  },
}));

describe("Index page with an unexpected error", () => {
  it("should not show a bug as a problem with the DSL query", () => {
    const reported = jest.fn((event: ErrorEvent) => event.preventDefault());
    window.addEventListener("error", reported);
    jest.spyOn(console, "error").mockImplementation(() => {});

    render(<Home />);
    fireEvent.click(screen.getByTestId("run-button"));

    expect(reported).toHaveBeenCalled();
    expect(screen.queryByTestId("error")).not.toBeInTheDocument();
    expect(screen.queryByTestId("success")).not.toBeInTheDocument();

    window.removeEventListener("error", reported);
  });
});

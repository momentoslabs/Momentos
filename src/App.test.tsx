import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

describe("App Component", () => {
  it("renders without crashing", async () => {
    render(<App />);
    expect(screen.getByTestId("app-component")).toBeInTheDocument();
  });
});

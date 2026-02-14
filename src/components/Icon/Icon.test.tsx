import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import Icon from "./Icon";

describe("Icon component", () => {
  it("renders without crashing", () => {
    render(<Icon name="trash" />);
    const icon = screen.getByTestId("Icon");
    expect(icon).toBeInTheDocument();
    expect(icon.tagName).toBe("svg");
  });

  it("renders the correct icon based on `name` prop", () => {
    const { rerender } = render(<Icon name="trash" />);
    expect(
      screen.getByTestId("Icon").querySelector("path"),
    ).toBeInTheDocument();

    rerender(<Icon name="save" />);
    rerender(<Icon name="save" />);
    const paths = screen.getByTestId("Icon").querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);
  });

  it("applies `size` prop correctly", () => {
    render(<Icon name="trash" size={32} />);
    const icon = screen.getByTestId("Icon");
    expect(icon).toHaveAttribute("width", "32");
    expect(icon).toHaveAttribute("height", "32");
  });

  it("applies `color` prop correctly", () => {
    render(<Icon name="trash" color="red" />);
    const icon = screen.getByTestId("Icon");
    expect(icon).toHaveAttribute("color", "red");
  });

  it("applies `style` prop correctly", () => {
    render(<Icon name="trash" style={{ margin: "10px" }} />);
    const icon = screen.getByTestId("Icon");
    expect(icon).toHaveStyle("margin: 10px");
  });

  it("calls `onClick` when clicked", () => {
    const handleClick = jest.fn();
    render(<Icon name="trash" onClick={handleClick} />);
    const icon = screen.getByTestId("Icon");
    fireEvent.click(icon);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

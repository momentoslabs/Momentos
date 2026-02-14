import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import ModuleContent from "./ModuleContent";
import * as colors from "../../utils/colors";

describe("ModuleContent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Object.keys(window);
    Object.keys(window)
      .filter((key) => key.startsWith("__module_"))
      .forEach((key) => delete (window as any)[key]);
  });

  it("renders label when no html, js, or moduleUrl is provided", () => {
    render(<ModuleContent label="Hello World" backgroundColor="#000" />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders iframe when html is provided", () => {
    render(
      <ModuleContent
        label="Test"
        html="<div>Hi</div>"
        backgroundColor="#000"
      />,
    );
    const iframe = screen.getByTitle("Test") as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.srcdoc).toContain("<div>Hi</div>");
  });

  it("applies theme based on background color", () => {
    const isLightColorSpy = jest
      .spyOn(colors, "isLightColor")
      .mockReturnValue(true);

    render(<ModuleContent label="Test" backgroundColor="#fff" />);
    expect(isLightColorSpy).toHaveBeenCalledWith("#fff");
  });

  it("shows loading state when moduleUrl is provided", () => {
    (globalThis as any).fetch = jest.fn(
      () => new Promise<void>(() => {}),
    ) as any;

    render(
      <ModuleContent
        label="Test"
        moduleUrl="/fake.js"
        backgroundColor="#000"
      />,
    );

    expect(screen.getByText(/Loading module/)).toBeInTheDocument();
  });

  it("renders error if fetch fails", async () => {
    (globalThis as any).fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }),
    ) as any;

    render(
      <ModuleContent
        label="Test"
        moduleUrl="/fail.js"
        backgroundColor="#000"
      />,
    );

    await waitFor(() =>
      expect(screen.getByText(/Failed to load module/)).toBeInTheDocument(),
    );
  });
});

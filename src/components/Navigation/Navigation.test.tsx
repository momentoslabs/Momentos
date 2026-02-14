import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";

jest.mock("../../utils/colors", () => {
  const actual = jest.requireActual("../../utils/colors");

  return {
    __esModule: true,
    ...actual,
    getThemeColors: () => ({
      background: "#ffffff",
      surface: "#f0f0f0",
      border: "#cccccc",
      primaryBorder: "#cccccc",
      secondaryBorder: "#cccccc",
      gridBackground: "#eeeeee",
      gridLine: "#cccccc",
      text: "#000000",
      accent: "#ff0000",
      primary: "#ff0000",
      success: "#4ade80",
      error: "#f87171",
      isLight: true,
    }),
  };
});

import Navigation from "./Navigation";

type IconProps = {
  name: string;
  onClick: () => void;
};

jest.mock("../Icon/Icon", () => ({ name, onClick }: IconProps) => (
  <div data-testid={`icon-${name}`} onClick={onClick} />
));

jest.mock(
  "../../graphics/branding/wordmarkblack.svg",
  () => "wordmarkBlack.svg",
);
jest.mock(
  "../../graphics/branding/wordmarkwhite.svg",
  () => "wordmarkWhite.svg",
);

global.open = jest.fn();

describe("Navigation component", () => {
  const props = {
    query: "",
    onQueryChange: jest.fn(),
    onSubmit: jest.fn((e) => e.preventDefault()),
    customColors: {},
    onSettingsClick: jest.fn(),
    onDrawerClick: jest.fn(),
    selectedEngine: "google" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve('<svg><rect fill="#000"/></svg>'),
      } as any),
    );
  });

  it("renders without crashing", async () => {
    await act(async () => {
      render(<Navigation {...props} />);
    });
    expect(screen.getByTestId("Navigation")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search Google")).toBeInTheDocument();
  });

  it("updates input value on change", () => {
    render(<Navigation {...props} />);
    const input = screen.getByPlaceholderText("Search Google");
    fireEvent.change(input, { target: { value: "test query" } });
    expect(props.onQueryChange).toHaveBeenCalledWith("test query");
  });

  it("calls onSubmit when form is submitted", async () => {
    render(<Navigation {...props} />);
    const form = screen.getByPlaceholderText("Search Google").closest("form");
    if (!form) throw new Error("Form not found");

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(props.onSubmit).toHaveBeenCalled();
  });

  it("calls onDrawerClick and onSettingsClick when icons are clicked", () => {
    render(<Navigation {...props} />);
    const gridIcon = screen.getByTestId("icon-grid");
    const settingsIcon = screen.getByTestId("icon-settings");

    fireEvent.click(gridIcon);
    expect(props.onDrawerClick).toHaveBeenCalled();

    fireEvent.click(settingsIcon);
    expect(props.onSettingsClick).toHaveBeenCalled();
  });

  it("renders the correct logo based on background", async () => {
    render(<Navigation {...props} />);
    await waitFor(() =>
      expect(screen.getByAltText("Momentos")).toBeInTheDocument(),
    );
  });

  it("applies correct colors from getThemeColors", () => {
    render(<Navigation {...props} />);
    const input = screen.getByPlaceholderText("Search Google");
    expect(input).toHaveStyle({ color: "#000000" });
  });
});
